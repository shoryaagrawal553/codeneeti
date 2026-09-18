"""Pydantic data models for CodeGuard matching API_CONTRACT.md."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# Type aliases for strict enum values defined in API_CONTRACT.md
SeverityLevel = Literal["Critical", "High", "Medium", "Low", "Info"]
CategoryLevel = Literal["Security", "Bug", "Code Quality"]
ConfidenceLevel = Literal["High", "Medium", "Low"]
VerificationStatus = Literal["Resolved", "Unresolved", "Regression", "Unavailable"]
LanguageChoice = Literal["python", "javascript", "auto"]


class HealthResponse(BaseModel):
    """Response model for GET /api/health."""
    status: str = "ok"
    version: str = "1.0.0"


class LanguageItem(BaseModel):
    """Language descriptor item."""
    id: str
    display_name: str
    extensions: List[str]


class LanguagesResponse(BaseModel):
    """Response model for GET /api/languages."""
    languages: List[LanguageItem]


class ReviewRequest(BaseModel):
    """Request model for POST /api/analyze."""
    code: str = Field(
        ...,
        min_length=1,
        max_length=102400,
        description="Source code string to analyze (max 100 KB)."
    )
    language: Optional[LanguageChoice] = Field(
        default="auto",
        description="Target language: python, javascript, or auto."
    )
    filename: Optional[str] = Field(
        default=None,
        description="Original filename; used as language detection fallback."
    )


class Finding(BaseModel):
    """Structured code issue finding matching API_CONTRACT.md Section 5.2."""
    id: str = Field(..., description="Unique finding ID within review.")
    line_start: int = Field(..., description="1-indexed starting line.")
    line_end: int = Field(..., description="1-indexed ending line.")
    rule_id: str = Field(..., description="Semgrep or Bandit rule identifier.")
    severity: SeverityLevel = Field(..., description="Severity level.")
    title: str = Field(..., description="Short plain-language title.")
    explanation: str = Field(..., description="Plain-language explanation.")
    category: CategoryLevel = Field(..., description="Issue category.")
    cwe: Optional[str] = Field(default=None, description="CWE ID if available.")
    confidence: ConfidenceLevel = Field(..., description="Confidence level.")
    verification_status: VerificationStatus = Field(
        ...,
        description="Verification outcome from Verifier Agent."
    )


class NewFindingAfterFix(BaseModel):
    """Regression finding introduced by fix code matching API_CONTRACT.md Section 5.3."""
    id: str
    line_start: int
    rule_id: str
    severity: SeverityLevel
    title: str


class VerificationSummary(BaseModel):
    """Aggregated resolution metrics matching API_CONTRACT.md Section 5.4."""
    total_findings: int = Field(..., ge=0)
    resolved: int = Field(..., ge=0)
    unresolved: int = Field(..., ge=0)
    regressions: int = Field(..., ge=0)


class ReviewResult(BaseModel):
    """Complete analysis pipeline response matching API_CONTRACT.md Section 5.5."""
    review_id: str
    language: str
    findings: List[Finding]
    fixed_code: Optional[str] = None
    fix_available: bool
    verification_available: bool
    new_findings_after_fix: List[NewFindingAfterFix] = Field(default_factory=list)
    summary: VerificationSummary
    warnings: List[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    """Uniform error response matching API_CONTRACT.md Section 3."""
    error: str = Field(..., description="Machine-readable error code.")
    message: str = Field(..., description="Human-readable description.")
    partial_result: Optional[ReviewResult] = Field(
        default=None,
        description="Partial result if failure occurred midway."
    )
