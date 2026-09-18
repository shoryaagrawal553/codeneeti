# PRD — AI Code Review & Security Assistant

**Project:** CodeNeeti Hackathon  
**Problem Difficulty:** MEDIUM  
**Document Status:** FINAL — Approved by human developers  
**Last Updated:** 2026-09-18

---

## 1. Product Overview

| Field | Value |
|---|---|
| **Product Name** | CodeGuard |
| **One-line description** | An agentic AI assistant that reviews submitted code, finds bugs and security vulnerabilities, explains them clearly, and proposes verified fixes. |
| **Product concept** | A developer pastes or uploads code. Three coordinated Gemini-powered agents—backed by deterministic static analysis (Semgrep + Bandit)—produce a structured, prioritized review: what is wrong, why it matters, how to fix it, and whether the fix actually resolved the issue. |
| **Intended outcome** | Developers catch real bugs and security vulnerabilities before they reach production, with actionable, explained, and verified fixes rather than raw warnings. |

---

## 2. Problem Definition

> **Source of truth:** The official CodeNeeti problem statement (MEDIUM difficulty).  
> All items in this section are taken verbatim or directly paraphrased from the official statement. Additions are explicitly labelled.

### 2.1 Official Problem Statement (verbatim)

> *"Developers can accidentally introduce bugs and security vulnerabilities while writing code. Finding these problems early can prevent larger issues later. Build an AI-powered code review tool that analyzes code, identifies potential problems, and suggests improvements."*

### 2.2 Official Required Capabilities (verbatim)

Your solution should:

1. Allow users to **enter or upload code**.
2. **Identify possible bugs or security vulnerabilities**.
3. **Explain detected issues in simple language**.
4. **Suggest a safer or improved version of the code**.
5. **Assign a severity level** where possible.

### 2.3 Official Expected Outcome (verbatim)

> *"An AI assistant that helps developers write safer and better-quality code."*

### 2.4 Official General Guidelines (verbatim)

- Teams may choose any programming language, framework, database, ML model, or development stack.
- The problem statement describes the goal; teams are free to decide how to implement the solution.
- A working prototype is preferred over a concept-only submission.
- Teams should clearly demonstrate the problem, their approach, and the impact of their solution.
- For AI-based solutions, teams should be able to explain the role of AI in their solution.

### 2.5 Users

**[Interpretation — not explicitly stated in problem statement]**  
Primary user: **software developers** (any experience level) who want early feedback on code quality and security before committing or deploying.

### 2.6 Pain Points

**[Interpretation]**

- Security vulnerabilities are often invisible during code writing.
- Static linters produce noisy output without context or explanation.
- Code review bottlenecks slow development; automated first-pass review adds bandwidth.
- Developers receive warnings without understanding severity or remediation.

### 2.7 Constraints Derived from Problem Statement

- No constraint on supported programming languages is stated. **Decided: Python (primary) and JavaScript (secondary).**
- No constraint on input method (paste vs. upload) is prescribed beyond “enter or upload.” Both must be supported.
- Severity assignment is qualified with “where possible,” implying best-effort, not guaranteed.

---

## 3. Product Goals

1. **Comply fully with all five official required capabilities** (input, identify, explain, suggest, severity).
2. **Demonstrate meaningful agentic AI behavior**: Detect → Analyze → Explain → Fix → Verify.
3. **Produce a working prototype**, not a concept-only submission (per official guidelines).
4. **Minimize false positives** to preserve developer trust; use deterministic tools for detection, Gemini for reasoning.
5. **Explain findings in plain language** accessible to developers of varying experience.
6. **Generate actionable, verified fixes**, not just textual advice.
7. **Complete an end-to-end demo** within hackathon time constraints.

---

## 4. User Personas & Use Cases

### Persona A — The Busy Developer

- Writes a feature quickly under deadline pressure.
- Submits a code snippet before committing.
- Needs: fast, prioritized findings; clear severity; copy-paste-ready fix.

### Persona B — The Junior Developer

- Unfamiliar with security patterns (e.g., SQL injection, XSS).
- Submits code not knowing what the risk is.
- Needs: plain-language explanation of *what* the issue is and *why* it matters.

### Persona C — The Hackathon Judge

- Evaluates the prototype’s AI quality, coverage, and demonstration clarity.
- Needs: observable agentic behavior; explainable AI; visible workflow stages.

### Primary Use Cases

| # | Use Case | Description |
|---|---|---|
| UC-1 | Code paste & analyze | User pastes Python or JavaScript code into the Monaco editor; receives structured findings. |
| UC-2 | File upload & analyze | User uploads a `.py` or `.js` file; receives structured findings. |
| UC-3 | View issue details | User clicks a finding to read its plain-language explanation and severity. |
| UC-4 | Review suggested fix | User views the improved code generated by the Fix Agent. |
| UC-5 | Review fix diff | User views original vs. fixed code in a diff panel. |
| UC-6 | View verification result | System displays per-finding verification status produced by the Verifier Agent. |

---

## 5. Proposed Solution

CodeGuard accepts Python or JavaScript code through a web interface (Monaco Editor, paste or file upload) and routes it through a two-stage pipeline:

1. **Static Analysis Stage** — Semgrep (multi-language) and Bandit (Python-specific) scan the code for known vulnerability and bug patterns. This stage is deterministic, produces structured JSON output, and is the sole source of detection. No LLM is involved in detection.

2. **Gemini Agent Stage** — Three specialized Gemini-powered agents sequentially process the static analysis output:
   - **Analyzer Agent**: interprets findings, adjusts severity in context, explains each finding in plain language, filters obvious false positives.
   - **Fix Agent**: generates a minimal, targeted corrected version of the code that preserves original intent.
   - **Verifier Agent**: re-runs static analysis on the fixed code and reports per-finding resolution status based on evidence — never fabricates a result.

