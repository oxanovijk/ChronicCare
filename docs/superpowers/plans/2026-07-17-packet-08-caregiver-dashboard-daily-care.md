# Packet 08 Caregiver Dashboard and Daily Care Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the profile-isolated Packet 08 caregiver dashboard and daily-care core on `/caregiver` without implementing Packet 09–12.

**Architecture:** Preserve the caregiver auth and profile lifecycle boundaries, add additive Prisma entities, and isolate Packet 08 contracts/services/routes under `daily-care`. Compose a new client dashboard into the authenticated caregiver workspace; server authorization remains authoritative and profile switching clears stale data.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, Zod 4, Tailwind CSS/shadcn primitives, Phosphor icons, Vitest/Testing Library, Playwright.

## Global Constraints

- Do not pull, merge, switch/create branches, stage, commit, push, or mutate stash.
- Keep Packet 08 `Draft`; do not change Packet 09–12 status or implement their features.
- Every patient-bound operation accepts explicit `patientProfileId` and revalidates caregiver membership and active profile relation.
- `NEWDESIGN.md` overrides visual suggestions; medical, privacy, API, and data contracts override visuals.
- Never infer `NONE_REPORTED`, recommend medication/dose, promise reminder delivery, or show cross-profile stale data.

---

### Task 1: Add Packet 08 persistence with a RED schema contract

**Files:**
- Test: `web/tests/unit/daily-care-schema.test.ts`
- Modify: `web/prisma/schema.prisma`
- Create: `web/prisma/migrations/20260717150000_packet_08_daily_care/migration.sql`
- Modify: `web/prisma/seed.ts`

**Interfaces:**
- Produces Prisma delegates `medication`, `medicationLog`, `reminder`, and `healthNote` plus locked enums and relations.

- [ ] Write a schema-text test asserting the four enums, four models, explicit `patientProfileId`, and documented indexes.
- [ ] Run `npm test -- daily-care-schema` and confirm it fails because Packet 08 models are absent.
- [ ] Add the locked Prisma enums/models/relations and additive SQL migration; add distinct idempotent synthetic Maya/Raka daily-care seed rows.
- [ ] Run `npm run db:generate`, `npx prisma validate`, and the focused schema test; confirm success before moving on.

### Task 2: Add contracts and authorized services through RED→GREEN

**Files:**
- Create: `web/src/lib/daily-care/daily-care-contract.ts`
- Create: `web/src/lib/daily-care/daily-care-authorization.ts`
- Create: `web/src/lib/daily-care/dashboard-service.ts`
- Create: `web/src/lib/daily-care/medication-service.ts`
- Create: `web/src/lib/daily-care/reminder-service.ts`
- Create: `web/src/lib/daily-care/health-note-service.ts`
- Test: `web/tests/unit/daily-care-contract.test.ts`
- Test: `web/tests/unit/daily-care-service.test.ts`
- Modify: `web/src/lib/patient-profile/service.ts`

**Interfaces:**
- `getCaregiverDashboard(context, patientProfileId, dependencies)` returns profile/setup/check-in/medication/reminder/note DTOs.
- Medication create/update/log functions enforce status synchronization and same-profile ownership.
- Reminder and note functions return whitelisted DTOs; PATCH uses `updatedAt` concurrency.

- [ ] Write contract tests for strict validation, enum values, date/text limits, and rejection of unknown fields.
- [ ] Write service tests for Owner/Family access, wrong Care Circle/profile/deactivated denial, latest check-in, empty states, transaction synchronization, mismatch denial, derived checklist, and conflict.
- [ ] Run `npm test -- daily-care-contract daily-care-service`; confirm failures are missing-module/behavior failures.
- [ ] Implement the minimum contracts, authorization helper, dashboard selector, and transactional services.
- [ ] Update Patient Profile medication-status mutation validation so active Medication rows prevent `UNKNOWN`/`NONE_REPORTED` and profile PATCH never manufactures `REPORTED`.
- [ ] Re-run the focused tests and existing profile/check-in tests until green.

### Task 3: Add thin Packet 08 API routes through RED→GREEN

**Files:**
- Create the locked dashboard, medication, medication-log, reminder, and health-note route handlers under `web/src/app/api/v1/patient-profiles/[patientProfileId]/`.
- Test: `web/tests/unit/daily-care-route.test.ts`

**Interfaces:**
- Routes parse `patientProfileId`, resolve caregiver auth, validate JSON with Zod, call one service, use the safe API envelope, and set `Cache-Control: private, no-store`.

- [ ] Write route tests covering success, 401, forbidden/not-found, validation, conflict, no-store, same-origin mutation, and safe error bodies.
- [ ] Run `npm test -- daily-care-route`; confirm it fails because routes are missing.
- [ ] Implement thin route handlers for every locked Packet 08 path and no other packet.
- [ ] Re-run route tests and existing auth/profile/check-in route tests until green.

### Task 4: Build the production caregiver dashboard through RED→GREEN

**Files:**
- Create: `web/src/components/caregiver/caregiver-dashboard.tsx`
- Create: `web/src/components/caregiver/daily-care-forms.tsx`
- Create or modify: `web/src/components/caregiver/caregiver-production-shell.tsx`
- Modify: `web/src/components/auth/caregiver-auth-panel.tsx`
- Modify: `web/src/components/profile/caregiver-profile-panel.tsx`
- Modify: `web/src/app/caregiver/page.tsx`
- Modify: `web/src/app/globals.css`
- Test: `web/tests/unit/daily-care-ui.test.tsx`
- Update affected caregiver auth/profile tests.

**Interfaces:**
- `CaregiverDashboard({ patientProfile, caregiverName, role })` clears data on prop change, fetches the dashboard with no-store, and owns Packet 08 dialog/form state.
- Existing profile lifecycle and auth state behaviors remain callable and visible according to role.

- [ ] Write UI tests for authenticated dashboard, latest/empty check-in, status semantics, later-feature honesty, form states, Owner/Family access, named switching skeleton, retry, and stale-response rejection.
- [ ] Run `npm test -- daily-care-ui caregiver-auth-panel profile-isolation-ui`; confirm Packet 08 assertions fail.
- [ ] Implement the Care in Motion shell, dashboard hierarchy, accessible forms, and honest unavailable navigation while retaining Packet 04–07 behavior.
- [ ] Add responsive 390×844 and 1440×900 styling, 44 px targets, visible focus, `aria-live`, and reduced-motion rules.
- [ ] Re-run focused UI tests until green.

### Task 5: Verify database, regression, E2E, and visual states

**Files:**
- Create or modify: `web/tests/e2e/caregiver-daily-care.spec.ts`
- Do not modify packet status documents.

- [ ] Add E2E coverage for caregiver login, Maya→Raka stale clearing, medication/reminder mutations, Family access, Patient denial, logout/session expiry, and mobile viewport, using only synthetic fixtures.
- [ ] Run `npm run db:generate`, `npx prisma validate`, migration review/status commands safe for the configured database, lint, typecheck, focused tests, all unit tests, build, and E2E.
- [ ] Inspect `/caregiver` at 390×844 and 1440×900 for overflow, focus, touch targets, loading/empty/error/conflict/profile-switch states, console errors, and no Packet 09–12 claims.
- [ ] Run `git diff --check`, secret/legacy-term/prototype-link scans, and `git status --short`; report exact failures/blockers without changing Git state.
