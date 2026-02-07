"""
Integration test for Phase 0: Backend Foundation.
Verifies RLS + Sync Engine + Middleware integration.
"""

import pytest
import os
from uuid import uuid4
from datetime import datetime
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, text, SQLModel
from app.main import app
from app.database import engine, create_db_and_tables, apply_rls_policies
from app.models import StockEvent, Product

# Use the real database for RLS testing (SQLite memory doesn't support Postgres RLS)
DATABASE_URL = "postgresql://agrotour_user:agrotour_pass@localhost:5432/agrotour"


@pytest.fixture(name="client")
def client_fixture():
    """
    Setup and teardown for each test: Clean database, create tables, apply RLS.
    """
    # CLEANUP: Drop all tables
    with Session(engine) as session:
        session.exec(text("SET session authorization DEFAULT;"))
        session.exec(text("DROP SCHEMA public CASCADE;"))
        session.exec(text("CREATE SCHEMA public;"))
        session.commit()
    
    # SETUP: Create tables and apply RLS
    create_db_and_tables()
    
    # Provide test client
    with TestClient(app) as client:
        yield client


def test_rls_integration_middleware(client):
    """
    Test that TenantMiddleware correctly sets context and RLS prevents data leaks.
    """
    tenant_a = str(uuid4())
    tenant_b = str(uuid4())
    device_id = str(uuid4())
    product_id_a = str(uuid4())
    product_id_b = str(uuid4())
    user_id = str(uuid4())

    from app.models import Product
    
    with Session(engine) as session:
        # Insert for Tenant A
        session.exec(text(f"SET app.current_tenant_id = '{tenant_a}';"))
        sku_a = f"SKU_A_{uuid4().hex[:8]}"
        prod_a = Product(
            id=product_id_a, 
            tenant_id=tenant_a, 
            name="Prod A", 
            price=10.0, 
            sku=sku_a,
            current_stock=100, 
            created_by=uuid4(), 
            updated_by=uuid4(), 
            device_id=uuid4(), 
            device_type="SERVER"
        )
        session.add(prod_a)
        session.commit()

        # Insert for Tenant B 
        session.exec(text(f"SET app.current_tenant_id = '{tenant_b}';"))
        sku_b = f"SKU_B_{uuid4().hex[:8]}"
        prod_b = Product(
            id=product_id_b, 
            tenant_id=tenant_b, 
            name="Prod B", 
            price=20.0, 
            sku=sku_b,
            current_stock=50, 
            created_by=uuid4(), 
            updated_by=uuid4(), 
            device_id=uuid4(), 
            device_type="SERVER"
        )
        session.add(prod_b)
        session.commit()

    # 1. Push data for Tenant A
    payload_a = {
        "operations": [
            {
                "tenant_id": tenant_a,
                "product_id": product_id_a,
                "device_id": device_id,
                "device_type": "DESKTOP",
                "operation": "DECREMENT",
                "delta": 5,
                "reason": "SALE",
                "payment_status": "PAID",
                "amount": 100.0,
                "lamport_ts": 1,
                "created_by": user_id,
                "updated_by": user_id
            }
        ],
        "client_lamport": 1,
        "device_id": device_id
    }
    
    response = client.post("/sync/push", json=payload_a, headers={"X-Tenant-ID": tenant_a})
    assert response.status_code == 200

    # 2. Push data for Tenant B
    payload_b = {
        "operations": [
            {
                "tenant_id": tenant_b,
                "product_id": product_id_b,
                "device_id": device_id,
                "device_type": "DESKTOP",
                "operation": "DECREMENT",
                "delta": 3,
                "reason": "SALE",
                "lamport_ts": 1,
                "created_by": user_id,
                "updated_by": user_id
            }
        ],
        "client_lamport": 1,
        "device_id": device_id
    }
    
    response = client.post("/sync/push", json=payload_b, headers={"X-Tenant-ID": tenant_b})
    assert response.status_code == 200

    # 3. Pull data as Tenant A
    response = client.post(
        "/sync/pull",
        json={"tenant_id": tenant_a, "last_lamport": 0, "limit": 100},
        headers={"X-Tenant-ID": tenant_a}
    )
    assert response.status_code == 200
    ops = response.json()["operations"]
    assert len(ops) >= 1
    for op in ops:
        assert op["tenant_id"] == tenant_a
        assert op["product_id"] == product_id_a

    # 4. Pull data as Tenant B
    response = client.post(
        "/sync/pull",
        json={"tenant_id": tenant_b, "last_lamport": 0, "limit": 100},
        headers={"X-Tenant-ID": tenant_b}
    )
    ops_b = response.json()["operations"]
    assert len(ops_b) >= 1
    assert ops_b[0]["product_id"] == product_id_b


def test_middleware_missing_header(client):
    """Test that missing header returns 400."""
    response = client.post("/sync/pull", json={})
    assert response.status_code == 400
    assert "Missing X-Tenant-ID" in response.json()["detail"]
