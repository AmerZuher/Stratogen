# Backend API - AI-Powered PPM

Enterprise-grade FastAPI backend for the AI-powered Project Portfolio Management platform.  
It handles authentication, investment lifecycle operations, governance workflows, document handling, notifications, and LLM-powered assistance.

## What This Backend Delivers

- **Secure access control** with JWT authentication and password hashing
- **Portfolio operations** for investments, ideas, projects, tasks, risks, and issues
- **AI services** for guided analysis and conversational support in PPM workflows
- **Document and reporting support** for portfolio artifacts and generated outputs
- **Notification workflows** to keep teams aligned on changes and actions
- **Reliable data layer** using PostgreSQL, async SQLAlchemy, and Alembic migrations

## API Surface

The service is organized into focused API domains:

- `/api/auth` - authentication and user access flows
- `/api/investments` - investment and portfolio entities
- `/api/risks_issues` - governance for risks and issues
- `/api/documents` - document upload and retrieval
- `/api/ai_services` - AI-powered endpoints
- `/api/notifications` - notification operations

Core service endpoints:

- `GET /health` - health check
- `GET /` - service metadata
- `GET /docs` - OpenAPI UI (enabled in debug mode)

## Architecture Highlights

- **Async-first backend** with FastAPI + SQLAlchemy async engine
- **Database lifecycle management** on startup with required directory bootstrapping
- **Global exception handling** and centralized logging utilities
- **Environment-driven configuration** using `pydantic-settings`
- **Modular structure** across routers, models, utilities, and services

## Technical Data (Short)

- **Language:** Python `>=3.11, <3.14`
- **Framework:** FastAPI, Uvicorn
- **Database:** PostgreSQL (`asyncpg`, `psycopg2-binary`)
- **ORM & Migrations:** SQLAlchemy, Alembic
- **Security:** `python-jose`, `PyJWT`, `passlib[bcrypt]`
- **Validation & Config:** Pydantic, pydantic-settings, python-dotenv
- **AI/ML:** torch, pandas, httpx/requests-based model integration
- **Docs/File Processing:** PyPDF2, python-pptx, python-docx, pytesseract, reportlab, openpyxl
- **Developer Tooling:** uv, pytest, black, isort, mypy, flake8

## Quick Start

### Prerequisites

- Python `3.11+`
- PostgreSQL
- `uv` installed

### Install and Run

```bash
cd Backend
cp Secret/.env.example Secret/.env
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`.

## Environment Setup

Configure `Backend/Secret/.env` at minimum:

- `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS`
- Optional AI keys/tokens: `HF_TOKEN`, `GEMINI_API_KEY`

## Directory Snapshot

```text
Backend/
├── app/                 # API routers, business logic, data models, utilities
├── alembic/             # Migration configuration
├── migrations/          # Database migration scripts
├── Secret/              # Environment templates and local env files
├── pyproject.toml       # Dependencies and project metadata
├── uv.lock              # Reproducible dependency lockfile
└── README.md            # Backend documentation
```
