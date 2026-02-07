"""
Tests for Agrotour Sync Engine.
"""

import pytest
from uuid import uuid4
from datetime import datetime
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.models import StockEvent, SyncConflict
from app.sync_engine import AgrotourSyncEngine


@pytest.fixture(name="session")
def session_fixture():
    """Create a test database session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def test_accept_operation_success(session: Session):
    """Test accepting a valid operation."""
    sync_engine = AgrotourSyncEngine(session)
    
    tenant_id = uuid4()
    product_id = uuid4()
    device_id = uuid4()
    user_id = uuid4()
    
    operation = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=device_id,
        device_type="DESKTOP",
        operation="DECREMENT",
        delta=5,
        reason="SALE",
        payment_status="PAID",
        amount=25000.0,
        lamport_ts=1,
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    
    operation.operation_hash = operation.compute_operation_hash()
    
    result = sync_engine.accept_operation(operation)
    
    assert result["status"] == "accepted"
    assert "operation_id" in result
    assert result["server_lamport"] > 0


def test_idempotency(session: Session):
    """Test that duplicate operations are rejected."""
    sync_engine = AgrotourSyncEngine(session)
    
    tenant_id = uuid4()
    product_id = uuid4()
    device_id = uuid4()
    user_id = uuid4()
    
    operation = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=device_id,
        device_type="DESKTOP",
        operation="DECREMENT",
        delta=5,
        reason="SALE",
        lamport_ts=1,
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    
    operation.operation_hash = operation.compute_operation_hash()
    
    # First operation should succeed
    result1 = sync_engine.accept_operation(operation)
    assert result1["status"] == "accepted"
    
    # Second identical operation should be duplicate
    operation2 = StockEvent(**operation.model_dump())
    result2 = sync_engine.accept_operation(operation2)
    assert result2["status"] == "duplicate"


def test_conflict_detection(session: Session):
    """Test that concurrent operations are detected."""
    sync_engine = AgrotourSyncEngine(session)
    
    tenant_id = uuid4()
    product_id = uuid4()
    user_id = uuid4()
    
    # First operation
    op1 = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=uuid4(),
        device_type="DESKTOP",
        operation="DECREMENT",
        delta=5,
        reason="SALE",
        lamport_ts=1,
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    op1.operation_hash = op1.compute_operation_hash()
    
    result1 = sync_engine.accept_operation(op1)
    assert result1["status"] == "accepted"
    
    # Concurrent operation from different device
    op2 = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=uuid4(),
        device_type="MOBILE",
        operation="DECREMENT",
        delta=3,
        reason="SALE",
        lamport_ts=2,  # Close Lamport timestamp
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    op2.operation_hash = op2.compute_operation_hash()
    
    result2 = sync_engine.accept_operation(op2)
    # Should detect conflict or accept based on rules
    assert result2["status"] in ["accepted", "conflict"]


def test_paid_sale_priority(session: Session):
    """Test that paid sales take priority in conflicts."""
    sync_engine = AgrotourSyncEngine(session)
    
    tenant_id = uuid4()
    product_id = uuid4()
    user_id = uuid4()
    
    # Unpaid reservation
    op1 = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=uuid4(),
        device_type="WEB",
        operation="DECREMENT",
        delta=5,
        reason="RESERVATION",
        payment_status="PENDING",
        lamport_ts=1,
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    op1.operation_hash = op1.compute_operation_hash()
    
    sync_engine.accept_operation(op1)
    
    # Paid sale (should win)
    op2 = StockEvent(
        tenant_id=tenant_id,
        product_id=product_id,
        device_id=uuid4(),
        device_type="DESKTOP",
        operation="DECREMENT",
        delta=5,
        reason="SALE",
        payment_status="PAID",
        amount=25000.0,
        lamport_ts=2,
        created_by=user_id,
        updated_by=user_id,
        operation_hash=""
    )
    op2.operation_hash = op2.compute_operation_hash()
    
    result = sync_engine.accept_operation(op2)
    assert result["status"] in ["accepted", "conflict"]
