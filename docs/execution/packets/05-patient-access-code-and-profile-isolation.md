# Packet 05: Patient Access Code and Profile Isolation

Status: Draft

Driver / DRI: Bernard

Contributors: Daniel, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 9 to 10.5

## Role Work

- Role A - Patient session/API, DRI: Bernard: implement Patient access code verification, profile-bound session, and authorization helpers.
- Role B - Profile UX, DRI: Daniel: implement caregiver active Patient Profile switching and Patient login/session states.
- Role C - Isolation QA, DRI: Ozan: verify Maya/Raka separation, wrong-code behavior, and wrong-role access.
- Role D - Privacy consult, DRI: Al: review that no hidden profile/context can be exposed to AI/OCR later.

## Goal

Implement Patient access code login and explicit Patient Profile isolation for both caregiver profile switching and Patient mode.

## User-Visible Outcome

Caregiver can switch Maya/Raka safely, and a Patient code opens exactly one bound Patient experience without exposing caregiver UI or another Patient Profile.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/05-patient-access-code-and-profile-isolation.md`
- `docs/product/user-journeys.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Completed Packet 04 caregiver auth and membership helpers.
- Seeded Maya and Raka Patient Profiles and hashed access-code fixture.
- Confirmed cookie/session naming from API docs.
- No real patient/family data is used.

## Hard Dependencies

- Packet 03 core schema and seed base must exist.
- Packet 04 caregiver auth and membership authorization must exist.

## Soft Dependencies / Parallel Prep

- Daniel can design profile switch loading/empty/error states while Bernard builds session helpers.
- Ozan can prepare wrong-profile and wrong-role QA matrix.
- Al can prepare hidden-context leak checks for later AI packet.

## Allowed Files / Areas

- `web/src/lib/auth/`
- `web/src/lib/patient-profile/`
- `web/src/app/api/v1/auth/patient-code/`
- `web/src/app/api/v1/patient-profiles/`
- `web/src/app/(patient)/`
- `web/src/app/(caregiver)/`
- `web/src/components/profile/`
- `web/tests/**/patient-session*`
- `web/tests/**/profile-isolation*`

## Out of Scope

- Daily-care check-in.
- Medication/reminder behavior.
- Document upload/OCR.
- Chatbot.
- SOS.
- Facility helper.
- Owner-only profile deactivation.
- Third Patient Profile or multi-Care Circle.

## Acceptance Criteria

- Patient access code is verified against hashed storage and returns generic errors for wrong/expired codes.
- Patient session is bound to exactly one `patientProfileId`.
- Patient session cannot open caregiver routes, caregiver APIs, documents admin, membership, settings, or another Patient Profile.
- Caregiver active profile switching clears stale Maya/Raka state.
- Every patient-bound API helper requires explicit `patientProfileId` and server authorization.
- Client-supplied role, `careCircleId`, and `patientProfileId` are never trusted without server validation.
- Tests cover Maya/Raka read denial, wrong code, expired/revoked code, caregiver profile switch, and Patient trying caregiver route.
- Browser logs and errors do not reveal access code validity or hidden profile details.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- patient-session` from `/web` if supported | Valid code creates bound session; invalid/expired code rejects safely. |
| `npm test -- profile-isolation` from `/web` if supported | Maya/Raka cross-profile access is denied. |
| `npm run typecheck` from `/web` | Patient session and profile helper types compile. |
| `npm run lint` from `/web` | Auth/profile code lint cleanly. |
| `npm run test:e2e` from `/web` if profile routes exist | Patient login and caregiver profile switch happy/negative paths pass. |

## Manual QA

- Log in as caregiver and switch Maya to Raka and back.
- Log in with Maya Patient code and try to open Raka route directly.
- Try wrong, expired, or revoked Patient code and confirm generic copy.
- Confirm Patient UI is simpler than caregiver UI and has no admin/document/member access.

## Documentation Update Rules

- Do not change role/access docs unless a locked permission changes and human allows it.
- If final cookie/session names differ from API docs, stop before changing docs.
- Record route/helper names in handoff if they differ from planning.

## Blockers / Stop Conditions

- Patient session cannot be isolated from caregiver session utilities.
- Profile switching leaks stale data.
- Generic error copy cannot hide whether a profile/code exists.
- Any implementation would allow Patient to access caregiver UI.

## Handoff Notes

Provide active profile type, Patient session helper names, route paths, cookie/session behavior, test evidence, and Maya/Raka isolation proof. Packet 06 and daily-care packets must reuse these helpers.

