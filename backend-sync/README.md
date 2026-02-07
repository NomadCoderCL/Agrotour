# Agrotour Sync Engine

FastAPI-based synchronization engine for Agrotour offline-first multi-platform system.

## Features

- ✅ Offline-first synchronization
- ✅ Multi-tenancy with tenant isolation
- ✅ Idempotent operations
- ✅ Three-tier conflict resolution (hardcoded → heuristics → manual)
- ✅ Event sourcing for inventory
- ✅ Lamport timestamps for causal ordering
- ✅ Comprehensive conflict logging

## Architecture

Based on consensus from 5 AI assistants (Grok, ChatGPT, Qwen, Claude, Gemini):
- Simplified sync model (Lamport + version int, no vector clocks initially)
- Hardcoded rules for deterministic conflict resolution
- Manual approval for ambiguous conflicts
- AI suggestions postponed to Phase 9

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7.0+

### Installation

```bash
# Install dependencies
poetry install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

```bash
# Create PostgreSQL database
createdb agrotour

# Tables will be created automatically on first run
```

### Run Development Server

```bash
poetry run uvicorn app.main:app --reload --port 8001
```

Server will be available at `http://localhost:8001`

API documentation at `http://localhost:8001/docs`

## API Endpoints

### POST /sync/push
Push operations from client to server.

**Request:**
```json
{
  "operations": [
    {
      "tenant_id": "uuid",
      "product_id": "uuid",
      "device_id": "uuid",
      "device_type": "DESKTOP",
      "operation": "DECREMENT",
      "delta": 5,
      "reason": "SALE",
      "payment_status": "PAID",
      "amount": 25000.0,
      "lamport_ts": 42,
      "created_by": "uuid",
      "updated_by": "uuid"
    }
  ],
  "client_lamport": 42,
  "device_id": "uuid"
}
```

**Response:**
```json
{
  "results": [
    {
      "status": "accepted",
      "operation_id": "uuid",
      "server_lamport": 43
    }
  ],
  "server_lamport": 43,
  "timestamp": "2026-02-05T22:00:00Z"
}
```

### POST /sync/pull
Pull operations from server to client.

**Request:**
```json
{
  "tenant_id": "uuid",
  "last_lamport": 40,
  "limit": 100
}
```

**Response:**
```json
{
  "operations": [...],
  "server_lamport": 43,
  "has_more": false
}
```

### GET /sync/conflicts
List synchronization conflicts.

**Query Parameters:**
- `tenant_id`: Tenant UUID
- `status`: Filter by status (PENDING, RESOLVED_AUTO, RESOLVED_MANUAL)

### POST /sync/conflicts/{conflict_id}/resolve
Manually resolve a conflict.

## Testing

```bash
# Run tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app
```

## Project Structure

```
backend-sync/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── models.py         # SQLModel models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   └── sync_engine.py    # Core sync logic
├── tests/
│   └── test_sync.py
├── pyproject.toml
├── .env.example
└── README.md
```

## Development

### Code Style

```bash
# Format code
poetry run black app/

# Lint code
poetry run ruff app/
```

### Adding Dependencies

```bash
poetry add package-name
```

## Deployment

See `docs/deployment.md` for production deployment instructions.

## License

Proprietary - Agrotour © 2026
