"""
FastAPI application for Agrotour Sync Engine.
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
from datetime import datetime
import os
from dotenv import load_dotenv

from .database import get_session, create_db_and_tables
from .models import StockEvent, SyncConflict
from .sync_engine import AgrotourSyncEngine
from .schemas import (
    SyncPushRequest,
    SyncPushResponse,
    SyncPullRequest,
    SyncPullResponse,
    ConflictListResponse
)

from .middleware import TenantMiddleware

load_dotenv()

app = FastAPI(
    title="Agrotour Sync Engine",
    description="Offline-first synchronization engine for Agrotour multi-platform system",
    version="0.1.0"
)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Multi-tenancy Middleware
app.add_middleware(TenantMiddleware)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    create_db_and_tables()


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "service": "Agrotour Sync Engine",
        "status": "operational",
        "version": "0.1.0"
    }


@app.post("/sync/push", response_model=SyncPushResponse)
def sync_push(
    request: SyncPushRequest,
    session: Session = Depends(get_session)
):
    """
    Push operations from client to server.
    Implements idempotency, conflict detection, and resolution.
    
    Args:
        request: Batch of operations to sync
        session: Database session
    
    Returns:
        SyncPushResponse with results for each operation
    """
    sync_engine = AgrotourSyncEngine(session)
    results = []
    
    # 1. Process Stock Events (Operations)
    for operation_data in request.operations:
        # Create StockEvent from request data
        operation = StockEvent(**operation_data.model_dump())
        
        # Compute operation hash if not provided
        if not operation.operation_hash:
            operation.operation_hash = operation.compute_operation_hash()
        
        # Accept operation through sync engine
        result = sync_engine.accept_operation(operation)
        results.append(result)
        
    # 2. Process Products (State Sync)
    from .models import Product
    for product_data in request.products:
        product = Product(**product_data.model_dump())
        product.content_hash = product.compute_hash() # Ensure hash is computed
        
        result = sync_engine.accept_operation(product)
        results.append(result)

    # 3. Process Pending Payments (State Sync)
    from .models import PendingPayment
    for payment_data in request.payments:
        payment = PendingPayment(**payment_data.model_dump())
        payment.content_hash = payment.compute_hash()
        
        result = sync_engine.accept_operation(payment)
        results.append(result)
    
    return SyncPushResponse(
        results=results,
        server_lamport=sync_engine.server_lamport,
        timestamp=datetime.utcnow()
    )


@app.post("/sync/pull", response_model=SyncPullResponse)
def sync_pull(
    request: SyncPullRequest,
    session: Session = Depends(get_session)
):
    """
    Pull operations from server to client.
    Returns operations newer than client's last sync.
    
    Args:
        request: Client's last known Lamport timestamp
        session: Database session
    
    Returns:
        SyncPullResponse with new operations
    """
    # Query operations newer than client's last sync
    from sqlmodel import select
    
    statement = select(StockEvent).where(
        StockEvent.tenant_id == request.tenant_id,
        StockEvent.lamport_ts > request.last_lamport,
        StockEvent.is_deleted == False
    ).order_by(StockEvent.lamport_ts).limit(request.limit or 100)
    
    operations = session.exec(statement).all()
    
    return SyncPullResponse(
        operations=[op.model_dump() for op in operations],
        server_lamport=AgrotourSyncEngine(session).server_lamport,
        has_more=len(operations) == (request.limit or 100)
    )


@app.get("/sync/conflicts", response_model=ConflictListResponse)
def list_conflicts(
    tenant_id: str,
    status: str = "PENDING",
    session: Session = Depends(get_session)
):
    """
    List synchronization conflicts for a tenant.
    
    Args:
        tenant_id: Tenant UUID
        status: Filter by status (PENDING, RESOLVED_AUTO, RESOLVED_MANUAL)
        session: Database session
    
    Returns:
        List of conflicts
    """
    from sqlmodel import select
    from uuid import UUID
    
    statement = select(SyncConflict).where(
        SyncConflict.status == status
    ).order_by(SyncConflict.detected_at.desc()).limit(50)
    
    conflicts = session.exec(statement).all()
    
    return ConflictListResponse(
        conflicts=[c.model_dump() for c in conflicts],
        total=len(conflicts)
    )


@app.post("/sync/conflicts/{conflict_id}/resolve")
def resolve_conflict(
    conflict_id: str,
    winner_id: str,
    resolved_by: str,
    feedback: str = None,
    session: Session = Depends(get_session)
):
    """
    Manually resolve a conflict.
    
    Args:
        conflict_id: Conflict UUID
        winner_id: Winning operation UUID
        resolved_by: User UUID who resolved the conflict
        feedback: Optional user feedback
        session: Database session
    """
    from uuid import UUID
    from datetime import datetime
    
    conflict = session.get(SyncConflict, UUID(conflict_id))
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conflict not found"
        )
    
    conflict.status = "RESOLVED_MANUAL"
    conflict.winner_id = UUID(winner_id)
    conflict.resolved_by = UUID(resolved_by)
    conflict.resolved_at = datetime.utcnow()
    conflict.user_feedback = feedback
    
    session.add(conflict)
    session.commit()
    
    return {
        "status": "resolved",
        "conflict_id": conflict_id,
        "winner_id": winner_id
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
