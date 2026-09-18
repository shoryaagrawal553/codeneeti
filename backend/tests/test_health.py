"""Tests for health check endpoint and application bootstrapping."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models import HealthResponse

client = TestClient(app)


def test_health_endpoint():
    """Verify that GET /api/health returns 200 OK and conforms to HealthResponse."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"

    # Validate against Pydantic schema
    model = HealthResponse(**data)
    assert model.status == "ok"
    assert model.version == "1.0.0"


def test_cors_headers_present():
    """Verify CORS preflight/request headers allow frontend origin."""
    response = client.get(
        "/api/health",
        headers={"Origin": "http://localhost:5173"}
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_root_endpoint():
    """Verify that GET / returns service overview."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "CodeGuard API"
