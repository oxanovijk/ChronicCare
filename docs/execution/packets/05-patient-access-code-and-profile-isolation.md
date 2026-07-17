# Packet 05: Patient Access Code and Profile Isolation

Status: Done

Driver / DRI: Bernard

Contributors: Daniel, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 9 to 10.5

## Role Work

- Role A - Patient session/API, DRI: Bernard: implement minimum Patient Profile create/update API, Patient access code verification, profile-bound session, and authorization helpers.
- Role B - Profile UX, DRI: Daniel: implement progressive profile setup states, caregiver active Patient Profile switching, and Patient login/session states.
- Role C - Isolation QA, DRI: Ozan: verify Maya/Raka separation, wrong-code behavior, and wrong-role access.
- Role D - Privacy consult, DRI: Al: review that no hidden profile/context can be exposed to AI/OCR later.

## Goal

Implement progressive minimum Patient Profile API behavior, Patient access code login, and explicit Patient Profile isolation for caregiver switching and Patient mode.

## User-Visible Outcome

Owner can create a profile without guessing optional data, caregivers can complete it progressively and switch Maya/Raka safely, and a Patient code opens exactly one bound Patient experience.

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

## Entry Readiness Evidence

- Packet 04 is `Done`; `resolveCaregiverAuthContext`, `CaregiverAuthContext`, and
  `requireOwner` provide the caregiver identity and role boundary that Packet 05
  must reuse.
- Packet 03 remains `Done`; the development Supabase contains the synthetic Maya
  and Raka Patient Profiles plus one hash-only access-code fixture per profile.
- `PATIENT_SESSION_SECRET` is present in ignored local `web/.env` and meets the
  locked minimum length without exposing its value.
- `chronicare_patient_session` remains the locked opaque Patient cookie name;
  no contract change is required.
- Supabase Auth contains only the two synthetic caregiver users. Patient mode
  remains a separate access-code and opaque-session flow as required.
- Database and direct migration connection values remain available locally;
  Packet 05 may use the existing schema without a provider or role decision.
- Usable synthetic Maya/Raka Patient codes will be generated or rotated during
  Packet 05, stored only as local demo inputs, and persisted only as hashes.
