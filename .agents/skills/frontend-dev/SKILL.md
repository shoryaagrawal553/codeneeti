---
name: frontend-dev
description: Workflow instructions and strict boundary rules for developing, styling, and testing React + Vite frontend components and services in CodeGuard.
---

# Frontend Development Skill (`frontend-dev`)

This skill defines the operational rules, boundaries, and workflow for Antigravity instances implementing frontend tasks.

---

## 1. Scope & Ownership (HARD RULE)

- **Allowed Area:** `/frontend/**` strictly (`src/`, `mocks/`, `package.json`, `vite.config.*`).
- **Forbidden Area:** NEVER modify any file in `/backend/**`.
- **Coordination Files:** Do NOT modify `API_CONTRACT.md`, `PRD.md`, or `DECISIONS.md`.

---

## 2. Pre-Implementation Inspection Checklist

Before modifying any frontend file:
1. **Check API Contract:** Read `API_CONTRACT.md` to verify endpoint URLs, request payload shapes, response models, and enum values.
2. **Check Task Scope:** Inspect `TASKS.md` for active assignment and dependencies.
3. **Check System State:** Inspect `BRAIN.md` for current frontend state and known issues.
4. **Check Design Tokens:** Inspect `/frontend/src/index.css` to reuse established CSS variables (colors, borders, shadows, typography, dark mode tokens).

---

## 3. Implementation Workflow

1. **Task Claim:** Ensure the target task in `TASKS.md` is marked `IN PROGRESS`.
2. **Adhere to Design System:**
   - Use curated, harmonious color palettes (HSL-based tokens) and modern typography.
   - Avoid generic browser styles or ad-hoc utility classes.
   - Support dark mode and clean micro-animations.
3. **Mock Independence:**
   - Wire all API service calls through an abstraction that supports mock fixtures in `/frontend/src/mocks/`.
   - The UI must run completely offline without requiring a running backend.
4. **Error & Edge States:**
   - Implement clear loading indicators, empty states, and degraded banners (e.g., when `fix_available: false`).

---

## 4. Testing & Verification

1. Run the frontend build:
   ```bash
   npm run build
   ```
2. Verify zero bundler, syntax, or styling compilation errors.
3. Verify components render cleanly with mock data fixtures.

---

## 5. Stop and Ask the Human

STOP and request human developer review before proceeding if:
- A requested UI feature requires a backend endpoint, field, or error code not defined in `API_CONTRACT.md`.
- A proposed change requires modifying files outside `/frontend/**`.
