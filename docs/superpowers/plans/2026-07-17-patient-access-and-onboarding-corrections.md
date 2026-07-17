# Patient Access and Onboarding Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Owner-issued Patient access codes and remove the registration/invitation continuity flaws found in manual QA.

**Architecture:** Add a focused Patient access-code service behind the locked Owner-only route and render its one-time result inside the active profile UI. Reuse the idempotent Owner onboarding service from the Supabase callback, while invitation URLs remain relative server data resolved against the canonical public app URL in the browser.

**Tech Stack:** Next.js 16 App Router, TypeScript, React, Prisma 7, Supabase Auth, Zod 4, Node.js crypto/Argon2id, Vitest, Testing Library, Playwright.

## Global Constraints

- Patient codes, invitation tokens, session tokens, provider keys, and database URLs never enter logs, audit summaries, tracked fixtures, screenshots, or client persistence.
- Role, user ID, `careCircleId`, and `patientProfileId` are authorized server-side.
- No new dependency, provider, table, or migration.
- Existing dirty P7 and caregiver-registration work must be preserved.
- Do not commit or push without explicit human instruction.

---

### Task 1: Patient Access-Code Domain and Route

**Files:**
- Create: `web/src/lib/patient-access/service.ts`
- Create: `web/src/app/api/v1/patient-profiles/[patientProfileId]/access-code/route.ts`
- Test: `web/tests/unit/patient-access-code.test.ts`
- Test: `web/tests/unit/patient-access-code-route.test.ts`

**Interfaces:**
- Produces: `rotatePatientAccessCode(context, patientProfileId, dependencies)` returning `{ code, expiresAt }`.
- Consumes: `requireOwner`, Prisma transaction APIs, `writeAuditEvent`, and `apiErrorResponse`.

- [ ] Write service tests proving six-digit generation, Argon2id hash-only persistence, old-code and active-session revocation, minimized audit data, wrong-circle/inactive denial, and Family denial.
- [ ] Run `npm test -- patient-access-code` and confirm failure because the service/route do not exist.
- [ ] Implement the minimal transaction and thin POST route using same-origin protection and explicit `patientProfileId` validation.
- [ ] Re-run focused tests and confirm pass.

### Task 2: Owner Patient-Access UI

**Files:**
- Create: `web/src/components/profile/patient-access-code-panel.tsx`
- Modify: `web/src/components/profile/caregiver-profile-panel.tsx`
- Test: `web/tests/unit/patient-access-code-ui.test.tsx`

**Interfaces:**
- Consumes: POST access-code route and active `PatientProfile` DTO.
- Produces: Owner-only create/rotate dialog and one-time copyable result.

- [ ] Write UI tests for Owner controls, confirmation, loading, error, one-time result, focus, and no raw-code persistence.
- [ ] Run the focused UI test and confirm missing-component failure.
- [ ] Implement the panel and mount it only for Owner on the active profile.
- [ ] Re-run focused UI tests and confirm pass.

### Task 3: Callback Bootstrap and Prefilled Fallback

**Files:**
- Modify: `web/src/lib/auth/caregiver.ts`
- Modify: `web/src/app/auth/callback/route.ts`
- Modify: `web/src/components/auth/caregiver-auth-panel.tsx`
- Modify: `web/src/components/auth/owner-onboarding-form.tsx`
- Test: `web/tests/unit/auth-callback-route.test.ts`
- Test: `web/tests/unit/caregiver-auth-panel.test.tsx`
- Test: `web/tests/unit/caregiver-registration-ui.test.tsx`

**Interfaces:**
- Produces: authenticated user metadata resolution and callback-driven `completeOwnerOnboarding`.
- Produces: `ONBOARDING_REQUIRED` state carrying safe initial display/Care Circle names.

- [ ] Write failing tests for valid metadata auto-bootstrap, invalid metadata fallback, callback failure, idempotent retry, and prefilled fallback fields.
- [ ] Run focused auth/registration tests and confirm expected failures.
- [ ] Implement metadata validation, callback bootstrap, and safe prefill without accepting role or Care Circle identifiers.
- [ ] Re-run focused tests and confirm pass.

### Task 4: Canonical Invitation URL and Patient Credential Copy

**Files:**
- Modify: `web/src/components/auth/invitation-panel.tsx`
- Modify: `web/src/components/auth/patient-login-form.tsx`
- Test: `web/tests/unit/caregiver-invitation-ui.test.tsx`
- Test: `web/tests/unit/patient-session-ui.test.tsx`

**Interfaces:**
- Produces: canonical URL resolver with local-only state.
- Produces: client-side Family-invitation URL rejection before Patient auth fetch.

- [ ] Write failing tests for configured app origin, development fallback, localhost warning, and pasted invitation URL rejection without network traffic.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement the minimal URL resolver, warning copy, and Patient-login credential distinction.
- [ ] Re-run focused tests and confirm pass.

### Task 5: Documentation, Regression, and Manual QA

**Files:**
- Modify: `docs/execution/packets/05-patient-access-code-and-profile-isolation.md`
- Modify: `docs/execution/packets/07-patient-homepage-and-check-in.md` only if dependency evidence changes.
- Modify: `docs/execution/packets.md`
- Modify: `docs/product/user-journeys.md`, `docs/technical/api.md`, or `docs/security-privacy.md` only to align behavior already approved.
- Modify: `web/tests/e2e/caregiver-registration.spec.ts`
- Modify: `web/tests/e2e/patient-check-in.spec.ts`

**Interfaces:**
- Produces: corrective P5 evidence and final human-QA-ready P7/registration flow.

- [ ] Add E2E for Owner registration metadata continuity, Patient code issue/rotation/login, Family invitation separation, role denials, and cleanup.
- [ ] Run focused E2E and inspect both 390x844 and 1440x900 views, keyboard focus, overflow, and fresh console messages.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` with no skips.
- [ ] Scan tracked files and diffs for raw credentials, secrets, stale copy, and unintended schema/dependency changes.
- [ ] Record exact fresh evidence without marking human acceptance as complete.
