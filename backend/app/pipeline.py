"""Sequential pipeline orchestration for CodeGuard review process.

Manages execution lifecycle through strict, explicit stages:
VALIDATING -> LANGUAGE_DETECTION -> STATIC_ANALYSIS -> ANALYZING -> GENERATING_FIX -> VERIFYING -> COMPLETED
"""

import asyncio
from enum import Enum
import logging
import time
import uuid
from typing import List, Optional

from .agents import AnalyzerAgent, FixAgent, VerifierAgent
from .analyzers import RawFinding, run_static_analysis
from .config import settings
from .languages import detect_language

_detect_language = detect_language
from .logging_config import get_review_logger
from .models import (
    CodeGuardException,
    Finding,
    ReviewRequest,
    ReviewResult,
    VerificationSummary,
)

logger = logging.getLogger("codeguard.pipeline")


class PipelineStage(str, Enum):
    """Explicit lifecycle stages of the CodeGuard analysis pipeline."""

    VALIDATING = "VALIDATING"
    LANGUAGE_DETECTION = "LANGUAGE_DETECTION"
    STATIC_ANALYSIS = "STATIC_ANALYSIS"
    ANALYZING = "ANALYZING"
    GENERATING_FIX = "GENERATING_FIX"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AnalysisPipeline:
    """Coordinates deterministic analysis and sequential AI agents with timeout controls."""

    def __init__(self):
        self.analyzer_agent = AnalyzerAgent()
        self.fix_agent = FixAgent()
        self.verifier_agent = VerifierAgent()

    async def execute(self, request: ReviewRequest) -> ReviewResult:
        """Execute full pipeline workflow under configured overall timeout."""
        timeout_seconds = settings.PIPELINE_TIMEOUT_SECONDS

        try:
            return await asyncio.wait_for(
                self._run_stages(request),
                timeout=float(timeout_seconds),
            )
        except asyncio.TimeoutError:
            logger.error(f"Pipeline execution exceeded {timeout_seconds}s timeout.")
            raise CodeGuardException(
                error="PIPELINE_TIMEOUT",
                message=f"Pipeline execution exceeded configured timeout of {timeout_seconds}s.",
                status_code=504,
                partial_result=None,
            )
        except CodeGuardException:
            raise
        except Exception as err:
            logger.error(f"Unhandled error in analysis pipeline: {err}")
            raise CodeGuardException(
                error="PIPELINE_ERROR",
                message=f"Internal pipeline review error: {str(err).splitlines()[0] if str(err) else 'Unknown error'}",
                status_code=500,
                partial_result=None,
            )

    async def _run_stages(self, request: ReviewRequest) -> ReviewResult:
        """Step through internal pipeline stages with timing and structured telemetry."""
        review_id = str(uuid.uuid4())
        warnings: List[str] = []
        start_time = time.perf_counter()

        # STAGE: LANGUAGE_DETECTION
        stage = PipelineStage.LANGUAGE_DETECTION
        r_logger = get_review_logger("codeguard.pipeline", review_id=review_id, stage=stage.value)
        language = detect_language(request.code, request.filename, request.language)
        r_logger.info(f"Language resolved: {language} (requested: {request.language}, file: {request.filename})")

        # STAGE: STATIC_ANALYSIS
        stage = PipelineStage.STATIC_ANALYSIS
        stage_start = time.perf_counter()
        raw_findings = run_static_analysis(request.code, language=language)
        stage_duration = (time.perf_counter() - stage_start) * 1000


        r_logger = get_review_logger(
            "codeguard.pipeline",
            review_id=review_id,
            stage=stage.value,
            language=language,
        )
        r_logger.info(
            f"Static scan complete in {stage_duration:.1f}ms: {len(raw_findings)} raw finding(s) discovered."
        )

        # Early return if no issues found
        if not raw_findings:
            return ReviewResult(
                review_id=review_id,
                language=language,
                findings=[],
                fixed_code=None,
                fix_available=False,
                verification_available=False,
                new_findings_after_fix=[],
                summary=VerificationSummary(
                    total_findings=0,
                    resolved=0,
                    unresolved=0,
                    regressions=0,
                ),
                warnings=warnings,
            )

        # STAGE: ANALYZING (Gemini Analyzer Agent)
        stage = PipelineStage.ANALYZING
        stage_start = time.perf_counter()
        enriched_findings, analyzer_warnings = await self.analyzer_agent.analyze(
            request.code, raw_findings, language=language
        )
        warnings.extend(analyzer_warnings)
        stage_duration = (time.perf_counter() - stage_start) * 1000

        r_logger = get_review_logger(
            "codeguard.pipeline",
            review_id=review_id,
            stage=stage.value,
            language=language,
        )
        r_logger.info(
            f"Analyzer enrichment complete in {stage_duration:.1f}ms: {len(enriched_findings)} issue(s) remaining."
        )

        # STAGE: GENERATING_FIX (Gemini Fix Agent)
        stage = PipelineStage.GENERATING_FIX
        stage_start = time.perf_counter()
        fixed_code, fix_available, fix_warnings = await self.fix_agent.generate_fix(
            request.code, enriched_findings, language=language
        )
        warnings.extend(fix_warnings)
        stage_duration = (time.perf_counter() - stage_start) * 1000

        r_logger = get_review_logger(
            "codeguard.pipeline",
            review_id=review_id,
            stage=stage.value,
            language=language,
        )
        r_logger.info(
            f"Fix generation complete in {stage_duration:.1f}ms: fix_available={fix_available}"
        )

        # STAGE: VERIFYING (Verifier Agent)
        stage = PipelineStage.VERIFYING
        stage_start = time.perf_counter()
        verified_findings, regressions, summary, verification_available = (
            self.verifier_agent.verify(enriched_findings, fixed_code, language=language)
        )
        stage_duration = (time.perf_counter() - stage_start) * 1000

        r_logger = get_review_logger(
            "codeguard.pipeline",
            review_id=review_id,
            stage=stage.value,
            language=language,
        )
        r_logger.info(
            f"Verification complete in {stage_duration:.1f}ms: resolved={summary.resolved}, unresolved={summary.unresolved}, regressions={summary.regressions}"
        )

        # Safety & Degraded State Guard: If regressions were introduced, mark fix as unavailable for developer safety
        fix_unavailable_reason: Optional[str] = None
        if regressions:
            fix_available = False
            fixed_code = None
            fix_unavailable_reason = (
                f"Proposed fix introduced {len(regressions)} new regression issue(s) during verification. "
                "Automated fix withheld for safety; manual remediation required."
            )
            warnings.append(f"Automated Fix Unavailable: {fix_unavailable_reason}")
        elif not fix_available:
            for w in warnings:
                if "Automated Fix Unavailable:" in w:
                    fix_unavailable_reason = w.split("Automated Fix Unavailable:")[-1].strip()
                    break
            if not fix_unavailable_reason:
                fix_unavailable_reason = "Automated repair could not safely be produced for this snippet."

        # STAGE: COMPLETED
        total_duration = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Review {review_id[:8]} completed in {total_duration:.1f}ms for language '{language}'."
        )

        return ReviewResult(
            review_id=review_id,
            language=language,
            findings=verified_findings,
            fixed_code=fixed_code,
            fix_available=fix_available,
            fix_unavailable_reason=fix_unavailable_reason,
            verification_available=verification_available,
            new_findings_after_fix=regressions,
            summary=summary,
            warnings=warnings,
        )


_pipeline_instance = AnalysisPipeline()


async def run_pipeline(request: ReviewRequest) -> ReviewResult:
    """Global entry point for pipeline execution."""
    return await _pipeline_instance.execute(request)