The result is presented in a React (Vite) web UI showing: original code with findings highlighted, issue list with severity badges, plain-language explanations, fixed code, a diff view, and per-finding verification status.

**Why the agentic design is justified:**
- **Detection** is deterministic (Semgrep/Bandit). LLMs are not used for detection to avoid hallucinations.
- **Explanation** requires contextual LLM reasoning about code intent and audience — deterministic tools cannot produce natural-language developer guidance.
- **Fix generation** requires multi-issue reasoning: the Fix Agent must resolve all findings simultaneously without introducing conflicts or rewriting unrelated code.
- **Verification** requires semantic reconciliation: the Verifier Agent re-runs the deterministic tool on the fix and uses Gemini only to map new findings back to original ones (e.g., if a finding shifts lines). It never fabricates a “Resolved” status.
- Each agent has distinct inputs, outputs, and decision logic. Merging them would create a single unprincipled LLM call that is harder to test, debug, and explain to judges.

---

## 6. Core User Flow

```
[User submits Python or JavaScript code (paste or file upload)]
        |
        v
[Backend: Language Detection (deterministic)]
        |
        v
[Backend: Static Analysis]
  Python  -> Semgrep + Bandit
  JavaScript -> Semgrep
  -> Produces: structured findings list (rule_id, line, snippet, raw message)
        |
        v
[Agent 1: Analyzer Agent (Gemini)]
  -> Interprets each finding in code context
  -> Assigns contextual severity (Critical / High / Medium / Low / Info)
  -> Generates plain-language explanation per finding
  -> Filters obvious false positives with reasoning
  -> Outputs: enriched findings list
        |
        v
[Agent 2: Fix Agent (Gemini)]
  -> Generates minimal corrected code addressing all enriched findings
  -> Preserves original code intent and structure
  -> Outputs: complete fixed code string
        |
        v
[Agent 3: Verifier Agent (Gemini + static analysis)]
  -> Re-runs Semgrep (+ Bandit for Python) on the fixed code
  -> Compares new findings to original enriched findings
  -> Reports per-finding status: Resolved | Unresolved | Regression
  -> Never reports Resolved without static-analysis evidence
        |
        v
[Backend: Assemble ReviewResult JSON]
        |
        v
[Frontend: Display results (React + Vite)]
  -> Issue list panel with severity badges, line numbers, categories
  -> Plain-language explanation on finding click
  -> Diff view: original vs. fixed code (lightweight React diff component)
  -> Per-finding verification status badge
  -> Copy fixed code button
  -> Stage-labeled progress during analysis
```

---

## 7. Functional Requirements

### Must Have

- **M-1** Accept Python and JavaScript code via text paste in Monaco Editor.
- **M-2** Accept Python (`.py`) and JavaScript (`.js`) code via file upload.
- **M-3** Auto-detect language from content or filename; allow manual override via language selector (Python / JavaScript).
- **M-4** Run Semgrep on submitted code; run Bandit additionally for Python.
- **M-5** Produce a list of findings, each with: line number(s), type (Security / Bug / Code Quality), severity (Critical / High / Medium / Low / Info), and CWE ID where available from rule metadata.
- **M-6** Analyzer Agent produces a plain-language explanation for each finding.
- **M-7** Fix Agent generates a complete corrected version of the code addressing all findings.
- **M-8** Display original code and fixed code as a diff (side-by-side or unified) using a lightweight React diff component.
- **M-9** Show a results panel: issue list with severity badges, line number, category; expandable explanation per finding.
- **M-10** Show labeled progress stages during analysis: Analyzing → Explaining → Generating Fix → Verifying.
- **M-11** Verifier Agent reports per-finding verification status: Resolved / Unresolved / Regression.
- **M-12** Handle and display errors gracefully: invalid file type, oversized input, analysis failure, Gemini API failure, timeout.

### Should Have

- **S-1** Display confidence level (High / Medium / Low) on each finding from the Analyzer Agent.
- **S-2** Display CWE or OWASP category on each finding where deterministically available from Semgrep/Bandit rule metadata.
- **S-3** Allow the user to copy the fixed code to clipboard.
- **S-4** Display a caveat on findings or fixes where Gemini confidence is low.

### Could Have

- **C-1** Per-finding fix explanation alongside the fixed code (why this fix addresses the issue).
- **C-2** Summary panel: total findings, resolved count, unresolved count, regression count.
- **C-3** History of past submissions within the browser session (in-memory, no persistence).

---

## 8. MVP Definition

### What the MVP is

The MVP is the smallest complete product that:
- Satisfies all five official required capabilities.
- Demonstrates the three-agent pipeline with genuinely distinct responsibilities.
- Produces a working, demoable prototype.
- Is reliable: graceful fallback at each stage if an agent fails.

### MVP Scope

| Requirement | In MVP? |
|---|---|
| Code paste (Python & JavaScript) | Yes |
| File upload (`.py`, `.js`) | Yes |
| Language auto-detection + manual override | Yes |
| Static analysis: Semgrep | Yes |
| Static analysis: Bandit (Python) | Yes |
| Finding list with severity | Yes |
| Analyzer Agent — plain-language explanation | Yes |
| Fix Agent — corrected code | Yes |
| Diff view (original vs. fixed) | Yes |
| Verifier Agent — per-finding status | Yes |
| Monaco Editor | Yes |
| Stage-labeled progress indicator | Yes |
| Graceful error handling at each stage | Yes |
| CWE/OWASP categorization | Best effort from rule metadata |
| Copy fixed code button | Yes |
| Authentication | No |
| Persistent database | No |
| Session history (cross-refresh) | No |
| Export report | No |
| Summary health score | No |
| CI/CD integration | No |
| IDE plugin | No |
| More than 2 languages | No |

