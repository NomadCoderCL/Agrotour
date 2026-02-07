"""
Tenant Middleware for Agrotour Sync Engine.
Enforces Row-Level Security (RLS) context for every request.
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlmodel import Session, text
from uuid import UUID
from .database import engine

class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle multi-tenancy.
    Extracts tenant_id from headers and sets RLS context in the database.
    """
    
    async def dispatch(self, request: Request, call_next):
        # 1. Extract Tenant ID
        # For Phase 0, we expect it in the header 'X-Tenant-ID'
        # In production, this might come from the JWT token or subdomain
        tenant_id_str = request.headers.get("X-Tenant-ID")
        
        if not tenant_id_str:
            # Allow health check without tenant context
            if request.url.path == "/" or request.url.path == "/docs" or request.url.path == "/openapi.json":
                return await call_next(request)
                
            return await self._error_response("Missing X-Tenant-ID header")
            
        try:
            tenant_uuid = UUID(tenant_id_str)
        except ValueError:
            return await self._error_response("Invalid X-Tenant-ID header format")

        # 2. Set RLS Context for this request
        # We need to ensure the DB session used in the endpoint has this context.
        # However, FastAPI dependency injection creates a new session per endpoint.
        # Since RLS is session-bound in Postgres, we have to rely on the fact 
        # that the dependency will use the SAME connection logic or set it explicitly.
        
        # CRITICAL: In async FastAPI with SQLAlchemy, simply setting it here might not 
        # propagate to the session created in the route if they use different connections from pool.
        # Strategy: We will store tenant_id in request.state and the `get_session` dependency
        #, MUST assume responsibility for setting `SET app.current_tenant_id` on the connection it yields.
        
        request.state.tenant_id = tenant_uuid
        
        response = await call_next(request)
        return response

    async def _error_response(self, message: str):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": message}
        )
