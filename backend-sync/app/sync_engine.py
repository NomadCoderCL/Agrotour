"""
Sync Engine core logic for Agrotour.
Implements conflict detection and resolution based on 5 AI consensus.
"""

from datetime import datetime
from typing import List, Dict, Optional, Union, Type
from uuid import UUID

from sqlmodel import Session, select, SQLModel
from .models import StockEvent, SyncConflict, Product, PendingPayment, SyncBaseModel


class ConflictResolution:
    """Result of conflict resolution attempt."""
    
    def __init__(
        self,
        winner_id: UUID,
        reason: str,
        method: str,
        confidence: float = 1.0,
        requires_approval: bool = False
    ):
        self.winner_id = winner_id
        self.reason = reason
        self.method = method
        self.confidence = confidence
        self.requires_approval = requires_approval


class AgrotourSyncEngine:
    """
    Core synchronization engine.
    Implements consensus from Grok, ChatGPT, Qwen, Claude, Gemini.
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.server_lamport = self._get_max_lamport()
    
    def _get_max_lamport(self) -> int:
        """Get current maximum Lamport timestamp from database."""
        result = self.session.exec(
            select(StockEvent.lamport_ts).order_by(StockEvent.lamport_ts.desc()).limit(1)
        ).first()
        return result if result else 0
    
    def accept_operation(self, operation: Union[StockEvent, Product, PendingPayment]) -> Dict:
        """
        Accept a single synchronization operation (Event or State).
        Dispatches to specific handler based on entity type.
        """
        if isinstance(operation, StockEvent):
            return self._handle_event_sync(operation)
        elif isinstance(operation, (Product, PendingPayment)):
            return self._handle_state_sync(operation)
        else:
            return {"status": "rejected", "message": f"Unsupported entity type: {type(operation)}"}

    def _handle_event_sync(self, operation: StockEvent) -> Dict:
        """
        Handle Event Sourcing (append-only) operations like StockEvent.
        """
        # 1. IDEMPOTENCY CHECK
        existing = self.session.exec(
            select(StockEvent).where(
                StockEvent.operation_hash == operation.operation_hash
            )
        ).first()
        
        if existing:
            return {
                "status": "duplicate",
                "operation_id": str(existing.id),
                "message": "Operation already processed"
            }
        
        # 2. UPDATE LAMPORT CLOCK
        self.server_lamport = max(self.server_lamport, operation.lamport_ts) + 1
        operation.lamport_ts = self.server_lamport
        operation.synced_at = datetime.utcnow()
        
        # 3. COMPUTE CONTENT HASH
        operation.content_hash = operation.compute_hash()
        
        # 4. INCREMENT VERSION
        operation.increment_version()
        
        # 5. DETECT CONCURRENT OPERATIONS
        conflicts = self._detect_concurrent_operations(operation)
        
        if conflicts:
            resolution = self._resolve_conflict(operation, conflicts[0])
            conflict_record = self._log_conflict(operation, conflicts[0], resolution)
            
            if resolution.requires_approval:
                return {
                    "status": "conflict",
                    "conflict_id": str(conflict_record.id),
                    "resolution": {
                        "method": resolution.method,
                        "reason": resolution.reason,
                        "confidence": resolution.confidence,
                        "requires_approval": True
                    },
                    "message": "Conflict detected - requires producer approval"
                }
        
        # 6. VALIDATE BUSINESS RULES
        validation = self._validate_business_rules(operation)
        if not validation["valid"]:
            return {
                "status": "rejected",
                "reason": validation["reason"],
                "suggestion": validation.get("alternative")
            }
        
        # 7. PERSIST OPERATION
        self.session.add(operation)
        self.session.commit()
        self.session.refresh(operation)
        
        return {
            "status": "accepted",
            "operation_id": str(operation.id),
            "server_lamport": self.server_lamport,
            "message": "Event accepted successfully"
        }

    def _handle_state_sync(self, entity: Union[Product, PendingPayment]) -> Dict:
        """
        Handle State Sync (Last-Write-Wins) for mutable entities.
        """
        EntityClass = type(entity)
        
        # 1. FIND EXISTING STATE
        current_state = self.session.exec(
            select(EntityClass).where(EntityClass.id == entity.id)
        ).first()
        
        if current_state:
            # 2. CONFLICT RESOLUTION (LWW)
            
            # Case A: Incoming is newer (Higher Lamport) -> OVERWRITE
            if entity.lamport_ts > current_state.lamport_ts:
                 # Update fields
                 entity_data = entity.model_dump(exclude_unset=True)
                 for key, value in entity_data.items():
                     setattr(current_state, key, value)
                 
                 # Update metadata
                 self.server_lamport = max(self.server_lamport, entity.lamport_ts) + 1
                 current_state.lamport_ts = self.server_lamport
                 current_state.synced_at = datetime.utcnow()
                 
                 self.session.add(current_state)
                 self.session.commit()
                 
                 return {"status": "accepted", "message": "State updated (Newer Lamport)"}
            
            # Case B: Incoming is older (Lower Lamport) -> IGNORE
            elif entity.lamport_ts < current_state.lamport_ts:
                return {
                    "status": "ignored", 
                    "message": "State stale (Older Lamport)",
                    "server_lamport": self.server_lamport
                }
                
            # Case C: Tie (Same Lamport) -> LWW based on tie-breaker (User ID or arbitrary)
            else:
                 # Simple tie-breaker: Server state wins (Reject incoming)
                 # Or: Compare update_by UUID
                 return {
                     "status": "ignored",
                     "message": "Concurrent update conflict - Server state preserved",
                     "server_lamport": self.server_lamport
                 }
        
        else:
            # 3. CREATE NEW STATE
            self.server_lamport = max(self.server_lamport, entity.lamport_ts) + 1
            entity.lamport_ts = self.server_lamport
            entity.synced_at = datetime.utcnow()
            
            self.session.add(entity)
            self.session.commit()
            
            return {"status": "accepted", "message": "New state created"}
    
    def _detect_concurrent_operations(
        self,
        new_op: StockEvent
    ) -> List[StockEvent]:
        """
        Detect operations that conflict with the new operation.
        Two operations conflict if they affect the same product and
        happened "concurrently" (neither causally precedes the other).
        """
        # Find recent operations on same product
        recent_ops = self.session.exec(
            select(StockEvent).where(
                StockEvent.product_id == new_op.product_id,
                StockEvent.is_deleted == False,
                StockEvent.id != new_op.id
            ).order_by(StockEvent.lamport_ts.desc()).limit(10)
        ).all()
        
        conflicts = []
        for op in recent_ops:
            # Check if operations are concurrent
            # Simplified: if Lamport timestamps are close, consider concurrent
            if abs(op.lamport_ts - new_op.lamport_ts) < 100:
                # Additional check: different devices
                if op.device_id != new_op.device_id:
                    conflicts.append(op)
        
        return conflicts
    
    def _resolve_conflict(
        self,
        new_op: StockEvent,
        conflict_op: StockEvent
    ) -> ConflictResolution:
        """
        Three-tier conflict resolution strategy:
        1. Hardcoded rules (Grok requirement)
        2. Heuristics (Qwen suggestion)
        3. AI suggestions with approval (Gemini + Claude)
        """
        
        # TIER 1: HARDCODED RULES (deterministic, highest priority)
        
        # Rule 1: Paid sales take absolute precedence
        if new_op.payment_status == "PAID" and conflict_op.payment_status != "PAID":
            return ConflictResolution(
                winner_id=new_op.id,
                reason="Paid sale has absolute priority",
                method="HARDCODED",
                confidence=1.0
            )
        
        if conflict_op.payment_status == "PAID" and new_op.payment_status != "PAID":
            return ConflictResolution(
                winner_id=conflict_op.id,
                reason="Existing operation is a paid sale",
                method="HARDCODED",
                confidence=1.0
            )
        
        # Rule 2: DECREMENT operations (sales) > INCREMENT (restocks)
        if new_op.operation == "DECREMENT" and conflict_op.operation == "INCREMENT":
            return ConflictResolution(
                winner_id=new_op.id,
                reason="Sales take priority over restocks",
                method="HARDCODED",
                confidence=0.95
            )
        
        # TIER 2: HEURISTICS (simple, fast)
        
        # Heuristic 1: Earlier Lamport timestamp wins
        if new_op.lamport_ts < conflict_op.lamport_ts:
            return ConflictResolution(
                winner_id=new_op.id,
                reason="Operation occurred first (lower Lamport timestamp)",
                method="HEURISTIC",
                confidence=0.9
            )
        
        # TIER 3: ESCALATE TO MANUAL RESOLUTION
        # (AI suggestions would go here in Phase 9)
        return ConflictResolution(
            winner_id=new_op.id,
            reason="Ambiguous conflict - requires producer decision",
            method="MANUAL",
            confidence=0.5,
            requires_approval=True
        )
    
    def _log_conflict(
        self,
        op_a: StockEvent,
        op_b: StockEvent,
        resolution: ConflictResolution
    ) -> SyncConflict:
        """
        Log conflict for audit and future AI training.
        ChatGPT: Critical for enterprise architecture.
        """
        conflict = SyncConflict(
            tenant_id=op_a.tenant_id,
            entity_type="StockEvent",
            entity_id=op_a.product_id,
            operation_a_id=op_a.id,
            operation_b_id=op_b.id,
            payload_a=op_a.model_dump(),
            payload_b=op_b.model_dump(),
            status="PENDING" if resolution.requires_approval else "RESOLVED_AUTO",
            resolution_method=resolution.method,
            winner_id=resolution.winner_id,
            resolution_reason=resolution.reason
        )
        
        self.session.add(conflict)
        self.session.commit()
        self.session.refresh(conflict)
        
        return conflict
    
    def _validate_business_rules(self, operation: StockEvent) -> Dict:
        """
        Validate hardcoded business rules.
        Grok: These must be deterministic and fast.
        """
        
        # Rule: Cannot decrement more than available stock
        # (Would need to query current stock snapshot)
        
        # Rule: Deleted products cannot have new operations
        # (Would need to check product.is_deleted)
        
        # For now, accept all operations
        return {"valid": True}