### What will NOT be in the MVP

- User accounts, authentication, or sessions.
- Any database or persistent storage.
- Export or download of review reports.
- Session history that persists across browser refreshes.
- Languages beyond Python and JavaScript.
- CI/CD, GitHub/GitLab integration.
- Custom rule configuration.
- Real-time collaboration.
- Analytics or dashboards.
- Deployment to a hosted service (unless time permits after core MVP is complete).

> **If time becomes constrained, reduce features (starting with C-class) rather than compromising the core pipeline.**

---

## 9. Agentic AI Design

### Overview

Three Gemini-powered agents are used. Each exists because it performs a task requiring contextual reasoning that cannot be reduced to a deterministic function. No orchestrator agent is added: the backend orchestration layer controls the linear pipeline.

**Anti-pattern explicitly rejected:** `code -> one LLM call -> response`. The pipeline demonstrates: Detect → Analyze → Explain → Fix → Verify.

---

### Agent 1 — Analyzer Agent

#### Responsibility
Interprets each raw static-analysis finding in the context of the surrounding code. Determines contextual severity, generates a plain-language developer explanation, assigns a security category, and filters obvious false positives. Produces structured output consumed by the Fix Agent.

#### Inputs
- Original source code (string)
- Detected language (`python` or `javascript`)
- Raw static analysis findings (structured JSON from Semgrep/Bandit)

#### Outputs
- Enriched findings list: `[{ id, rule_id, line_start, line_end, severity, title, explanation, category, cwe, confidence, filtered_reason? }]`
- Filtered findings list with reasons (surfaced in UI as low-confidence items)

#### Trigger
Called by backend orchestration immediately after static analysis completes, if at least one raw finding is present.

#### Tools / Capabilities
- Google Gemini API (structured JSON output mode)
- Prompt template: language + original code + raw findings list; instructs Gemini to reason about each finding individually and return structured JSON

#### Why this should be an agent
Contextual severity and false-positive filtering require reasoning about code intent — a hardcoded string might be a test placeholder, not a real credential. This judgment cannot be encoded as a static rule. The agent must also produce natural-language explanation for a developer audience, which is inherently generative. If Gemini returns malformed JSON, the agent retries once with a clarifying prompt before falling back.

#### Interaction with other agents
Outputs enriched findings to Fix Agent. If no findings pass the confidence threshold, Fix Agent and Verifier Agent are not called; the pipeline returns “No significant issues found.”

---

### Agent 2 — Fix Agent

#### Responsibility
Generates a minimal, targeted corrected version of the submitted code that addresses all enriched findings simultaneously. Preserves original code structure, logic, and intent. Does not rewrite code beyond what is necessary to resolve the findings.

#### Inputs
- Original source code (string)
- Enriched findings list from Analyzer Agent
- Detected language

#### Outputs
- Fixed source code (complete corrected string, same language as input)
- Per-finding fix description (Could Have — C-1; include if Gemini response provides it)

#### Trigger
Called by backend orchestration after Analyzer Agent completes, if at least one enriched finding with severity >= Low is present.

#### Tools / Capabilities
- Google Gemini API (structured JSON output mode returning fixed code + optional per-finding notes)
- Prompt template: original code + enriched findings; instructs Gemini to apply minimal, targeted changes only

#### Why this should be an agent
Fix generation requires simultaneously resolving multiple findings without introducing conflicts. A fix for one issue (e.g., escaping input) may change the code context for a nearby finding. The agent must reason about the code body as a whole, understand what to change, and avoid unnecessary rewrites. This is multi-step code synthesis that cannot be encoded as a lookup table or rule.

#### Interaction with other agents
Receives enriched findings from Analyzer Agent. Outputs fixed code to Verifier Agent. If fix generation fails or times out, the pipeline returns enriched findings without a fix (partial result, clearly flagged in the UI).

---

### Agent 3 — Verifier Agent

#### Responsibility
Re-runs the same static analysis tools (Semgrep, Bandit for Python) on the fixed code. Compares new findings against the original enriched findings list. Reports per-finding status: Resolved, Unresolved, or Regression. Uses Gemini only for semantic reconciliation where deterministic comparison is insufficient (e.g., a finding shifted lines but is the same underlying issue). Never reports a finding as Resolved without static-analysis evidence.

#### Inputs
- Fixed source code from Fix Agent
- Original enriched findings list from Analyzer Agent
- Detected language

#### Outputs
- Per-finding verification status: `Resolved | Unresolved | Regression`
- New findings list (regressions introduced by the fix)
- Overall verification summary: `{ resolved, unresolved, regressions }`

#### Trigger
Called by backend orchestration after Fix Agent completes.

#### Tools / Capabilities
- Semgrep (subprocess, same rules as initial scan)
- Bandit (Python only, same configuration)
- Google Gemini API (structured output, reconciliation only): called only when a finding’s rule fires in the fixed code at a different location, to determine if it is the same issue or a separate one

#### Why this should be an agent
Re-running static analysis is deterministic, but the reconciliation step — mapping new tool output back to original findings when lines shift — requires semantic reasoning. Without Gemini-assisted reconciliation, a trivially refactored fix (same vulnerability, new line) would be incorrectly reported as Resolved. The agent must reason about equivalence, not just line-number equality. Crucially, it never fabricates a verdict: every Resolved status is backed by the absence of the rule in the new static-analysis output.

