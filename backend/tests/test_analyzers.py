"""Tests for BE-003: Deterministic Static Analysis Runner."""

import os
from pathlib import Path
from app.analyzers import (
    safe_temp_source_file,
    run_bandit,
    run_static_analysis,
    RawFinding,
)

VULNERABLE_PYTHON_SAMPLE = """import sqlite3

DB_PASSWORD = "super_secret_db_password_123"

def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE name = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()
"""

CLEAN_PYTHON_SAMPLE = """def add_numbers(a: int, b: int) -> int:
    return a + b
"""


def test_safe_temp_source_file_cleanup():
    """Verify ephemeral file is deleted after context block completes."""
    recorded_path: Path
    with safe_temp_source_file("x = 1\n", suffix=".py") as temp_path:
        recorded_path = temp_path
        assert temp_path.exists()
        content = temp_path.read_text(encoding="utf-8")
        assert "x = 1" in content

    # Check that file was cleaned up
    assert not recorded_path.exists()


def test_safe_temp_source_file_cleanup_on_exception():
    """Verify ephemeral file is deleted even when an exception is raised."""
    recorded_path: Path
    try:
        with safe_temp_source_file("x = 1\n", suffix=".py") as temp_path:
            recorded_path = temp_path
            assert temp_path.exists()
            raise RuntimeError("Forced error during scan")
    except RuntimeError:
        pass

    assert not recorded_path.exists()


def test_bandit_detection_sql_injection_and_secret():
    """Verify Bandit deterministic scan flags SQL injection (B608) and hardcoded secret (B105)."""
    with safe_temp_source_file(VULNERABLE_PYTHON_SAMPLE, suffix=".py") as temp_path:
        findings = run_bandit(temp_path)
        assert len(findings) >= 2
        rule_ids = [f.rule_id for f in findings]
        assert "bandit.B608" in rule_ids
        assert "bandit.B105" in rule_ids

        sqli = next(f for f in findings if f.rule_id == "bandit.B608")
        assert sqli.severity == "Critical"
        assert sqli.cwe == "CWE-89"

        secret = next(f for f in findings if f.rule_id == "bandit.B105")
        assert secret.severity in ["Critical", "High", "Medium", "Low"]
        assert secret.cwe in ["CWE-259", "CWE-798"]


def test_run_static_analysis_clean_code():
    """Verify static analysis on clean code returns 0 findings."""
    findings = run_static_analysis(CLEAN_PYTHON_SAMPLE, language="python")
    assert len(findings) == 0


def test_run_static_analysis_vulnerable_code():
    """Verify run_static_analysis returns normalized findings with sequential IDs."""
    findings = run_static_analysis(VULNERABLE_PYTHON_SAMPLE, language="python")
    assert len(findings) >= 2
    assert findings[0].id == "find-1"
    assert findings[1].id == "find-2"
    for f in findings:
        assert isinstance(f, RawFinding)
        assert f.line_start > 0
        assert f.line_end >= f.line_start
        assert f.severity in ["Critical", "High", "Medium", "Low", "Info"]
