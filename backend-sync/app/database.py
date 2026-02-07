"""
Database configuration and session management.
"""
# -*- coding: utf-8 -*-

from sqlmodel import SQLModel, create_engine, Session, text
from fastapi import Request
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/agrotour")

engine = create_engine(DATABASE_URL, echo=True)


def apply_rls_policies(engine):
    """
    Apply RLS policies to all tables with tenant_id.
    Also ensures 'app_user' exists for production security.
    """
    from sqlalchemy import text
    
    with Session(engine) as session:
        print("[INFO] Applying RLS Policies...")
        
        # 1. Create app_user if not exists
        try:
            session.exec(text("CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass';"))
            print("   [OK] Created role 'app_user'")
        except Exception:
            session.rollback()
            print("   [INFO] Role 'app_user' already exists")
            
        # 2. Apply RLS to all tables with tenant_id
        for table_name, table in SQLModel.metadata.tables.items():
            if 'tenant_id' in table.columns:
                print(f"   [SECURE] Securing table: {table_name}")
                
                # Enable RLS
                session.exec(text(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;"))
                
                # Create Policy (Drop if exists first)
                policy_name = f"{table_name}_isolation_policy"
                session.exec(text(f"DROP POLICY IF EXISTS {policy_name} ON {table_name};"))
                
                # Policy: tenant_id MUST match app.current_tenant_id
                policy_sql = f"""
                CREATE POLICY {policy_name} ON {table_name}
                    USING (tenant_id::text = current_setting('app.current_tenant_id', true))
                    WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
                """
                session.exec(text(policy_sql))
                
                # Force RLS for owner
                session.exec(text(f"ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;"))
                
                # Grant access to app_user
                session.exec(text(f"GRANT ALL ON TABLE {table_name} TO app_user;"))
        
        # Grant schema usage and table access
        session.exec(text("GRANT USAGE ON SCHEMA public TO app_user;"))
        session.exec(text("GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;"))
        
        session.commit()
        print("[INFO] RLS Policies Applied Successfully")


def create_db_and_tables():
    """Create all database tables and apply RLS."""
    SQLModel.metadata.create_all(engine)
    apply_rls_policies(engine)


def get_session(request: Request = None) -> Generator[Session, None, None]:
    """
    Dependency to get database session with RLS context enabled.
    """
    # Use the restricted user for application logic if configured
    # For now, we use the engine default, but we MUST set the tenant context
    
    with Session(engine) as session:
        if request and hasattr(request.state, "tenant_id"):
            tenant_id = request.state.tenant_id
            
            # 1. Switch to restricted role (prevents superuser bypass)
            session.exec(text("SET ROLE app_user;"))
            
            # 2. Set the RLS variable for the session
            session.exec(text(f"SET app.current_tenant_id = '{tenant_id}';"))
            
            # Optional: Verify it was set (debug only)
            # print(f"DEBUG: RLS Context set to {tenant_id}")
            
        yield session
