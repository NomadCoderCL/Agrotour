
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, text, SQLModel
from app.main import app
from app.models import Product, PendingPayment
from app.database import engine, create_db_and_tables

@pytest.fixture(name="client")
def client_fixture():
    SQLModel.metadata.drop_all(engine)
    create_db_and_tables()
    with TestClient(app) as client:
        yield client

def test_product_state_sync_lww(client):
    """Test Last-Write-Wins logic for Product state sync."""
    tenant_id = str(uuid4())
    product_id = str(uuid4())
    device_id = str(uuid4())
    user_id = str(uuid4())
    
    # 1. Create Initial Product (Simulate existing state)
    with Session(engine) as session:
        # Set RLS context
        session.exec(text("SET ROLE app_user;"))
        session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))
        
        prod = Product(
            id=product_id, 
            tenant_id=tenant_id, 
            name="Old Name", 
            price=10.0, 
            sku="SKU_1", 
            current_stock=10, 
            lamport_ts=1,
            created_by=user_id, 
            updated_by=user_id, 
            device_id=device_id, 
            device_type="SERVER"
        )
        session.add(prod)
        session.commit()

    # 2. Push NEWER Update (Higher Lamport) -> Should Update
    print("\n🔹 Testing Push Updated Product (Higher Lamport)...")
    payload_update = {
        "products": [{
            "id": product_id,
            "tenant_id": tenant_id,
            "name": "New Name",
            "price": 20.0,
            "sku": "SKU_1",
            "current_stock": 5,
            "lamport_ts": 5, # Higher than 1
            "device_id": device_id,
            "device_type": "WEB",
            "created_by": user_id,
            "updated_by": user_id
        }],
        "operations": [],
        "payments": [],
        "client_lamport": 5,
        "device_id": device_id
    }
    
    response = client.post("/sync/push", json=payload_update, headers={"X-Tenant-ID": tenant_id})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["results"][0]["status"] == "accepted"
    print("✅ Update Accepted")
    
    # Verify DB update
    with Session(engine) as session:
        session.exec(text("SET ROLE app_user;"))
        session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))
        updated_prod = session.get(Product, product_id)
        assert updated_prod.name == "New Name"
        assert updated_prod.lamport_ts == 6 # Server increments max(server, client) + 1
        print(f"✅ DB Verified: Name='{updated_prod.name}', Lamport={updated_prod.lamport_ts}")

    # 3. Push STALE Update (Lower Lamport) -> Should Ignore
    print("\n🔹 Testing Push Stale Product (Lower Lamport)...")
    payload_stale = {
        "products": [{
            "id": product_id,
            "tenant_id": tenant_id,
            "name": "Stale Name",
            "price": 99.0,
            "sku": "SKU_1",
            "current_stock": 99,
            "lamport_ts": 2, # Lower than current DB (6)
            "device_id": device_id,
            "device_type": "WEB",
            "created_by": user_id,
            "updated_by": user_id
        }],
        "operations": [],
        "payments": [],
        "client_lamport": 2,
        "device_id": device_id
    }
    
    response = client.post("/sync/push", json=payload_stale, headers={"X-Tenant-ID": tenant_id})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["results"][0]["status"] == "ignored"
    print("✅ Stale Update Ignored")
    
    # Verify DB Unchanged
    with Session(engine) as session:
        session.exec(text("SET ROLE app_user;"))
        session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))
        prod_check = session.get(Product, product_id)
        assert prod_check.name == "New Name"
        print("✅ DB Verified: Name still 'New Name'")


def test_payment_sync_creation(client):
    """Test syncing a new PendingPayment."""
    tenant_id = str(uuid4())
    payment_id = str(uuid4())
    sale_id = str(uuid4())
    device_id = str(uuid4())
    user_id = str(uuid4())
    
    print("\n🔹 Testing Push New Payment...")
    payload = {
        "payments": [{
            "id": payment_id,
            "tenant_id": tenant_id,
            "sale_id": sale_id,
            "amount": 1500.0,
            "payment_method": "CASH",
            "reconciliation_status": "PENDING",
            "lamport_ts": 1,
            "device_id": device_id,
            "device_type": "MOBILE",
            "created_by": user_id,
            "updated_by": user_id
        }],
        "operations": [],
        "products": [],
        "client_lamport": 1,
        "device_id": device_id
    }
    
    response = client.post("/sync/push", json=payload, headers={"X-Tenant-ID": tenant_id})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["results"][0]["status"] == "accepted"
    print("✅ Payment Accepted")
    
    # Verify DB
    with Session(engine) as session:
        session.exec(text("SET ROLE app_user;"))
        session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))
        payment = session.get(PendingPayment, payment_id)
        assert payment is not None
        assert payment.amount == 1500.0
        print("✅ DB Verified: Payment exists")

if __name__ == "__main__":
    t = TestClient(app)
    try:
        SQLModel.metadata.drop_all(engine)
        create_db_and_tables()
        test_product_state_sync_lww(t)
        test_payment_sync_creation(t)
        print("\n🎉 ALL TESTS PASSED!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n❌ TESTS FAILED: {e}")