- No P5 blocker or unresolved soft dependency remains.

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
- `web/src/app/api/v1/auth/patient/`
- `web/src/app/api/v1/patient-profiles/`
- `web/src/app/patient/`
- `web/src/app/caregiver/`
- `web/src/components/auth/`
- `web/src/components/profile/`
- `web/playwright.config.ts`
- `web/tests/**/patient-session*`
- `web/tests/**/profile-isolation*`
- `web/tests/**/patient-profile*`

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
- Owner can create a Patient Profile with only `displayName` and `relationshipLabel`.
- Owner or Family Member can update allowed optional details with locked status/value validation.
- Skipped details remain `UNKNOWN`; the API never converts empty arrays into `NONE_REPORTED`.
- Full BPJS numbers are rejected; optional four-digit suffix is accepted only for `REGISTERED`.
- Profile PATCH rejects client-supplied `currentMedicationsStatus = REPORTED`; that state belongs to Packet 08 Medication transactions.
- Profile response includes the derived setup checklist and no stored completion percentage.
- Patient session is bound to exactly one `patientProfileId`.
- Patient session cannot open caregiver routes, caregiver APIs, documents admin, membership, settings, or another Patient Profile.
- Caregiver active profile switching clears stale Maya/Raka state.
- Every patient-bound API helper requires explicit `patientProfileId` and server authorization.
- Client-supplied role, `careCircleId`, and `patientProfileId` are never trusted without server validation.
- Tests cover Maya/Raka read denial, wrong code, expired/revoked code, caregiver profile switch, and Patient trying caregiver route.
- Browser logs and errors do not reveal access code validity or hidden profile details.
- Owner can create or regenerate a Patient access code for an active profile; only a hash is stored, the raw code is shown once, and the previous code/session access is revoked atomically.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- patient-session` from `/web` if supported | Valid code creates bound session; invalid/expired code rejects safely. |
| `npm test -- profile-isolation` from `/web` if supported | Maya/Raka cross-profile access is denied. |
| `npm test -- patient-profile` from `/web` if supported | Minimum create, progressive update, status contradictions, and setup checklist cases pass. |
| `npm test -- patient-access-code` from `/web` | Owner-only issue/rotation, hash-only storage, collision retry, session revocation, route, and UI cases pass. |
| `npm run typecheck` from `/web` | Patient session and profile helper types compile. |
| `npm run lint` from `/web` | Auth/profile code lint cleanly. |
| `npm run test:e2e` from `/web` if profile routes exist | Patient login and caregiver profile switch happy/negative paths pass. |

## Manual QA

- Log in as caregiver and switch Maya to Raka and back.
- Create a profile with only name/relationship, choose `Isi nanti`, and confirm optional facts remain `Belum diketahui`.
- Set one fact to `NONE_REPORTED` explicitly and confirm UI wording remains qualified.
- Log in with Maya Patient code and try to open Raka route directly.
- Try wrong, expired, or revoked Patient code and confirm generic copy.
- Confirm Patient UI is simpler than caregiver UI and has no admin/document/member access.
- As Owner, create/rotate a code for the active profile; verify Family Member denial, one-time display, old-code/session failure, and new-code login.

## Exit Review Evidence

Review completed by Daniel, Al, and Ozan on 2026-07-17 against commit
`a2bf438` plus the current P5 QA corrections.

### Daniel - UI/UX Review

- Patient login and Patient homepage were inspected at `390x844` and
  `1440x900`; both rendered without horizontal overflow or console errors.
- Keyboard order on Patient login reached the code field, `Masuk`, and the
  return link. Patient mode contains no caregiver administration, document, or
  membership controls.
- Caregiver profile selector/editor was exercised as Owner and Family Member.
  Loading, empty, error, forbidden, create-success, and update-success states
  use distinct copy.
- A delayed Maya/Raka switch confirmed that the previous profile detail is
  removed immediately and replaced by a loading state before the next profile
  appears.
- Minimum profile creation explains that optional data may remain `Belum
  diketahui`; the UI does not encourage guessing.

### Al - Privacy and Context Review

- `patientProfileDto` uses an explicit allowlist and excludes `careCircleId`,
  access-code hashes, session values, and future internal/unconfirmed context.
- Patient `/api/v1/auth/me` returns only the bound Patient identity/profile and
  does not expose caregiver membership or session material.
- Patient-bound reads require an explicit route `patientProfileId` and authorize
  it against the server-resolved Patient or caregiver context. Maya-to-Raka and
  Raka-to-Maya reads return `403` without returning the other profile name.
- P5 does not feed data to AI/OCR. Future AI/OCR callers must reuse the same
  authorized profile boundary and may not add hidden or unconfirmed extraction
  fields to this DTO.
- A tracked-file scan found no local database URL, Patient session secret,
  caregiver password, or usable Patient code.

### Ozan - Acceptance Criteria Verdict

| # | Verdict | Evidence |
| --- | --- | --- |
| 1 | Pass | Wrong, expired, and revoked codes return the same generic authentication failure; valid codes are checked against Argon2id hashes. |
| 2 | Pass | Owner created a temporary profile through the UI with only `displayName` and `relationshipLabel`; API returned `201`. |
| 3 | Pass | Family Member updated an allowed optional field through the UI/API; Owner and Family paths returned success. |
| 4 | Pass | Minimum-create evidence retained optional fact states as `UNKNOWN` with empty arrays. |
| 5 | Pass | Unit coverage rejects full BPJS numbers and enforces the four-digit suffix/status contract. |
| 6 | Pass | Unit coverage rejects client-supplied `currentMedicationsStatus = REPORTED`. |
| 7 | Pass | Profile DTO includes derived `setupChecklist`; no completion percentage is stored or returned. |
| 8 | Pass | Maya and Raka logins each resolve a session bound to exactly one `patientProfileId`. |
| 9 | Pass | Patient access to the other profile returns `403`; caregiver API access returns `401`; `/caregiver` redirects to `/patient`. |
| 10 | Pass | Delayed Maya/Raka/Maya switching showed no stale detail during loading. |
| 11 | Pass | Profile detail routes require explicit `patientProfileId` and authorize it server-side. |
| 12 | Pass | Client role/circle/profile spoofing is ignored or denied by server-resolved context tests. |
| 13 | Pass | Unit and E2E coverage includes wrong/expired/revoked code, both cross-profile directions, caregiver switching, and Patient caregiver-route denial. |
| 14 | Pass | Responsive browser sessions emitted zero fresh console errors; API and tracked-secret scans found no code validity detail or hidden profile data. |
| 15 | Pass | Corrective P5 tests and live E2E prove Owner-only issuance, six-digit collision retry, hash-only persistence, one-time display, old-code/session revocation, Family denial, and login with the replacement code. |

### Automated Check Results

| Command | Exit | Result |
| --- | --- | --- |
| `npm run lint` | 0 | ESLint completed without errors. |
| `npm run typecheck` | 0 | TypeScript completed without errors. |
| `npm test` | 0 | 72 tests in 17 files passed. |
| `npm test -- patient-session` | 0 | 13 tests in 3 files passed. |
| `npm test -- profile-isolation` | 0 | 4 tests in 2 files passed. |
| `npm test -- patient-profile` | 0 | 8 tests in 1 file passed. |
| `npm run build` | 0 | Next.js production build passed; Patient auth/profile routes and caregiver/Patient pages were generated. |
| `npm run test:e2e` | 0 | 14 Playwright tests passed with no skip or not-run result. |

### Manual QA Matrix

| Actor / route | Viewport | Result |
| --- | --- | --- |
| Patient login `/patient/login` | `390x844`, `1440x900` | Pass: keyboard reachable, generic wrong-code state, no overflow, no fresh console error. |
| Maya `/patient` | `390x844` | Pass: own profile `200`, Raka `403`, caregiver list `401`, caregiver route redirected, logout revoked session. |
| Raka `/patient` | `1440x900` | Pass: own profile `200`, Maya `403`, no hidden DTO fields, no overflow or console error. |
| Owner `/caregiver` | `1440x900` | Pass: Maya/Raka/Maya switch cleared stale state; minimum create returned `201` and qualified success copy. |
| Family Member `/caregiver` | `390x844` | Pass: create denied `403`, allowed profile update returned `200`, success state visible. |

Wrong, expired, and revoked code checks all returned `401 UNAUTHENTICATED`
with `Kode tidak valid atau sudah tidak berlaku.` and no Patient identity leak.
Temporary QA data and audit artifacts were removed. Maya and Raka are active,
not deleted, and each has one active, non-expired, non-locked, hash-only code.

### Corrected Review Findings

- Replaced broad profile object spreading with an explicit response DTO
  allowlist.
- Kept the Patient on the current page and showed a retryable error when logout
  revocation fails instead of always redirecting.
- Separated profile-create success/error messaging from profile-list load
  errors.
- Configured Playwright to use one worker because live Supabase caregiver and
  Patient suites share mutable demo fixtures; this removed provider-concurrency
  flakiness while retaining all 14 scenarios.
- Corrected this packet's stale planned paths to the implemented App Router
  paths. No locked API, role, data, or privacy contract changed.

### Corrective Completion Evidence - 2026-07-17

- Added `rotatePatientAccessCode` and the locked
  `POST /api/v1/patient-profiles/{patientProfileId}/access-code` route.
- Issuance is Owner-only, same-origin, scoped to an active profile in the
  verified Care Circle, globally serialized for the MVP, and retries raw-code
  collisions against every active Argon2id hash.
- Rotation atomically revokes the previous active code and active Patient
  sessions, stores only the new Argon2id hash, and emits a minimized audit
  event. The raw code is returned/displayed once and never persisted.
- Owner UI separates `Akses Patient` from `Undang Family Member`; Family Member
  sees neither Owner action. Patient login rejects a pasted HTTP(S) invitation
  locally without probing invitation validity.
- Fresh verification: lint and typecheck passed; 141 tests in 34 files passed;
  production build included the access-code route; 18 Playwright tests passed
  without skip. Live E2E covered 390x844 and 1440x900, code/session rotation,
  canonical invitation origin, role denial, expected negative HTTP console
  responses, no unexpected hydration/page error, and synthetic cleanup.

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

- Profile services: `createPatientProfile`, `updatePatientProfile`,
  `listPatientProfiles`, and `getAuthorizedPatientProfile`.
- Derived selector and DTO: `deriveSetupChecklist` and `patientProfileDto`.
- Patient auth helpers: `authenticatePatientCode`,
  `resolvePatientAuthContext`, `requireBoundPatientProfile`, and
  `revokePatientSession`; shared `/auth/me` resolution uses
  `resolveAuthContext`.
- Routes: `/api/v1/auth/patient/login`,
  `/api/v1/auth/patient/logout`, `/api/v1/patient-profiles`,
  `/api/v1/patient-profiles/[patientProfileId]`, and
  `/api/v1/patient-profiles/[patientProfileId]/access-code`; UI routes are
  `/patient/login`, `/patient`, and `/caregiver`.
- Cookie: opaque, HTTP-only `chronicare_patient_session`, with the locked
  eight-hour server-side session lifetime.
- Packet 06 must reuse the Owner guard, profile authorization, access-code
  records, and Patient session records. Profile-wide atomic code/session
  revocation is Packet 06 implementation scope.
- P5 has no remaining blocker or unresolved review finding.
