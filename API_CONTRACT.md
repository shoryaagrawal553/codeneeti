# API_CONTRACT.md — Frontend-Backend Integration Specification

**Version:** 1.0.0  
**Status:** Approved  
**Last Updated:** 2026-09-18  
**Governing Documents:** [PRD.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/PRD.md), [AGENTS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/AGENTS.md), [DECISIONS.md](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md)

---

## 1. Core Principles

1. **Strict Decoupling:** Frontend and backend must be independently developable, runnable, and testable.
2. **Contract Supremacy:** Neither layer may depend on internal implementation details of the other. All interaction is governed solely by this document.
3. **Mock Independence:** The frontend must be fully developable and verifiable using static mock JSON fixtures conforming to this contract without a running backend.
4. **Isolated Testability:** The backend must be fully testable via direct HTTP requests (`pytest` + `httpx`, `curl`) without a running frontend.
5. **No Silent Changes:** Neither side may unilaterally alter field names, types, endpoints, or error codes. Any changes must follow the formal Contract Change Process.
6. **Zero Secret Leakage:** The backend must never expose `GEMINI_API_KEY` or environment secrets in any response payload or header.

---

## 2. General Integration Details

### Base URL
- **Local Backend Default:** `http://localhost:8000/api`
- **Frontend Development Origin:** `http://localhost:5173`
- **CORS Requirement:** Backend must configure CORS to permit requests from `http://localhost:5173` (methods: `GET`, `POST`, `OPTIONS`; headers: `Content-Type`).

### Content Type
All request and response bodies use UTF-8 encoded JSON:
```http
Content-Type: application/json
```

---

## 3. Standard Error Format

