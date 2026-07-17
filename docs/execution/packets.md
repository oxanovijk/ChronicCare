# Execution Packets Index

Produk: ChroniCare

Status: Locked packet structure for MVP v1; Packets 01 through 08 are `Done`, and each remaining packet status remains evidence-driven

DRI: Ozan

Contributors: Bernard, Daniel, Al

Reviewer: Bernard

## Purpose

This index keeps execution packets small enough for one focused Codex session. It is not a phase plan and not a canonical milestone layer. Product and technical contracts remain in the locked product/technical docs; each packet is a work order that references those contracts.

## Packet List

| Order | Packet | Driver / DRI | Current status | Exit result |
| --- | --- | --- | --- | --- |
| 01 | [Scaffold and Tooling Baseline](packets/01-scaffold-and-tooling-baseline.md) | Bernard | Done | Runnable `/web`, scripts, shell routes, baseline tests |
| 02 | [Env and Provider Boundary](packets/02-env-and-provider-boundary.md) | Bernard | Done | Typed env validation, server-only Supabase/Azure boundaries, safe fallback flags |
| 03 | [Data Schema, Prisma, and Seed Base](packets/03-data-schema-prisma-and-seed-base.md) | Bernard | Done | Minimum identity/profile schema, explicit fact states, audit helper, synthetic seed base |
| 04 | [Caregiver Auth and Membership Authorization](packets/04-caregiver-auth-and-membership-authorization.md) | Bernard | Done | Caregiver session resolution, Owner/Family Member authorization, role tests |
| 05 | [Patient Access Code and Profile Isolation](packets/05-patient-access-code-and-profile-isolation.md) | Bernard | Done | Minimum profile API, Owner-issued Patient codes, bound login/session, Maya/Raka isolation |
| 06 | [Patient Profile Lifecycle Deactivation](packets/06-patient-profile-lifecycle-deactivation.md) | Bernard | Done | Owner-only non-destructive profile deactivation and Patient access revocation |
| 07 | [Patient Homepage and Check-In](packets/07-patient-homepage-and-check-in.md) | Daniel | Done | Cheerful Patient homepage and profile-bound check-in flow |
| 08 | [Caregiver Dashboard, Medication, and Reminder](packets/08-caregiver-dashboard-medication-and-reminder.md) | Daniel | Done | Informative caregiver dashboard with medication/reminder basics |
| 09 | [Document Upload, OCR, and Review](packets/09-document-upload-ocr-and-review.md) | Al | Draft | Private upload, OCR/fallback, caregiver review, confirmed-only summary |
| 10 | [Faskes and BPJS Helper](packets/10-faskes-and-bpjs-helper.md) | Daniel | Done | Safe Tangerang facility/BPJS navigation |
| 11 | [Chatbot Safety Gateway and Personas](packets/11-chatbot-safety-gateway-and-personas.md) | Al | Draft | Patient/Caregiver chat with profile-bound context, refusal rules, fallback |
| 12 | [SOS Realtime and Handling](packets/12-sos-realtime-and-handling.md) | Bernard | Draft | Patient SOS, open-dashboard Realtime alert, audio opt-in, atomic handling |
| 13 | [QA, Deploy, and Demo Rehearsal](packets/13-qa-deploy-and-demo-rehearsal.md) | Ozan | Draft | Evidence-based readiness verdict, deploy/local fallback, rehearsal assets |

## Order and Parallel Work

Packets 01 through 05 run mostly in order because later UI and feature packets depend on app scripts, env boundaries, schema, caregiver auth, and Patient Profile isolation. Packet 06 follows Packet 05 because lifecycle actions must reuse the same authorization and Patient access revocation helpers. Packets 07 and 08 form the daily-care demo core. Packet 09 needs the caregiver dashboard entry point from Packet 08. Packet 10 may start after Packet 05 and can overlap Packet 09 if it does not touch document/OCR files or migrations. Packet 11 needs Packet 07, Packet 08, and the confirmed OCR selector from Packet 09. Packet 12 needs Patient and caregiver surfaces from Packets 07 and 08. Packet 13 gathers evidence from hour zero and becomes the final gate after Packets 01 through 12 reach `Review`.

The diabetes tipe 2 scenario is demo context only. No packet may add diagnosis, treatment targets, dose adjustment, lab interpretation, or food/menu/pantangan recommendation without a new human verdict.

## Shared Rules

- Each packet has one driver/DRI and hybrid `Role Work` so humans and agents know who owns API/data, UI, AI/OCR, and QA concerns.
- Ozan changes packet status after checking entry or exit evidence.
- Locked contracts live in product, technical, security, QA, and pitch docs. Packets cite those docs instead of copying them wholesale.
- A packet may not redefine role permissions, provider, API shape, schema contract, OCR review gate, AI safety rule, or SOS delivery.
- All demo data and files are synthetic.
- No packet becomes `Done` because documentation or code exists. Verification is required.
- Commit and push happen only when the human asks.
- If a packet grows past one focused session, split it before implementation.