#### Interaction with other agents
Consumes outputs from Analyzer Agent (original findings) and Fix Agent (fixed code). Returns verification results to the backend for final ReviewResult assembly.

---

### No Orchestrator Agent

The backend pipeline controller (FastAPI route handler + service layer) sequences the three agents deterministically:

```
Static Analysis -> Analyzer Agent -> Fix Agent -> Verifier Agent -> Response
```

There is no orchestrator agent. The pipeline is linear and its sequencing is deterministic; an additional agent would add complexity without value.

---

### Agent Decision Flow

```
Static Analysis (Semgrep + Bandit, deterministic)
        |
        v
Analyzer Agent (Gemini)
  +-- Findings exist and pass confidence? --> Fix Agent
  +-- No significant findings              --> Return "No issues found" response
        |
        v
Fix Agent (Gemini)
  +-- Fix generated successfully?  --> Verifier Agent
  +-- Fix generation failed        --> Return enriched findings only, flag fix_available=false
        |
        v
Verifier Agent (Semgrep + Bandit + Gemini for reconciliation)
  +-- For each finding:
        Resolved    -> rule absent in fixed code (static tool confirms)
        Unresolved  -> rule still fires on same/adjacent location
        Regression  -> new rule fires that was absent in original scan
```

### Handoffs

All handoffs are in-memory structured data (Python dicts validated against Pydantic models). No message queues, no async task workers needed for MVP.

### Shared State / Memory

A per-request **ReviewSession** object holds:
- `original_code` (str)
- `language` (str)
- `raw_findings` (list — from static analysis)
- `enriched_findings` (list — from Analyzer Agent)
- `fixed_code` (str | None — from Fix Agent)
- `verification_results` (list — from Verifier Agent)

This object is assembled by the backend service layer and serialized to the final API response JSON. No cross-request persistence.

### Failure Handling

| Failure Scenario | Behavior |
|---|---|
| Static analysis tool error (Semgrep/Bandit crash) | Return 500 with clear error message; do not call any agent |
| Static analysis produces no findings | Return response with empty findings list; skip Fix Agent and Verifier Agent |
| Analyzer Agent — Gemini returns malformed JSON | Retry once with clarifying prompt; if still malformed, return raw static findings with `enrichment_unavailable: true` warning |
| Analyzer Agent — Gemini API error / timeout | Return raw static findings with `enrichment_unavailable: true` |
| Fix Agent — Gemini returns malformed or empty fix | Return enriched findings with `fix_available: false`; clearly flag in UI |
| Fix Agent — Gemini API error / timeout | Return enriched findings with `fix_available: false` |
| Verifier Agent — static analysis on fixed code fails | Return fix with `verification_available: false`; clearly flag in UI |
| Verifier Agent — Gemini reconciliation fails | Fall back to deterministic-only comparison; flag reconciliation as partial |
| Any Gemini response — schema validation fails after retry | Use degraded safe response; never surface unvalidated LLM output |

### Submitted Code is Untrusted Data

- Code content (including comments, strings, and documentation) must never be interpreted as agent instructions.
- Submitted code is always inserted into Gemini prompts as a clearly delimited data block (`<code>...</code>` or equivalent fencing).
- System prompts explicitly instruct Gemini to treat the code block as data to analyze, not as instructions to follow.
- Gemini responses are validated against Pydantic schemas; schema failures trigger fallback, never blind use of the output.

---

## 10. AI vs Deterministic Analysis

| Task | Approach | Rationale |
|---|---|---|
| Language detection | Deterministic (file extension + content heuristic) | Reliable, fast, no hallucination risk |
| Vulnerability / bug detection | Deterministic: Semgrep (Python + JS) + Bandit (Python) | Rules-based, verifiable, auditable, does not hallucinate |
| Contextual severity refinement | Gemini (Analyzer Agent) | Raw tool severity is context-free; true risk depends on surrounding code |
| False-positive filtering | Gemini (Analyzer Agent) | Requires reasoning about code intent, not just pattern matching |
| Plain-language explanation | Gemini (Analyzer Agent) | Generative; requires developer-audience awareness |
| CWE / OWASP category | Deterministic first (Semgrep rule metadata); Gemini fallback if metadata absent | Rule metadata is authoritative; LLM only used when metadata is missing |
| Fix generation | Gemini (Fix Agent) | Multi-constraint code synthesis; inherently generative |
| Fix re-analysis | Deterministic: Semgrep + Bandit (Verifier Agent) | Tool output is the ground truth for resolution status |
| Finding reconciliation (line shifts) | Gemini (Verifier Agent) | Semantic judgment required when same issue appears at a shifted location |

**Hallucination Mitigation:**
- Static tools run first; Gemini agents are grounded in tool output, not raw code.
- Gemini is never asked to detect vulnerabilities independently.
- All Gemini outputs are validated against Pydantic schemas; failures trigger retry then fallback.
- Verification status is backed by static tool output, not LLM assertion alone.
- Gemini never has access to the runtime environment; submitted code is never executed.

---

## 11. Detection → Explanation → Fix → Verification

### Detection

- **Tools:** Semgrep (Python and JavaScript), Bandit (Python only).
- Semgrep and Bandit run as subprocesses on the submitted code; output is parsed to structured JSON.
- Output per finding: `rule_id`, `line_start`, `line_end`, `code_snippet`, `message`, `severity` (raw tool value), `cwe` (from rule metadata where available).
- **No LLM involvement at this stage.** Detection is entirely deterministic.

### Explanation (Analyzer Agent)

