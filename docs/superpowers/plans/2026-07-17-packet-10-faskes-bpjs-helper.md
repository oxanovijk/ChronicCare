# Packet 10 Faskes and BPJS Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the validated, authenticated, deterministic Tangerang Raya facility and BPJS helper in the production caregiver workspace.

**Architecture:** Parse two static JSON datasets with strict Zod contracts, filter them in a pure server module, expose them through thin caregiver-authenticated Route Handlers, and integrate a responsive two-tab helper into the active Patient dashboard. Do not add persistence or external providers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod 4, Tailwind CSS/shadcn primitives, Phosphor icons, Vitest/Testing Library, Playwright.

## Global Constraints

- Packet 10 remained `Draft` during implementation and was marked `Done` after Ozan's human QA verdict on 2026-07-17.
- Do not add Prisma schema, migration, seed, dependency, scraping, Google Places, maps, booking, ranking, or live facility lookup.
- Require a verified caregiver session for both static endpoints.
- Preserve `null` as unknown and never present it as negative evidence.
- Never claim best facility, clinical suitability, current availability, emergency capacity, or guaranteed BPJS acceptance.
- Do not stage, commit, push, switch branches, or mutate stash.

---

### Task 1: Add strict static data contracts through RED to GREEN

**Files:**
- Create: `web/src/data/facilities/facilities.packet10.json`
- Create: `web/src/data/facilities/bpjs-guides.packet10.json`
- Create: `web/src/lib/facilities/schemas.ts`
- Create: `web/src/lib/facilities/data.ts`
- Test: `web/tests/unit/facilities-data.test.ts`

**Interfaces:**
- Produces `Facility`, `BpjsGuide`, `facilities`, and `bpjsGuides` from strict Zod parsing.

- [ ] Write failing tests for exact counts, unique identifiers, strict keys, allowed values, valid source URLs/dates, null semantics, non-empty services, and forbidden raw fields.
- [ ] Run `npm test -- facilities-data` and confirm RED because the modules do not exist.
- [ ] Add the normalized JSON files, Zod schemas, and module-load parsing with immutable exported arrays.
- [ ] Re-run `npm test -- facilities-data` and confirm GREEN.

### Task 2: Add deterministic filtering through RED to GREEN

**Files:**
- Create: `web/src/lib/facilities/filter.ts`
- Test: `web/tests/unit/facilities-filter.test.ts`

**Interfaces:**
- `filterFacilities(items, filters)` returns source-order deterministic matches.
- `deriveFacilityFilterOptions(items, city?)` returns sorted city/area/type/service/specialty options.
- `facilityQuerySchema` parses URL query values and strict booleans.

- [ ] Write failing tests for every single filter, case normalization, combined BPJS plus Penyakit Dalam demo filter, null exclusion, area narrowing, metadata sorting, reset-equivalent empty filters, and deliberate no-result.
- [ ] Run `npm test -- facilities-filter` and confirm RED.
- [ ] Implement pure normalization, query parsing, filtering, and option derivation without ranking or fuzzy inference.
- [ ] Re-run the focused tests and confirm GREEN.

### Task 3: Add authenticated static APIs through RED to GREEN

**Files:**
- Create: `web/src/app/api/v1/facilities/route.ts`
- Create: `web/src/app/api/v1/bpjs-guides/route.ts`
- Test: `web/tests/unit/facilities-route.test.ts`

**Interfaces:**
- `GET /api/v1/facilities` returns `{ items, filters, total }` in `apiSuccess`.
- `GET /api/v1/bpjs-guides` returns `{ items, total, version }` in `apiSuccess`.

- [ ] Write failing route tests for Owner and Family success, unauthenticated denial, strict invalid-query response, combined filtering, source/review fields, safe body shape, and no-store headers.
- [ ] Run `npm test -- facilities-route` and confirm RED.
- [ ] Implement thin handlers that resolve caregiver auth, parse queries, call pure data/filter modules, and use existing response helpers.
- [ ] Re-run route tests plus existing auth route tests and confirm GREEN.

### Task 4: Build the complete helper UI through RED to GREEN

**Files:**
- Create: `web/src/components/facilities/facility-helper.tsx`
- Create: `web/src/components/facilities/facility-filters.tsx`
- Create: `web/src/components/facilities/facility-results.tsx`
- Create: `web/src/components/facilities/bpjs-guide-list.tsx`
- Test: `web/tests/unit/facilities-ui.test.tsx`

**Interfaces:**
- `FacilityHelper({ patientProfileId, patientName })` owns tab, filter, fetch, retry, and reset state.
- Child components receive typed data and callbacks only; they do not fetch or authorize.

- [ ] Write failing UI tests for Patient context, both tabs, loading, retry, all controls, deterministic results, source/review copy, null labels, hidden null phone, reset, no-result wording, guide steps/caveat, keyboard labels, and session expiry.
- [ ] Run `npm test -- facilities-ui` and confirm RED.
- [ ] Implement accessible tabs, selects, checkboxes, results, expandable guides, skeleton/error/empty states, and mobile-safe Tailwind layout using existing UI primitives and Phosphor icons.
- [ ] Re-run focused UI tests and confirm GREEN.

### Task 5: Integrate the helper into the production caregiver flow

**Files:**
- Modify: `web/src/components/caregiver/caregiver-dashboard.tsx`
- Modify if needed: `web/src/components/caregiver/caregiver-production-shell.tsx`
- Update: `web/tests/unit/facilities-ui.test.tsx`
- Update affected caregiver dashboard/profile tests only when assertions intentionally change.

**Interfaces:**
- The active `patientProfile.id` and display name are passed to `FacilityHelper` for orientation and remount/reset only.

- [ ] Write a failing integration assertion that the active dashboard exposes a Faskes/BPJS entry point and opens a helper labeled with the correct Patient.
- [ ] Replace the Packet 08 `Belum tersedia` faskes placeholder with the production helper entry point while preserving document/chat/SOS honesty.
- [ ] Ensure Patient switching resets helper state through the existing profile-key remount boundary.
- [ ] Re-run facility and existing caregiver/profile UI tests until GREEN.

### Task 6: Add E2E coverage and complete verification

**Files:**
- Create: `web/tests/e2e/facilities.spec.ts`
- Packet 10 status may change only after Ozan records the final human QA verdict.

- [ ] Add authenticated Owner demo flow, Family access, Patient/unauthenticated denial, Maya/Raka context switching, BPJS plus Penyakit Dalam filtering, emergency filtering, reset, no-result, guides, and mobile viewport coverage.
- [ ] Run `npm test -- facilities`, full `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and the relevant/full Playwright suites; fix every Packet 10 regression.
- [ ] Start the development server and inspect 390x844 and 1440x900 for overflow, focus, touch targets, source copy, null states, loading/error/no-result states, console errors, and 20-second demo ergonomics.
- [ ] Run `git diff --check`, secret/legacy-term/overclaim/provider scans, and `git status --short`; record exact evidence and remaining human-only closure items.
