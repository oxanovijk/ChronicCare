# Caregiver Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real Owner self-registration and invitation-only Family Member registration while preserving Patient access-code isolation.

**Architecture:** Supabase Auth creates and verifies caregiver identities; thin Next.js Route Handlers call isolated onboarding/invitation services that transactionally create application records in Prisma. Owner role is server-assigned during idempotent bootstrap, and Family role is server-assigned from a hash-only, single-use invitation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth/SSR, Prisma 7, PostgreSQL, Zod 4, Vitest, Testing Library, Playwright.

## Global Constraints

- Patient remains access-code/session based and is never created in Supabase Auth.
- Client input may not select role, `careCircleId`, or user ID.
- Mutation endpoints enforce same-origin requests.
- Raw password, invitation token/hash, session, JWT, and provider error detail may not enter logs or public DTOs.
- No new dependency, auth provider, email provider, or database table is introduced.
- Existing uncommitted P7 changes must be preserved.
- Do not commit or push without a separate human request.

---

### Task 1: Auth State and Owner Bootstrap

**Files:**
- Create: `web/src/lib/onboarding/schemas.ts`
- Create: `web/src/lib/onboarding/owner-service.ts`
- Create: `web/src/app/api/v1/onboarding/owner/route.ts`
- Modify: `web/src/lib/auth/caregiver.ts`
- Modify: `web/src/lib/auth/api-response.ts`
- Test: `web/tests/unit/caregiver-registration-service.test.ts`
- Test: `web/tests/unit/caregiver-registration-route.test.ts`
- Test: `web/tests/unit/membership.test.ts`

**Interfaces:**
- Produces `ownerOnboardingSchema`, `completeOwnerOnboarding(authUser, input, dependencies)`, and `CaregiverAuthError("ONBOARDING_REQUIRED")`.
- Returns the existing `CaregiverAuthContext` DTO shape.

- [x] Write tests proving authenticated Auth users without public rows need onboarding, removed public users remain forbidden, bootstrap fixes role to Owner, transaction/audit are minimal, and retry is idempotent.
- [x] Run `npm test -- caregiver-registration membership` and confirm failures are caused by missing onboarding behavior.
- [x] Implement schemas, auth distinction, locked transactional service, thin route, and public error mapping.
- [x] Re-run targeted tests and confirm they pass.

### Task 2: Owner Registration and Verification Recovery UI

**Files:**
- Create: `web/src/components/auth/caregiver-registration-form.tsx`
- Create: `web/src/components/auth/owner-onboarding-form.tsx`
- Create: `web/src/app/caregiver/register/page.tsx`
- Create: `web/src/app/auth/callback/route.ts`
- Modify: `web/src/components/auth/caregiver-auth-panel.tsx`
- Modify: `web/src/app/caregiver/page.tsx`
- Test: `web/tests/unit/caregiver-registration-ui.test.tsx`
- Test: `web/tests/unit/auth-callback-route.test.ts`

**Interfaces:**
- Registration form calls Supabase `signUp`, then `POST /api/v1/onboarding/owner` when a session exists.
- Callback accepts only local `/caregiver...` next paths and exchanges the PKCE code.
- Auth panel renders `OwnerOnboardingForm` only for server code `ONBOARDING_REQUIRED`.

- [x] Write failing tests for password confirmation, password clearing, generic provider errors, verification-pending state, immediate bootstrap, callback redirect allowlisting, and resumable onboarding.
- [x] Run `npm test -- caregiver-registration-ui auth-callback` and observe expected failures.
- [x] Implement pages/components/callback with accessible focus and responsive states.
- [x] Re-run targeted tests and confirm they pass.

### Task 3: Hash-Only Family Invitation Domain and API

**Files:**
- Create: `web/src/lib/invitations/schemas.ts`
- Create: `web/src/lib/invitations/service.ts`
- Create: `web/src/app/api/v1/care-circle/invitations/route.ts`
- Create: `web/src/app/api/v1/care-circle/invitations/[token]/route.ts`
- Create: `web/src/app/api/v1/care-circle/invitations/[token]/accept/route.ts`
- Test: `web/tests/unit/caregiver-invitation-service.test.ts`
- Test: `web/tests/unit/caregiver-invitation-route.test.ts`

**Interfaces:**
- Produces `createInvitation`, `getInvitationPreview`, and `acceptInvitation`.
- Create returns `{ id, invitePath, expiresAt }`; preview returns `{ careCircleName, expiresAt }`; acceptance returns `CaregiverAuthContext`.

- [x] Write failing tests for Owner-only create, SHA-256 hash-only persistence, 24-hour expiry, generic invalid/expired/revoked/used states, atomic single use, fixed Family role, idempotent same-user retry, and cross-circle denial.
- [x] Run `npm test -- caregiver-invitation` and observe expected failures.
- [x] Implement services and thin routes without returning tokens/hashes from persistence reads.
- [x] Re-run targeted tests and confirm they pass.

### Task 4: Invitation UI and Owner Link Creation

**Files:**
- Create: `web/src/components/auth/family-invitation-form.tsx`
- Create: `web/src/components/auth/invitation-panel.tsx`
- Create: `web/src/app/caregiver/invite/[token]/page.tsx`
- Modify: `web/src/components/auth/caregiver-auth-panel.tsx`
- Modify: `web/src/app/patient/login/page.tsx`
- Test: `web/tests/unit/caregiver-invitation-ui.test.tsx`

**Interfaces:**
- Owner panel creates and displays a copyable same-origin link once.
- Invitation form validates the token, supports Family sign-in/signup, resumes after email verification, and calls acceptance only with authenticated session plus display name.

- [x] Write failing UI tests for Owner-only visibility, one-time link, invalid token, Family signup/sign-in, verification pending, generic provider errors, acceptance success, and Patient no-registration copy.
- [x] Run `npm test -- caregiver-invitation-ui` and observe expected failures.
- [x] Implement feature-complete UI with loading/error/success/focus states.
- [x] Re-run targeted tests and confirm they pass.

### Task 5: Canonical Docs, E2E, Security, and Cleanup

**Files:**
- Create: `web/tests/e2e/caregiver-registration.spec.ts`
- Modify: `docs/product/user-journeys.md`
- Modify: `docs/technical/api.md`
- Modify: `docs/technical/architecture.md`
- Modify: `docs/security-privacy.md`
- Modify: `docs/execution/packets.md`

**Interfaces:**
- E2E creates only synthetic emails/names, verifies Owner registration and Family invitation acceptance, then removes database and Auth fixtures.

- [x] Add E2E coverage for Owner onboarding, copied invitation, Family acceptance, role denial, 390x844/1440x900 overflow, keyboard focus, and generic errors; email-delivery signup remains provider-rate-limited and is covered below the provider boundary by tests.
- [x] Update canonical docs with the approved identity lifecycle and exact routes.
- [x] Run Prisma generation, lint, typecheck, targeted tests, full unit tests, production build, and all E2E.
- [x] Scan tracked files/build artifacts for secrets and verify zero synthetic registration fixtures remain.
- [x] Record evidence and leave Packet 07 at Review until final human acceptance.