- Gemini receives: the full original code, the detected language, and all raw findings.
- Gemini returns structured JSON per finding: `severity` (contextual), `title` (short, plain language), `explanation` (developer-friendly, max 3-4 sentences), `category`, `confidence`, optional `filtered_reason`.
- Explanation addresses: what the issue is, why it matters, what an attacker or bug could cause.
- Explanation is not a security-jargon dump; it is written for the submitting developer.

### Fix Generation (Fix Agent)

- Gemini receives: full original code, enriched findings list (with line numbers and explanations), language.
- Gemini returns: the complete corrected code string.
- Prompt constrains: apply minimal targeted changes only; do not refactor unrelated code; preserve original logic and structure.
- Output is the full corrected file/snippet, not a patch, to keep the UI and diff view simple.

### Fix Verification (Verifier Agent)

- Semgrep (and Bandit for Python) re-run on the fixed code using the same rules.
- New findings are compared to original enriched findings by `rule_id` and location.
- Gemini is called only when a rule fires in the fixed code at a different location — to determine if it is the same underlying issue (Unresolved) or a new distinct issue (Regression).
- **Resolution rules:**
  - **Resolved:** Same `rule_id` no longer fires anywhere in the fixed code.
  - **Unresolved:** Same `rule_id` fires at the same or adjacent location in the fixed code.
  - **Regression:** A `rule_id` that was absent in the original scan fires in the fixed code.
- The Verifier Agent never reports Resolved without static-analysis confirmation.

---

## 12. Frontend Requirements

**Frontend stack: React + Vite. Code editor: Monaco Editor. Diff view: lightweight React-compatible diff component.**

### Required Screens

1. **Code Input Screen**
   - Monaco Editor with syntax highlighting (Python / JavaScript modes).
   - Language selector: Auto-detect (default), Python, JavaScript.
   - File upload: drag-and-drop zone + click-to-browse; accepts `.py` and `.js` files only.
   - “Analyze” submit button (disabled while analysis is in progress).
   - Line/character count indicator.
   - Clear / reset button.
   - Max file size warning (100 KB limit).

2. **Analysis Progress Overlay / Indicator**
   - Stage-labeled progress: `Analyzing… → Explaining… → Generating Fix… → Verifying…`
   - Each stage activates as the backend reports it (polling or streaming).
   - If an agent stage fails, the label shows the failure without blocking display of earlier results.

3. **Results Screen**
   - **Issue List Panel:** Scrollable list of findings. Each finding shows: severity badge (color-coded), issue title, line number(s), category (Security / Bug / Code Quality), CWE ID if available, verification status badge (Resolved / Unresolved / Regression / Unavailable).
   - **Detail Panel:** Expands on finding click; shows full plain-language explanation and confidence level.
   - **Diff Panel:** Side-by-side or unified diff of original vs. fixed code using a lightweight React diff component. Clearly labeled “Original” and “Fixed.”
   - **Copy Fixed Code** button.
   - **Analyze Again** / new submission button.
   - Degraded-result banners: shown when fix or verification is unavailable.

4. **Error / Empty States**
   - Empty state: prompt to paste or upload code.
   - Loading/progress: stage-labeled indicator.
   - Partial result state: display available results + banner indicating which stage failed.
   - Full error state: clear error message + retry button.
   - Invalid file type / oversized file: inline warning before submission.

### User Interactions

- Paste code into Monaco Editor.
- Upload `.py` or `.js` file via drag-and-drop or button.
- Select or override language.
- Submit for analysis.
- Click a finding to expand explanation.
- View diff of original vs. fixed code.
- Copy fixed code to clipboard.
- Submit a new analysis.

### Information Displayed per Finding

| Field | Source |
|---|---|
| Severity badge | Analyzer Agent (contextual severity) |
| Line number(s) | Static analysis tool |
| Issue title | Analyzer Agent |
| Category | Analyzer Agent |
| CWE ID | Static tool rule metadata (if available) |
| Plain-language explanation | Analyzer Agent |
| Confidence level | Analyzer Agent |
| Verification status | Verifier Agent |

### Frontend Constraints

- Frontend is built entirely within `/frontend/`.
- Frontend must function against mock API responses (static JSON fixtures) without a running backend.
- Frontend must not import or call backend code directly.
- The Gemini API key must never appear in frontend code or be sent to the browser.

---

## 13. Backend Requirements

**Backend stack: Python + FastAPI.**

### Major Components

| Component | Responsibility |
|---|---|
| FastAPI API Server | Exposes REST endpoints; validates requests; orchestrates the pipeline; assembles and returns ReviewResult |
| Language Detector | Detects language from file extension and/or content heuristics; returns `python` or `javascript` |
| Static Analysis Runner | Runs Semgrep subprocess (Python + JS); runs Bandit subprocess (Python only); parses output to structured findings list |
| Analyzer Agent | Calls Gemini API with raw findings; validates response; returns enriched findings |
| Fix Agent | Calls Gemini API with enriched findings + original code; validates response; returns fixed code string |
| Verifier Agent | Re-runs Semgrep/Bandit on fixed code; calls Gemini for reconciliation where needed; returns per-finding status |
| Gemini Client | Abstracted wrapper around `google-generativeai`; handles structured output mode, retries, timeout, schema validation |
| Pydantic Models | Schema definitions for all internal data structures and all Gemini request/response payloads |

### Analysis Pipeline (FastAPI handler)

