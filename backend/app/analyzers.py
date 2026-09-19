"""Deterministic static analysis abstraction and runners for CodeGuard.

SECURITY GUARANTEE:
NEVER EXECUTE SUBMITTED USER CODE.
Code is treated strictly as untrusted data written to isolated, ephemeral
temporary files that are guaranteed to be unlinked after analysis.
"""

from abc import ABC, abstractmethod
import hashlib
import json
import logging
import os
import shutil
import subprocess
import sys
import tempfile
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Dict, Generator, List, Optional, Tuple

from pydantic import BaseModel, Field

from .config import settings
from .languages import get_language

logger = logging.getLogger("codeguard.analyzers")


class RawFinding(BaseModel):
    """Internal normalized finding representation from static analysis scanners."""

    id: str
    tool: str  # "bandit", "semgrep", etc.
    rule_id: str
    line_start: int
    line_end: int
    message: str
    severity: str  # "Critical", "High", "Medium", "Low", "Info"
    confidence: str  # "High", "Medium", "Low"
    category: str = "Security"  # "Security", "Bug", "Code Quality"
    cwe: Optional[str] = None
    fingerprint: Optional[str] = None


def compute_finding_fingerprint(
    language: str,
    rule_id: str,
    line_start: int,
    message: str,
    cwe: Optional[str] = None,
) -> str:
    """Compute a deterministic cryptographic fingerprint for issue tracking and deduplication."""
    # Normalize message to reduce noise from line shifts or variable names
    clean_msg = " ".join(message.strip().lower().split()[:15])
    raw_key = f"{language.lower()}:{rule_id.lower()}:{line_start}:{cwe or ''}:{clean_msg}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:16]


@contextmanager
def safe_temp_source_file(
    code: str, suffix: str = ".py"
) -> Generator[Path, None, None]:
    """Safely write submitted source code to an ephemeral temporary file.

    Guarantees deletion even if exceptions, timeouts, or scanner errors occur.
    Never executes, imports, or compiles the code.
    """
    # Sanitize suffix against any path traversal sequences
    safe_ext = "".join(c for c in suffix if c.isalnum()).lower() if suffix else "py"
    safe_suffix = f".{safe_ext}" if safe_ext else ".py"

    scratch_dir = Path(__file__).resolve().parent.parent / ".tmp_scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)

    # Clean up any stale ephemeral files older than 600s to prevent disk accumulation
    try:
        import time
        now_ts = time.time()
        for stale in scratch_dir.glob("cg_*_*"):
            if stale.is_file() and (now_ts - stale.stat().st_mtime) > 600:
                stale.unlink(missing_ok=True)
    except Exception as cleanup_err:
        logger.debug("Scratch cleanup notice: %s", cleanup_err)

    # Use UUID to prevent any predictable filename collisions
    unique_prefix = f"cg_{uuid.uuid4().hex[:8]}_"
    temp_file = tempfile.NamedTemporaryFile(
        mode="w",
        prefix=unique_prefix,
        suffix=safe_suffix,
        dir=str(scratch_dir),
        delete=False,
        encoding="utf-8",
    )
    temp_path = Path(temp_file.name).resolve()

    try:
        temp_file.write(code)
        temp_file.flush()
        temp_file.close()
        yield temp_path
    finally:
        # Scrub ephemeral file from disk
        if temp_path.exists():
            try:
                os.unlink(temp_path)
            except OSError as err:
                logger.warning(f"Failed to unlink ephemeral file {temp_path}: {err}")


# ==============================================================================
# TOOL CAPABILITY REGISTRY
# ==============================================================================

class ToolCapability(BaseModel):
    """Metadata and runtime availability status of an external CLI tool."""

    name: str
    available: bool
    version: Optional[str] = None
    supported_languages: List[str] = Field(default_factory=list)


