# BRAIN.md — Current Project State & Working Memory

## Current Project State
The project has completed initial frontend (`FE-001` through `FE-006` plus Pixel-Art Landing Scene) and backend (`BE-001` through `BE-006` with hardening and multi-language support) implementation streams. Branches `main` and `fe` are merged. The repository is ready for live end-to-end integration testing (`INT-001`).

## Repository Structure
- `docs/`: Competition documentation (`CodeNeeti problem statements.pdf`).
- `PRD.md`: Approved Product Requirements Document.
- `AGENTS.md`: Authoritative operational rulebook for Antigravity instances.
- `DECISIONS.md`: Authoritative log of approved architectural and technical decisions.
- `API_CONTRACT.md`: Version 1.0.0 integration specification for frontend and backend.
- `TASKS.md`: Implementation task board tracking frontend, backend, integration, and testing workstreams.
- `LICENSE`: Apache 2.0 license file.
- `/frontend`: React + Vite application with Monaco Editor, pixel-art landing scene, and multi-agent review workspace.
- `/backend`: Python + FastAPI service with Semgrep/Bandit runners and Gemini multi-agent pipeline.
- `.agents/skills/`: 5 operational workflow skills created (`frontend-dev`, `backend-dev`, `agent-pipeline-dev`, `test-and-debug`, `ui-research-integration`).

## Frontend State
- **Implemented:**
  - `FE-001`: React + Vite project scaffolding initialized in `/frontend`, modern CSS design tokens in `/frontend/src/index.css`, offline mock fixture in `/frontend/src/mocks/sampleReviewResult.json`.
  - `FE-002`: Code entry experience with embedded Monaco Editor (`@monaco-editor/react`), Python & JavaScript syntax modes, Auto-detect switcher, drag-and-drop file upload overlay (.py and .js, 100 KB limit), character/line/byte counters, reset and clear controls.
  - **Pixel-Art Landing Scene Foundation:** Full-screen pixel-art meadow landscape matching reference image 1, animated flying birds, drifting clouds, gentle wildflower sway, ambient pollen motes, and interactive vine-covered CRT computer with scanlines, phosphor glow, green prompt (`> CODEGUARD / SYS: READY / ENTER _`), and gateway transition to the review workspace.
  - `FE-003`: Typed API service client (`/frontend/src/services/api.js`) for `GET /api/health`, `GET /api/languages`, and `POST /api/analyze`, with offline mock fallback and typed contract error mappings.
  - `FE-004`: Pipeline progress component (`/frontend/src/components/PipelineProgress.jsx`) with multi-stage status indicators (`Analyzing... → Explaining... → Generating Fix... → Verifying...`).
  - `FE-005`: Structured Findings list (`/frontend/src/components/FindingsList.jsx`) and detail view (`/frontend/src/components/FindingDetail.jsx`) with severity badges (Critical, High, Medium, Low, Info), CWE tags, line ranges, and resolution tags.
  - `FE-006`: Unified diff viewer (`/frontend/src/components/DiffViewer.jsx`) displaying original vs. fixed code additions/deletions, copy button with clipboard confirmation, and developer disclaimer.
- **In progress:** None.
- **Pending:** Integration with live backend pipeline (INT-001).
- **Known issues:** None.

## Backend State
- **Implemented:**
  - `BE-001`: FastAPI app, CORS middleware, config loader, Pydantic schemas, initial test suite.
  - `BE-002`: `GET /api/health`, `GET /api/languages`, custom validation exception handlers returning exact ErrorResponse schemas (`MISSING_CODE`, `CODE_TOO_LARGE`, `UNSUPPORTED_LANGUAGE`, `UNSUPPORTED_FILE_TYPE`).
  - `BE-003`: Deterministic static analysis runners for Bandit (Python) and Semgrep (Python + JavaScript) with ephemeral file sandbox, non-execution guarantee, and offline local security rulesets.
  - `BE-004`: Gemini `AnalyzerAgent` with prompt-injection isolation (`<code_to_analyze>`), Pydantic schema enforcement, and offline fallback with descriptive warning entries.
  - `BE-005`: Gemini `FixAgent` generating targeted fixes while preserving program structure, with offline fallback (`fix_available: false`).
  - `BE-006`: `VerifierAgent` and complete `POST /api/analyze` pipeline orchestration with re-analysis diffing, evidence-based verification tags (Resolved / Unresolved / Regression), and 90s timeout guard.
  - **Backend Hardening & Multi-Language Upgrade:**
    - Expanded central language registry (`backend/app/languages.py`) supporting 7 languages (Python, JavaScript, TypeScript, Java, C, C++, Go) plus `auto` detection.
    - Added local Semgrep security rulesets for TypeScript, Java, C, C++, and Go (`backend/app/rules/`).
    - Tool capability registry (`backend/app/analyzers.py`) detecting installed tools with graceful degradation for missing tools.
    - Cryptographic finding fingerprints (SHA-256) and multi-tool finding deduplication.
    - Structured sanitizing logger (`backend/app/logging_config.py`) redacting secrets and never logging raw code.
    - Request validation hardened with null-byte checks and sanitized filename handling.
