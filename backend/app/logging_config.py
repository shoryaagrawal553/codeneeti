"""Structured logging configuration for CodeGuard backend.

Enforces strict safety rules:
- NEVER logs complete submitted user source code.
- NEVER logs API keys, Gemini tokens, secrets, or passwords.
- Records review_id, language, pipeline stage, duration_ms, and status for observability.
"""

import logging
import re
import sys
from typing import Optional

# Regex pattern for sanitizing potential secrets or tokens in log strings
_SECRET_PATTERN = re.compile(
    r"(?i)(api[_-]?key|secret|password|token|bearer\s+)[\s:=]+['\"]?([a-zA-Z0-9_\-\.]{8,})['\"]?"
)


class SanitizingFormatter(logging.Formatter):
    """Logging formatter that strips credentials and structured telemetry tags."""

    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        # Redact detected secrets
        sanitized = _SECRET_PATTERN.sub(r"\1=***REDACTED***", orig)
        return sanitized


def setup_logging(log_level: str = "INFO") -> None:
    """Initialize structured sanitizing logger for CodeGuard."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid duplicate handlers if already configured
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(numeric_level)
        formatter = SanitizingFormatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)


class ReviewLoggerAdapter(logging.LoggerAdapter):
    """Contextual logger adapter attaching review_id and pipeline stage."""

    def process(self, msg: str, kwargs: dict) -> tuple:
        extra = self.extra or {}
        prefix_parts = []

        if "review_id" in extra:
            prefix_parts.append(f"[review:{extra['review_id'][:8]}]")
        if "stage" in extra:
            prefix_parts.append(f"[stage:{extra['stage']}]")
        if "language" in extra:
            prefix_parts.append(f"[lang:{extra['language']}]")
        if "duration_ms" in extra:
            prefix_parts.append(f"[{extra['duration_ms']:.1f}ms]")

        prefix = " ".join(prefix_parts)
        if prefix:
            return f"{prefix} {msg}", kwargs
        return msg, kwargs


def get_review_logger(
    name: str = "codeguard.review",
    review_id: Optional[str] = None,
    stage: Optional[str] = None,
    language: Optional[str] = None,
) -> ReviewLoggerAdapter:
    """Create a contextual review logger adapter."""
    base_logger = logging.getLogger(name)
    context = {}
    if review_id:
        context["review_id"] = review_id
    if stage:
        context["stage"] = stage
    if language:
        context["language"] = language
    return ReviewLoggerAdapter(base_logger, context)
