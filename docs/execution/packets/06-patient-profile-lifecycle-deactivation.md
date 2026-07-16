# Packet 06: Patient Profile Lifecycle Deactivation

Status: Ready

Driver / DRI: Bernard

Contributors: Daniel, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 10.5 to 12

## Role Work

- Role A - Lifecycle/API, DRI: Bernard: implement Owner-only non-destructive profile deactivation and Patient access revocation.
- Role B - Careful UX copy, DRI: Daniel: design the guarded action copy without using harsh internal language or implying real subscription cancellation.
- Role C - Destructive-action QA, DRI: Ozan: verify confirmation, denial, audit, and demo reset/fallback behavior.
- Role D - Privacy consult, DRI: Al: review retention wording and ensure hidden/deactivated profile data is not exposed to future AI/OCR context.

## Goal

Implement the MVP end-of-care lifecycle flow for a Patient Profile as an Owner-only, non-destructive deactivation action.

## User-Visible Outcome

Owner can safely remove a Patient Profile from active care flows with careful copy, while existing history is retained and Patient access is revoked.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/06-patient-profile-lifecycle-deactivation.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Completed Packet 05 profile isolation and Patient session helpers.
- A resettable synthetic profile fixture exists for lifecycle testing.
- Human verdict: end-of-care/deactivate profile is in MVP; subscription/payment remains dummy/contextual only.

## Entry Readiness Evidence

- Packet 05 is `Done`; Patient sessions are profile-bound, cross-profile access
  is denied in both directions, and caregiver profile selection uses active
  server-authorized profiles.
- Packet 03 already provides `PatientStatus`, deactivation reason/note/actor/time
  fields, `PatientAccessCode.status`, and `PatientSession.revokedAt`; no schema
  migration is required to begin P6.
- Packet 04 provides server-resolved membership context and `requireOwner`;
  Family Member and Patient denial can be enforced without trusting client
  roles.
- P5 provides `resolvePatientAuthContext`, `requireBoundPatientProfile`, and
  current-session revocation. P6 will add the locked profile-wide atomic
  revocation of active codes and sessions in the lifecycle transaction.
- Maya and Raka remain resettable synthetic fixtures. P6 manual QA must use a
  temporary/resettable profile and leave both main demo profiles active.
- The ignored local database inputs and `PATIENT_SESSION_SECRET` are available;
  no credential needs to be committed or exposed.
- No hard blocker or unresolved soft dependency remains. Confirmation copy,
  lifecycle API/service, audit action, active-list exclusion, and reset proof
  remain normal P6 implementation work.

## Hard Dependencies

- Packet 03 status/deactivation fields must exist.
- Packet 04 Owner/Family Member authorization must exist.
- Packet 05 Patient access/session revocation path must exist.

## Soft Dependencies / Parallel Prep

- Daniel can prepare confirmation and success/error copy while Bernard implements endpoint.
- Ozan can prepare a test fixture that is not the main demo profile.
- Al can prepare AI-context exclusion notes for deactivated profiles.

## Allowed Files / Areas

- `web/src/lib/patient-profile/`
- `web/src/lib/auth/`
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/lifecycle/`
- `web/src/app/(caregiver)/`
- `web/src/components/profile/`
- `web/tests/**/profile-lifecycle*`
- `web/tests/**/deactivation*`

## Out of Scope

- Hard delete of Patient Profile history.
- Real subscription cancellation or payment integration.
- Restoring archived profiles unless already documented in the data model.
- Deleting documents, audit records, or historical care logs.
- Deactivating the only demo-critical profile during rehearsal without reset plan.

## Acceptance Criteria

- Owner can trigger a guarded action such as `Akhiri perawatan profil` / `Nonaktifkan profil`.
- Family Member and Patient are denied server-side.
- Action is non-destructive: historical data remains stored but excluded from active flows.
- Active Patient access codes and sessions for the profile are revoked.
- Deactivated profile cannot be selected as active Patient Profile.
- The UI explains this is not real subscription/payment cancellation.
- Audit records actor, target, action, and timestamp without sensitive payload.
- Tests cover Owner success, Family Member denial, Patient denial, revoked access, and active-list exclusion.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- profile-lifecycle` from `/web` if supported | Owner succeeds; Family Member/Patient deny; active profile list excludes deactivated profile. |
| `npm test -- patient-session` from `/web` if supported | Revoked Patient code/session no longer resolves. |
| `npm run typecheck` from `/web` | Lifecycle handler and UI types compile. |
| `npm run lint` from `/web` | Lifecycle code lint cleanly. |

## Manual QA

- Use a resettable/non-demo fixture to deactivate a profile.
- Confirm it disappears from active profile switcher.
- Try old Patient code/session and confirm it fails generically.
- Confirm main demo profiles can be restored by seed reset if accidentally touched.
- Read copy aloud to ensure it is respectful and not harsh.

## Documentation Update Rules

- Do not change retention/privacy policy without human verdict.
- Do not document real subscription cancellation.
- If final endpoint path differs from API docs, record it in handoff and ask before changing canonical API docs.

## Blockers / Stop Conditions

- Deactivation would hard-delete history.
- Access revocation cannot be verified.
- Family Member or Patient can trigger lifecycle action.
- The only available test fixture is a main demo profile and no reset path exists.

## Handoff Notes

Report endpoint/action names, copy used, audit event name, revoked access evidence, active-list evidence, and reset instructions. Packet 07 and later packets must exclude deactivated profiles.
