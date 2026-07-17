# Packet 07: Patient Homepage and Check-In

Status: Done

Driver / DRI: Daniel

Contributors: Bernard, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 12 to 14

## Role Work

- Role A - Patient UI, DRI: Daniel: build cheerful, simple Patient homepage, check-in form, and patient-safe copy.
- Role B - Check-in API/data, DRI: Bernard: implement profile-bound check-in read/write using existing Patient session helpers.
- Role C - Journey QA, DRI: Ozan: verify Patient login to check-in path and diabetes tipe 2 demo copy boundaries.
- Role D - Safety consult, DRI: Al: review that check-in copy does not become clinical diagnosis, dosing, or emergency handling.

## Goal

Build the Patient homepage and one simple chronic-care check-in flow for the bound Patient Profile.

## User-Visible Outcome

Patient sees a warm, cheerful homepage and can submit a simple check-in that belongs only to their active Patient Profile.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/07-patient-homepage-and-check-in.md`
- `docs/product/user-journeys.md`
- `docs/product/feature-scope.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Completed Packet 05 Patient session and profile isolation.
- Deactivated profiles are excluded by Packet 06 or documented as unavailable.
- Check-in fields are limited to locked MVP needs.
- Diabetes tipe 2 is demo context only.

## Entry Readiness Evidence

- Packet 06 is `Done`; deactivated profiles are excluded from active profile
  reads, Patient auth, and active caregiver selection.
- The locked data model already defined `CheckIn`, but Packet 03 implementation
  did not include its Prisma model/table. P7's Allowed Files explicitly permit
  adding it here, so this was an implementation gap rather than a new data-model
  decision or entry blocker.
- Packet 05 provides profile-bound Patient login/session helpers and explicit
  wrong-profile denial that P7 must reuse.
- Packet 05 corrective completion also provides the Owner-only Patient-code
  producer/UI required to enter that bound login journey without local fixture
  knowledge; P7 itself remains responsible only for homepage and check-in.
- Ignored local Patient/caregiver demo inputs and the development database are
  available; Maya and Raka are active, clean, and resettable through seed.
- P7 must add the locked check-in API/UI and deactivated-profile write denial;
  these are normal implementation scope, not entry blockers.
- No hard blocker or unresolved soft dependency remains.

## Hard Dependencies

- Packet 03 schema/seed base must exist.
- Packet 05 Patient access/session helpers must exist.
- Packet 06 lifecycle exclusion must exist.

## Soft Dependencies / Parallel Prep

- Bernard can prepare check-in schema/API while Daniel builds UI states.
- Ozan can prepare mobile happy-path QA.
- Al can prepare safe copy review for symptom/emergency copy.

## Allowed Files / Areas

- `web/src/app/patient/`
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/check-ins/`
- `web/src/components/patient/`
- `web/src/components/daily-care/`
- `web/src/lib/daily-care/`
- `web/prisma/` only if check-in model was not already added
- `web/tests/**/check-in*`
- `web/tests/e2e/**/patient*`

## Out of Scope

- Caregiver dashboard.
- Medication and reminder management.
- Document upload/OCR.
- Chatbot.
- SOS implementation.
- Facility helper.
- Medical interpretation of check-in symptoms.

## Acceptance Criteria

- Patient homepage shows the correct Patient Profile name/state from the bound session.
- Patient can submit one simple check-in only for the bound `patientProfileId`.
- Check-in form has loading, success, empty, validation, and error states.
- Check-in copy is cheerful and supportive but does not diagnose, prescribe, or adjust medication.
- Possible emergency copy routes toward SOS/IGD/family help without long conversation.
- Deactivated Patient Profile cannot submit check-in.
- Tests cover profile-bound write and wrong-profile denial.
- Mobile layout at 390x844 is usable without dense caregiver-style controls.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- check-in` from `/web` if supported | Bound Patient can write; wrong profile and deactivated profile are denied. |
| `npm run typecheck` from `/web` | Check-in route/UI types compile. |
| `npm run lint` from `/web` | Patient homepage and check-in code lint cleanly. |
| `npm run test:e2e` from `/web` if patient E2E exists | Patient login to check-in happy path passes. |

## Implementation and Role Review Evidence

Evidence captured on 2026-07-17:

- Daniel review: `/patient` now presents the bound profile, inline check-in,
  progressive optional details, recent-history loading/empty/error/success
  states, keyboard focus recovery, and usable 390x844 and 1440x900 layouts.
- Bernard review: migration `20260717064000_packet_07_check_ins` implements the
  locked fields, submitter and pain constraints, descending profile/time index,
  active-profile checks, explicit `patientProfileId`, same-origin mutation,
  bound-Patient/Care Circle authorization, whitelist DTOs, and minimal audit.
- Al review: copy does not diagnose, prescribe, change dose, interpret labs, or
  provide diet advice. Explicit urgent phrases produce only a short route to
  family/caregiver or medical/IGD help and do not claim that SOS was sent.
- Ozan review: Prisma generate/validate/migrate/status, constraint probes, 101
  unit tests, lint, typecheck, production build, and 15 E2E tests passed without
  skip. Maya-to-Raka POST returned a generic 403; synthetic check-in/audit QA
  records were removed and the remaining fixture count was zero.
- Human acceptance completed by Ozan on 2026-07-17 after manual QA of the
  synthetic Patient journey. Fresh closure checks also passed: 17/17 focused
  check-in tests and the Patient mobile/desktop Playwright journey (1/1).
- All eight acceptance criteria are satisfied and no P7 blocker remains.

## Manual QA

- Log in with Maya Patient code and submit a simple diabetes routine check-in.
- Try direct Raka check-in route from Maya session and confirm denial.
- Confirm check-in copy does not include dose, lab target, diagnosis, or diet/pantangan advice.
- Check mobile viewport first, then 1440x900.

## Documentation Update Rules

- Do not update product docs to add new check-in fields without human verdict.
- If API route names differ from `docs/technical/api.md`, record in handoff and ask before changing canonical API docs.
- Do not mark caregiver dashboard as complete from this packet.

## Blockers / Stop Conditions

- Patient session/profile isolation from Packet 05 is not reliable.
- Check-in requires new medical data fields not in locked scope.
- Copy would create clinical or emergency overclaim.
- Deactivated profile state cannot be enforced.

## Handoff Notes

Report Patient route paths, check-in API names, fields saved, tests run, mobile QA evidence, and safe-copy notes. Packet 08 consumes check-in data for caregiver dashboard.
