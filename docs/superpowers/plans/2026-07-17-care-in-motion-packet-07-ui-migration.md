# Care in Motion Packet 07 UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing inline Patient Home and check-in UI at `/patient` to Care in Motion without changing Packet 07 behavior or contracts.

**Architecture:** Keep `PatientPage` as the server authorization boundary and keep all existing fetch, validation, focus recovery, escalation, and form state inside `PatientHome`. Change only the rendered composition, icon family, and scoped CSS; retain the existing API endpoint and payload exactly.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Phosphor Icons, Vitest, Playwright.

## Global Constraints

- `NEWDESIGN.md` is the visual source of truth.
- `/patient` remains the only production Patient Home/check-in route.
- Do not create `/patient/home` or `/patient/check-in`.
- Do not add reminder, chatbot, SOS, caregiver dashboard, OCR, or facility UI.
- Do not change Prisma, API routes, check-in contract/service, auth, authorization, or audit behavior.
- Preserve all Packet 07 loading, empty, validation, submitting, success, error, urgent, and history states.
- Patient touch targets are at least 44×44 px and mobile body text is at least 16 px.
- Use existing Care in Motion tokens and Phosphor Icons; no new dependency.

---

### Task 1: Lock the Packet 07 visual boundary with a failing test

**Files:**
- Modify: `web/tests/unit/check-in-ui.test.tsx`
- Test: `web/tests/unit/check-in-ui.test.tsx`

**Interfaces:**
- Consumes: `PatientHome({ patientProfile })`
- Produces: a regression contract requiring the Care in Motion brand while forbidding unavailable feature navigation.

- [x] Add a test that renders `PatientHome`, expects visible `ChroniCare`, and confirms no links named Reminder, Assistant, or SOS exist.
- [x] Run `npm test -- check-in-ui` and verify the brand assertion fails before implementation.

### Task 2: Migrate Patient Home and inline check-in composition

**Files:**
- Modify: `web/src/components/patient/patient-home.tsx`
- Reuse: `web/src/components/brand-mark.tsx`
- Reuse: `web/src/components/auth/patient-logout-button.tsx`

**Interfaces:**
- Consumes: `patientProfile.id`, `displayName`, `relationshipLabel`; existing GET/POST endpoint and `shouldEscalateCheckIn()`.
- Produces: the same form payload and state behavior inside a Care in Motion Patient surface.

- [x] Replace Lucide structural icons with Phosphor CSR icons.
- [x] Add the shared brand header, bound-profile identity, greeting, and logout without adding profile selection.
- [x] Restyle the existing form as the dominant inline check-in Motion Card.
- [x] Keep the exact mood values, field names, payload construction, focus refs, and submit/reset logic.
- [x] Add text/icon selected indication to mood cards so selection does not rely on color.
- [x] Keep optional details inside the existing native `details` disclosure.
- [x] Keep urgent escalation copy and logic unchanged.
- [x] Keep recent-history loading, empty, error/retry, and three-item list behavior unchanged.

### Task 3: Add scoped responsive Care in Motion styles

**Files:**
- Modify: `web/src/app/globals.css`

**Interfaces:**
- Consumes: existing Care in Motion color, type, spacing, border, radius, and focus tokens.
- Produces: `.production-patient-home` scoped styles that do not affect prototype or caregiver routes.

- [x] Add mobile-first page, header, identity, form, mood, disclosure, urgent, and history styles.
- [x] Use one column at 390×844 and a dominant-form/supporting-history grid at 1440×900.
- [x] Ensure controls meet 44 px targets, text wraps, and no horizontal overflow is introduced.
- [x] Preserve reduced-motion handling and avoid decorative animation.

### Task 4: Verify behavior and responsive output

**Files:**
- Test: `web/tests/unit/check-in-ui.test.tsx`
- Test: `web/tests/e2e/patient-check-in.spec.ts`

**Interfaces:**
- Consumes: completed Packet 07 UI migration.
- Produces: fresh verification evidence.

- [x] Run `npm test -- check-in patient-session`; expect all focused tests to pass.
- [x] Run `npm run lint`; expect exit 0.
- [x] Run `npm run typecheck`; expect exit 0.
- [x] Run `npm test`; expect zero failures.
- [x] Run `npm run build`; expect `/patient` and check-ins API in the route table and no `/patient/check-in` route.
- [ ] Run Patient E2E when synthetic credentials are available; otherwise report it as skipped/unavailable.
- [ ] Manually inspect `/patient` at 390×844 and 1440×900 when a synthetic Patient session is available.