## Packet File Template

Each packet file must contain:

- `Status`
- `Driver / DRI`
- `Role Work`
- `Goal`
- `User-Visible or Technical-Visible Outcome`
- `Covered Canonical Sources`
- `Dependency Inputs`
- `Hard Dependencies`
- `Soft Dependencies / Parallel Prep`
- `Allowed Files / Areas`
- `Out of Scope`
- `Acceptance Criteria`
- `Automated Checks`
- `Manual QA`
- `Documentation Update Rules`
- `Blockers / Stop Conditions`
- `Handoff Notes`

`Covered Canonical Sources` must be intentionally small. Do not make every packet read every document. Always include `AGENTS.md`, this index, and the selected packet file, then add only the product/technical/security docs needed by that packet.

## Implementation Entry Protocol

When the human says "implement packet X":

1. Read `AGENTS.md`.
2. Read this index.
3. Read only the selected packet and its `Covered Canonical Sources`.
4. Confirm `/web/package.json` and available scripts before running commands.
5. Confirm dependency inputs and blockers before editing.
6. Preserve all user edits and unrelated files.
7. Report unavailable checks honestly.

Do not start from older deleted packet filenames. The current packet directory is `docs/execution/packets/`, and the implementable packet set is 01 through 13 in the table above.

## Implementable Packet Criteria

A packet is sized correctly when it has:

- One main goal.
- One clear user-visible or technical-visible result.
- Limited file areas.
- Five to ten acceptance criteria.
- No new product/provider decision.
- A simple automated or manual verification path.
- An isolated failure mode.

If a packet combines auth, database, UI, AI, OCR, Realtime, deploy, and QA, it is too large.

## Automated Check Rules

- Packet 01 creates the command baseline.
- Later packets must verify commands exist in `web/package.json` before running them.
- If a command is unavailable, report `Unavailable` with reason. Do not mark it as passed.
- If provider credentials are unavailable, run fixture/fallback checks only when the packet explicitly permits that fallback.
- `Not Run` is not `Pass`.

## Documentation Update Rules

- Do not update canonical product/API/data/architecture docs unless implementation intentionally changes a locked contract and the task allows that doc update.
- If final file, function, route, or test names differ from planning docs but the contract is unchanged, record the difference in the implementation handoff.
- Update packet status only with evidence from checks or manual QA.
- Do not add speculative implementation claims to `README.md`, `AGENTS.md`, or pitch docs.

## Global Checks After Scaffold

Run from `/web` when scripts exist:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Run `npm run test:e2e` when the packet adds or changes a user journey.

## Status Change Record

