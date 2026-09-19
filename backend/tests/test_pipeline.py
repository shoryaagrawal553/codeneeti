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


def test_pipeline_automated_fix_unavailable_when_regression_detected():
    """Verify pipeline withholds automated fix when regressions are detected."""
    import asyncio
    from unittest.mock import patch, AsyncMock
    from app.pipeline import AnalysisPipeline
    from app.models import ReviewRequest, Finding, VerificationSummary, NewFindingAfterFix

    pipeline = AnalysisPipeline()

    mock_raw = [
        Finding(
            id="f1",
            line_start=1,
            line_end=1,
            rule_id="bandit.B608",
            severity="Critical",
            title="SQL Injection",
            explanation="SQL Injection detected",
            category="Security",
            cwe="CWE-89",
            confidence="High",
            verification_status="Unavailable",
        )
    ]

    mock_regression = NewFindingAfterFix(
        id="reg-1",
        line_start=2,
        rule_id="bandit.B105",
        severity="High",
        title="Hardcoded Password",
    )

    from app.analyzers import RawFinding
    mock_raw_scan = [
        RawFinding(
            id="f1",
            tool="bandit",
            rule_id="bandit.B608",
            line_start=1,
            line_end=1,
            message="SQL Injection",
            severity="Critical",
            confidence="High",
            cwe="CWE-89",
        )
    ]

    with patch("app.pipeline.run_static_analysis", return_value=(mock_raw_scan, [])), \
         patch.object(pipeline.analyzer_agent, "analyze", new=AsyncMock(return_value=(mock_raw, []))), \
         patch.object(pipeline.fix_agent, "generate_fix", new=AsyncMock(return_value=("fixed_candidate_code()", True, []))), \
         patch.object(pipeline.verifier_agent, "verify", return_value=(mock_raw, [mock_regression], VerificationSummary(total_findings=1, resolved=0, unresolved=1, regressions=1), True)):

        req = ReviewRequest(code="cursor.execute(query)", language="python", filename="app.py")
        res = asyncio.run(pipeline.execute(req))

        assert res.fix_available is False
        assert res.fixed_code is None
        assert res.fix_unavailable_reason is not None
        assert "regression issue(s)" in res.fix_unavailable_reason
        assert any("Automated Fix Unavailable:" in w for w in res.warnings)


def test_pipeline_automated_fix_unavailable_without_api_key():
    """Verify pipeline populates fix_unavailable_reason cleanly when GEMINI_API_KEY is not set."""
    from unittest.mock import patch

    with patch("app.agents.settings.GEMINI_API_KEY", ""):
        response = client.post(
            "/api/analyze",
            json={"code": BENCHMARK_VULNERABLE_CODE, "language": "python", "filename": "app.py"},
        )
        assert response.status_code == 200
        data = response.json()
        result = ReviewResult.model_validate(data)

        assert result.fix_available is False
        assert result.fixed_code is None
        assert result.fix_unavailable_reason is not None
        assert "GEMINI_API_KEY is not configured" in result.fix_unavailable_reason
