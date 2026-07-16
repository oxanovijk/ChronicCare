# Packet 03: Data Schema, Prisma, and Seed Base

Status: Ready

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
