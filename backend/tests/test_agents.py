"""Tests for BE-004 and BE-005: Analyzer, Fix, and Verifier Agents."""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.agents import AnalyzerAgent, FixAgent, VerifierAgent, EnrichedItem, AnalyzerOutput, FixOutput
from app.analyzers import RawFinding
from app.models import Finding


@pytest.fixture
def sample_raw_findings():
    return [
        RawFinding(
            id="find-1",
            tool="bandit",
            rule_id="bandit.B608",
            line_start=6,
            line_end=7,
            message="Possible SQL injection vector through string-based query construction.",
            severity="Critical",
            confidence="High",
            cwe="CWE-89",
        ),
        RawFinding(
            id="find-2",
            tool="bandit",
            rule_id="bandit.B105",
            line_start=3,
            line_end=3,
            message="Possible hardcoded password: 'super_secret_db_password_123'",
            severity="Low",
            confidence="Medium",
            cwe="CWE-259",
        ),
    ]


def test_analyzer_agent_fallback_without_api_key(sample_raw_findings):
    """Verify AnalyzerAgent returns clean fallback findings when GEMINI_API_KEY is not set."""
    async def _run():
        with patch("app.agents.settings.GEMINI_API_KEY", ""):
            agent = AnalyzerAgent()
            findings, warnings = await agent.analyze("x = 1", sample_raw_findings)
            assert len(findings) == 2
            assert len(warnings) > 0
            assert "Enrichment unavailable" in warnings[0]
            assert findings[0].rule_id == "bandit.B608"
            assert findings[1].rule_id == "bandit.B105"

    asyncio.run(_run())


def test_analyzer_agent_mocked_gemini(sample_raw_findings):
    """Verify AnalyzerAgent correctly maps Gemini structured JSON response."""
    async def _run():
        mock_enriched = AnalyzerOutput(
            findings=[
                EnrichedItem(
                    id="find-1",
                    title="SQL Injection in Database Query",
                    explanation="Unsanitized user input is concatenated directly into SQL command.",
                    severity="Critical",
                    category="Security",
                    cwe="CWE-89",
                    confidence="High",
                    is_false_positive=False,
                ),
                EnrichedItem(
                    id="find-2",
                    title="Hardcoded Database Password",
                    explanation="Plaintext secret is committed in code.",
                    severity="High",
                    category="Security",
                    cwe="CWE-798",
                    confidence="High",
                    is_false_positive=False,
                ),
            ]
        )

        with patch("app.agents.settings.GEMINI_API_KEY", "mock-key"):
            with patch("google.generativeai.GenerativeModel") as mock_model_cls:
                mock_model = MagicMock()
                mock_response = MagicMock()
                mock_response.text = mock_enriched.model_dump_json()
                mock_model.generate_content_async = AsyncMock(return_value=mock_response)
                mock_model.generate_content.return_value = mock_response
                mock_model_cls.return_value = mock_model

                agent = AnalyzerAgent()
                findings, warnings = await agent.analyze("test_code", sample_raw_findings)
                assert len(findings) == 2
                assert findings[0].title == "SQL Injection in Database Query"
                assert findings[0].severity == "Critical"
                assert findings[1].severity == "High"
                assert findings[1].cwe == "CWE-798"

    asyncio.run(_run())


def test_fix_agent_mocked_gemini(sample_raw_findings):
    """Verify FixAgent returns corrected code from Gemini."""
    async def _run():
        original_code = "cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')"
        fixed_code = "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))"

        mock_output = FixOutput(fixed_code=fixed_code, fix_summary="Parameterized query")

        enriched = [
            Finding(
                id=f.id,
                line_start=f.line_start,
                line_end=f.line_end,
                rule_id=f.rule_id,
                severity=f.severity,
                title="Finding",
                explanation="Explanation",
                category="Security",
                cwe=f.cwe,
                confidence=f.confidence,
                verification_status="Unavailable",
            )
            for f in sample_raw_findings
        ]

        with patch("app.agents.settings.GEMINI_API_KEY", "mock-key"):
            with patch("google.generativeai.GenerativeModel") as mock_model_cls:
                mock_model = MagicMock()
                mock_response = MagicMock()
                mock_response.text = mock_output.model_dump_json()
                mock_model.generate_content_async = AsyncMock(return_value=mock_response)
                mock_model.generate_content.return_value = mock_response
                mock_model_cls.return_value = mock_model

                fix_agent = FixAgent()
                code_res, available, warnings = await fix_agent.generate_fix(original_code, enriched)
                assert available is True
                assert code_res == fixed_code

    asyncio.run(_run())


def test_verifier_agent_proves_resolved_with_clean_code():
    """Verify VerifierAgent tags findings as Resolved when the rule no longer triggers."""
    original_findings = [
        Finding(
            id="find-1",
            line_start=6,
            line_end=7,
            rule_id="bandit.B608",
            severity="Critical",
            title="SQL Injection",
            explanation="...",
            category="Security",
            cwe="CWE-89",
            confidence="High",
            verification_status="Unavailable",
        )
    ]

    clean_fix = """import sqlite3
def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE name = ?", (username,))
    return cursor.fetchall()
"""

    verifier = VerifierAgent()
    verified, regressions, summary, available = verifier.verify(
        original_findings=original_findings,
        fixed_code=clean_fix,
        language="python",
    )

    assert available is True
    assert len(verified) == 1
    assert verified[0].verification_status == "Resolved"
    assert summary.resolved == 1
    assert summary.unresolved == 0
    assert summary.regressions == 0


