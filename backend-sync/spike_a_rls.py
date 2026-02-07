"""
Spike A: PostgreSQL Row-Level Security (RLS) Validation.
Objective: Prove that RLS prevents data leakage between tenants.
"""

import os
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session, select, text
from sqlalchemy import event

# --- 1. Models Definition with RLS ---

class TenantBaseModel(SQLModel):
    """Base model with tenant_id for RLS."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True, nullable=False)

class Product(TenantBaseModel, table=True):
    __tablename__ = "products_rls_test"
    name: str
    price: float

# --- 2. Database Setup ---

# Connect using credentials from docker-compose.yml
DATABASE_URL = "postgresql://agrotour_user:agrotour_pass@localhost:5432/agrotour"
engine = create_engine(DATABASE_URL, echo=False)

# --- 3. RLS Configuration ---

def setup_rls(session: Session):
    """Enable RLS and setup unprivileged user."""
    print("🔒 Configuring RLS...")
    
    # Check current user info
    user_info = session.exec(text("SELECT current_user, session_user, current_setting('is_superuser');")).first()
    print(f"   Current User: {user_info}")
    
    # Enable RLS
    session.exec(text(f"ALTER TABLE products_rls_test ENABLE ROW LEVEL SECURITY;"))
    
    # Create Policy
    policy_sql = """
    DROP POLICY IF EXISTS tenant_isolation_policy ON products_rls_test;
    CREATE POLICY tenant_isolation_policy ON products_rls_test
        USING (tenant_id::text = current_setting('app.current_tenant_id', true))
        WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
    """
    session.exec(text(policy_sql))
    
    # Enable bypass for owner/superuser explicitly? No need, they bypass by default.
    # But for testing, we want to test RESTRAINT.
    # We will create a role app_user that is NOT superuser.
    
    try:
        session.exec(text("CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass';"))
        print("   ✅ Created role 'app_user'")
    except Exception as e:
        print("   ℹ️ Role 'app_user' already exists or error:", e)
        session.rollback()
    
    # Grant permissions to app_user
    session.exec(text("GRANT ALL ON TABLE products_rls_test TO app_user;"))
    # Also grant usage on schema public if needed
    session.exec(text("GRANT USAGE ON SCHEMA public TO app_user;"))
    
    session.commit()
    print("✅ RLS Configured successfully.")

def check_rls_status(session: Session):
    """Verify if RLS is actually active."""
    result = session.exec(text(
        "SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'products_rls_test'"
    )).first()
    print(f"   Table Status: RLS Enabled={result[1]}, Forced={result[2]}")

def switch_to_app_user(session: Session):
    """Switch current session to unprivileged user."""
    print("🔄 Switching to 'app_user' (non-superuser)...")
    session.exec(text("SET ROLE app_user;"))
    
    user_info = session.exec(text("SELECT current_user, session_user, current_setting('is_superuser');")).first()
    print(f"   Current User Now: {user_info}")


# --- 4. Simulation Helpers ---

def set_tenant_context(session: Session, tenant_id: UUID):
    """Simulate logging in as a specific tenant."""
    session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))

def reset_tenant_context(session: Session):
    """Clear tenant context."""
    session.exec(text("RESET app.current_tenant_id;"))

# --- 5. Main Test Execution ---

def run_spike():
    print("\n🧪 Spike A: PostgreSQL RLS Validation\n")
    
    # 1. Create tables
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        setup_rls(session)
        check_rls_status(session)
        switch_to_app_user(session)
        
        # 2. Create Test Tenants
        tenant_a = uuid4()
        tenant_b = uuid4()
        print(f"👤 Tenant A ID: {tenant_a}")
        print(f"👤 Tenant B ID: {tenant_b}")
        
        # 3. Insert Data (Simulating Tenant A)
        print("\n📝 Inserting data as Tenant A...")
        set_tenant_context(session, tenant_a)
        
        prod_a1 = Product(tenant_id=tenant_a, name="Manzanas Tenant A", price=100)
        prod_a2 = Product(tenant_id=tenant_a, name="Peras Tenant A", price=120)
        session.add(prod_a1)
        session.add(prod_a2)
        session.commit()
        print("✅ Data inserted for Tenant A.")
        
        # 4. Insert Data (Simulating Tenant B)
        print("\n📝 Inserting data as Tenant B...")
        set_tenant_context(session, tenant_b)
        
        prod_b1 = Product(tenant_id=tenant_b, name="Uvas Tenant B", price=200)
        session.add(prod_b1)
        session.commit()
        print("✅ Data inserted for Tenant B.")
        
        # 5. VERIFICATION: Tenant A should ONLY see Tenant A data
        print("\n🔍 Verifying isolation for Tenant A...")
        set_tenant_context(session, tenant_a)
        
        results_a = session.exec(select(Product)).all()
        print(f"   Rows visible to Tenant A: {len(results_a)}")
        for p in results_a:
            print(f"   - {p.name} (Tenant: {p.tenant_id})")
        
        assert len(results_a) == 2
        assert all(p.tenant_id == tenant_a for p in results_a)
        print("✅ SUCCESS: Tenant A only sees their own data.")
        
        # 6. VERIFICATION: Tenant B should ONLY see Tenant B data
        print("\n🔍 Verifying isolation for Tenant B...")
        set_tenant_context(session, tenant_b)
        
        results_b = session.exec(select(Product)).all()
        print(f"   Rows visible to Tenant B: {len(results_b)}")
        for p in results_b:
            print(f"   - {p.name} (Tenant: {p.tenant_id})")
            
        assert len(results_b) == 1
        assert results_b[0].tenant_id == tenant_b
        print("✅ SUCCESS: Tenant B only sees their own data.")
        
        # 7. SECURITY TEST: Attempt cross-tenant insert
        print("\n☠️ Security Test: Tenant A tries to insert data for Tenant B...")
        set_tenant_context(session, tenant_a)
        
        try:
            # Malicious insert: Tenant A tries to write with Tenant B's ID
            malicious_prod = Product(tenant_id=tenant_b, name="HACKED PRODUCT", price=0)
            session.add(malicious_prod)
            session.commit()
            print("❌ FAILURE: Insert should have failed!")
        except Exception as e:
            print(f"✅ SUCCESS: Database blocked the write operation.\n   Error: {str(e).splitlines()[0]}")
            session.rollback()

if __name__ == "__main__":
    try:
        run_spike()
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
