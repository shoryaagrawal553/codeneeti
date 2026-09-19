"""Pydantic data models for CodeGuard matching API_CONTRACT.md."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator

from .config import settings
from .languages import is_supported_extension, is_supported_language


class CodeGuardException(Exception):
    """Domain exception conforming to API_CONTRACT.md ErrorResponse schema."""

    def __init__(
        self,
        error: str,
        message: str,
        status_code: int = 400,
        partial_result: Optional[object] = None,
    ):
        self.error = error
        self.message = message
        self.status_code = status_code
        self.partial_result = partial_result
        super().__init__(message)


# Type aliases for strict enum values defined in API_CONTRACT.md
SeverityLevel = Literal["Critical", "High", "Medium", "Low", "Info"]
CategoryLevel = Literal["Security", "Bug", "Code Quality"]
ConfidenceLevel = Literal["High", "Medium", "Low"]
VerificationStatus = Literal["Resolved", "Unresolved", "Regression", "Unavailable"]

# Expanded supported languages including C, C++, Go, Java, TypeScript, and auto
LanguageChoice = Literal[
    "python",
    "javascript",
    "typescript",
    "java",
    "c",
    "cpp",
    "go",
    "auto",
]


class HealthResponse(BaseModel):
    """Response model for GET /api/health."""
    status: str = "ok"
    version: str = "1.0.0"
    tools: Optional[dict] = None


class LanguageItem(BaseModel):
    """Language descriptor item with backward-compatible metadata extensions."""
    id: str
    display_name: str
    extensions: List[str]
    supported_analyzers: Optional[List[str]] = None
    available: Optional[bool] = True


class LanguagesResponse(BaseModel):
    """Response model for GET /api/languages."""
    languages: List[LanguageItem]


class ReviewRequest(BaseModel):
    """Request model for POST /api/analyze."""
    code: str = Field(
        ...,
        description="Source code string to analyze (max 100 KB)."
    )
    language: Optional[LanguageChoice] = Field(
        default="auto",
        description="Target language: python, javascript, typescript, java, c, cpp, go, or auto."
    )
    filename: Optional[str] = Field(
        default=None,
        description="Original filename; used as language detection fallback."
    )

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("MISSING_CODE: The code property is omitted, null, or empty whitespace.")
        if "\0" in v:
            raise ValueError("MISSING_CODE: The code property contains invalid null byte characters.")
        if len(v.encode("utf-8")) > settings.MAX_CODE_SIZE_BYTES:
            raise ValueError(
                f"CODE_TOO_LARGE: The submitted code string exceeds {settings.MAX_CODE_SIZE_BYTES} bytes."
            )
        return v

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: Optional[str]) -> Optional[str]:
        if v and not is_supported_language(v):
            raise ValueError(f"UNSUPPORTED_LANGUAGE: Language '{v}' is not supported.")
        return v

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: Optional[str]) -> Optional[str]:
        if v:
            if "\x00" in v:
                raise ValueError("UNSUPPORTED_FILE_TYPE: Null bytes are not permitted in filename.")
            # Check for path traversal attempts in filename parameter
            if ".." in v or "/" in v or "\\" in v:
                v = v.replace("\\", "/").split("/")[-1]
            if not is_supported_extension(v):
                raise ValueError(
                    f"UNSUPPORTED_FILE_TYPE: Uploaded file extension for '{v}' is not supported."
                )
        return v


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
    fingerprint: Optional[str] = Field(
        default=None,
        description="Stable cryptographic fingerprint of finding."
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
    fix_unavailable_reason: Optional[str] = None
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


class RefineRequest(BaseModel):
    """Request schema for POST /api/refine matching API_CONTRACT.md Section 8.4."""
    original_code: str = Field(..., description="Original code before fix.")
    current_fixed_code: Optional[str] = Field(default=None, description="Current candidate fix.")
    language: LanguageChoice = Field(..., description="Target language identifier.")
    findings: List[Finding] = Field(default_factory=list, description="Original findings.")
    instruction: str = Field(..., min_length=1, max_length=2048, description="User refinement instructions.")

    @field_validator("original_code")
    @classmethod
    def validate_original_code(cls, v: str) -> str:
        if "\x00" in v:
            raise ValueError("Null bytes are not permitted in source code.")
        if len(v.encode("utf-8")) > settings.MAX_CODE_SIZE_BYTES:
            raise ValueError(f"original_code exceeds maximum size of {settings.MAX_CODE_SIZE_BYTES} bytes.")
        if not v.strip():
            raise ValueError("original_code cannot be empty or whitespace only.")
        return v

    @field_validator("current_fixed_code")
    @classmethod
    def validate_current_fixed_code(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if "\x00" in v:
                raise ValueError("Null bytes are not permitted in fixed code.")
            if len(v.encode("utf-8")) > settings.MAX_CODE_SIZE_BYTES:
                raise ValueError(f"current_fixed_code exceeds maximum size of {settings.MAX_CODE_SIZE_BYTES} bytes.")
        return v

    @field_validator("instruction")
    @classmethod
    def validate_instruction(cls, v: str) -> str:
        if "\x00" in v:
            raise ValueError("Null bytes are not permitted in instruction.")
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("instruction cannot be empty or whitespace only.")
        return cleaned


class RefineResult(BaseModel):
    """Response schema for POST /api/refine matching API_CONTRACT.md Section 8.4."""
    refined_code: str
    refine_summary: str
    verification_status: VerificationStatus
    scanner_findings_count: int = 0
    warnings: List[str] = Field(default_factory=list)

