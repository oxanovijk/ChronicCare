# Care in Motion Screen 03–10 Implementation Plan

> Execute inline in the existing `sandbox` workspace. Do not create a worktree or branch because the human explicitly asked to continue in the current experiment. Do not commit, push, stage, apply, or drop the existing stash.

**Goal:** Build a safe, responsive, connected mockup from Patient Check-in through Caregiver Facilities using `NEWDESIGN.md`.

**Architecture:** Next.js App Router pages compose a shared Patient or Caregiver shell. Interactive mock states live in focused Client Components using local React state. There is no persistence, backend, provider call, or dependency addition.

**Tech:** Next.js 16, React 19, TypeScript, Tailwind/global CSS, Phosphor icons, Vitest/Testing Library, Playwright.

---

### Task 1: Lock behavioral tests in RED

**Files:**
- Modify: `web/src/components/patient-shell.tsx` contract through tests
- Create: `web/src/test/connected-patient-flow.test.tsx`
- Create: `web/src/test/connected-caregiver-flow.test.tsx`
- Modify: `web/e2e/prototype.spec.ts`

1. Write component tests for Screen 03 and 08 patient interactions.
2. Write component tests for Screen 04–07, 09, and 10 caregiver interactions.
3. Extend E2E expectations for all routes and the connected journey.
4. Run targeted component tests and confirm failure is caused by missing components/routes.

### Task 2: Build shared shells and Patient Screen 03/08

**Files:**
- Modify: `web/src/components/patient-shell.tsx`
- Create: `web/src/components/check-in-form.tsx`
- Create: `web/src/components/patient-sos-panel.tsx`
- Create: `web/src/app/patient/check-in/page.tsx`
- Create: `web/src/app/patient/sos/page.tsx`
- Modify: `web/src/app/globals.css`

1. Add explicit PatientShell active state and correct `aria-current` behavior.
2. Implement check-in selection, note counter, validation, success, and separate SOS link.
3. Implement two-step SOS confirmation and honest success/limitation copy.
4. Run patient tests until green.

### Task 3: Build Caregiver shell and Screen 04

**Files:**
- Create: `web/src/components/caregiver-shell.tsx`
- Create: `web/src/components/patient-context-control.tsx`
- Create: `web/src/app/caregiver/page.tsx`
- Modify: `web/src/app/globals.css`

1. Implement desktop sidebar and mobile navigation with active route semantics.
2. Implement patient context switcher; Maya shows the connected demo content and Raka shows a clearly labeled safe empty/skeleton state.
3. Implement current-care summary, review work, recent activity, and quick actions.
4. Run caregiver dashboard tests until green.

### Task 4: Build Documents Screen 05/06

**Files:**
- Create: `web/src/components/document-upload-form.tsx`
- Create: `web/src/components/ocr-review-workspace.tsx`
- Create: `web/src/app/caregiver/documents/upload/page.tsx`
- Create: `web/src/app/caregiver/documents/review/page.tsx`
- Modify: `web/src/app/globals.css`

1. Implement accessible file selection, allowed-type/size validation, simulated progress/cancel, and honest private/synthetic/page-count notes.
2. Implement non-interpretive editable extraction fields, edited marker, reject state, and confirmed success.
3. Run document interaction tests until green.

### Task 5: Build Assistant, SOS handling, and Facilities Screen 07/09/10

**Files:**
- Create: `web/src/components/caregiver-assistant.tsx`
- Create: `web/src/components/caregiver-sos-panel.tsx`
- Create: `web/src/components/facility-helper.tsx`
- Create: `web/src/app/caregiver/chat/page.tsx`
- Create: `web/src/app/caregiver/sos/page.tsx`
- Create: `web/src/app/caregiver/facilities/page.tsx`
- Modify: `web/src/app/globals.css`

1. Implement visible demo-fallback chat suggestions, deterministic context response, medical refusal, emergency escalation, and clear-conversation action.
2. Implement mandatory visual alert, audio opt-in state, handling state, and friendly already-handled conflict simulation.
3. Implement static Tangerang filters, results, source date, contact disclosure, and honest empty state.
4. Run all component tests until green.

### Task 6: Connect and verify the complete mockup

**Files:**
- Modify: `web/e2e/prototype.spec.ts`
- Modify only implementation/test files necessary to fix verified issues

1. Run full unit suite, lint, typecheck, and build.
2. Run E2E across Screen 01–10 at mobile and desktop widths.
3. Inspect screenshots and horizontal overflow at 390×844 and 1440×900.
4. Scan for unsafe clinical claims, live-provider claims, real data, legacy terminology, and placeholder copy.
5. Inspect `git status --short`, stash list, and diff summary; leave Git history and stash untouched.

