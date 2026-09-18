---
name: ui-research-integration
description: Workflow instructions for researching, evaluating, and integrating dynamic UI components, patterns, and animations into the React frontend.
---

# UI Research & Integration Skill (`ui-research-integration`)

This skill defines the workflow for researching, selecting, and integrating dynamic UI components, visual patterns, and micro-animations into the CodeGuard frontend (e.g., code diff viewers, Monaco editor theming, animated progress steppers).

---

## 1. Scope & Ownership (HARD RULE)

- **Allowed Area:** `/frontend/**` strictly (`src/components/`, `src/styles/`, `package.json`).
- **Forbidden Area:** NEVER modify any file in `/backend/**`.
- **Coordination Files:** Do NOT modify `API_CONTRACT.md`, `PRD.md`, or `DECISIONS.md`.

---

## 2. Pre-Research Inspection Checklist

Before evaluating or integrating any component:
1. **Frontend Requirements:** Inspect `PRD.md` Section 12 for required visual elements and desktop target specs (1280px+).
2. **Decisions Check:** Inspect `DECISIONS.md` (DEC-001, DEC-006, OD-3) regarding Monaco Editor and diff viewer choices.
3. **Design System:** Inspect `/frontend/src/index.css` to ensure new components reuse established CSS design tokens (typography, color palette, dark mode variables, border radiuses, shadows).
4. **Existing Dependencies:** Check `/frontend/package.json` to prevent duplicate or conflicting libraries.

---

## 3. Evaluation & Selection Criteria

When researching candidate components or patterns:
1. **Vite & React Compatibility:** Must support modern React (18+) and Vite ESM bundling without legacy Babel/Webpack hacks.
2. **Lightweight Footprint:** Avoid heavy monolithic UI frameworks; favor focused, single-purpose libraries (<500 KB) or native CSS-driven implementations.
3. **Visual Polish:** Ensure components support custom styling, dark themes, and smooth micro-animations.
4. **Desktop Usability:** Must render reliably on desktop displays without clipping or horizontal layout breaking.

---

## 4. Integration Workflow

1. **Component Scaffolding:** Create the component in `/frontend/src/components/<ComponentName>.jsx` (or `.tsx`).
2. **Style Alignment:** Apply classes using design tokens from `index.css`. Never introduce conflicting CSS resets or un-namespaced global styles.
3. **Mock Data Hookup:** Bind the component to mock fixtures in `/frontend/src/mocks/` to test varied states (empty, partial, loading, full).
4. **Build Verification:** Run `npm run build` from the frontend directory to verify zero bundling or syntax warnings.
5. **Documentation:** Update `BRAIN.md` to reflect the newly integrated UI component.

---

## 5. Stop and Ask the Human

STOP and request human developer review before proceeding if:
- A candidate UI component introduces a large dependency footprint (>500 KB) or significant bundle overhead.
- Integrating the component would require backend schema changes or new API endpoints.
