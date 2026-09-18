# TASKS.md — Implementation Task Board

This document is the shared coordination and task ownership board for human operators and Antigravity instances working concurrently on CodeGuard.

---

## Rules

- **Unique Identification:** Every task must have a unique ID (`FE-xxx`, `BE-xxx`, `INT-xxx`, `TEST-xxx`).
- **Single Workstream:** Every task belongs to exactly one workstream.
- **Concurrency Protection:** Never work on a task marked `IN PROGRESS` by another instance without prior human coordination.
- **Strict Boundary Isolation:**
  - Frontend tasks modify files under `/frontend/**` only.
  - Backend tasks modify files under `/backend/**` only.
- **Contract Boundary:** Cross-boundary changes require formal coordination via [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).
- **Explicit Dependencies:** Do not start a task until all listed dependencies are marked `DONE`.
- **Validation Before Completion:** A task can only be moved to `DONE` after passing concrete tests or manual verification.

---

## Statuses

- `TODO` — Ready to be picked up when dependencies are met.
- `IN PROGRESS` — Currently active in an Antigravity instance.
- `BLOCKED` — Waiting on an external decision or prerequisite.
- `REVIEW` — Implementation complete, pending human or test verification.
- `DONE` — Verified and complete.

---

## Frontend Workstream

### FE-001 — Initialize Frontend Scaffolding & Design System
**Status:** TODO  
**Depends on:** None  
**Files/Area:** `/frontend/**`  
**Goal:** Initialize the React + Vite application structure, configure package scripts, create modern vanilla CSS design tokens, and set up mock fixture infrastructure.  
**Acceptance criteria:**
- Vite + React project initialized in `/frontend`.
- Modern CSS design system created in `/frontend/src/index.css` (color tokens, typography, dark mode, card styles).
- `/frontend/src/mocks/sampleReviewResult.json` created matching [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).
- `npm run dev` builds and serves without errors.

---

### FE-002 — Code Input Screen & Monaco Editor Integration
**Status:** TODO  
**Depends on:** `FE-001`  
**Files/Area:** `/frontend/**`  
**Goal:** Build the main code entry interface featuring Monaco Editor, language switching, file uploading, and input validation.  
**Acceptance criteria:**
- Monaco Editor (`@monaco-editor/react`) embedded with syntax highlighting for Python and JavaScript.
- Language selector dropdown supporting Auto-detect, Python, and JavaScript.
- File upload drop-zone supporting `.py` and `.js` files with clear error states for unsupported extensions.
- Client-side size guard warning and disabling submission if code exceeds 100 KB.
- Clear/Reset code button and line/character count counters.

---

### FE-003 — API Client & Mock Service Layer
**Status:** TODO  
**Depends on:** `FE-001`  
**Files/Area:** `/frontend/**`  
**Goal:** Implement the frontend API service module to communicate with backend endpoints and support offline mock development mode.  
**Acceptance criteria:**
- API client implemented covering `GET /api/health`, `GET /api/languages`, and `POST /api/analyze`.
- Environment flag (e.g. `VITE_USE_MOCKS=true`) allowing full UI execution against mock JSON without backend running.
- Graceful handling of backend network errors and timeout scenarios with typed error mappings conforming to [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).

---

### FE-004 — Pipeline Progress & Analysis Overlay
**Status:** TODO  
**Depends on:** `FE-002`, `FE-003`  
**Files/Area:** `/frontend/**`  
**Goal:** Provide visual feedback during the review process showing stage-labeled progression.  
**Acceptance criteria:**
- Progress component displaying sequential stages: `Analyzing… → Explaining… → Generating Fix… → Verifying…`.
- Active stage animation and completion checkmarks.
- Clear error notification banner if analysis encounters `PIPELINE_TIMEOUT` or tool failure.

---

### FE-005 — Findings List & Issue Detail Component
**Status:** TODO  
**Depends on:** `FE-001`, `FE-003`  
**Files/Area:** `/frontend/**`  
**Goal:** Render the structured list of code findings with severity indicators, explanations, and verification tags.  
**Acceptance criteria:**
- Findings list panel displaying severity badges (Critical, High, Medium, Low, Info) with designated colors.
- Finding card displays line number range, rule identifier, category, and CWE badge where present.
- Expandable detail view showing the plain-language developer explanation and confidence indicator.
- Verification status badge shown on each finding (Resolved / Unresolved / Regression).

