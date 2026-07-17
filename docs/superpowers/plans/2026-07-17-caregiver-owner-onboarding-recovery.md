# Caregiver Owner Onboarding Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover a confirmed Supabase caregiver account that has no application user or membership by restoring valid local server configuration and preserving the existing `ONBOARDING_REQUIRED` contract instead of a generic 500.

**Architecture:** Keep Supabase Auth as the identity authority and keep `completeOwnerOnboarding()` as the only application bootstrap path. Supply the required ignored local Patient session secret so the shared server environment can initialize, then harden API error classification across Next.js/Turbopack module boundaries so a genuine `CaregiverAuthError` retains its 409 semantics even when `instanceof` identity is not preserved. Unexpected failures log only a safe error name/code classification.

**Tech Stack:** Next.js App Router, TypeScript, Supabase SSR, Prisma, Vitest, Testing Library.

## Global Constraints

- Do not manually insert, delete, or update Auth, user, Care Circle, or membership records.
- Do not change Packet 07 Patient Home/check-in behavior or UI.
- Do not expose email, UUID, session, token, provider error, database URL, or onboarding metadata beyond the existing safe defaults.
- Preserve `401 UNAUTHENTICATED`, `403 FORBIDDEN`, and `409 ONBOARDING_REQUIRED` contracts.
- Keep Owner onboarding idempotent through the existing transaction and advisory lock.

---

### Task 1: Reproduce cross-boundary onboarding error mapping

**Files:**
- Modify: `web/tests/unit/auth-route.test.ts`
- Test: `web/tests/unit/auth-route.test.ts`

**Interfaces:**
- Consumes: `GET /api/v1/auth/me` and `apiErrorResponse(error, requestId)`.
- Produces: a regression contract requiring a cross-boundary `CaregiverAuthError` shape to return 409 with safe onboarding defaults.

- [x] Add a test that makes `resolveAuthContext` reject an `Error` whose `name` is `CaregiverAuthError`, `code` is `ONBOARDING_REQUIRED`, and defaults contain only display name/Care Circle name.
- [x] Assert status 409, code `ONBOARDING_REQUIRED`, safe defaults, and absence of token/session/provider details.
- [x] Run `npm test -- auth-route` and verify the new test fails with status 500.

### Task 2: Harden API auth error classification

**Files:**
- Modify: `web/src/lib/auth/api-response.ts`
- Test: `web/tests/unit/auth-route.test.ts`

**Interfaces:**
- Consumes: native error instances or cross-module `Error` objects with the exact trusted class name and allowed auth code.
- Produces: the existing safe 401/403/409 response mapping.

- [x] Add a narrow type guard that accepts normal `CaregiverAuthError` instances and cross-module `Error` objects only when `name === "CaregiverAuthError"` and the code is in the allowed caregiver set.
- [x] Reuse the existing response messages and only include onboarding defaults for `ONBOARDING_REQUIRED`.
- [x] Run `npm test -- auth-route membership caregiver-auth-panel caregiver-registration` and verify all focused tests pass.

### Task 3: Verify the real recovery path

**Files:**
- No production file beyond Task 2.

**Interfaces:**
- Consumes: the confirmed current Supabase session and the existing `/api/v1/onboarding/owner` endpoint.
- Produces: 409 before onboarding and the existing Owner completion form in the caregiver UI.

- [x] Configure the ignored local `PATIENT_SESSION_SECRET` with a cryptographically random value without exposing it.
- [x] Restart `npm run dev` so the server loads the patch.
- [ ] Verify `/api/v1/auth/me` returns 409 for the current confirmed account rather than 500.
- [ ] Verify `/caregiver` renders `Selesaikan pendaftaran Owner` with no identity or provider leak.
- [x] Do not submit the final onboarding form on the user's behalf because it creates a Care Circle; leave that explicit action to the user.

The authenticated browser session was no longer available after the required server restart. The signed-out `/caregiver` surface rendered normally without the previous environment 500; the two authenticated checks remain a user-assisted manual verification after the user signs in again.

### Task 4: Full verification and isolated commit

**Files:**
- Test: all existing repository checks.

**Interfaces:**
- Consumes: completed corrective patch.
- Produces: verification evidence and a standalone local commit.

- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [ ] Confirm no staged log/environment/prototype changes.
- [ ] Commit only the plan, auth response change, and regression test with `fix(auth): recover confirmed owner onboarding`.
