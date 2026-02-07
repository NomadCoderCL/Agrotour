"""
Pydantic schemas for API requests and responses.
"""

from datetime import datetime
from typing import List, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class StockEventCreate(BaseModel):
    """Schema for creating a stock event."""
    
    tenant_id: UUID
    product_id: UUID
    device_id: UUID
    device_type: str
    
    operation: str
    delta: int
    reason: str
    
    payment_status: Optional[str] = None
    amount: Optional[float] = None
    
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    
    lamport_ts: int = 0
    version: int = 1
    
    created_by: UUID
    updated_by: UUID
    
    operation_hash: Optional[str] = None


class ProductSync(BaseModel):
    """Schema for syncing product state."""
    id: UUID
    tenant_id: UUID
    
    name: str
    description: Optional[str] = None
    price: float
    sku: str
    category: Optional[str] = None
    current_stock: int
    
    device_id: UUID
    device_type: str
    
    lamport_ts: int = 0
    version: int = 1
    is_deleted: bool = False
    
    created_by: UUID
    updated_by: UUID


class PendingPaymentSync(BaseModel):
    """Schema for syncing pending payments."""
    id: UUID
    tenant_id: UUID
    
    sale_id: UUID
    amount: float
    payment_method: str
    
    pos_transaction_id: Optional[str] = None
    pos_device_id: Optional[str] = None
    
    reconciled: bool = False
    reconciled_at: Optional[datetime] = None
    reconciliation_status: str = "PENDING"
    
    receipt_photo: Optional[str] = None
    notes: Optional[str] = None
    
    device_id: UUID
    device_type: str
    
    lamport_ts: int = 0
    version: int = 1
    is_deleted: bool = False
    
    created_by: UUID
    updated_by: UUID


class SyncPushRequest(BaseModel):
    """Request to push operations to server."""
    
    operations: List[StockEventCreate] = [] # Events (Append-only)
    products: List[ProductSync] = []        # State (Last-Write-Wins)
    payments: List[PendingPaymentSync] = [] # State (Last-Write-Wins)
    
    client_lamport: int
    device_id: UUID


class SyncPushResponse(BaseModel):
    """Response from push operation."""
    
    results: List[Dict]
    server_lamport: int
    timestamp: datetime


class SyncPullRequest(BaseModel):
    """Request to pull operations from server."""
    
    tenant_id: UUID
    last_lamport: int
    limit: Optional[int] = 100


class SyncPullResponse(BaseModel):
    """Response from pull operation."""
    
    operations: List[Dict]
    server_lamport: int
    has_more: bool


class ConflictListResponse(BaseModel):
    """Response listing conflicts."""
    
    conflicts: List[Dict]
    total: int