| Packet | From | To | Timestamp | Evidence | Approved by |
| --- | --- | --- | --- | --- | --- |
| 08 | Draft | Done | 2026-07-17 14:42 +07:00 | Human team review accepted the Packet 08 caregiver dashboard and daily-care flow; Prisma generate/validate/migration status and synthetic seed passed, lint/typecheck/build passed, 186 unit/integration tests and the Packet 08 desktop/mobile E2E journey passed, with two pre-existing repo-wide E2E assertions remaining separately documented | Human team review |
| 07 | Review | Done | 2026-07-17 10:54 +07:00 | Ozan completed human manual acceptance; fresh closure evidence passed 17 focused check-in tests and 1 mobile/desktop Patient Playwright journey, with all eight P7 acceptance criteria satisfied | Ozan |
| 05 | Done | Done | 2026-07-17 10:33 +07:00 | Corrective P5 completion adds Owner-only hash-only Patient-code issue/rotation, one-time display, collision avoidance, old code/session revocation, Family denial, 141 unit/integration tests, 18 live E2E without skip, responsive QA, and synthetic cleanup | Ozan |
| 07 | Ready | Review | 2026-07-17 06:51 +07:00 | Bound `/patient` check-in UI/API, locked Prisma model/migration, role and safety reviews, 101 unit tests, 15 E2E without skip, build, database constraints, cross-profile denial, responsive checks, and zero remaining QA fixtures passed; final human acceptance remains | Ozan |
| 07 | Draft | Ready | 2026-07-17 06:21 +07:00 | P6 lifecycle exclusion is Done; the locked CheckIn contract and P7 schema allowance, P5 bound Patient session helpers, ignored local env, clean resettable profiles, and development database are available | Ozan |
| 06 | Review | Done | 2026-07-17 06:21 +07:00 | All 8 acceptance criteria passed; Daniel/Al/Ozan reviews, 84 unit tests, 14 E2E without skip, live role/revocation/history/audit QA, responsive keyboard checks, seed reset, and secret scan passed | Ozan |
| 06 | Ready | Review | 2026-07-17 06:21 +07:00 | Commit `157892b` plus current QA corrections provide Owner-only atomic deactivation, careful UI states, active-list exclusion, access revocation, deterministic reset, and reviewable evidence | Ozan |
| 06 | Draft | Ready | 2026-07-17 04:09 +07:00 | P5 profile isolation is Done; P3 lifecycle/code/session fields, P4 Owner guard, ignored local env, and resettable synthetic fixtures are available; profile-wide atomic revocation remains explicit P6 scope | Ozan |
| 05 | Review | Done | 2026-07-17 04:09 +07:00 | All 14 acceptance criteria passed; Daniel/Al/Ozan reviews, 72 unit tests, 14 E2E with no skip, build, responsive role QA, bidirectional Maya/Raka denial, DTO privacy, and tracked-secret/database-cleanliness scans passed | Ozan |
| 05 | Ready | Review | 2026-07-17 04:09 +07:00 | Commit `a2bf438` plus current QA corrections provide minimum profile API/UI, hash-verified Patient login, bound sessions, progressive states, and reviewable isolation evidence | Ozan |
| 05 | Draft | Ready | 2026-07-17 02:25 +07:00 | P4 auth/membership boundary is Done; P3 Maya/Raka profiles and hash-only code fixtures exist; ignored local Patient session secret and database inputs are present; usable synthetic Patient codes remain explicit P5 scope | Ozan |
| 04 | Review | Done | 2026-07-17 02:25 +07:00 | All 8 acceptance criteria passed; Daniel/Al/Ozan reviews, 45 unit tests, 7 live E2E/responsive checks, build, role-spoof/denial tests, Auth-user audit, logout verification, and secret/artifact scans passed | Ozan |
| 04 | Ready | Review | 2026-07-17 02:25 +07:00 | Commit `1a3c89c` plus current P4 QA corrections provide server auth context, membership/Owner guards, caregiver login UI, generic states, and reviewable automated/manual evidence | Ozan |
| 04 | Draft | Ready | 2026-07-17 01:26 +07:00 | P3 migration/seed verified and Done; Supabase Auth identities and ignored local env are available; typed core env validation passes; caregiver demo-password establishment remains in P4 scope | Ozan |
| 03 | Review | Done | 2026-07-17 01:26 +07:00 | All 12 acceptance criteria passed; migration current; seed passed twice; database constraints, 33 tests, lint, typecheck, build, e2e regression, privacy scan, and Daniel/Al/Ozan reviews passed | Ozan |
| 03 | Ready | Review | 2026-07-17 01:18 +07:00 | Commit `9c5daf3` provides schema, migration, seed, DB/fact helpers, audit helper, and tests; independent domain and QA review started | Ozan |
| 03 | Draft | Ready | 2026-07-16 23:51 +07:00 | P2 merged to `dev`; all domain reviews approved; ignored `web/.env` and Supabase dev are available; Prisma generate/validate pass and migrate status reaches the expected empty migration baseline through `DIRECT_URL` | Ozan |
| 02 | Draft | Done | 2026-07-16 23:22 +07:00 | Typed public/server env parsing, real server-only Supabase/Azure factories, labeled OCR fallback, 23 unit tests, client-import rejection, lint/typecheck/build/e2e, responsive shell QA, and secret scan passed without credentials | Ozan |
| 01 | Done | Done | 2026-07-16 23:22 +07:00 | Regressed successfully after Packet 02 and progressive-profile documentation: install, lint, typecheck, 23 unit tests, 3 e2e tests, build, six responsive route checks, and secret scan passed | Ozan |
| 01 | Draft | Done | 2026-07-16 21:26 +07:00 | Latest P1 baseline verified: `/web` scaffold, locked scripts, shell routes, install/lint/typecheck/test/build/e2e, manual responsive QA, and secret scan passed | Ozan |
| All | Draft | Draft | 2026-07-16 | At the time of packet restructuring, the app did not yet exist; 13 one-prompt-sized packets were prepared | Human request |

## Change Log

| Date | Change | Reason | DRI | Reviewer |
| --- | --- | --- | --- | --- |
| 2026-07-16 | Added progressive Patient Profile data semantics to Packets 03, 05, 08, 09, and 11 | Carry the approved unknown/none/reported contract through schema, profile API, dashboard, document privacy copy, and AI context | Ozan | Bernard |
| 2026-07-16 | Refined execution packet structure from 9 to 13 packets and added role work, dependency inputs, automated checks, documentation rules, blockers, and covered canonical sources | Make each packet good for one focused implementation prompt while preserving the 30-hour demo path | Ozan | Bernard |
| 2026-07-16 | Updated packet index for Patient Profile, diabetes tipe 2 demo context, and profile deactivation scope | Challenge update and human scope verdict | Ozan | Bernard |