```
POST /api/analyze
  |
  +-- Validate request (size <= 100 KB, language in [python, javascript, auto])
  +-- Detect language
  +-- Run Static Analysis (Semgrep; + Bandit if Python)
  |     Failure -> 500 error response
  |     No findings -> return ReviewResult with empty findings, skip agents
  +-- Analyzer Agent (Gemini)
  |     Gemini failure -> return raw findings with enrichment_unavailable warning
  +-- Fix Agent (Gemini)
  |     Gemini failure -> return enriched findings with fix_available=false
  +-- Verifier Agent (Semgrep/Bandit + Gemini reconciliation)
  |     Failure -> return fix with verification_available=false
  +-- Assemble and return ReviewResult JSON
```

### AI Integration (Gemini)

- **Library:** `google-generativeai` (official Python SDK).
- **Mode:** Structured output (JSON schema) for all three agents.
- **API key:** Loaded from environment variable `GEMINI_API_KEY`; never logged, never sent to frontend.
- **Retry policy:** Maximum 2 retries on schema validation failure or malformed response; then fallback behavior.
- **Timeout:** Per-agent timeout configurable via environment variable (default: 30 seconds per agent call).
- **Prompt management:** Prompts are defined as versioned template strings in backend configuration, not hardcoded in route handlers.
- **Untrusted input:** Submitted code is embedded in prompts inside a clearly delimited `<code_to_analyze>` block. System prompt explicitly instructs Gemini to treat the content as data, not instructions.

### Data Handling

- **No persistent storage.** All data is in-memory, per request. The ReviewSession object is discarded when the response is sent.
- **No logging of submitted code.** Only metadata (language, finding count, processing time) may be logged for operational purposes.
- **Gemini API calls are made server-side only.** The frontend never calls Gemini directly.

### Validation

- Submitted code: max 100 KB; reject with `400 CODE_TOO_LARGE` if exceeded.
- File upload: allowed extensions `.py`, `.js` only; reject with `400 UNSUPPORTED_FILE_TYPE` otherwise.
- Language values: `python`, `javascript`, or `auto`; reject others with `400 UNSUPPORTED_LANGUAGE`.
- All Gemini responses: validated against Pydantic models before use; schema failures trigger retry then fallback.
- Static analysis output: parsed and validated before passing to Analyzer Agent.

---

## 14. Frontend-Backend Separation — CRITICAL

This is a **hard development rule**. It exists to allow two developers to work independently without blocking each other.

### Directory Ownership

| Developer / Agent | May modify |
|---|---|
| Frontend developer | `/frontend/**` only: source files, dependencies (`package.json`), configuration, tests, mock data |
| Backend developer | `/backend/**` only: source files, dependencies (`pyproject.toml` / `requirements.txt`), configuration, tests |

### Hard Rules

1. **Frontend must not modify any file in `/backend/`** — including source code, dependencies, configuration, or tests.
2. **Backend must not modify any file in `/frontend/`** — including source code, dependencies, configuration, or tests.
3. **All communication between frontend and backend occurs exclusively through the API contract** defined in Section 15. No shared state. No shared imports. No shared configuration files.
4. **Frontend must be runnable against mock API responses** (static JSON fixtures in `/frontend/mocks/` matching the Section 15 API schema) without a running backend.
5. **Backend must be independently testable** via HTTP requests (curl, Postman, pytest with `httpx`) without a running frontend.
6. **If a cross-layer change is needed** (e.g., a new response field): STOP — identify the required API contract update — update Section 15 — report to human developers — then implement both sides independently. Do not automatically modify both layers.
7. **No shared configuration files** exist between frontend and backend. Each side has its own environment variable handling.
8. **The Gemini API key must exist only in the backend environment.** It must never be present in frontend code, frontend configuration, or API responses.

### Repository Structure (enforced)

```
/
  /frontend/          <- React + Vite SPA
    /src/
    /mocks/           <- Mock API response fixtures
    package.json
    vite.config.*
  /backend/           <- Python + FastAPI
    /app/
    /tests/
    pyproject.toml (or requirements.txt)
  /docs/
  PRD.md
```

---

## 15. API Contract

### Base URL

`http://localhost:8000/api` (local development, backend default port)  
CORS must be configured in the backend to allow requests from the frontend dev server origin (e.g., `http://localhost:5173`).

---

### POST /api/analyze

**Purpose:** Submit code for review. Triggers the full pipeline: Static Analysis → Analyzer Agent → Fix Agent → Verifier Agent.

**Request**
```
Content-Type: application/json
```
```json
{
  "code": "string (required) — source code to analyze; max 100 KB",
  "language": "string (optional) — 'python' | 'javascript' | 'auto'. Defaults to 'auto'.",
  "filename": "string (optional) — original filename if uploaded; used as language hint"
}
```

**Response — 200 OK**
```json
{
  "review_id": "string — UUID for this review",
  "language": "string — detected or confirmed language ('python' | 'javascript')",
  "findings": [
    {
      "id": "string — unique finding ID",
      "line_start": "integer",
      "line_end": "integer",
      "rule_id": "string — Semgrep or Bandit rule identifier",
      "severity": "string — Critical | High | Medium | Low | Info",
      "title": "string — short plain-language title (from Analyzer Agent)",
      "explanation": "string — developer-friendly explanation (from Analyzer Agent)",
      "category": "string — Security | Bug | Code Quality",
      "cwe": "string or null — e.g. CWE-89 (from rule metadata)",
      "confidence": "string — High | Medium | Low (from Analyzer Agent)",
      "verification_status": "string — Resolved | Unresolved | Regression | Unavailable"
    }
  ],
  "fixed_code": "string or null — complete corrected code from Fix Agent; null if fix unavailable",
  "fix_available": "boolean",
  "verification_available": "boolean",
  "new_findings_after_fix": [
    {
      "id": "string",
      "line_start": "integer",
      "rule_id": "string",
      "severity": "string",
      "title": "string"
    }
  ],
  "summary": {
    "total_findings": "integer",
    "resolved": "integer",
    "unresolved": "integer",
    "regressions": "integer"
  },
  "warnings": [
    "string — e.g. 'Enrichment unavailable: Gemini did not respond. Showing raw static analysis output.'"
  ]
}
```

