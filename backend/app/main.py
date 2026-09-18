"""Main application entry point for CodeGuard backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import HealthResponse

# Initialize FastAPI application
app = FastAPI(
    title="CodeGuard API",
    description="Agentic AI Code Review & Security Assistant Backend API",
    version="1.0.0",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
    description="Verifies backend service availability.",
)
async def health_check() -> HealthResponse:
    """Return backend health status and version."""
    return HealthResponse(status="ok", version="1.0.0")


@app.get(
    "/",
    tags=["System"],
    summary="Root index",
    description="Basic service info.",
)
async def root() -> dict:
    """Root endpoint for quick service inspection."""
    return {
        "service": "CodeGuard API",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }
