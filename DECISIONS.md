    # DECISIONS.md — Architectural & Technical Decision Log

This document is the authoritative record of approved architectural and technical decisions for CodeGuard. Its purpose is to record rationale, consequences, and alternatives, and to prevent Antigravity instances from repeatedly reconsidering or modifying settled decisions.

---

## Decision Log

### DEC-001 — React + Vite for Frontend

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Build the web user interface as a single-page application using React and Vite.

**Reason:**
Vite provides instant Hot Module Replacement (HMR) and fast build times crucial for rapid hackathon iteration. React provides a mature component ecosystem with direct support for Monaco Editor, diff viewers, and stateful UI workflows.

**Alternatives considered:**
- *Next.js:* Unnecessary overhead; server-side rendering, routing complexity, and API routes add friction when the backend is Python-based.
- *Vanilla JavaScript / HTML:* Lacks component reusability and clean state management needed for multi-stage analysis views, diff panels, and complex findings lists.

**Consequences:**
The frontend will run as an independent client-side application (default port `5173`), consuming the backend REST API.

**Scope:**
`/frontend/**`

---

### DEC-002 — Python + FastAPI for Backend

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Build the backend service using Python 3.10+ and FastAPI.

**Reason:**
FastAPI offers asynchronous execution, high performance, automatic OpenAPI documentation, and native Pydantic schema validation. Python is the native ecosystem for both the target static analysis tool (Bandit) and the Google GenAI SDK (`google-generativeai`).

**Alternatives considered:**
- *Node.js / Express:* Spawning Python-based CLI tools (Bandit) from Node.js introduces cross-process marshalling overhead and dual-runtime dependencies.
- *Flask:* Lacks native async support, automatic OpenAPI schema generation, and built-in type-safe request validation provided by FastAPI.

**Consequences:**
Backend runs as a FastAPI service on port `8000`, cleanly handling async agent requests and deterministic tool execution.

**Scope:**
`/backend/**`

---

### DEC-003 — Google Gemini as LLM Provider

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Use Google Gemini via the official Python SDK (`google-generativeai`) with structured JSON schema output for all agent interactions.

**Reason:**
Native support for JSON schema enforcement guarantees strict output compliance without brittle regex or parsing logic. Gemini provides strong reasoning capabilities on code analysis, large context windows, fast latency, and aligns with the hackathon platform.

**Alternatives considered:**
- *OpenAI (GPT-4o):* Comparable quality, but Gemini is the designated platform LLM and offers structured outputs via official SDK.
- *Local LLMs (Ollama / Llama-3):* High hardware dependency, non-deterministic performance on evaluation machines, and potential latency bottlenecks.

**Consequences:**
The backend requires a valid `GEMINI_API_KEY` in the environment. Structured response models guarantee type safety for downstream consumers.

**Scope:**
`/backend/agents/**`, `/backend/config.py`

---

### DEC-004 — Semgrep and Bandit for Deterministic Static Analysis

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Use Semgrep (for Python and JavaScript) and Bandit (Python-specific) as the sole mechanisms for vulnerability and bug detection. LLMs must NOT be used for initial detection.

**Reason:**
Deterministic static analysis tools eliminate AI hallucinations in vulnerability detection. They produce reproducible, rule-backed findings mapped to industry standards (CWE/OWASP) and can be re-run on fixed code to empirically verify remediation.

**Alternatives considered:**
- *LLM-Only Detection:* High false-positive rate, non-deterministic results, vulnerability hallucinations, and lack of ground truth for verification.
- *ESLint / Flake8:* Primarily style and syntax linters rather than focused security vulnerability scanners.

**Consequences:**
Semgrep and Bandit must be installed in the backend environment and invoked via controlled subprocess execution. Findings serve as ground truth for the agent pipeline.

**Scope:**
`/backend/analyzers/**`, `/backend/services/**`

---

