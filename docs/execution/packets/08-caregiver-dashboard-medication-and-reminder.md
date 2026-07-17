# Packet 08: Caregiver Dashboard, Medication, and Reminder

Status: Done

Driver / DRI: Daniel

Contributors: Bernard, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 14 to 16

## Role Work

- Role A - Caregiver UI, DRI: Daniel: build informative active-profile dashboard, setup checklist, medication/reminder panels, and daily-care states.
- Role B - Daily-care API/data, DRI: Bernard: implement profile-bound caregiver reads/writes for dashboard, derived setup checklist, medication text, reminders, and check-in summary.
- Role C - Demo QA, DRI: Ozan: verify Maya/Raka switching, Owner/Family Member access, and dashboard readiness for later packets.
- Role D - Safety consult, DRI: Al: review medication/reminder copy so it does not recommend dosing or treatment changes.

## Goal

Build the caregiver dashboard daily-care core for active Patient Profile context, medication text/log basics, and reminder states.

## User-Visible Outcome

Caregiver can see the latest Patient check-in, medication/reminder basics, and clear next actions for the active Patient Profile without cross-profile leakage.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/08-caregiver-dashboard-medication-and-reminder.md`
- `docs/product/user-journeys.md`
- `docs/product/feature-scope.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Completed Packet 05 profile switching and isolation.
- Completed Packet 07 check-in data exists or empty state is acceptable.
- Owner/Family Member authorization from Packet 04 works.
- Medication/reminder scope remains basic text/state, not clinical dose logic.

## Hard Dependencies

- Packet 04 caregiver authorization must exist.
- Packet 05 active Patient Profile switching must exist.
- Packet 07 check-in flow should exist or be explicitly unavailable with empty state.

## Soft Dependencies / Parallel Prep

- Daniel can prepare dashboard shell and empty states while Bernard builds daily-care selectors.
- Ozan can prepare two-profile manual QA matrix.
- Al can prepare medication/dose copy review.

## Allowed Files / Areas

- `web/src/app/(caregiver)/`
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/dashboard/`
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/medications/`
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/reminders/`
- `web/src/components/caregiver/`
- `web/src/components/daily-care/`
- `web/src/lib/daily-care/`
- `web/prisma/` only if medication/reminder models were not already added
- `web/tests/**/daily-care*`
- `web/tests/e2e/**/caregiver*`

## Out of Scope

- OCR/document upload.
- Chatbot generation.
- SOS event creation.
- Facility helper implementation.
- Complex charts, live monitoring, dose calculator, lab interpretation, or diet/pantangan advice.
- Multi-Care Circle management.

## Acceptance Criteria

- Caregiver dashboard shows active Patient Profile clearly.
- Dashboard shows latest check-in, medication text/log basics, reminder state, and clear empty states.
- Dashboard distinguishes `Belum diketahui`, explicit `Tidak ada yang dilaporkan`, and a recorded value.
- Setup checklist is compact, advisory, and does not block daily-care, document, chatbot, or SOS entry points.
- Creating/reactivating an active Medication sets `currentMedicationsStatus = REPORTED` atomically.
- Pausing/ending the last active Medication sets `currentMedicationsStatus = UNKNOWN`, not `NONE_REPORTED`.
- Owner and Family Member can perform only allowed daily-care actions.
- Profile switching updates dashboard data without stale Maya/Raka leakage.
- Patient cannot access caregiver dashboard or daily-care admin routes.
- UI copy never recommends medication, dose changes, lab targets, or diagnosis.
- Dashboard includes stable entry placeholders or routes for documents, chatbot, SOS, and faskes without claiming incomplete features work.
- Tests cover profile isolation for daily-care reads and writes.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- daily-care` from `/web` if supported | Active profile reads/writes isolate Maya/Raka and enforce role permissions. |
| `npm run typecheck` from `/web` | Dashboard and daily-care API types compile. |
| `npm run lint` from `/web` | Caregiver dashboard code lint cleanly. |
| `npm run test:e2e` from `/web` if caregiver E2E exists | Caregiver dashboard and profile switching path passes. |

## Manual QA

- Submit Maya check-in from Patient flow and view it on caregiver dashboard.
- Switch to Raka and confirm Maya data disappears.
- Add/update medication/reminder text where allowed.
- Verify an empty Medication list with status `UNKNOWN` is not labeled as `tidak ada obat`.
- Verify an explicit `NONE_REPORTED` state uses qualified caregiver-reported wording.
- Verify profile PATCH cannot set `REPORTED` without an active Medication.
- Confirm Family Member cannot perform Owner-only actions.
- Check 390x844 and 1440x900 layouts.

## Documentation Update Rules

- Do not add medication/dose semantics to product docs.
- If daily-care fields differ from locked data model, stop for human verdict before changing docs.
- Record incomplete placeholder routes clearly in handoff.

## Blockers / Stop Conditions

- Profile switching leaks stale daily-care data.
- Daily-care schema conflicts with locked data model.
- UI drifts into analytics or medical interpretation.
- Dashboard cannot support later document/chatbot/SOS entry points.

## Handoff Notes

Provide dashboard route paths, setup checklist component/selector names, daily-care selector names, active profile state source, sparse-state tests, and known placeholder entry points. Packet 09 uses the dashboard document entry; Packet 11 uses daily-care context.
