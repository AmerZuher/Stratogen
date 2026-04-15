"""
FastAPI Enterprise Project Management System
Production-ready backend with workflow automation and AI integration
"""
import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer

from app.routers import llm_services
from app.core.settings import settings
from app.core.database import engine, create_database_if_not_exists
from app.models import Base
from app.routers import auth, investments, workflows, documents,  risks_issues, notifications
from app.utils.logging import setup_logging
from app.utils.exceptions import global_exception_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    # Startup
    setup_logging()
    logger = logging.getLogger(__name__)
    
    try:
        # Ensure database exists
        await create_database_if_not_exists()
        
        # Create all tables
        # async with engine.begin() as conn:
            # await conn.run_sync(Base.metadata.create_all)
        
        # Ensure required directories exist
        Path(settings.DATA_WAREHOUSE_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.DATA_DOCUMENTS_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.DATA_REPORTS_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.LOG_DIR).mkdir(parents=True, exist_ok=True)
        
        logger.info("Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        raise HTTPException(status_code=500, detail="Application initialization failed")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown initiated")
    await engine.dispose()
    logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title="Enterprise Project Management System",
    description="Production-ready FastAPI backend with workflow automation and AI integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Security scheme
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(investments.router, prefix="/api/investments", tags=["Investments"])
app.include_router(risks_issues.router, prefix="/api/risks_issues", tags=["risks_issues"])
# app.include_router(workflows.router, prefix="/api/workflow", tags=["Workflows"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(llm_services.router, prefix="/api/ai_services", tags=["ai_services"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

#app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "10.0.0"}


@app.get("/")
async def root():
    return {
        "message": "Enterprise Project Management System API",
        "version": "10.0.0",
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