def test_verifier_agent_tags_unresolved_when_rule_still_fires():
    """Verify VerifierAgent tags findings as Unresolved when the vulnerable pattern persists."""
    original_findings = [
        Finding(
            id="find-1",
            line_start=6,
            line_end=7,
            rule_id="bandit.B608",
            severity="Critical",
            title="SQL Injection",
            explanation="...",
            category="Security",
            cwe="CWE-89",
            confidence="High",
            verification_status="Unavailable",
        )
    ]

    still_vulnerable = """import sqlite3
def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # Still vulnerable string formatting
    cursor.execute(f"SELECT * FROM users WHERE name = '{username}'")
    return cursor.fetchall()
"""

    verifier = VerifierAgent()
    verified, regressions, summary, available = verifier.verify(
        original_findings=original_findings,
        fixed_code=still_vulnerable,
        language="python",
    )

    assert available is True
    assert len(verified) == 1
    assert verified[0].verification_status == "Unresolved"
    assert summary.resolved == 0
    assert summary.unresolved == 1


def test_fix_agent_refine_fallback_without_api_key(sample_raw_findings):
    """Verify refine_fix returns fallback warning when API key is missing."""
    async def _run():
        enriched = [
            Finding(
                id=f.id,
                line_start=f.line_start,
                line_end=f.line_end,
                rule_id=f.rule_id,
                severity=f.severity,
                title="Finding",
                explanation="Explanation",
                category="Security",
                cwe=f.cwe,
                confidence=f.confidence,
                verification_status="Unavailable",
            )
            for f in sample_raw_findings
        ]
        with patch("app.agents.settings.GEMINI_API_KEY", ""):
            agent = FixAgent()
            refined_code, summary, warnings = await agent.refine_fix(
                original_code="cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
                current_fixed_code=None,
                findings=enriched,
                instruction="Use SQLAlchemy",
                language="python",
            )
            assert refined_code is None
            assert summary is None
            assert any("Fix refinement unavailable" in w for w in warnings)

    asyncio.run(_run())


def test_fix_agent_refine_mocked_gemini(sample_raw_findings):
    """Verify refine_fix returns refined code and summary with mocked Gemini."""
    async def _run():
        enriched = [
            Finding(
                id=f.id,
                line_start=f.line_start,
                line_end=f.line_end,
                rule_id=f.rule_id,
                severity=f.severity,
                title="Finding",
                explanation="Explanation",
                category="Security",
                cwe=f.cwe,
                confidence=f.confidence,
                verification_status="Unavailable",
            )
            for f in sample_raw_findings
        ]
        mock_output = FixOutput(
            fixed_code="cursor.execute('SELECT * FROM users WHERE id = :id', {'id': user_id})",
            fix_summary="Refined to use named parameter dictionary placeholder"
        )
        with patch("app.agents.settings.GEMINI_API_KEY", "mock-key"):
            with patch("google.generativeai.GenerativeModel") as mock_model_cls:
                mock_model = MagicMock()
                mock_response = MagicMock()
                mock_response.text = mock_output.model_dump_json()
                mock_model.generate_content_async = AsyncMock(return_value=mock_response)
                mock_model.generate_content.return_value = mock_response
                mock_model_cls.return_value = mock_model

                agent = FixAgent()
                refined_code, summary, warnings = await agent.refine_fix(
                    original_code="cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
                    current_fixed_code="cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
                    findings=enriched,
                    instruction="Use named parameters dictionary instead of tuple",
                    language="python",
                )
                assert refined_code == mock_output.fixed_code
                assert summary == mock_output.fix_summary

    asyncio.run(_run())


def test_verifier_agent_detects_regression_with_cwe():
    """Verify VerifierAgent detects a newly introduced vulnerability with CWE as Regression."""
    original_findings = [
        Finding(
            id="find-1",
            line_start=4,
            line_end=4,
            rule_id="bandit.B608",
            severity="Critical",
            title="SQL Injection",
            explanation="Unsanitized query",
            category="Security",
            cwe="CWE-89",
            confidence="High",
            verification_status="Unavailable",
        )
    ]

    # Code that fixes SQLi but introduces hardcoded secret (CWE-798)
    regression_code = """import sqlite3
DB_PASSWORD = "super_secret_production_password_123"
def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE name = ?", (username,))
    return cursor.fetchall()
"""

    verifier = VerifierAgent()
    verified, regressions, summary, available = verifier.verify(
        original_findings=original_findings,
        fixed_code=regression_code,
        language="python",
    )

    assert available is True
    # Original SQLi is resolved
    assert verified[0].verification_status == "Resolved"
    assert summary.resolved == 1
    # Regression detected!
    assert len(regressions) >= 1
    assert any("B105" in r.rule_id or "secret" in r.rule_id for r in regressions)
    assert summary.regressions >= 1