- **In progress:** None.
- **Pending:** Integration workstream (`INT-001`).
- **Known issues:** None.

## Agent System State
- **Analyzer Agent:**
  - Status: Implemented (`backend/app/agents.py`).
  - Current behavior: Enriches raw deterministic findings with titles, plain explanations, confidence, and CWEs across all 7 languages. Fallback preserves raw findings when Gemini is unconfigured or unavailable.
  - Dependencies: Google Gemini API (`google-generativeai`), Semgrep/Bandit raw findings.
  - Known limitations: Graceful offline fallback populates `warnings[]` when `GEMINI_API_KEY` is not present.
- **Fix Agent:**
  - Status: Implemented (`backend/app/agents.py`).
  - Current behavior: Generates minimal code repairs targeting detected findings while preserving surrounding logic and architecture. If an automated repair cannot safely be determined (e.g. requires external API keys, database migrations, complex architectural restructuring, or API rate limits), it gracefully yields `fix_available: false`, populates standardized `Automated Fix Unavailable: <reason>. Manual remediation is recommended.` warnings, and populates `fix_unavailable_reason`.
  - Dependencies: Google Gemini API, enriched findings, original code.
  - Known limitations: Returns `fix_available: false` and `fixed_code: null` when Gemini is unavailable or repair is unsafe.
- **Verifier Agent & Regression Guard:**
  - Status: Implemented (`backend/app/agents.py` + `backend/app/pipeline.py`).
  - Current behavior: Re-runs Bandit/Semgrep on generated fix and compares findings deterministically via fingerprints and rule IDs. Tags findings as `Resolved` (rule no longer fires), `Unresolved` (rule still fires), or `Regression` (new rule triggered).
  - Safety Guard: If regressions are detected on a candidate fix, the pipeline withholds the fix (`fix_available: false`, `fixed_code: null`, `fix_unavailable_reason` explaining that the fix introduced regressions).
  - Dependencies: Semgrep/Bandit static runners, Gemini for line-shift reconciliation if needed.
  - Known limitations: Strictly evidence-based; never marks a finding Resolved without scanner confirmation.

## API Integration State
- **Current API contract version/state:** Version 1.0.0 approved and documented in API_CONTRACT.md (with backward-compatible additive fields `fix_unavailable_reason` and tool metadata).
- **Implemented endpoints:**
  - `GET /api/health`: Returns 200 OK `{"status": "ok", "version": "1.0.0", "tools": {...}}`.
  - `GET /api/languages`: Returns 200 OK with metadata for Python, JavaScript, TypeScript, Java, C, C++, Go.
  - `POST /api/analyze`: Returns 200 OK with complete `ReviewResult` matching API_CONTRACT.md schema (including `fix_unavailable_reason`).
  - `POST /api/refine`: Returns 200 OK with `RefineResult` allowing interactive developer prompting.
- **Frontend integration status:** Frontend UI (`FE-001` through `FE-006`) is built and tested; `DiffViewer.jsx` seamlessly displays "Automated Fix Unavailable" warning states with full backend reasoning.
- **Mock API status:** Fully supported in frontend (`VITE_USE_MOCKS=true`) and backend fallback modes.
- **Known mismatches:** None.

## Testing State
- **Tests that exist:** 63 automated tests in `backend/tests/` across `test_endpoints.py`, `test_analyzers.py`, `test_agents.py`, `test_pipeline.py`, `test_health.py`, `test_models.py`, `test_languages.py`, and `test_security_and_hardening.py`.
- **Tests passing/failing:** 63 passed, 0 failed.
- **Important untested areas:** Full browser-driven end-to-end user journey with backend daemon (INT-001).


## Current Work
All backend workstream tasks (`BE-001` through `BE-006`) are complete and verified. Ready for `INT-001`.

## Blockers
None.

## Known Problems
None.

## Recently Completed
- [PRD.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/PRD.md) approved.
- [AGENTS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/AGENTS.md) operational rulebook established.
- [DECISIONS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md) architectural log established.
- [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md) v1.0.0 established.
- [TASKS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/TASKS.md) task board established.
- 5 operational skills created under `.agents/skills/`.
- `BE-001` (Initialize FastAPI Project & Core Configuration) implemented and verified.

## Important Context
- **Boundary Isolation:** Strict separation between `/frontend/**` and `/backend/**`. Cross-boundary edits are forbidden without updating [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).
- **Security Rule:** Submitted user code is untrusted data and must never be evaluated or executed (`eval`, `exec`, or script execution).
- **Open Decisions with Defaults:**
  - OD-1: Gemini model variant defaults to `gemini-1.5-flash` pending explicit human direction.
  - OD-3: React diff library selection will use a standard lightweight component.
  - OD-4: Per-agent timeout defaults to 30 seconds (90 seconds total pipeline).
  - OD-5: Semgrep rulesets default to `p/python`, `p/javascript`, and `p/owasp-top-ten`.
