"""Tests for BE-006: Pipeline orchestration and end-to-end POST /api/analyze."""

import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import ReviewResult
from app.pipeline import _detect_language

client = TestClient(app)

BENCHMARK_VULNERABLE_CODE = """import sqlite3

DB_PASSWORD = "super_secret_db_password_123"

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE name = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()
"""

CLEAN_CODE = """def add(a: int, b: int) -> int:
    return a + b
"""


def test_detect_language():
    """Verify deterministic language resolution."""
    assert _detect_language("x = 1", "test.py", "auto") == "python"
    assert _detect_language("x = 1", "test.js", "auto") == "javascript"
    assert _detect_language("const a = 5;", None, "auto") == "javascript"
    assert _detect_language("def hello(): pass", None, "auto") == "python"
    assert _detect_language("anything", None, "javascript") == "javascript"


def test_analyze_endpoint_clean_code():
    """Verify POST /api/analyze returns 0 findings on clean code."""
    response = client.post(
        "/api/analyze",
        json={"code": CLEAN_CODE, "language": "python", "filename": "math_utils.py"},
    )
    assert response.status_code == 200
    data = response.json()
    result = ReviewResult.model_validate(data)

    assert result.language == "python"
    assert len(result.findings) == 0
    assert result.summary.total_findings == 0
    assert result.fix_available is False
    assert result.verification_available is False


def test_analyze_endpoint_vulnerable_benchmark_flow():
    """Verify POST /api/analyze detects vulnerabilities and returns full ReviewResult schema."""
    response = client.post(
        "/api/analyze",
        json={
            "code": BENCHMARK_VULNERABLE_CODE,
            "language": "python",
            "filename": "database.py",
        },
    )
    assert response.status_code == 200
    data = response.json()
    result = ReviewResult.model_validate(data)

    # Verify review_id is valid UUID
    uuid.UUID(result.review_id)

    # Verify findings count and attributes
    assert len(result.findings) >= 2
    rule_ids = [f.rule_id for f in result.findings]
    assert "bandit.B608" in rule_ids
    assert "bandit.B105" in rule_ids

    sqli = next(f for f in result.findings if f.rule_id == "bandit.B608")
    assert sqli.severity == "Critical"
    assert sqli.cwe == "CWE-89"

    # Verify fix and verification resolution on benchmark
    if result.fix_available and result.fixed_code:
        assert result.verification_available is True
        assert result.summary.resolved >= 1