class ToolCapabilityRegistry:
    """Probes and tracks installed analysis tooling in the operating environment."""

    def __init__(self):
        self._tools: Dict[str, ToolCapability] = {}
        self._probed = False

    def probe_tools(self) -> Dict[str, ToolCapability]:
        """Discover installed tools and cache their capability status."""
        if self._probed:
            return self._tools

        # 1. Semgrep
        semgrep_bin = _find_semgrep_executable()
        semgrep_ver = None
        semgrep_avail = False
        if semgrep_bin:
            try:
                out = subprocess.run(  # nosec B603
                    [semgrep_bin, "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    stdin=subprocess.DEVNULL,
                )
                if out.returncode == 0:
                    semgrep_avail = True
                    semgrep_ver = out.stdout.strip().split("\n")[0]
            except Exception as err:
                logger.debug("Semgrep probe error: %s", err)

        self._tools["semgrep"] = ToolCapability(
            name="semgrep",
            available=semgrep_avail,
            version=semgrep_ver,
            supported_languages=["python", "javascript", "typescript", "java", "c", "cpp", "go"],
        )

        # 2. Bandit
        bandit_avail = False
        bandit_ver = None
        try:
            out = subprocess.run(  # nosec B603
                [sys.executable, "-m", "bandit", "--version"],
                capture_output=True,
                text=True,
                timeout=5,
                stdin=subprocess.DEVNULL,
            )
            if out.returncode == 0:
                bandit_avail = True
                bandit_ver = out.stdout.strip().split("\n")[0]
        except Exception as err:
            logger.debug("Bandit probe error: %s", err)


        self._tools["bandit"] = ToolCapability(
            name="bandit",
            available=bandit_avail,
            version=bandit_ver,
            supported_languages=["python"],
        )

        # 3. Optional tools (ESLint, SpotBugs, PMD, Clang-Tidy, Staticcheck)
        for tool_name, langs in [
            ("eslint", ["javascript", "typescript"]),
            ("spotbugs", ["java"]),
            ("pmd", ["java"]),
            ("clang-tidy", ["c", "cpp"]),
            ("staticcheck", ["go"]),
            ("go", ["go"]),
        ]:
            which_path = shutil.which(tool_name)
            self._tools[tool_name] = ToolCapability(
                name=tool_name,
                available=bool(which_path),
                version="available" if which_path else None,
                supported_languages=langs,
            )

        self._probed = True
        return self._tools

    def get_tool(self, name: str) -> Optional[ToolCapability]:
        self.probe_tools()
        return self._tools.get(name.lower())

    def get_diagnostics(self) -> dict:
        self.probe_tools()
        return {
            name: {"available": t.available, "version": t.version}
            for name, t in self._tools.items()
        }


tool_registry = ToolCapabilityRegistry()


# ==============================================================================
# ABSTRACT STATIC ANALYZER & ADAPTERS
# ==============================================================================

class BaseStaticAnalyzer(ABC):
    """Abstract base class for static analysis tool adapters."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the tool."""
        pass

    @property
    @abstractmethod
    def supported_languages(self) -> List[str]:
        """List of supported language identifiers."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the tool can be executed."""
        pass

    @abstractmethod
    def analyze(
        self, temp_path: Path, language: str, timeout_seconds: int = 25
    ) -> List[RawFinding]:
        """Execute scanner against ephemeral file without executing the code."""
        pass


def _find_semgrep_executable() -> Optional[str]:
    """Locate semgrep binary or module."""
    which_path = shutil.which("semgrep")
    if which_path:
        return which_path
    scripts_dir = Path(sys.executable).parent / "Scripts" / "semgrep.exe"
    if scripts_dir.exists():
        return str(scripts_dir)
    return None


class SemgrepAnalyzer(BaseStaticAnalyzer):
    """Semgrep multi-language static analysis adapter."""

    @property
    def name(self) -> str:
        return "semgrep"

    @property
    def supported_languages(self) -> List[str]:
        return ["python", "javascript", "typescript", "java", "c", "cpp", "go"]

    def is_available(self) -> bool:
        return _find_semgrep_executable() is not None

    def analyze(
        self, temp_path: Path, language: str, timeout_seconds: int = 25
    ) -> List[RawFinding]:
        findings: List[RawFinding] = []
        semgrep_bin = _find_semgrep_executable()
        if not semgrep_bin:
            return findings

        # Sanitize language against path traversal
        clean_lang = "".join(c for c in language if c.isalnum() or c in ("-", "_")).lower()
        rules_dir = Path(__file__).resolve().parent / "rules"
        rule_file = (rules_dir / f"{clean_lang}_security.yaml").resolve()
        if rule_file.exists() and str(rule_file).startswith(str(rules_dir.resolve())):
            ruleset = str(rule_file)
        else:
            ruleset = f"p/{clean_lang}"

        semgrep_env = {
            **os.environ,
            "SEMGREP_SEND_METRICS": "off",
            "SEMGREP_ENABLE_VERSION_CHECK": "false",
        }

        cmd = [
            semgrep_bin,
            "scan",
            "--json",
            "--quiet",
            "--metrics=off",
            "--config",
            ruleset,
            str(temp_path),
        ]

        try:
            result = subprocess.run(  # nosec B603
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                shell=False,
                env=semgrep_env,
                stdin=subprocess.DEVNULL,
            )


            stdout = result.stdout.strip()
            if not stdout:
                return findings

            if len(stdout.encode("utf-8")) > 5 * 1024 * 1024:
                logger.warning("Semgrep output exceeded 5MB; truncating to prevent memory exhaustion.")
                return findings

            data = json.loads(stdout)
            results = data.get("results", [])

            for idx, item in enumerate(results, start=1):
                check_id = item.get("check_id", "semgrep.finding")
                extra = item.get("extra", {})
                start_pos = item.get("start", {})
                end_pos = item.get("end", {})

                line_start = start_pos.get("line", 1)
                line_end = end_pos.get("line", line_start)

                raw_sev = extra.get("severity", "WARNING").upper()
                if raw_sev == "ERROR":
                    mapped_sev = "High"
                elif raw_sev == "WARNING":
                    mapped_sev = "Medium"
                elif raw_sev == "INFO":
                    mapped_sev = "Low"
                else:
                    mapped_sev = "Info"

                metadata = extra.get("metadata", {})
                cwe_list = metadata.get("cwe", [])
                cwe_str = None
                if isinstance(cwe_list, list) and cwe_list:
                    cwe_str = cwe_list[0].split(":")[0].strip()
                elif isinstance(cwe_list, str):
                    cwe_str = cwe_list.split(":")[0].strip()

                msg = extra.get("message", "Semgrep security finding")
                fp = compute_finding_fingerprint(language, check_id, line_start, msg, cwe_str)

                findings.append(
                    RawFinding(
                        id=f"sg-find-{idx}",
                        tool="semgrep",
                        rule_id=check_id,
                        line_start=line_start,
                        line_end=line_end,
                        message=msg,
                        severity=mapped_sev,
                        confidence="High",
                        category="Security",
                        cwe=cwe_str,
                        fingerprint=fp,
                    )
                )
        except subprocess.TimeoutExpired:
            logger.warning(f"Semgrep execution timed out after {timeout_seconds}s for {language}")
        except (json.JSONDecodeError, OSError) as err:
            logger.warning(f"Semgrep execution error: {err}")

        return findings


class BanditAnalyzer(BaseStaticAnalyzer):
    """Bandit Python AST security analyzer adapter."""

    @property
    def name(self) -> str:
        return "bandit"

    @property
    def supported_languages(self) -> List[str]:
        return ["python"]

    def is_available(self) -> bool:
        tool = tool_registry.get_tool("bandit")
        return bool(tool and tool.available)

    def analyze(
        self, temp_path: Path, language: str, timeout_seconds: int = 20
    ) -> List[RawFinding]:
        findings: List[RawFinding] = []
        if language != "python":
            return findings

        cmd = [
            sys.executable,
            "-m",
            "bandit",
            "-f",
            "json",
            "-q",
            str(temp_path),
        ]

        try:
            result = subprocess.run(  # nosec B603
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                shell=False,
                stdin=subprocess.DEVNULL,
            )


            stdout = result.stdout.strip()
            if not stdout:
                return findings

            if len(stdout.encode("utf-8")) > 5 * 1024 * 1024:
                logger.warning("Bandit output exceeded 5MB; truncating to prevent memory exhaustion.")
                return findings

            data = json.loads(stdout)
            results = data.get("results", [])

            for idx, item in enumerate(results, start=1):
                test_id = item.get("test_id", "")
                rule_id = f"bandit.{test_id}" if test_id else "bandit.unknown"
                line_start = item.get("line_number", 1)
                line_range = item.get("line_range", [line_start])
                line_end = line_range[-1] if line_range else line_start

                cwe_obj = item.get("issue_cwe")
                cwe_str = None
                if isinstance(cwe_obj, dict) and "id" in cwe_obj:
                    cwe_str = f"CWE-{cwe_obj['id']}"

                sev_raw = item.get("issue_severity", "LOW").upper()
                if sev_raw == "HIGH":
                    mapped_sev = "High"
                elif sev_raw == "MEDIUM":
                    mapped_sev = "Medium"
                elif sev_raw == "LOW":
                    mapped_sev = "Low"
                else:
                    mapped_sev = "Info"

                # Escalate SQL Injection B608 to Critical per PRD
                if test_id == "B608":
                    mapped_sev = "Critical"

                conf_raw = item.get("issue_confidence", "HIGH").upper()
                mapped_conf = "High" if conf_raw == "HIGH" else ("Medium" if conf_raw == "MEDIUM" else "Low")

                msg = item.get("issue_text", "Security issue detected")
                fp = compute_finding_fingerprint("python", rule_id, line_start, msg, cwe_str)

                findings.append(
                    RawFinding(
                        id=f"b-find-{idx}",
                        tool="bandit",
                        rule_id=rule_id,
                        line_start=line_start,
                        line_end=line_end,
                        message=msg,
                        severity=mapped_sev,
                        confidence=mapped_conf,
                        category="Security",
                        cwe=cwe_str,
                        fingerprint=fp,
                    )
                )
        except subprocess.TimeoutExpired:
            logger.warning(f"Bandit execution timed out after {timeout_seconds}s")
        except (json.JSONDecodeError, OSError) as err:
            logger.error(f"Bandit execution or parse error: {err}")

        return findings


# ==============================================================================
# FINDING DEDUPLICATION & CONSOLIDATION
# ==============================================================================

def deduplicate_findings(findings: List[RawFinding]) -> List[RawFinding]:
    """Deduplicate overlapping findings across multiple static analysis tools.

    If two scanners identify the same issue (same line range, matching CWE or rule),
    consolidate into a single entry preserving the highest severity and primary provenance.
    """
    if not findings:
        return []

    severity_weights = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1, "Info": 0}
    consolidated: Dict[str, RawFinding] = {}

    for f in findings:
        # Key on line range + CWE (if present) or rule similarity
        loc_key = f"{f.line_start}:{f.cwe or f.rule_id.split('.')[-1]}"

        if loc_key in consolidated:
            existing = consolidated[loc_key]
            # Keep higher severity
            if severity_weights.get(f.severity, 0) > severity_weights.get(existing.severity, 0):
                f.tool = f"{existing.tool}, {f.tool}"
                consolidated[loc_key] = f
            else:
                existing.tool = f"{existing.tool}, {f.tool}"
        else:
            consolidated[loc_key] = f

    results = list(consolidated.values())
    MAX_FINDINGS_LIMIT = 50
    if len(results) > MAX_FINDINGS_LIMIT:
        results.sort(key=lambda x: severity_weights.get(x.severity, 0), reverse=True)
        results = results[:MAX_FINDINGS_LIMIT]

    return results