### DEC-005 — Language Scope Restricted to Python and JavaScript

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Restrict MVP analysis and fix support to Python (`.py`) as primary and JavaScript (`.js`) as secondary.

**Reason:**
Python and JavaScript represent the most widely used programming languages and are robustly supported by Semgrep and Bandit. Keeping the scope focused ensures high detection reliability and achievable MVP completion within hackathon timeframes.

**Alternatives considered:**
- *Adding TypeScript, Java, C++, or Go:* Significantly widens parsing complexity, ruleset configuration, and verification nuances beyond hackathon constraints.

**Consequences:**
Input handlers must validate language selection and reject unsupported file types.

**Scope:**
`/backend/**`, `/frontend/**`

---

### DEC-006 — Monaco Editor for Code Input

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Embed Monaco Editor (`@monaco-editor/react`) as the primary code input and display interface.

**Reason:**
Provides a familiar, professional code editing experience (identical to VS Code) with syntax highlighting, line numbers, folding, and keyboard shortcuts, elevating demo presentation and developer usability.

**Alternatives considered:**
- *Plain HTML `<textarea>`:* Unprofessional UI; lacks syntax highlighting, code indentation, and line numbering.
- *CodeMirror:* Capable editor, but Monaco delivers higher visual fidelity and native VS Code familiarity.

**Consequences:**
Introduces Monaco dependency into the frontend build.

**Scope:**
`/frontend/**`

---

### DEC-007 — Three-Agent Sequential Architecture (Analyzer → Fix → Verifier)

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Organize AI capabilities into three dedicated sequential agents:
1. **Analyzer Agent:** Interprets static analysis findings, adjusts severity in context, produces plain-language explanations, and filters false positives.
2. **Fix Agent:** Generates minimal, unified corrected code resolving all valid findings.
3. **Verifier Agent:** Re-executes static analysis on the proposed fix and semantically reconciles results to prove resolution (Resolved, Unresolved, Regression).

**Reason:**
Separating concerns prevents prompt overload and cascading failures. The sequential structure allows clear UI progress stage indicators and guarantees that verification is backed by empirical static analysis rather than fabricated LLM claims.

**Alternatives considered:**
- *Single Monolithic Prompt:* Conflates detection, explanation, and fixing; impossible to perform post-fix static verification; difficult to debug or demonstrate.
- *Autonomous Looping Multi-Agent System:* Unpredictable runtime, risks infinite loops, and exceeds hackathon latency limits.

**Consequences:**
Pipeline runs predictably in sequence. Each agent has its own Pydantic input/output schemas and prompts.

**Scope:**
`/backend/agents/**`, `/backend/pipeline.py`

---

### DEC-008 — Strict Frontend / Backend Isolation via API Contract

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Enforce strict separation between frontend (`/frontend/**`) and backend (`/backend/**`). All cross-boundary communication must strictly adhere to `API_CONTRACT.md`.

**Reason:**
Prevents merge conflicts and unintended side effects, enabling independent development and concurrent Antigravity instances without boundary contamination.

**Alternatives considered:**
- *Full-stack Monorepo with Shared Code:* High coupling, fragile boundaries, and complexity coordinating Python backend with JS frontend.

**Consequences:**
Frontend tasks must not edit backend files; backend tasks must not edit frontend files. Any contract changes require updating `API_CONTRACT.md` and obtaining human approval first.

**Scope:**
Entire repository architecture, `API_CONTRACT.md`

---

### DEC-009 — No Authentication or User Accounts for MVP

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Omit user authentication, registration, login, and session tokens from the MVP.

**Reason:**
The problem statement focuses solely on code review and security assistance capabilities. Authentication adds operational overhead, database dependencies, and friction during hackathon evaluation.

**Alternatives considered:**
- *OAuth2 / Supabase / Firebase Auth:* Unnecessary complexity that detracts focus from the core AI and security analysis pipeline.

**Consequences:**
All API endpoints are unauthenticated and intended for single-user interactive operation.

**Scope:**
`/backend/**`, `/frontend/**`