All error responses across all endpoints adhere to a uniform structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable explanation of what went wrong.",
  "partial_result": null
}
```

### Fields
- `error` (*string, required*): Machine-readable uppercase identifier from the approved error code table.
- `message` (*string, required*): Developer-friendly description of the error.
- `partial_result` (*object or null, required*): If pipeline failure occurred after partial progress (e.g., Fix Agent or Verifier Agent failed), contains available `ReviewResult` data up to the failure point; otherwise `null`.

### Error Codes

| HTTP Status | Error Code | Description / Trigger |
|---|---|---|
| 400 | `MISSING_CODE` | The `code` property is omitted, null, or empty whitespace. |
| 400 | `CODE_TOO_LARGE` | The submitted `code` string exceeds 100 KB (102,400 bytes). |
| 400 | `UNSUPPORTED_LANGUAGE` | The specified `language` is not supported (not `python`, `javascript`, or `auto`). |
| 400 | `UNSUPPORTED_FILE_TYPE` | Uploaded file extension is not `.py` or `.js`. |
| 422 | `ANALYSIS_PARSE_ERROR` | Static analysis output could not be parsed into the required schema. |
| 500 | `ANALYSIS_TOOL_ERROR` | Underlying static analysis engine (Semgrep / Bandit) failed to execute. |
| 500 | `PIPELINE_ERROR` | Unhandled internal exception within backend pipeline. |
| 504 | `PIPELINE_TIMEOUT` | Overall pipeline execution exceeded configured timeout (default 90 seconds). |

---

## 4. Endpoints

### 4.1 `GET /api/health`

**Purpose:** Health check endpoint used by the frontend and deployment monitors to verify backend service availability.

#### Request
- **Method:** `GET`
- **Headers:** None required
- **Body:** None

#### Response (200 OK)
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### 4.2 `GET /api/languages`

**Purpose:** Returns the list of supported programming languages and valid file extensions for code submission and syntax highlighting.

#### Request
- **Method:** `GET`
- **Headers:** None required
- **Body:** None

#### Response (200 OK)
```json
{
  "languages": [
    {
      "id": "python",
      "display_name": "Python",
      "extensions": [".py"]
    },
    {
      "id": "javascript",
      "display_name": "JavaScript",
      "extensions": [".js"]
    }
  ]
}
```

---

### 4.3 `POST /api/analyze`

**Purpose:** Primary endpoint for code submission. Triggers the end-to-end review pipeline: Static Analysis (Semgrep + Bandit) → Analyzer Agent → Fix Agent → Verifier Agent.

#### Request
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

```json
{
  "code": "import sqlite3\n\ndef get_user(username):\n    conn = sqlite3.connect('users.db')\n    cursor = conn.cursor()\n    query = f\"SELECT * FROM users WHERE name = '{username}'\"\n    cursor.execute(query)\n    return cursor.fetchall()",
  "language": "python",
  "filename": "database.py"
}
```

#### Request Fields
- `code` (*string, required*): The raw source code to analyze. Minimum length 1 character, maximum size 100 KB (102,400 bytes).
- `language` (*string, optional*): Programming language identifier. Allowed values: `"python"`, `"javascript"`, `"auto"`. Default: `"auto"`.
- `filename` (*string, optional*): Name of uploaded file. Used as a deterministic fallback hint for language detection when `language` is `"auto"`.

#### Validation Rules
1. If `code` is missing or empty, return `400 MISSING_CODE`.
2. If UTF-8 byte length of `code` exceeds 102,400 bytes, return `400 CODE_TOO_LARGE`.
3. If `language` is provided and not in `["python", "javascript", "auto"]`, return `400 UNSUPPORTED_LANGUAGE`.
4. If `filename` is provided, extension must be `.py` or `.js` (case-insensitive); otherwise return `400 UNSUPPORTED_FILE_TYPE`.

#### Response (200 OK)
Returns a complete `ReviewResult` object:

```json
{
  "review_id": "8f3b6c7a-9412-4cf4-912a-0a5688bfae11",
  "language": "python",
  "findings": [
    {
      "id": "find-1",
      "line_start": 6,
      "line_end": 7,
      "rule_id": "bandit.B608",
      "severity": "Critical",
      "title": "SQL Injection via String Formatting",
      "explanation": "User input is formatted directly into a SQL query string. An attacker can manipulate the input to execute arbitrary SQL commands against your database.",
      "category": "Security",
      "cwe": "CWE-89",
      "confidence": "High",
      "verification_status": "Resolved"
    }
  ],
  "fixed_code": "import sqlite3\n\ndef get_user(username):\n    conn = sqlite3.connect('users.db')\n    cursor = conn.cursor()\n    query = \"SELECT * FROM users WHERE name = ?\"\n    cursor.execute(query, (username,))\n    return cursor.fetchall()",
  "fix_available": true,
  "verification_available": true,
  "new_findings_after_fix": [],
  "summary": {
    "total_findings": 1,
    "resolved": 1,
    "unresolved": 0,
    "regressions": 0
  },
  "warnings": []
}
```

---

### 4.4 Note on `/api/verify`

**Decision:** A standalone `/api/verify` endpoint is **NOT** included in MVP.  
**Reasoning:** Verification is performed automatically as Stage 3 of the sequential analysis pipeline within `POST /api/analyze`. Creating a separate `/api/verify` endpoint would require persistent session storage or sending redundant original findings across network requests, violating [DEC-007](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md) and [DEC-010](file:///c:/Shehzan_Workspace/CodeNeeti%20Hack/AI%20Code%20Review%20&%20Security%20Assistant/codeneeti/DECISIONS.md). If interactive multi-turn fix verification is approved post-MVP, this document will be updated prior to implementation.

---

## 5. Schema Definitions

### 5.1 `ReviewRequest`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `code` | string | Yes | Source code string; 1 byte to 102,400 bytes. |
| `language` | string | No | Enum: `"python"`, `"javascript"`, `"auto"`. Defaults to `"auto"`. |
| `filename` | string | No | Original filename; used for language hint. |

### 5.2 `Finding`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `id` | string | Yes | Unique identifier for finding within this review (e.g. `"find-1"`). |
| `line_start` | integer | Yes | 1-indexed starting line number of finding in original code. |
| `line_end` | integer | Yes | 1-indexed ending line number of finding in original code. |
| `rule_id` | string | Yes | Identifier from Semgrep or Bandit rule (e.g. `"bandit.B608"`). |
| `severity` | string | Yes | Enum: `"Critical"`, `"High"`, `"Medium"`, `"Low"`, `"Info"`. |
| `title` | string | Yes | Short, plain-language title generated by Analyzer Agent. |
| `explanation` | string | Yes | Plain-language developer explanation generated by Analyzer Agent. |
| `category` | string | Yes | Enum: `"Security"`, `"Bug"`, `"Code Quality"`. |
| `cwe` | string or null | Yes | Standard CWE identifier (e.g. `"CWE-89"`), or `null` if unavailable. |
| `confidence` | string | Yes | Enum: `"High"`, `"Medium"`, `"Low"`. |
| `verification_status` | string | Yes | Enum: `"Resolved"`, `"Unresolved"`, `"Regression"`, `"Unavailable"`. |

### 5.3 `NewFindingAfterFix`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `id` | string | Yes | Identifier for the regression finding. |
| `line_start` | integer | Yes | Line number in fixed code. |
| `rule_id` | string | Yes | Rule identifier. |
| `severity` | string | Yes | Enum: `"Critical"`, `"High"`, `"Medium"`, `"Low"`, `"Info"`. |
| `title` | string | Yes | Descriptive title. |

### 5.4 `VerificationSummary`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `total_findings` | integer | Yes | Total count of original findings detected. |
| `resolved` | integer | Yes | Count of findings confirmed resolved by Verifier Agent. |
| `unresolved` | integer | Yes | Count of findings still present in fixed code. |
| `regressions` | integer | Yes | Count of new findings introduced by the fix. |

### 5.5 `ReviewResult`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `review_id` | string | Yes | UUID tracking this review session. |
| `language` | string | Yes | Confirmed language (`"python"` or `"javascript"`). |
| `findings` | array of `Finding` | Yes | List of detected and analyzed findings. |
| `fixed_code` | string or null | Yes | Complete corrected code string, or `null` if fix failed/unavailable. |
| `fix_available` | boolean | Yes | `true` if Fix Agent generated code; `false` on fallback/failure. |
| `verification_available` | boolean | Yes | `true` if Verifier Agent completed; `false` on fallback/failure. |
| `new_findings_after_fix` | array of `NewFindingAfterFix`| Yes | Regressions detected in fixed code. |
| `summary` | `VerificationSummary` | Yes | Aggregated counts of resolution statuses. |
| `warnings` | array of strings | Yes | Operational warnings (e.g. partial pipeline fallbacks). |

### 5.6 `ErrorResponse`
| Property | Type | Required | Description / Constraints |
|---|---|---|---|
| `error` | string | Yes | Machine-readable error code. |
| `message` | string | Yes | Human-readable explanation. |
| `partial_result` | `ReviewResult` or null | Yes | Partial analysis data if available, otherwise `null`. |

---

## 6. Frontend Expectations

Frontend developers can rely on the following guarantees from the backend:
1. **Always Valid JSON:** Successful responses (200) will strictly validate against `ReviewResult`.
2. **Deterministic Enums:** `severity`, `category`, `confidence`, and `verification_status` will always match the declared enum values.
3. **No Hanging Requests:** Backend will terminate pipeline calls within 90 seconds, returning either a 200 with partial flags or a 504 timeout.
4. **Complete Replacement Code:** When `fix_available` is `true`, `fixed_code` is the complete corrected file, suitable for direct diff rendering against original code.
5. **Clear Degradation Flags:** If Gemini fails or times out, the backend will return static analysis results with `warnings` populated and `fix_available: false`, rather than failing silently.

---

## 7. Backend Expectations

Backend developers must adhere to the following guarantees:
1. **Validation Enforcement:** Reject invalid requests immediately with the exact specified status codes and error JSON structure.
2. **Never Execute User Code:** The backend must never run `eval()`, `exec()`, or execute submitted code as a script.
3. **Evidence-Based Verification:** Never mark a finding as `"Resolved"` unless the rule no longer fires in the fixed code.
4. **Schema Conformance:** Validate all Gemini responses against internal Pydantic models matching this contract before sending to the client.
5. **CORS Headers:** Ensure headers allow communication from Vite default port `5173`.

---

## 8. Mock Data for Frontend Development

Frontend developers can use this static mock fixture to build and test the complete UI in isolation (e.g., placed at `/frontend/mocks/sampleReviewResult.json`):

```json
{
  "review_id": "c1a9382f-6821-4f2b-86d1-9a74e502b4d9",
  "language": "python",
  "findings": [
    {
      "id": "find-1",
      "line_start": 6,
      "line_end": 7,
      "rule_id": "bandit.B608",
      "severity": "Critical",
      "title": "SQL Injection via Unsanitized Input",
      "explanation": "The user input 'username' is directly concatenated into a SQL statement. An attacker could enter malicious payloads such as \"' OR '1'='1\" to bypass authentication or extract sensitive database contents.",
      "category": "Security",
      "cwe": "CWE-89",
      "confidence": "High",
      "verification_status": "Resolved"
    },
    {
      "id": "find-2",
      "line_start": 2,
      "line_end": 2,
      "rule_id": "bandit.B105",
      "severity": "High",
      "title": "Hardcoded Database Secret",
      "explanation": "A plaintext password string was found assigned directly in the source code. Hardcoded credentials can be leaked via version control systems.",
      "category": "Security",
      "cwe": "CWE-798",
      "confidence": "High",
      "verification_status": "Resolved"
    }
  ],
  "fixed_code": "import os\nimport sqlite3\n\nDB_PASS = os.getenv('DB_PASSWORD')\n\ndef get_user(username):\n    conn = sqlite3.connect('users.db')\n    cursor = conn.cursor()\n    query = \"SELECT * FROM users WHERE name = ?\"\n    cursor.execute(query, (username,))\n    return cursor.fetchall()",
  "fix_available": true,
  "verification_available": true,
  "new_findings_after_fix": [],
  "summary": {
    "total_findings": 2,
    "resolved": 2,
    "unresolved": 0,
    "regressions": 0
  },
  "warnings": []
}
```

---

## 9. Contract Change Process

When a frontend or backend developer/agent requires an API modification:

1. **Identify Need:** Specify the exact endpoint, request field, response field, or error code to add or change.
2. **Update API_CONTRACT.md:** Draft the exact schema update in this document.
3. **Human Approval:** Alert human developers and obtain sign-off before modifying any source code.
4. **Independent Implementation:**
   - Backend implements updated models, handlers, and tests.
   - Frontend implements updated mocks, services, and UI components.
5. **Verification:** Validate integration against the contract using automated tests.
