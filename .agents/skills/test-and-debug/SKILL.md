---
name: test-and-debug
description: Workflow instructions for executing automated tests, debugging static analysis and agent pipelines, and diagnosing issues without modifying code across layer boundaries.
---

# Testing & Debugging Skill (`test-and-debug`)

This skill defines the methodology for running automated test suites, debugging failures, and writing regression tests in CodeGuard.

---

## 1. Scope & Ownership

- **Allowed Area:** Test files and fixtures only: `/backend/tests/**`, `/frontend/src/__tests__/**`, `/frontend/src/mocks/**`.
- **Forbidden Area:** Never edit production application code across boundaries. If a bug fix is needed, delegate to `frontend-dev`, `backend-dev`, or `agent-pipeline-dev`.

---

## 2. Pre-Testing Inspection Checklist

1. **Check Contract:** Inspect `API_CONTRACT.md` for expected endpoint behaviors, status codes, and schemas.
2. **Check Demo Ground Truth:** Inspect `PRD.md` Section 18 for the canonical Python demo test case (SQL injection, hardcoded secret, missing validation).
3. **Check System State:** Inspect `BRAIN.md` Testing State and Known Problems.

---

## 3. Testing Workflows

### Backend Testing
Run pytest from workspace or backend directory:
```bash
pytest backend/tests/ -v
```
Verify:
- Request validation (rejection of oversized payloads > 100 KB, bad languages, bad file extensions).
- Static analysis runner parsing with synthetic test snippets.
- Pipeline timeout handling and graceful fallbacks.

### Frontend Testing
Run build and component tests:
```bash
npm --prefix frontend run build
```
Verify:
- Monaco Editor input and language toggling.
- Mock fixture rendering of findings, severity badges, and diffs.
- Clear error notification display on API failures.

---

## 4. Debugging Guidelines

1. Isolate the failure: Determine whether the defect lies in static analysis CLI execution, LLM JSON schema formatting, network transport, or React state management.
2. Reproduce with a minimal test case in a test fixture.
3. NEVER disable safety checks, bypass Pydantic validation, or skip failing tests to force a pass.
4. Record verified defects and diagnostic notes in `BRAIN.md` under Known Problems.

---

## 5. Stop and Ask the Human

STOP and request human developer review before proceeding if:
- A test failure uncovers a contradiction between frontend and backend contracts.
- A bug requires altering the approved requirements in `PRD.md` or settled choices in `DECISIONS.md`.