**Errors**

| Status | Error Code | Trigger |
|---|---|---|
| 400 | `CODE_TOO_LARGE` | Submitted code exceeds 100 KB |
| 400 | `UNSUPPORTED_LANGUAGE` | Language value not in allowed set |
| 400 | `UNSUPPORTED_FILE_TYPE` | Uploaded file extension not `.py` or `.js` |
| 400 | `MISSING_CODE` | `code` field absent or empty |
| 422 | `ANALYSIS_PARSE_ERROR` | Static analysis tool output could not be parsed |
| 500 | `ANALYSIS_TOOL_ERROR` | Semgrep or Bandit subprocess failed |
| 500 | `PIPELINE_ERROR` | Unexpected internal error |
| 504 | `PIPELINE_TIMEOUT` | Total pipeline exceeded configured timeout |

Error response body:
```json
{
  "error": "string — error code from table above",
  "message": "string — human-readable description",
  "partial_result": "object or null — partial ReviewResult JSON if some stages completed before failure"
}
```

---

### GET /api/health

**Purpose:** Backend health check. Used by frontend to confirm backend is reachable.

**Response — 200 OK**
```json
{
  "status": "ok",
  "version": "string"
}
```

---

### GET /api/languages

**Purpose:** Returns the list of languages the backend currently supports for analysis.

**Response — 200 OK**
```json
{
  "languages": [
    { "id": "python", "display_name": "Python", "extensions": [".py"] },
    { "id": "javascript", "display_name": "JavaScript", "extensions": [".js"] }
  ]
}
```

---

## 16. Security & Privacy

### Source Code Privacy

- Submitted code is processed in-memory only and discarded after the response is sent.
- Submitted code is never written to disk, logged, or retained.
- No database or persistent storage exists in the MVP.

### API Keys / Secrets

- `GEMINI_API_KEY` is loaded from environment variables server-side; never logged, never included in any API response, never present in frontend code.
- `.env` files are listed in `.gitignore`.

### Submitted Code is Untrusted Data

- Submitted code is never executed.
- Semgrep and Bandit run as subprocesses against the code as a file; the backend process does not `eval` or `exec` submitted code.
- Submitted code is embedded in Gemini prompts inside a clearly delimited `<code_to_analyze>` block. The Gemini system prompt explicitly states that content inside the block is untrusted data to be analyzed, not instructions to follow.
- Code comments, docstrings, and string literals in submitted code must never override agent instructions.

### Prompt Injection

- Gemini prompts use a structured template with explicit data delimiters.
- All Gemini responses are validated against Pydantic schemas; schema failures trigger retry then fallback. An attacker embedding prompt-injection instructions in code cannot cause the agent to return arbitrary unvalidated output that the system would act on.

### Unsafe Generated Code

- Fixed code generated by the Fix Agent is displayed as text only.
- The backend never executes the fixed code.
- The frontend never executes the fixed code.
- The UI must display a disclaimer: *“Generated fixes are suggestions. Review and test before applying to your codebase.”*

### Data Retention

- No user data is retained between requests.
- No analytics on submitted code content.

---

## 17. Evaluation Strategy

### Detection Correctness

- Test against code samples with known vulnerabilities: OWASP examples, common Python/JS injection patterns, hardcoded credentials.
- Verify that Semgrep/Bandit detects the expected findings.
- Count false positives on known-clean idiomatic Python and JavaScript code.

### Severity Classification

- Compare Analyzer Agent’s contextual severity to Semgrep/Bandit’s raw severity for the same sample.
- Evaluate whether contextual adjustment is directionally correct (e.g., a critical SQL injection in production code should not be downgraded to Low by the Analyzer Agent).

### Explanation Quality

- Human evaluation: is the explanation accurate, non-hallucinated, and understandable without security background?
- Check that explanation content is grounded in the finding data, not invented.

### Fix Correctness

- Apply the generated fix to test code; run Semgrep/Bandit on the result.
- Evaluate: does the fix eliminate the finding without introducing new ones?

### Fix Verification Accuracy

- Manually inspect whether the Verifier Agent’s per-finding status matches ground truth.
- Check for false Resolved reports (agent reports resolved, but vulnerability persists in fixed code).

### Agent Reliability

- Pipeline completion rate: percentage of submissions where all three agents produce valid, schema-compliant output.
- Fallback activation rate: how often does the degraded response path trigger?

> **No performance numbers are invented or promised.** All metrics are observed empirically during development and testing.

---

## 18. Hackathon Demo

### Demo Narrative: Detect → Understand → Fix → Verify

**Prepared demo sample:** A deliberate Python code snippet containing three vulnerabilities of different severity:
1. SQL injection via string concatenation (Critical — CWE-89).
2. Hardcoded API key / password (High — CWE-798).
3. Missing input validation / type coercion (Medium).

**Step 1 — Submit**
- Open the web UI. Paste the vulnerable Python code into Monaco Editor.
- Note: the code “looks like normal application code” to the naked eye.
- Click “Analyze.”

**Step 2 — Watch the pipeline**
- Stage labels progress: `Analyzing… → Explaining… → Generating Fix… → Verifying…`
- Each stage label activates in sequence — visible evidence of the three-agent pipeline.

