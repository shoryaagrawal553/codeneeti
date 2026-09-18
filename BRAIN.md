# BRAIN.md — Current Project State & Working Memory

## Current Project State
The project is in the scaffolding and pre-implementation phase. All foundational governance, architectural, contract, and task coordination documents are finalized and approved ([PRD.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/PRD.md), [AGENTS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/AGENTS.md), [DECISIONS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md), [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md), [TASKS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/TASKS.md)). No source code has been written yet; neither `/frontend` nor `/backend` directories have been initialized.

## Repository Structure
- `docs/`: Competition documentation (`CodeNeeti problem statements.pdf`).
- `PRD.md`: Approved Product Requirements Document.
- `AGENTS.md`: Authoritative operational rulebook for Antigravity instances.
- `DECISIONS.md`: Authoritative log of approved architectural and technical decisions.
- `API_CONTRACT.md`: Version 1.0.0 integration specification for frontend and backend.
- `TASKS.md`: Implementation task board tracking frontend, backend, integration, and testing workstreams.
- `LICENSE`: Apache 2.0 license file.
- `/frontend`: Not yet initialized (planned: React + Vite application).
- `/backend`: Not yet initialized (planned: Python + FastAPI service).
- `.agents/skills/`: 5 operational workflow skills created (`frontend-dev`, `backend-dev`, `agent-pipeline-dev`, `test-and-debug`, `ui-research-integration`).

## Frontend State
- **Implemented:** None.
- **In progress:** None.
- **Pending:** Tasks `FE-001` through `FE-006` in [TASKS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/TASKS.md) (scaffolding, Monaco Editor integration, mock API client, progress overlay, findings list, diff viewer).
- **Known issues:** None (no code implemented).

## Backend State
- **Implemented:** `BE-001` core foundation (FastAPI app, CORS middleware for `http://localhost:5173`, configuration loader with `.env` support, strict Pydantic schemas matching `API_CONTRACT.md`, `GET /api/health` endpoint).
- **In progress:** None.
- **Pending:** Tasks `BE-002` through `BE-006` in [TASKS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/TASKS.md) (languages & validation endpoints, Semgrep/Bandit runners, Gemini Analyzer, Fix, and Verifier agents).
- **Known issues:** None.

## Agent System State
- **Analyzer Agent:**
  - Status: Not implemented.
  - Current behavior: None.
  - Dependencies: Planned: Google Gemini API (`google-generativeai`), static analysis findings.
  - Known limitations: None yet built.
- **Fix Agent:**
  - Status: Not implemented.
  - Current behavior: None.
  - Dependencies: Planned: Google Gemini API, Analyzer findings, original code.
  - Known limitations: None yet built.
- **Verifier Agent:**
  - Status: Not implemented.
  - Current behavior: None.
  - Dependencies: Planned: Google Gemini API, Semgrep/Bandit subprocess re-execution.
  - Known limitations: None yet built.

## API Integration State
- **Current API contract version/state:** Version 1.0.0 approved and documented in [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md).
- **Implemented endpoints:** `GET /api/health` (verified returning 200 OK with `{"status": "ok", "version": "1.0.0"}`).
- **Frontend integration status:** Not implemented.
- **Mock API status:** Fixture schema defined in [API_CONTRACT.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/API_CONTRACT.md); file creation in `/frontend/src/mocks/` pending `FE-001`.
- **Known mismatches:** None.

## Testing State
- **Tests that exist:** `backend/tests/test_health.py` (3 tests), `backend/tests/test_models.py` (4 tests).
- **Tests passing/failing:** 7 passed, 0 failed.
- **Important untested areas:** Tasks BE-002 through BE-006 (endpoints not yet built, static analysis runners, agent prompts, pipeline integration).

## Current Work
BE-001 complete; ready for BE-002 (Health, Languages & Validation Endpoints) or frontend task initiation.

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