---

### FE-006 — Code Diff Viewer & Remediation Panel
**Status:** TODO  
**Depends on:** `FE-001`, `FE-005`  
**Files/Area:** `/frontend/**`  
**Goal:** Display original vs. fixed code in a clear visual diff viewer with copy controls and remediation summaries.  
**Acceptance criteria:**
- Lightweight diff view component rendering side-by-side or unified diff between original and `fixed_code`.
- Copy Fixed Code button with interactive clipboard confirmation toast.
- Degraded-state banner displayed when `fix_available: false` or `verification_available: false`.
- Prominent developer disclaimer displayed: *"Generated fixes are suggestions. Review and test before applying."*

---

## Backend Workstream

### BE-001 — Initialize FastAPI Project & Core Configuration
**Status:** DONE  
**Depends on:** None  
**Files/Area:** `/backend/**`  
**Goal:** Set up the Python FastAPI project skeleton, dependency manifest, environment configuration, and Pydantic data schemas.  
**Acceptance criteria:**
- Backend project initialized with `requirements.txt` / `pyproject.toml` including FastAPI, Uvicorn, Pydantic v2, and `google-generativeai`.
- Configuration module loading `GEMINI_API_KEY` and setting defaults for host, port (`8000`), and timeout.
- CORS middleware enabled for `http://localhost:5173`.
- Strict Pydantic models created for `ReviewRequest`, `Finding`, `ReviewResult`, `ErrorResponse`, matching [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).

---

### BE-002 — Health, Languages & Validation Endpoints
**Status:** TODO  
**Depends on:** `BE-001`  
**Files/Area:** `/backend/**`  
**Goal:** Implement utility endpoints and request validation guards.  
**Acceptance criteria:**
- `GET /api/health` returns status `ok` and version string.
- `GET /api/languages` returns Python and JavaScript metadata.
- Request validation logic rejecting code > 100 KB with `400 CODE_TOO_LARGE` and invalid languages with `400 UNSUPPORTED_LANGUAGE`.
- Standard error responses match the `ErrorResponse` schema.

---

### BE-003 — Deterministic Static Analysis Runner (Semgrep & Bandit)
**Status:** TODO  
**Depends on:** `BE-001`  
**Files/Area:** `/backend/**`  
**Goal:** Build subprocess runners for Semgrep and Bandit that inspect submitted code without executing it, returning normalized finding dictionaries.  
**Acceptance criteria:**
- Temporary file management safely writing code to ephemeral scratch file and scrubbing upon completion.
- Runner invokes Semgrep with standard Python and JavaScript security rules.
- Runner invokes Bandit for Python snippets.
- Subprocess outputs parsed reliably into internal finding structures with rule IDs, line numbers, and raw messages.
- Does NOT execute submitted user code under any circumstance.

---

### BE-004 — Gemini Integration & Analyzer Agent
**Status:** TODO  
**Depends on:** `BE-001`, `BE-003`  
**Files/Area:** `/backend/**`  
**Goal:** Implement the Analyzer Agent using `google-generativeai` with structured JSON schema output to enrich raw static findings.  
**Acceptance criteria:**
- Gemini client wrapper handling authentication, structured output schema, and timeouts.
- Prompt explicitly isolates submitted code inside `<code_to_analyze>` data blocks with anti-prompt-injection system instructions.
- Generates plain-language explanation, contextual severity, and category per finding.
- Filters obvious false positives with explicit reasoning.
- Fallback handler returning raw static findings with a descriptive entry in `warnings[]` (e.g., `"Enrichment unavailable: Gemini did not respond."`) on Gemini failure, per `API_CONTRACT.md` `ReviewResult` schema.

---

