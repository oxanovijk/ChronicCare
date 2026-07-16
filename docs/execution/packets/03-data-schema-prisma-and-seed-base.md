# Packet 03: Data Schema, Prisma, and Seed Base

Status: Done

Driver / DRI: Bernard

Contributors: Ozan, Daniel

Consulted: Al

Reviewer: Ozan

Timebox: hours 5 to 7

## Role Work

- Role A - Schema/data, DRI: Bernard: implement minimum Prisma schema, progressive profile fact statuses, database helpers, and constraints needed for identity, Care Circle, Patient Profile, sessions, and audit.
- Role B - Seed/demo data, DRI: Ozan: define synthetic Owner, Family Member, Maya, and Raka seed records with diabetes tipe 2 as demo scenario only.
- Role C - UI data needs, DRI: Daniel: confirm seed labels and profile fields are enough for Patient/caregiver UI without adding future features.
- Role D - Privacy review, DRI: Al: review that seed data and audit fields do not include real sensitive data.

## Goal

Implement the minimum database schema, explicit unknown/none/reported semantics, and synthetic seed foundation needed before auth, Patient access, and feature packets.

## Technical-Visible Outcome

Prisma can generate a typed client for core identity/profile data, preserve unknown facts without false defaults, and create synthetic demo records without real family or credential data.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/03-data-schema-prisma-and-seed-base.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/security-privacy.md`
- `docs/technical/env-and-deploy.md`

## Dependency Inputs

- Completed Packet 02 env/provider boundary.
- Supabase development PostgreSQL is provisioned by Bernard and its connection values are available in untracked `web/.env`.
- Synthetic demo names, profile assumptions, schema/API contract, UI data needs, and AI/OCR privacy behavior are approved by Bernard, Daniel, and Al.
- Real provider values remain only in untracked env files.

## Entry Readiness Evidence

- Packet 02 is `Done` and its PR has been merged into `dev`.
- Bernard confirmed the Supabase development project is provisioned.
- Bernard approved the schema, API, Prisma mapping, and database constraints.
- Daniel approved the Patient Profile fields, sparse states, seed labels, and UI suitability.
- Al approved synthetic seed privacy, audit minimization, and sparse AI/OCR context handling.
- `web/.env` exists locally, is ignored by Git, and was not inspected during readiness verification.
- `web/prisma.config.ts` loads `web/.env` through `dotenv/config` and uses `DIRECT_URL` for Prisma CLI operations.
- Fresh `db:generate` and `prisma validate` checks pass; `prisma migrate status` reaches the Supabase development database and reports the expected pre-Packet-03 state of no migrations.

## Hard Dependencies

- Packet 01 must provide scripts and test harness.
- Packet 02 must provide env validation.

## Soft Dependencies / Parallel Prep

- Ozan can prepare seed verification checklist while Bernard works on schema.
- Daniel can prepare UI copy using seed display names.
- Al can prepare OCR/AI privacy notes for future context fields.

## Allowed Files / Areas

- `web/prisma/`
- `web/prisma.config.ts`
- `web/src/lib/db/`
- `web/src/lib/seed/`
- `web/src/lib/audit/`
- `web/tests/**/db*`
- `web/tests/**/seed*`
- `web/tests/**/profile-fact*`

## Out of Scope

- Caregiver auth session parsing.
- Patient code login behavior.
- Daily-care, document/OCR, chatbot, SOS, and faskes feature implementation.
- Production seed data.
- RLS policy finalization beyond what is needed for local Prisma access.

## Acceptance Criteria

- Prisma models cover core users, Care Circles, memberships, Patient Profiles, Patient access codes/sessions, and audit events.
- `profile_fact_status` and `bpjs_membership_status` match the locked data model.
- Patient Profile can be created with minimum identity while all optional fact statuses default to `UNKNOWN`.
- Database checks reject contradictory condition, allergy, emergency-contact, and BPJS status/value combinations.
- Patient Profile stores only optional `bpjs_number_last4`; full BPJS number is not modeled.
- Patient Profile status and deactivation fields match the locked data model.
- Constraints or server helpers prevent second active Owner and third active Patient Profile for the MVP Care Circle.
- Seed creates synthetic Owner, Family Member, Maya Pratama with diabetes tipe 2 context, and Raka Pratama with distinct chronic-care context including at least one `UNKNOWN` optional fact.
- Patient access code fixtures are stored as hashes, not raw reusable secrets.
- Audit helper records actor/action/target without sensitive payload values.
- `db:generate` works or a database blocker is documented with exact reason.
- No seed, migration, fixture, log, or screenshot contains real family data.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm run db:generate` from `/web` | Prisma client generation succeeds. |
| `npm run lint` from `/web` | Schema helpers and seed scripts lint cleanly. |
| `npm run typecheck` from `/web` | Prisma types and seed helpers compile. |
| `npm test -- seed` from `/web` if supported | Seed helpers create expected synthetic records and constraints. |
| `npm test -- profile-facts` from `/web` if supported | Minimum-create defaults, contradictory fact states, and BPJS last-four validation behave as locked. |

## Manual QA

- Inspect seed values for synthetic names, contacts, health notes, and access codes.
- Confirm `.env` remains untracked.
- Confirm schema names use `PatientProfile` / `patientProfileId`, not legacy parent terminology.
- Confirm Maya and Raka demonstrate both recorded and unknown fact states without using real data.
- Confirm no empty array is labeled `NONE_REPORTED` unless explicitly seeded that way.
- Confirm audit helper does not duplicate sensitive document, prompt, token, or health content.

