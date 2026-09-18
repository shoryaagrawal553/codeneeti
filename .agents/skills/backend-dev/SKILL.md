---
name: backend-dev
description: Workflow instructions and strict boundary rules for developing FastAPI routes, Pydantic models, static analysis runners, and server configuration in CodeGuard.
---

# Backend Development Skill (`backend-dev`)

This skill defines the operational rules, boundaries, and workflow for Antigravity instances implementing backend tasks.

---

## 1. Scope & Ownership (HARD RULE)

- **Allowed Area:** `/backend/**` strictly (`app/`, `requirements.txt`, `pyproject.toml`).
- **Forbidden Area:** NEVER modify any file in `/frontend/**`.
- **Coordination Files:** Do NOT modify `API_CONTRACT.md`, `PRD.md`, or `DECISIONS.md`.

---

## 2. Pre-Implementation Inspection Checklist

Before modifying any backend file:
1. **Check API Contract:** Read `API_CONTRACT.md` to ensure exact Pydantic model and route schema conformance.
2. **Check Task Scope:** Inspect `TASKS.md` for task boundaries and dependencies.
3. **Check System State:** Inspect `BRAIN.md` for current backend state.
4. **Enforce Safety Rule:** Read `AGENTS.md` Rule 8 — submitted code is untrusted data and must NEVER be evaluated (`eval`, `exec`, or subprocess script execution).

---

## 3. Implementation Workflow

1. **Task Claim:** Verify the target task in `TASKS.md` is marked `IN PROGRESS`.
2. **Input Validation:**
   - Enforce maximum 100 KB payload limit returning `400 CODE_TOO_LARGE`.
   - Validate language parameter (`python`, `javascript`, `auto`) returning `400 UNSUPPORTED_LANGUAGE`.
   - Validate uploaded file extensions (`.py`, `.js`) returning `400 UNSUPPORTED_FILE_TYPE`.
3. **Static Analysis Subprocess Safety:**
   - Write submitted code to temporary isolated files.
   - Run Semgrep and Bandit CLI tools strictly as static scanners.
   - Never execute or interpret the code snippet.
   - Scrub temporary files immediately after scanning.
4. **CORS Configuration:**
   - Ensure backend permits requests from frontend dev origin (`http://localhost:5173`).
5. **Secrets Protection:**
   - Load `GEMINI_API_KEY` from environment variables only; never hardcode, log, or leak secrets in API responses.

---

## 4. Testing & Verification

1. Run backend tests:
   ```bash
   pytest
   ```
2. Verify all endpoint responses match the exact JSON schemas and status codes defined in `API_CONTRACT.md`.

---

## 5. Stop and Ask the Human

STOP and request human developer review before proceeding if:
- A backend constraint necessitates changing an endpoint path, request schema, or response model in `API_CONTRACT.md`.
- A proposed change requires modifying files outside `/backend/**`.
