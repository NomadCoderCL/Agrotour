"""
Core models for Agrotour Sync Engine.
Implements offline-first synchronization with multi-tenancy.
"""

from datetime import datetime
from typing import Optional, Dict
from uuid import UUID, uuid4
from hashlib import sha256
import json

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class SyncBaseModel(SQLModel):
    """
    Base model for offline-first synchronization.
    Consensus from 5 AIs: Simplified version with Lamport + version int.
    """
    
    # Identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)  # Multi-tenancy isolation
    
    # Synchronization (SIMPLIFIED - no vector clocks initially)
    version: int = Field(default=1, index=True)  # Simple counter
    lamport_ts: int = Field(default=0, index=True)  # Causal ordering
    
    # Device tracking (ChatGPT + Grok requirement)
    device_id: UUID = Field(index=True)
    device_type: str  # "WEB", "MOBILE", "DESKTOP"
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    synced_at: Optional[datetime] = None
    
    # Soft delete (100% consensus)
    is_deleted: bool = Field(default=False)
    deleted_at: Optional[datetime] = None
    
    # Content hash (SHA-256 full, not truncated)
    content_hash: str = Field(default="", max_length=64, index=True)
    
    # Audit
    created_by: UUID
    updated_by: UUID
    
    def compute_hash(self) -> str:
        """
        Compute deterministic hash of business fields only.
        Excludes sync metadata to detect actual content changes.
        """
        business_fields = self.model_dump(
            exclude={
                'content_hash', 'synced_at', 'lamport_ts',
                'created_at', 'updated_at', 'version'
            }
        )
        return sha256(
            json.dumps(business_fields, sort_keys=True, default=str).encode()
        ).hexdigest()
    
    def increment_version(self):
        """Increment version counter for this entity."""
        self.version += 1
        self.updated_at = datetime.utcnow()





class Product(SyncBaseModel, table=True):
    """
    Product entity.
    """
    __tablename__ = "products"
    
    name: str = Field(index=True)
    description: Optional[str] = None
    price: float
    sku: str = Field(index=True, unique=True)
    category: Optional[str] = None
    
    # Stock level (denormalized for quick access, but truth is in events)
    current_stock: int = Field(default=0)


class StockEvent(SyncBaseModel, table=True):
    """
    Event Sourcing for inventory operations.
    Consensus: Store OPERATIONS, not final state.
    """
    
    __tablename__ = "stock_events"
    
    product_id: UUID = Field(foreign_key="products.id")
    
    # Delta, not final state (Gemini + all AIs)
    operation: str  # "INCREMENT", "DECREMENT", "SET"
    delta: int
    reason: str  # "SALE", "RESERVATION", "RESTOCK", "CANCEL", "DAMAGE"
    
    # Priority for conflict resolution (Gemini + ChatGPT)
    payment_status: Optional[str] = None  # "PAID", "PENDING", "CANCELLED"
    amount: Optional[float] = None
    
    # Geolocation (basic, no SpatiaLite initially)
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    
    # Idempotency (Grok requirement)
    operation_hash: str = Field(unique=True, index=True, max_length=64)
    
    def compute_operation_hash(self) -> str:
        """
        Compute unique hash for this operation to ensure idempotency.
        """
        operation_data = {
            'product_id': str(self.product_id),
            'operation': self.operation,
            'delta': self.delta,
            'device_id': str(self.device_id),
            'created_at': self.created_at.isoformat(),
        }
        return sha256(
            json.dumps(operation_data, sort_keys=True).encode()
        ).hexdigest()


class SyncConflict(SQLModel, table=True):
    """
    Log of synchronization conflicts for audit and analysis.
    CRITICAL per ChatGPT - enterprise architecture requirement.
    """
    
    __tablename__ = "sync_conflicts"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Conflicting entities
    entity_type: str  # "StockEvent", "Product", etc.
    entity_id: UUID
    operation_a_id: UUID
    operation_b_id: UUID
    
    # Full payloads for post-analysis
    payload_a: Dict = Field(sa_column=Column(JSON))
    payload_b: Dict = Field(sa_column=Column(JSON))
    
    # Resolution
    status: str = Field(default="PENDING")  # "PENDING", "RESOLVED_AUTO", "RESOLVED_MANUAL"
    resolution_method: str  # "HARDCODED", "HEURISTIC", "AI_SUGGESTION", "MANUAL"
    winner_id: UUID
    resolution_reason: str
    
    # AI involvement (for suggestions only, not auto-resolution)
    ai_suggestion: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    
    # Human approval (MANDATORY for critical decisions)
    resolved_by: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    user_feedback: Optional[str] = None


class PendingPayment(SyncBaseModel, table=True):
    """
    Offline payments pending reconciliation.
    Grok requirement - critical for rural areas.
    """
    
    __tablename__ = "pending_payments"
    
    sale_id: UUID
    amount: float
    payment_method: str  # "CASH", "POS_OFFLINE", "TRANSFER"
    
    # For offline POS (Mercado Pago Point, SumUp)
    pos_transaction_id: Optional[str] = None
    pos_device_id: Optional[str] = None
    
    # Reconciliation status
    reconciled: bool = Field(default=False)
    reconciled_at: Optional[datetime] = None
    reconciliation_status: str = Field(default="PENDING")  # "PENDING", "CONFIRMED", "FAILED"
    
    # Evidence
    receipt_photo: Optional[str] = None
    notes: Optional[str] = None