## Exit Review Evidence

Implementation reviewed: commit `9c5daf3` on branch `P3`.

### Domain Sign-Off

| Reviewer role | Verdict | Evidence |
| --- | --- | --- |
| Daniel - UI/data | Pass | Minimum identity fields support progressive onboarding; `UNKNOWN`, `NONE_REPORTED`, and `REPORTED` are distinguishable; Maya/Raka provide recorded and sparse states suitable for profile switching, setup-checklist, and upcoming dashboard work. |
| Al - privacy/minimization | Pass | Seed identities and health context are synthetic; generated caregiver passwords are not logged or committed; Patient fixtures store Argon2id hashes only; audit summaries are derived from bounded labels and accept no free-form sensitive payload. |
| Ozan - QA/product | Pass | All acceptance criteria below were independently checked against source, the configured development Supabase, fresh commands, rollback-only constraint mutations, and tracked-file secret scans. |

### Acceptance Criteria Verdict

| # | Verdict | Evidence |
| --- | --- | --- |
| 1 | Pass | Prisma defines `User`, `CareCircle`, membership/invitation, `PatientProfile`, Patient access code/session, and `AuditEvent` models. |
| 2 | Pass | PostgreSQL and Prisma enums match the locked `profile_fact_status` and `bpjs_membership_status` values. |
| 3 | Pass | Model defaults and `minimumPatientProfileFacts` keep optional fact and BPJS states `UNKNOWN`; unit coverage passes. |
| 4 | Pass | Rollback-only database mutations confirmed condition, allergy, emergency-contact, BPJS state, and BPJS last-four checks reject contradictions. |
| 5 | Pass | Only nullable `bpjs_number_last4` is modeled; no full BPJS-number field exists. |
| 6 | Pass | Patient lifecycle status, reason, note, actor, timestamp, and non-destructive deletion fields match the locked model. |
| 7 | Pass | A real mutation of the Family Member to a second active Owner and insertion of a third non-deleted Patient Profile were rejected and rolled back. |
| 8 | Pass | Repeated seed runs leave one synthetic Care Circle, two members, Maya with diabetes tipe 2 context, and Raka with distinct chronic-care and `UNKNOWN` states. Medication remains `UNKNOWN` until Packet 08 creates an active Medication row. |
| 9 | Pass | Both seeded Patient access-code records contain Argon2id-shaped hashes; no reusable raw Patient code is committed or logged. |
| 10 | Pass | `writeAuditEvent` records actor/action/target metadata and derives its summary from restricted labels; unit and database actor-constraint checks pass. |
| 11 | Pass | `npm run db:generate` and `prisma validate` pass; migration status reports the development database is up to date. |
| 12 | Pass | Source and database inspection found only the locked fictional personas and invented health context; tracked-file scans found no credentials or real family data. |

### Fresh Command Evidence

| Command/check | Result |
| --- | --- |
| `npm run db:generate` | Pass; Prisma Client 7.8.0 generated. |
| `npx prisma validate` | Pass; schema valid. |
| `npm run db:migrate` | Pass; development Supabase already in sync. |
| `npx prisma migrate status` | Pass; one migration found and database up to date. |
| `npm run db:seed` twice | Pass twice; seed is idempotent. |
| Database inspection and rollback-only mutations | Pass; expected counts/states/hashes and eight constraint scenarios verified without persistent test mutations. |
| `npm run lint` | Pass. |
| `npm run typecheck` | Pass. |
| `npm test` | Pass; 33 tests in 7 files. |
| `npm run build` | Pass; all shell routes prerender. |
| `npm run test:e2e` | Pass; 3 shell-route regression tests. Not required by P3, run as regression evidence. |
| Env/secret scan | Pass; `web/.env` exists and is ignored, `PATIENT_SESSION_SECRET` is at least 32 bytes, and no tracked credential-like value was found. |

No P3 implementation blocker or deferred correction remains. `db:deploy`,
Vercel deployment, production migration/seed, and feature UI QA remain outside
Packet 03.

## Documentation Update Rules

- Do not change `docs/technical/data-model.md` unless implementation intentionally changes a locked schema contract and human allows the doc update.
- If database constraint names differ from the docs but behavior matches, record actual names in handoff.
- Do not update README to claim app features exist.

## Blockers / Stop Conditions

- Supabase/local database connection is unavailable and Prisma generation cannot be verified.
- Locked data model contains unresolved `Parent Profile` terminology that blocks safe implementation.
- A schema decision would change role permissions, retention, profile limits, or provider assumptions.
- Fact status/value consistency cannot be enforced without silently deleting or inventing data.
- Seed requires real personal/family/health data.

## Handoff Notes

Report migration/generation status, core model names, fact/BPJS enum names, constraint tests, seed command/result, synthetic account lookup strategy, audit helper names, and blockers. Packet 04 and Packet 05 must use these helpers instead of duplicating identity/profile logic; Packet 05 builds the derived setup checklist.

Final handoff:

- Prisma client: `web/src/lib/db/client.ts`.
- Fact validation: `minimumPatientProfileFacts` and `patientProfileFactsSchema`.
- Audit helper: `writeAuditEvent`.
- Seed lookup: fixed synthetic emails under `chronicare.example`; usable caregiver demo passwords are intentionally established during Packet 04.
- Patient access fixtures: hash-only baseline; usable Patient codes are intentionally established during Packet 05.
- Migration: `20260716173215_packet_03_core_schema`, applied and current on the configured development Supabase.
- Blockers: none.
