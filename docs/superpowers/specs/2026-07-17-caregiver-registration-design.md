# Caregiver Registration and Invitation Design

Date: 2026-07-17

Status: Implemented and regression-verified; final human P7 acceptance pending

DRI: Bernard for auth/API/data, Daniel for UI, Ozan for QA, Al consulted for privacy

## Objective

Add real caregiver registration without weakening ChroniCare's role boundary:

- A new caregiver may self-register only as the Owner of a new Care Circle.
- A Family Member may register or sign in only through a valid Owner invitation.
- A Patient remains a separate access-code/session actor and never becomes a
  Supabase Auth user through this flow.

## Identity Boundaries

Supabase Auth owns caregiver email, password, email verification, and browser
session. PostgreSQL owns application identity, Care Circle, membership, and
role. A Supabase account without a public `users` row is an incomplete Owner
onboarding, while an existing public user without an active membership is
forbidden and may not silently create a new Owner circle.

Client input never selects `role`, `careCircleId`, or another user ID. Owner
bootstrap always assigns `OWNER` to a newly created Care Circle. Invitation
acceptance always assigns `FAMILY_MEMBER` to the Care Circle encoded by the
server-side invitation record.

## Owner Registration

`/caregiver/register` collects display name, Care Circle name, email, password,
and password confirmation. The browser calls Supabase `signUp` with an
allowlisted callback `/auth/callback?next=/caregiver`.

If signup immediately returns a session, the browser calls
`POST /api/v1/onboarding/owner`. If email verification is required, UI shows a
verification-pending state. After callback, the server validates the
allowlisted display/Care Circle metadata and calls the same idempotent Owner
bootstrap automatically. Missing or invalid metadata falls back to
`409 ONBOARDING_REQUIRED` with sanitized prefilled values; role and Care Circle
authorization never come from metadata.

The bootstrap endpoint authenticates with Supabase `getUser()`, validates only
`displayName` and `careCircleName`, then uses one Prisma transaction and an
advisory lock keyed by Auth user ID to create:

- public `users` row;
- one `care_circles` row;
- one active `OWNER` membership;
- `OWNER_ONBOARDING_COMPLETED` audit event.

Retry returns the existing Owner context and never creates a second circle.

## Family Invitation

An authenticated Owner creates an invitation through
`POST /api/v1/care-circle/invitations`. The service generates 32 random bytes,
stores only its SHA-256 hash, applies a 24-hour expiry, and returns the raw token
once as a relative invitation path. No email provider is added; the Owner can
copy the link.

`/caregiver/invite/[token]` supports Family Member sign-in or signup. The public
validation response reveals only validity, expiry, and the Care Circle display
name to a holder of the high-entropy token. Acceptance uses
`POST /api/v1/care-circle/invitations/[token]/accept`, authenticates with
Supabase `getUser()`, locks and consumes the invitation once, creates or reuses
the public user, and creates/reactivates a `FAMILY_MEMBER` membership.

An active membership in another Care Circle, an Owner attempting to consume a
Family invitation, an expired/revoked/used token, or a concurrent second
acceptance receives a generic denial or conflict. The raw token is never logged
or stored outside the URL/browser input.

## API and Error Contract

- `POST /api/v1/onboarding/owner`
- `POST /api/v1/care-circle/invitations`
- `GET /api/v1/care-circle/invitations/{token}`
- `POST /api/v1/care-circle/invitations/{token}/accept`
- `GET /auth/callback?code=...&next=...`

All mutation endpoints require same-origin requests. Public errors remain
generic. `ONBOARDING_REQUIRED` uses HTTP 409. Invitation responses never expose
hashes, email addresses, Supabase session values, or unrelated membership.

## UI States

Registration and invitation screens provide loading, validation, provider
error, verification-pending, bootstrap/acceptance error, and success states.
Passwords are cleared before asynchronous provider work finishes. Success moves
focus to a status message or redirects to `/caregiver`; errors move focus to a
retryable alert. Layout must work at 390x844 and 1440x900 without overflow.

The Patient login page explicitly says that Patients receive an access code
from the Owner/caregiver and does not offer account registration.

## Verification

Tests must prove Owner bootstrap idempotency, role immutability, authenticated
no-user versus removed-user behavior, invitation hash-only storage, expiry,
single use, cross-circle denial, callback redirect allowlisting, generic errors,
password clearing, responsive keyboard operation, and cleanup of synthetic
Auth/database fixtures. Full lint, typecheck, unit, build, and Playwright suites
remain mandatory.

## Scope Exclusions

No social login, password reset, production invitation email, Patient account
signup, subscription, multi-Care-Circle account, or automatic real-data import
is added.

## Implementation Evidence

Implemented on branch `P7` without a new dependency, table, or migration. The
existing `care_circle_invitations` model was sufficient. Live integration QA
found that Prisma 7 cannot deserialize the `void` result of
`pg_advisory_xact_lock`; both Owner bootstrap and invitation acceptance now
cast the lock result to `text`, preserving transaction-scoped concurrency.

Fresh evidence on 2026-07-17:

- `npm run db:generate`: pass.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: 126 tests across 31 files pass.
- `npm run build`: pass; all registration, callback, and invitation routes are present.
- `npm run test:e2e`: 18 tests pass with no skip.
- Registration-specific E2E: responsive and keyboard order at 390x844 and 1440x900, live Owner bootstrap, hashed single-use invitation, live Family acceptance, role isolation, and reuse denial pass.
- Browser inspection: no horizontal overflow, clipping, hydration error, or console warning on registration and generic invalid-invitation states.
- Cleanup verification: zero temporary registration users remain in public or Supabase Auth records.

Supabase public email delivery was rate-limited during QA with
`over_email_send_rate_limit`. Live email delivery/callback therefore remains a
human/provider-environment check after the quota resets or development SMTP is
configured. Unit/integration tests cover the exact `signUp` call, allowlisted
callback, verification-pending state, password clearing, and resumable Owner
bootstrap. This provider quota does not affect the live application onboarding
and invitation tests, which use temporary confirmed synthetic Auth users and
clean them afterward.

## Corrective Verification

Manual QA found that the first verification flow repeated Owner/Care Circle
fields, local invitation URLs were easy to misinterpret as shareable, and the
locked Owner Patient-code producer was missing. The correction now auto-runs
Owner bootstrap from validated metadata, resolves invitations against
`NEXT_PUBLIC_APP_URL` with a localhost warning, distinguishes Family invitation
URLs from Patient codes, and completes the Owner-only hash-only Patient code
rotation route/UI. Rotation revokes the previous code and active Patient
sessions; raw codes are returned once and never persisted by the browser.
