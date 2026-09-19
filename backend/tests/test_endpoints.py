"""Tests for BE-002: Health, Languages, and Validation guards."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import ErrorResponse, HealthResponse, LanguagesResponse

client = TestClient(app)


def test_get_health():
    """Verify GET /api/health endpoint conforms to API_CONTRACT.md."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    model = HealthResponse.model_validate(data)
    assert model.status == "ok"
    assert model.version == "1.0.0"


def test_get_languages():
    """Verify GET /api/languages endpoint returns Python and JavaScript."""
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    model = LanguagesResponse.model_validate(data)
    lang_ids = [l.id for l in model.languages]
    assert "python" in lang_ids
    assert "javascript" in lang_ids

    py = next(l for l in model.languages if l.id == "python")
    assert ".py" in py.extensions
    js = next(l for l in model.languages if l.id == "javascript")
    assert ".js" in js.extensions


def test_validation_missing_code_empty_body():
    """Verify omitting code returns 400 MISSING_CODE."""
    response = client.post("/api/analyze", json={})
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "MISSING_CODE"
    assert err.partial_result is None


def test_validation_missing_code_empty_string():
    """Verify empty string code returns 400 MISSING_CODE."""
    response = client.post("/api/analyze", json={"code": ""})
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "MISSING_CODE"
    assert err.partial_result is None


def test_validation_missing_code_whitespace():
    """Verify whitespace-only code returns 400 MISSING_CODE."""
    response = client.post("/api/analyze", json={"code": "   \n\t  "})
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "MISSING_CODE"
    assert err.partial_result is None


def test_validation_code_too_large():
    """Verify code > 100 KB (102,400 bytes) returns 400 CODE_TOO_LARGE."""
    oversized_code = "x = 1\n" * 25000  # > 150 KB
    response = client.post("/api/analyze", json={"code": oversized_code})
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "CODE_TOO_LARGE"
    assert err.partial_result is None


def test_validation_unsupported_language():
    """Verify unsupported language returns 400 UNSUPPORTED_LANGUAGE."""
    response = client.post(
        "/api/analyze",
        json={"code": "print('hello')", "language": "ruby"},
    )
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "UNSUPPORTED_LANGUAGE"
    assert err.partial_result is None


def test_validation_unsupported_file_extension():
    """Verify unsupported filename extension returns 400 UNSUPPORTED_FILE_TYPE."""
    response = client.post(
        "/api/analyze",
        json={"code": "print('hello')", "filename": "script.rb"},
    )
    assert response.status_code == 400
    data = response.json()
    err = ErrorResponse.model_validate(data)
    assert err.error == "UNSUPPORTED_FILE_TYPE"
    assert err.partial_result is None


def test_validation_valid_python_request():
    """Verify valid Python request passes validation."""
    response = client.post(
        "/api/analyze",
        json={"code": "x = 1\n", "language": "python", "filename": "app.py"},
    )
    assert response.status_code == 200


def test_validation_valid_javascript_request():
    """Verify valid JavaScript request passes validation."""
    response = client.post(
        "/api/analyze",
        json={"code": "const x = 1;\n", "language": "javascript", "filename": "app.js"},
    )
    assert response.status_code == 200


def test_refine_endpoint_validation_empty_instruction():
    """Verify POST /api/refine rejects empty instruction."""
    payload = {
        "original_code": "x = 1",
        "language": "python",
        "findings": [],
        "instruction": "   ",
    }
    response = client.post("/api/refine", json=payload)
    assert response.status_code == 400


def test_refine_endpoint_validation_oversized_instruction():
    """Verify POST /api/refine rejects instructions > 2048 chars."""
    payload = {
        "original_code": "x = 1",
        "language": "python",
        "findings": [],
        "instruction": "a" * 2050,
    }
    response = client.post("/api/refine", json=payload)
    assert response.status_code == 400


def test_refine_endpoint_success_flow():
    """Verify POST /api/refine executes refinement and returns RefineResult."""
    payload = {
        "original_code": "cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
        "current_fixed_code": "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
        "language": "python",
        "findings": [
            {
                "id": "f1",
                "line_start": 1,
                "line_end": 1,
                "rule_id": "bandit.B608",
                "severity": "Critical",
                "title": "SQL Injection",
                "explanation": "Direct interpolation",
                "category": "Security",
                "cwe": "CWE-89",
                "confidence": "High",
                "verification_status": "Unavailable",
            }
        ],
        "instruction": "Use named parameters dictionary instead of tuple.",
    }
    response = client.post("/api/refine", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "refined_code" in data
    assert "refine_summary" in data
    assert "verification_status" in data
    assert "scanner_findings_count" in data

