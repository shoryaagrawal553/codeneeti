"""Main application entry point for CodeGuard backend."""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .analyzers import tool_registry
from .config import settings
from .languages import get_all_languages
from .logging_config import setup_logging
from .agents import FixAgent, VerifierAgent
from .models import (
    CodeGuardException,
    ErrorResponse,
    HealthResponse,
    LanguageItem,
    LanguagesResponse,
    RefineRequest,
    RefineResult,
    ReviewRequest,
    ReviewResult,
)
from .pipeline import run_pipeline

# Initialize structured sanitizing logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger("codeguard.main")

# Initialize FastAPI application
app = FastAPI(
    title="CodeGuard API",
    description="Multi-agent AI Code Review & Security Assistant Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS with controlled methods and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)


@app.middleware("http")
async def security_headers_and_limits_middleware(request: Request, call_next):
    """Enforce HTTP security headers and transport-level payload size boundaries."""
    # Transport-level size boundary defense before full parsing
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > (settings.MAX_CODE_SIZE_BYTES * 2):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ErrorResponse(
                error="CODE_TOO_LARGE",
                message=f"Request payload exceeds transport limit of {settings.MAX_CODE_SIZE_BYTES * 2} bytes.",
                partial_result=None,
            ).model_dump(),
        )

    response = await call_next(request)

    # Standard industry-grade security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    return response


@app.exception_handler(CodeGuardException)
async def codeguard_exception_handler(
    request: Request, exc: CodeGuardException
) -> JSONResponse:
    """Handle explicit CodeGuard domain exceptions matching ErrorResponse schema."""
    from .logging_config import _SECRET_PATTERN
    clean_message = _SECRET_PATTERN.sub(r"\1=***REDACTED***", exc.message) if exc.message else ""
    error_payload = ErrorResponse(
        error=exc.error,
        message=clean_message,
        partial_result=exc.partial_result,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload.model_dump(),
    )



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Map FastAPI/Pydantic validation errors to strict API_CONTRACT.md ErrorResponse format."""
    error_code = "MISSING_CODE"
    error_message = "The request payload failed validation."

    for err in exc.errors():
        msg = err.get("msg", "")
        loc = err.get("loc", ())

        if "MISSING_CODE:" in msg:
            error_code = "MISSING_CODE"
            error_message = msg.split("MISSING_CODE:")[-1].strip()
            break
        elif "CODE_TOO_LARGE:" in msg:
            error_code = "CODE_TOO_LARGE"
            error_message = msg.split("CODE_TOO_LARGE:")[-1].strip()
            break
        elif "UNSUPPORTED_LANGUAGE:" in msg:
            error_code = "UNSUPPORTED_LANGUAGE"
            error_message = msg.split("UNSUPPORTED_LANGUAGE:")[-1].strip()
            break
        elif "UNSUPPORTED_FILE_TYPE:" in msg:
            error_code = "UNSUPPORTED_FILE_TYPE"
            error_message = msg.split("UNSUPPORTED_FILE_TYPE:")[-1].strip()
            break
        elif "language" in loc:
            error_code = "UNSUPPORTED_LANGUAGE"
            error_message = "The specified language is not supported (not python, javascript, typescript, java, c, cpp, go, or auto)."
            break
        elif "code" in loc:
            error_code = "MISSING_CODE"
            error_message = "The code property is omitted, null, or empty whitespace."
            break
        elif "filename" in loc:
            error_code = "UNSUPPORTED_FILE_TYPE"
            error_message = "Uploaded file extension is not supported."
            break

    error_payload = ErrorResponse(
        error=error_code,
        message=error_message,
        partial_result=None,
    )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=error_payload.model_dump(),
    )


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
    description="Returns backend health status, version, and analyzer availability.",
)
async def health_check() -> HealthResponse:
    """Return application health status and tool capability status."""
    diagnostics = tool_registry.get_diagnostics()
    return HealthResponse(
        status="ok",
        version="1.0.0",
        tools=diagnostics,
    )


@app.get(
    "/api/languages",
    response_model=LanguagesResponse,
    tags=["System"],
    summary="Supported languages",
    description="Returns list of supported languages, extensions, and analyzer availability.",
)
async def get_languages() -> LanguagesResponse:
    """Return supported programming languages and valid extensions."""
    all_defs = get_all_languages()
    items = []
    for defn in all_defs:
        # Check if at least one analyzer is available for this language
        has_avail_analyzer = False
        for tool_name in defn.supported_analyzers:
            tool = tool_registry.get_tool(tool_name)
            if tool and tool.available:
                has_avail_analyzer = True
                break

        items.append(
            LanguageItem(
                id=defn.id,
                display_name=defn.display_name,
                extensions=defn.extensions,
                supported_analyzers=defn.supported_analyzers,
                available=has_avail_analyzer,
            )
        )
    return LanguagesResponse(languages=items)


@app.post(
    "/api/analyze",
    response_model=ReviewResult,
    tags=["Analysis"],
    summary="Analyze code",
    description="Primary review pipeline: Static Analysis -> Analyzer -> Fix -> Verifier.",
)
async def analyze_code(request: ReviewRequest) -> ReviewResult:
    """Trigger the multi-agent code analysis pipeline."""
    return await run_pipeline(request)


@app.post(
    "/api/refine",
    response_model=RefineResult,
    tags=["Analysis"],
    summary="Refine fix",
    description="Refines code remediation with custom instructions and verifies via static re-analysis.",
)
async def refine_code(request: RefineRequest) -> RefineResult:
    """Refine candidate fix according to developer instruction and re-verify."""
    fix_agent = FixAgent()
    verifier_agent = VerifierAgent()

    effective_lang = request.language
    if effective_lang == "auto":
        from .languages import detect_language_from_filename_or_content
        effective_lang = detect_language_from_filename_or_content(None, request.original_code)

    refined_code, refine_summary, warnings = await fix_agent.refine_fix(
        original_code=request.original_code,
        current_fixed_code=request.current_fixed_code,
        findings=request.findings,
        instruction=request.instruction,
        language=effective_lang,
    )

    if not refined_code:
        fallback_code = request.current_fixed_code or request.original_code
        return RefineResult(
            refined_code=fallback_code,
            refine_summary="Could not generate refined fix with specified instructions.",
            verification_status="Unavailable",
            scanner_findings_count=len(request.findings),
            warnings=warnings or ["Refinement could not be generated."],
        )

    # Deterministically re-verify refined code
    verified_findings, regressions, summary, is_available = verifier_agent.verify(
        original_findings=request.findings,
        fixed_code=refined_code,
        language=effective_lang,
    )

    if not is_available:
        warnings.append("Verification could not be performed on refined code.")

    if regressions:
        warnings.append(f"Refinement introduced {len(regressions)} new regression issue(s).")

    if not verified_findings and not regressions:
        overall_status = "Resolved"
    elif regressions:
        overall_status = "Regression"
    elif summary.unresolved > 0:
        overall_status = "Unresolved"
    else:
        overall_status = "Resolved"

    return RefineResult(
        refined_code=refined_code,
        refine_summary=refine_summary or "Fix adjusted according to developer instruction.",
        verification_status=overall_status,
        scanner_findings_count=summary.unresolved + len(regressions),
        warnings=warnings,
    )



@app.get(
    "/",
    tags=["System"],
    summary="Root",
    description="Returns basic API metadata.",
)
async def root() -> dict:
    """Return root discovery response."""
    return {
        "service": "CodeGuard API",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
        "languages": "/api/languages",
    }

