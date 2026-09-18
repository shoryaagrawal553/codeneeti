"""Tests validating that Pydantic models conform to API_CONTRACT.md."""

import pytest
from pydantic import ValidationError

from backend.app.models import (
    ReviewRequest,
    Finding,
    VerificationSummary,
    ReviewResult,
    ErrorResponse,
)


def test_valid_review_request():
    """Verify ReviewRequest model parses valid payload."""
    req = ReviewRequest(
        code="print('hello')",
        language="python",
        filename="test.py"
    )
    assert req.code == "print('hello')"
    assert req.language == "python"
    assert req.filename == "test.py"


def test_review_request_validation():
    """Verify ReviewRequest rejects empty code or oversized code."""
    # Empty code
    with pytest.raises(ValidationError):
        ReviewRequest(code="")

    # Invalid language
    with pytest.raises(ValidationError):
        ReviewRequest(code="print(1)", language="ruby")


def test_finding_and_review_result_models():
    """Verify ReviewResult and Finding models validate complete contract payload."""
    finding = Finding(
        id="find-1",
        line_start=6,
        line_end=7,
        rule_id="bandit.B608",
        severity="Critical",
        title="SQL Injection via String Formatting",
        explanation="User input formatted into SQL query.",
        category="Security",
        cwe="CWE-89",
        confidence="High",
        verification_status="Resolved"
    )

    summary = VerificationSummary(
        total_findings=1,
        resolved=1,
        unresolved=0,
        regressions=0
    )

    result = ReviewResult(
        review_id="test-uuid-1234",
        language="python",
        findings=[finding],
        fixed_code="query = 'SELECT * FROM users WHERE id = ?'",
        fix_available=True,
        verification_available=True,
        new_findings_after_fix=[],
        summary=summary,
        warnings=[]
    )

    assert result.review_id == "test-uuid-1234"
    assert result.findings[0].severity == "Critical"
    assert result.summary.resolved == 1


def test_error_response_model():
    """Verify ErrorResponse model structure."""
    err = ErrorResponse(
        error="CODE_TOO_LARGE",
        message="Submitted code exceeds 100 KB"
    )
    assert err.error == "CODE_TOO_LARGE"
    assert err.partial_result is None