---

### DEC-010 — Ephemeral Processing without Persistent Storage

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Process all code submissions and analysis results in-memory. Do not store code or findings in a persistent database.

**Reason:**
User-submitted code is sensitive; omitting persistent storage avoids data retention liabilities, privacy risks, and the operational burden of database configuration and migrations.

**Alternatives considered:**
- *SQLite / PostgreSQL Database:* Adds schema migrations and storage management with zero benefit to the core review workflow.

**Consequences:**
Analysis results persist only in frontend state during the active browser session. Refreshing the browser clears current findings.

**Scope:**
`/backend/**`, `/frontend/**`

---

### DEC-011 — Local-First Development and Execution Target

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Target local execution as the primary operational environment (Backend: `http://localhost:8000`, Frontend: `http://localhost:5173`).

**Reason:**
Guarantees reliable, unmetered demonstration during judging without cloud deployment downtime, network latency, or cold-start failures.

**Alternatives considered:**
- *Cloud-First Deployment:* Introduces deployment troubleshooting and infrastructure configuration risks during core feature implementation.

**Consequences:**
All development scripts, environment variables, and setup instructions will target local execution. Hosted deployment is deferred until MVP completion.

**Scope:**
Entire project setup and documentation.

---

### DEC-012 — Direct Gemini SDK Calls (No Heavy Agent Frameworks)

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Invoke Gemini directly via the `google-generativeai` SDK using typed Pydantic models; do not use external agent orchestration frameworks (LangChain, CrewAI, AutoGen).

**Reason:**
Direct SDK usage minimizes dependencies, eliminates framework churn, reduces latency, and provides complete transparency over prompts and structured schemas.

**Alternatives considered:**
- *LangChain / CrewAI / AutoGen:* Adds heavy abstraction layers, dependency conflicts, and hidden prompt wrappers that complicate debugging and testing.

**Consequences:**
Lightweight backend dependency footprint with direct, deterministic control over prompts and outputs.

**Scope:**
`/backend/agents/**`, `/backend/requirements.txt`

---

### DEC-013 â€” Python Dependency Format: requirements.txt

**Status:** Accepted  
**Date:** 2026-09-18

**Decision:**
Use `requirements.txt` as the sole Python dependency manifest for the backend. Do not use `pyproject.toml` or a build system (Poetry, Hatch, etc.) for the MVP.

**Reason:**
`requirements.txt` is universally understood, requires no build-system tooling, and is the fastest option for hackathon setup and onboarding. All required backend packages (`fastapi`, `uvicorn`, `pydantic`, `google-generativeai`, `semgrep`, `bandit`) are installable via `pip install -r requirements.txt`.

**Alternatives considered:**
- *pyproject.toml (Poetry / Hatch):* Adds build-system configuration, lock-file management, and dependency resolver overhead with no meaningful benefit for a single-developer hackathon backend.

**Consequences:**
- BE-001 must create `requirements.txt` (not `pyproject.toml`) as the backend dependency file.
- Backend environment setup is: `python -m venv .venv && pip install -r requirements.txt`.

**Scope:**
`/backend/requirements.txt`

---

## Unresolved Decisions (From PRD Section 22)

The following minor items remain open for human developer resolution and are NOT accepted decisions:

1. **OD-1: Gemini Model Variant** â€” Specific model variant selection (`gemini-1.5-flash` vs `gemini-1.5-pro`).
2. **OD-2: Hackathon Deadline & Duration** â€” Final schedule determining post-MVP buffer.
3. **OD-3: React Diff Component Library** â€” Specific diff package selection (`react-diff-viewer-continued` vs lightweight custom diff).
4. **OD-4: Per-Agent Timeout Duration** â€” Proposed default is 30s per agent (90s total pipeline); pending empirical tuning.
5. **OD-5: Semgrep Ruleset Selection** â€” Specific registry rulesets to include (e.g., `p/python`, `p/javascript`, `p/owasp-top-ten`).