**Step 3 — Detect**
- Results panel: three findings with severity badges (Critical, High, Medium), line numbers, and category labels.

**Step 4 — Understand**
- Click the Critical finding (SQL Injection).
- Plain-language explanation: “Your query is built by directly inserting user input into the SQL string. An attacker can enter malicious SQL that alters or destroys your database. This is CWE-89.”
- Show CWE-89 badge and High confidence indicator.

**Step 5 — Fix**
- Scroll to the diff panel.
- Original: string concatenation into SQL query (highlighted red).
- Fixed: parameterized query with bound parameters (highlighted green).
- Note: only the vulnerable lines changed; surrounding code is untouched.

**Step 6 — Verify**
- Each finding shows a Resolved badge in green, backed by the Verifier Agent re-running Semgrep/Bandit.
- If a finding is Unresolved or shows a Regression: explain that the agent honestly detected the incomplete fix, demonstrating that the system does not fabricate success.

**Step 7 — Copy and Go**
- Click “Copy Fixed Code.”
- Close: “In one workflow, the developer went from vulnerable code to a reviewed, explained, fixed, and verified result.”

---

## 19. Technical Constraints & Assumptions

### Constraints (from problem statement)

- A **working prototype is required**; concept-only submissions are insufficient.
- Teams must be able to **explain the role of AI** in their solution.
- No technology stack is prescribed by the problem statement.

### Finalized Technical Decisions

| Decision | Choice |
|---|---|
| Languages supported | Python (primary), JavaScript (secondary) |
| LLM | Google Gemini (via `google-generativeai` Python SDK) |
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| Static analysis | Semgrep (Python + JavaScript) + Bandit (Python only) |
| Code editor | Monaco Editor |
| Diff viewer | Lightweight React-compatible diff component |
| Authentication | None (not required for MVP) |
| Persistence / database | None (not required for MVP) |
| Deployment | Local-first; hosted deployment only if time permits after MVP is complete |
| Max code input | 100 KB |
| Agent count | 3 (Analyzer, Fix, Verifier) — no orchestrator agent |
| Agent framework | Direct Gemini API calls with structured output; no external agent framework required |
| Per-agent timeout | 30 seconds (configurable via environment variable) |

### Assumptions

**[A1]** Backend API port: 8000. Frontend dev server port: 5173.  
**[A2]** Semgrep and Bandit are installed in the backend environment; called as subprocesses.  
**[A3]** Gemini structured output (JSON schema mode) is sufficient for all three agents without additional parsing.  
**[A4]** The analysis pipeline timeout of 90 seconds total (3 agents x 30 seconds each) is sufficient for hackathon demo purposes.  

---

## 20. Out of Scope

The following must NOT be attempted during the MVP hackathon build:

1. **Authentication and user accounts.** No login, no sessions.
2. **Persistent database.** No storage of submitted code or results.
3. **CI/CD pipeline integration.** No GitHub Actions, webhooks, or SCM integration.
4. **IDE plugin or editor extension.** Web UI only.
5. **Custom rule authoring.** Users cannot configure Semgrep or Bandit rules.
6. **Real-time collaborative review.** Single-user, single-session.
7. **Execution of submitted code.** The tool never runs submitted code in any environment.
8. **License compliance scanning.** Out of scope of the problem statement.
9. **Performance profiling or optimization suggestions.** Focus is bugs and security vulnerabilities.
10. **Languages beyond Python and JavaScript.** No additional language support in MVP.
11. **Detailed audit logging or compliance reporting.**
12. **Mobile-responsive design.** Desktop web browser (1280px+) is the target for demo.
13. **Any analytics or telemetry on submitted code.**

---

## 21. Future Enhancements

Post-MVP improvements that must not be built during the hackathon:

1. **CI/CD integration** — GitHub/GitLab PR webhook triggers automatic review on push.
2. **IDE plugin** — VS Code extension for inline analysis during development.
3. **Multi-file / repository-level analysis** — Cross-file data flow vulnerability detection.
4. **Custom rule configuration** — User-defined Semgrep rules.
5. **Interactive fix refinement** — Developer requests alternative or more conservative fix via follow-up prompt.
6. **Historical tracking** — Track findings across multiple submissions of evolving code.
7. **Language expansion** — TypeScript, Java, Go, etc.
8. **SAST/DAST integration** — Deeper integration with commercial security tooling.
9. **Confidence calibration** — Empirical calibration of Gemini confidence scores against labeled vulnerability datasets.
10. **Streaming pipeline updates** — Server-sent events so the frontend updates in real time as each agent completes.

---

## 22. Open Decisions

**All major technology decisions are finalized.** The following minor items remain for human developer confirmation before implementation begins.

| # | Decision | Status | Notes |
|---|---|---|---|
| OD-1 | Gemini model variant | Open | Which specific Gemini model to use (e.g., `gemini-1.5-flash`, `gemini-1.5-pro`). Affects cost, latency, and output quality. |
| OD-2 | Hackathon duration / deadline | Open | Needed to finalize MVP feature prioritization if time is constrained. |
| OD-3 | Diff component library | Open | Specific React diff library to use. Must be lightweight, React-compatible, and support side-by-side or unified view. |
| OD-4 | Per-agent Gemini timeout | Open | Default proposed: 30 seconds per agent call. Adjust based on observed latency during development. |
| OD-5 | Semgrep ruleset | Open | Which Semgrep registry rulesets to run (e.g., `p/python`, `p/javascript`, `p/owasp-top-ten`). Affects detection coverage and false-positive rate. |

---

*End of PRD — CodeGuard / CodeNeeti Hackathon*