# ==============================================================================
# CENTRAL STATIC ANALYSIS RUNNER
# ==============================================================================

ACTIVE_ANALYZERS: List[BaseStaticAnalyzer] = [
    SemgrepAnalyzer(),
    BanditAnalyzer(),
]


def run_bandit(temp_path: Path, timeout_seconds: int = 20) -> List[RawFinding]:
    """Execute Bandit against temporary Python file."""
    return BanditAnalyzer().analyze(temp_path, language="python", timeout_seconds=timeout_seconds)


def run_semgrep(temp_path: Path, language: str = "python", timeout_seconds: int = 25) -> List[RawFinding]:
    """Execute Semgrep against temporary source file."""
    return SemgrepAnalyzer().analyze(temp_path, language=language, timeout_seconds=timeout_seconds)


def run_static_analysis(
    code: str, language: str = "python"
) -> List[RawFinding]:
    """Execute deterministic static analysis over submitted untrusted code snippet.

    Returns:
        findings: List[RawFinding]
    """
    lang_info = get_language(language)
    suffix = lang_info.default_extension if lang_info else ".py"
    all_findings: List[RawFinding] = []
    timeout_sec = settings.ANALYZER_TIMEOUT_SECONDS

    with safe_temp_source_file(code, suffix=suffix) as temp_path:
        for analyzer in ACTIVE_ANALYZERS:
            if language in analyzer.supported_languages:
                if analyzer.is_available():
                    tool_findings = analyzer.analyze(
                        temp_path, language=language, timeout_seconds=timeout_sec
                    )
                    all_findings.extend(tool_findings)

    # Deterministically deduplicate
    deduped = deduplicate_findings(all_findings)

    # Re-index unique sequential IDs
    for index, finding in enumerate(deduped, start=1):
        finding.id = f"find-{index}"

    return deduped