### BE-005 — Fix Agent Implementation
**Status:** TODO  
**Depends on:** `BE-004`  
**Files/Area:** `/backend/**`  
**Goal:** Implement the Fix Agent to generate minimal, targeted code repairs addressing all verified findings.  
**Acceptance criteria:**
- Prompt instructs Gemini to repair only vulnerable/buggy sections while strictly preserving surrounding logic and architecture.
- Gemini returns full corrected code string adhering to structured response schema.
- Graceful fallback setting `fix_available: false` and leaving `fixed_code: null` if Gemini times out or produces invalid output.

---

### BE-006 — Verifier Agent & Pipeline Orchestration
**Status:** TODO  
**Depends on:** `BE-003`, `BE-005`  
**Files/Area:** `/backend/**`  
**Goal:** Re-run static analysis on fixed code, semantically reconcile findings, and assemble the complete `POST /api/analyze` response.  
**Acceptance criteria:**
- Re-runs Semgrep (+ Bandit) on the Fix Agent's output code.
- Accurately tags findings: `Resolved` (rule no longer fires), `Unresolved` (rule still fires), or `Regression` (new rule triggered).
- Calls Gemini for line-shift reconciliation only when needed, never fabricating a `Resolved` status.
- Final `POST /api/analyze` endpoint coordinates the pipeline and returns the complete `ReviewResult` within the 90s timeout window.

---

## Integration Workstream

### INT-001 — End-to-End Local Pipeline Integration & Verification
**Status:** TODO  
**Depends on:** `FE-006`, `BE-006`  
**API Contract:** [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md)  
**Goal:** Verify complete end-to-end integration between frontend and backend running locally using the PRD demo sample.  
**Acceptance criteria:**
- Frontend running on `http://localhost:5173` successfully submits code to backend on `http://localhost:8000`.
- Prepared Python demo sample (SQL injection, hardcoded secret, missing validation) produces 3 distinct findings.
- Stage-labeled progression displays accurately during the scan.
- Diff panel renders side-by-side comparison cleanly.
- Resolved verification badges display correctly based on backend verifier evidence.

---

## Testing Workstream

### TEST-001 — Backend API & Static Analysis Test Suite
**Status:** TODO  
**Depends on:** `BE-002`, `BE-003`  
**Files/Area:** `/backend/tests/**`  
**Goal:** Create automated test suite for endpoints, static analysis parsing, and error conditions.  
**Acceptance criteria:**
- `pytest` suite testing `/api/health` and `/api/languages`.
- Tests validating request guards (payload > 100 KB rejected, bad language rejected).
- Tests running Semgrep/Bandit runners against synthetic vulnerable Python and JavaScript snippets to confirm parsing fidelity.

---

### TEST-002 — Frontend Component & Mock Verification Suite
**Status:** TODO  
**Depends on:** `FE-003`, `FE-005`, `FE-006`  
**Files/Area:** `/frontend/src/**`  
**Goal:** Validate frontend UI rendering against contract mock fixtures and user interaction edge cases.  
**Acceptance criteria:**
- Unit/component tests verifying Monaco input change events and file upload validation.
- Test verifying findings list correctly renders all severity levels from mock fixture.
- Test verifying diff view renders correctly with `fix_available: true` and gracefully handles `fix_available: false`.

---

## Blocked / Decisions Required

The following tasks proceed with documented defaults pending human confirmation of open decisions in [DECISIONS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md):
- **BE-004 / BE-005 / BE-006 (OD-1 & OD-4):** Configured to default to `gemini-1.5-flash` and 30-second per-agent timeout; human confirmation can change configuration without code refactoring.
- **FE-006 (OD-3):** Will use a standard lightweight React diff package (`react-diff-viewer-continued` or similar) pending human preference.
- **BE-003 (OD-5):** Standard default rulesets (`p/python`, `p/javascript`, `p/owasp-top-ten`) will be targeted.

---

## Completed

- **DOC-001:** Approved Product Requirements Document finalized ([PRD.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/PRD.md)).
- **DOC-002:** Antigravity Operational Rulebook established ([AGENTS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/AGENTS.md)).
- **DOC-003:** Current project state & working memory initialized ([BRAIN.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/BRAIN.md)).
- **DOC-004:** Architectural & technical decisions recorded ([DECISIONS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md)).
- **DOC-005:** Frontend-backend API contract finalized ([API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md)).
