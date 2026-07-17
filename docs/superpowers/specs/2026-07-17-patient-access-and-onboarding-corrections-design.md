# Patient Access and Onboarding Corrections Design

Date: 2026-07-17

Status: Approved for implementation

DRI: Bernard for API/data, Daniel for UI, Ozan for QA, Al consulted for privacy

## Objective

Close the Packet 05 Patient-access gap and make caregiver registration coherent:

- an Owner can create or rotate a Patient access code for an active Patient Profile;
- verified Owner signup metadata completes onboarding without asking for the same values again;
- Family invitation links use the configured application origin and are clearly distinct from Patient codes.

Packet 07 remains the Patient homepage/check-in consumer of the bound Patient session. No new provider, dependency, table, or migration is required.

## Patient Access Code

`POST /api/v1/patient-profiles/{patientProfileId}/access-code` is Owner-only. The service validates that the active profile belongs to the Owner's Care Circle, generates a cryptographically random six-digit code, hashes it with Argon2id, and performs rotation in one transaction. Rotation revokes the previous active code and every active Patient session for that profile, creates the new hash, and records an audit event containing no raw credential.

The response returns the raw code exactly once with its expiry. The browser may display and copy it but must not persist it in local storage, URLs, logs, or profile DTOs. Losing the code requires another rotation.

The active profile UI separates `Akses Patient` from `Undang Family Member`. Only Owner sees the create/rotate control. Rotation requires confirmation, success receives focus, and failure remains generic.

## Owner Onboarding Continuity

Owner signup stores only `display_name` and `care_circle_name` in Supabase user metadata. After exchanging an email-verification callback code, the server reads the authenticated user, validates those two metadata values with the existing onboarding schema, and calls the existing idempotent Owner bootstrap service.

If metadata is absent or invalid, the authenticated caregiver remains in `ONBOARDING_REQUIRED`; the fallback form is prefilled with any validated metadata values. Metadata is never trusted for role, user ID, or Care Circle ID. The server always assigns `OWNER` and creates the Care Circle transactionally.

## Invitation URL and Credential Separation

The invitation API continues returning a relative path. The browser resolves it against validated `NEXT_PUBLIC_APP_URL`, falling back to the current origin only in local development. A localhost or loopback result displays a local-only warning.

Patient login detects pasted HTTP(S) URLs before making an authentication request and explains that Family invitations are not Patient codes. It does not validate or disclose invitation-token state.

## Verification

Tests cover Owner-only authorization, wrong-Care-Circle and inactive-profile denial, atomic code/session revocation, hash-only persistence, audit minimization, one-time raw response, callback bootstrap and fallback behavior, canonical/local invitation URLs, and URL rejection on Patient login. Regression includes lint, typecheck, all unit/integration tests, build, Playwright without skips, responsive keyboard QA at 390x844 and 1440x900, role isolation, secret scans, and cleanup of synthetic records.
