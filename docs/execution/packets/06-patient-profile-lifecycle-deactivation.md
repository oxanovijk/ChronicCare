# Packet 06: Patient Profile Lifecycle Deactivation

Status: Done

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
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/deactivate/`
- `web/src/app/caregiver/`
- `web/src/components/profile/`
- `web/prisma/seed.ts` only for deterministic synthetic lifecycle reset
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

## Exit Review Evidence

Review completed by Daniel, Al, and Ozan on 2026-07-17 against commit
`157892b` plus the current P6 QA corrections.

### Daniel - UI/UX Sign-off

- Confirmation copy identifies the selected profile, explains retained
  history and revoked Patient access, and explicitly states that the action is
  not subscription or payment cancellation.
- The sensitive reason is presented as `Pasien meninggal dunia`; internal enum
  wording is not shown. The optional note warns against medical or sensitive
  detail.
- Loading, retryable error, cancellation, and success states were exercised.
  Error and success alerts now receive programmatic focus so state changes are
  announced without leaving keyboard users at a removed control.
- At `390x844`, Tab remained trapped across close, reason, note, cancel, and
  destructive controls; Escape closed the dialog and restored focus to the
  trigger. At `1440x900`, the success alert received focus after the removed
  profile trigger disappeared.
- Mobile and desktop screenshots showed no horizontal overflow, clipped copy,
  incoherent overlap, or fresh happy-path console error.

### Al - Privacy Consult and Sign-off

- The optional note is stored as retained lifecycle metadata but is never
  copied into the audit summary. Audit contains actor, role, action, target,
  timestamp, request ID, and reason category only.
- Copy tells caregivers to avoid medical detail and sensitive data; it does not
  request diagnosis, cause of death, document content, or another medical
  narrative.
- Active profile selectors and authorized profile reads require `ACTIVE`, so a
  deactivated profile cannot enter a new Patient, document, or chat flow.
- Packet 09 now requires document/OCR rejection before provider/storage work
  for a deactivated profile. Packet 11 now requires denial before an AI call
  and excludes retained profile, daily-care, and confirmed OCR context.
- Secret scanning found no Patient code, code hash source value, session secret,
  caregiver password, or database URL in tracked files.

### Ozan - Acceptance Criteria Verdict

| # | Verdict | Evidence |
| --- | --- | --- |
| 1 | Pass | Owner opened the guarded `Nonaktifkan profil` dialog and completed `Akhiri perawatan profil`. |
| 2 | Pass | Family Member received `403 FORBIDDEN`; Patient received `401 UNAUTHENTICATED`; Family UI exposed no lifecycle action. |
| 3 | Pass | Profile row and original timestamps/history remained stored; status changed without `deletedAt` or hard delete. |
| 4 | Pass | Active access code changed to `REVOKED`; all old Patient sessions received `revokedAt` in the same transaction. |
| 5 | Pass | Raka disappeared immediately from the active selector/list after successful deactivation. |
| 6 | Pass | Dialog states retained history and clarified that this is not subscription/payment cancellation. |
| 7 | Pass | Audit recorded Owner actor, action, profile target, timestamp, and reason category; QA note text was absent. |
| 8 | Pass | Unit and live evidence cover Owner success, Family/Patient denial, old code/session denial, active-list exclusion, and reset. |

### Automated Check Results

| Command | Exit | Result |
| --- | --- | --- |
| `npm run lint` | 0 | ESLint completed without errors. |
| `npm run typecheck` | 0 | TypeScript completed without errors. |
| `npm test` | 0 | 84 tests in 20 files passed. |
| `npm test -- profile-lifecycle` | 0 | 12 tests in 3 files passed. |
| `npm test -- patient-session` | 0 | 13 tests in 3 files passed. |
| `npm run build` | 0 | Production build passed and generated the `/deactivate` route. |
| `npm run db:seed` | 0 | Repeated reset passed; lifecycle metadata/code state were verified and local usable codes remained valid. |
| `npm run test:e2e` | 0 | 14 Playwright tests passed with no skip or not-run result. |

### Manual QA Matrix

| Scenario | Evidence | Result |
| --- | --- | --- |
| Owner dialog, `390x844` | Keyboard-open, 10-step focus cycle, Escape return-focus, copy and overflow check | Pass |
| Owner error, `1440x900` | Forced generic `500`; dialog stayed open, error received focus, retry re-enabled | Pass |
| Owner success, `1440x900` | Live `200`; success received focus and Raka disappeared from selector | Pass |
| Family Member | Action absent; direct POST returned `403 FORBIDDEN` | Pass |
| Patient | Direct POST returned `401`; old session redirected to login after deactivation | Pass |
| Revoked code | Old code returned generic `401` with no Raka identity | Pass |
| History/audit | Profile retained; audit summary was `PATIENT_PROFILE_DEACTIVATED OTHER` and excluded note | Pass |
| Reset | Seed restored Maya/Raka `ACTIVE`, cleared lifecycle metadata, reset code state, and preserved usable local-code alignment | Pass |

Temporary Patient sessions, login/lifecycle audits, and QA state were removed
after evidence capture. Maya and Raka are active, not deleted, have cleared
lifecycle metadata, and each has one active, non-expired, non-locked,
Argon2id-only code record.

### Corrected Review Findings

- Added deterministic focus targets for lifecycle error and success states.
- Expanded seed reset to clear deactivation reason/note/actor/time and reset
  access-code status, attempts, lock, last-use, and expiry metadata.
- Prevented seed reset from replacing locally provisioned usable Patient codes
  with inaccessible fixture hashes. Local codes are re-hashed from ignored env
  when present and never logged; existing hashes are preserved when absent.
- Corrected the packet route from the stale `/lifecycle` plan to locked
  `/deactivate`, corrected the caregiver App Router path, and recorded the seed
  reset area.
- Added deactivated-profile exclusion requirements to Packets 09 and 11.

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

- Endpoint: `POST /api/v1/patient-profiles/[patientProfileId]/deactivate`.
- Service/schema: `deactivatePatientProfile` and
  `deactivatePatientProfileSchema`.
- Audit action: `PATIENT_PROFILE_DEACTIVATED`; summary contains only the reason
  category and never the optional note.
- `listPatientProfiles` and `getAuthorizedPatientProfile` require `ACTIVE`;
  Patient auth also rejects a non-active bound profile.
- `npm run db:seed` is the reset path. It restores both demo profiles, clears
  lifecycle/code transient state, and re-hashes ignored local demo codes when
  supplied.
- Packet 07 and all later patient-bound selectors must retain the active-profile
  predicate. Packets 09/11 carry explicit OCR/AI exclusion requirements.
- P6 has no remaining blocker or unresolved review finding.
