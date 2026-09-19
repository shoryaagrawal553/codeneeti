# CodeGuard — AI Code Review & Security Assistant

> **CodeNeeti Hackathon** | **Track:** AI Code Review Tool | **Status:** Prototype Ready

**CodeGuard** is an agentic AI developer assistant that reviews code, identifies bugs and security vulnerabilities, explains them clearly in simple terms, generates targeted safe repairs, and verifies whether the suggested fixes actually resolved the underlying issues without introducing regressions.

---

## Architecture & How It Works

CodeGuard pairs **deterministic static analysis engines** (Semgrep & Bandit) with a **three-agent Google Gemini pipeline**:

```
 ┌──────────────────────┐
 │  Developer Code      │
 │  (Paste / Upload)    │
 └──────────┬───────────┘
            │
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Deterministic Scanners (Semgrep & Bandit)                │
 │    - Ephemeral zero-execution sandbox                       │
 │    - SHA-256 fingerprinting & deduplication                 │
 └──────────┬──────────────────────────────────────────────────┘
            │
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 2. Analyzer Agent (Gemini)                                  │
 │    - Enriches raw findings with plain explanations          │
 │    - Contextual risk explanation & severity scoring         │
 │    - Fallback preservation when offline                     │
 └──────────┬──────────────────────────────────────────────────┘
            │
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 3. Fix Agent (Gemini)                                       │
 │    - Minimal targeted surgical repairs                      │
 │    - Preserves application logic and architecture           │
 │    - Explicit safety guards & fix-unavailability reporting  │
 └──────────┬──────────────────────────────────────────────────┘
            │
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 4. Verifier Agent (Deterministic Re-analysis)               │
 │    - Re-runs Semgrep & Bandit against fixed code            │
 │    - Tags findings: Resolved, Unresolved, or Regression     │
 │    - Withholds fix if new regressions are introduced        │
 └──────────┬──────────────────────────────────────────────────┘
            │
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ Frontend Workspace (React + Vite + Monaco Editor)           │
 │    - Side-by-side & unified diff viewer                     │
 │    - Interactive findings list & CWE tags                   │
 │    - Real-time pipeline step progress                       │
 └─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, C, C++, and Go (with automatic language detection).
- **Code Entry Flexibility**: Embedded Monaco editor with syntax highlighting, line numbers, character counters, plus drag-and-drop file upload (`.py`, `.js`, etc., up to 100 KB).
- **Deterministic + Agentic Accuracy**: Uses established static security rulesets (Bandit, Semgrep) to eliminate hallucinated bug lines, and AI reasoning to explain and contextualize findings.
- **Evidence-Based Fix Verification**: Every proposed fix is automatically re-analyzed through the scanners. Findings are marked as `Resolved` only with empirical proof.
- **Strict Non-Execution Safety**: Submitted user code is **never** executed (`eval`/`exec`/subprocesses). Code is treated strictly as untrusted text.
- **Offline & Graceful Degradation**: If `GEMINI_API_KEY` is not present, deterministic findings are still presented with informative warning banners, and mock fixtures can be enabled on the frontend.
- **Modern Developer UI**: Clean Monaco code workspace, pipeline progress tracker, unified and split diff viewers, and pixel-art landing scene.

---

## Project Structure

```
codeneeti/
├── docs/                     # Hackathon problem statement & documentation
├── PRD.md                    # Approved Product Requirements Document
├── API_CONTRACT.md           # API specifications and Pydantic/TypeScript schemas
├── DECISIONS.md              # Architectural decision log
├── BRAIN.md                  # Working memory and current technical state
├── TASKS.md                  # Backlog and implementation status
├── backend/                  # FastAPI service
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint and route handlers
│   │   ├── config.py         # App settings and environment variables
│   │   ├── models.py         # Pydantic schemas (ReviewRequest, ReviewResult, etc.)
│   │   ├── languages.py      # Multi-language registry and auto-detection
│   │   ├── analyzers.py      # Bandit & Semgrep deterministic static runners
│   │   ├── agents.py         # AnalyzerAgent, FixAgent, VerifierAgent
│   │   ├── pipeline.py       # Multi-agent review & verification orchestrator
│   │   ├── logging_config.py # Sanitized privacy-preserving logging
│   │   └── rules/            # Local Semgrep rule configurations
│   ├── tests/                # Automated pytest suite (60+ unit & integration tests)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
└── frontend/                 # React + Vite web application
    ├── src/
    │   ├── components/       # Monaco Editor, DiffViewer, FindingsList, PipelineProgress
    │   ├── services/         # Typed API client with mock fallback
    │   ├── mocks/            # Offline mock sample review payload
    │   ├── App.jsx           # Main workspace orchestration
    │   └── index.css         # Design tokens and styles
    ├── package.json          # Node dependencies & scripts
    └── vite.config.js        # Vite build & dev server configuration
```

---

## Getting Started

### Prerequisites

- **Python**: 3.10+
- **Node.js**: 18+ (with `npm`)
- **Semgrep & Bandit** (optional for local deterministic scans):
  ```bash
  pip install semgrep bandit
  ```
- **Google Gemini API Key** (optional for AI agent reasoning): [Get an API Key](https://aistudio.google.com/)

---

### Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *(Note: CodeGuard gracefully falls back to deterministic analysis if no key is provided.)*

5. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be live at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

### Frontend Setup

1. Open a separate terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Running Tests

### Backend Tests

Execute the comprehensive backend test suite (unit tests, static analyzer mocks, agents, pipeline, and security hardening):

```bash
cd backend
pytest
```

### Frontend Code Quality

Run Oxlint on the frontend codebase:

```bash
cd frontend
npm run lint
```

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and detected analyzer tool availability |
| `GET` | `/api/languages` | Supported programming languages and file extensions |
| `POST` | `/api/analyze` | Core review pipeline: static scan → explain → fix → verify |
| `POST` | `/api/refine` | Interactive developer refinement on findings |

For complete schema definitions and sample payloads, refer to [`API_CONTRACT.md`](API_CONTRACT.md).

---

## Security & Safety Principles

1. **Zero Execution of User Code**: Code uploaded or pasted is analyzed purely as text. It is never executed in Python runtime or shell subprocesses.
2. **Prompt-Injection Defense**: User code snippets are isolated in prompt envelopes (`<code_to_analyze>`) and explicitly separated from system instructions.
3. **Secret Protection**: Logging configurations sanitize and redact potential API keys or tokens; raw code is never emitted into persistent server logs.
4. **Verified Remediation**: The Fix Agent never assumes its output is safe; the Verifier Agent re-scans the fix to confirm the vulnerability is gone and zero new flaws exist.

---

## License

This project is licensed under the Apache License 2.0. See [`LICENSE`](LICENSE) for details.
