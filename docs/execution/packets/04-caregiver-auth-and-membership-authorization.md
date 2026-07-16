# Packet 04: Caregiver Auth and Membership Authorization

Status: Draft

Driver / DRI: Bernard

Contributors: Daniel, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 7 to 9

## Role Work

- Role A - Server auth, DRI: Bernard: implement Supabase caregiver session resolution, typed auth context, and membership authorization helpers.
- Role B - Auth UX foundation, DRI: Daniel: prepare simple caregiver auth/session UI states without assuming Patient access exists.
- Role C - Security/QA, DRI: Ozan: verify role denial cases and that logs do not expose sessions, auth headers, or tokens.
- Role D - Privacy consult, DRI: Al: review that no AI/OCR future behavior is introduced through auth context.

## Goal

Implement caregiver authentication and server-side membership authorization for Owner and Family Member roles.

## Technical-Visible Outcome

Route handlers and server actions can resolve a verified caregiver, Care Circle membership, and Owner/Family Member permissions without trusting client-supplied role data.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/04-caregiver-auth-and-membership-authorization.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/security-privacy.md`
- `docs/product/user-journeys.md`

## Dependency Inputs

- Completed Packet 03 schema and seed.
- Hosted Supabase project or approved local Supabase setup.
- Caregiver auth method is available enough for demo.
- Real provider values are available only in local untracked env files.

## Hard Dependencies

- Packet 01 scripts and test harness must exist.
- Packet 02 env validation must exist.
- Packet 03 core schema and seed base must exist.

## Soft Dependencies / Parallel Prep

- Daniel can prepare auth loading/empty/error UI while Bernard builds guard utilities.
- Ozan can prepare role-denial manual QA before tests are written.
- Al can review logging and future context boundaries.

## Allowed Files / Areas

- `web/src/lib/auth/`
- `web/src/lib/supabase/`
- `web/src/app/api/v1/auth/`
- `web/src/app/(caregiver)/`
- `web/src/components/auth/`
- `web/tests/**/auth*`
- `web/tests/**/membership*`

## Out of Scope

- Patient code/session login.
- Patient Profile switching UI.
- Daily-care, OCR, chatbot, SOS, and faskes features.
- Production invite email, social login, and password reset polish.
- Real subscription/payment behavior.

## Acceptance Criteria

- Server auth context contains verified Supabase user id and no raw token payload.
- Caregiver membership helper resolves Owner or Family Member for the active Care Circle.
- Owner-only guard rejects Family Member and unauthenticated requests.
- Client-supplied role and `careCircleId` are ignored or validated against server-side membership.
- Auth errors are generic enough to avoid membership/profile leakage.
- Logs do not print raw tokens, decoded payloads, sessions, auth headers, or secrets.
- Tests cover unauthenticated, Owner allowed, Family Member allowed, and Family Member denied for Owner-only helper.
- Patient mode is not introduced as a separate Supabase auth user in this packet.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- auth` from `/web` if supported | Invalid sessions reject and valid caregiver session resolves user id. |
| `npm test -- membership` from `/web` if supported | Owner/Family Member allow/deny cases pass. |
| `npm run typecheck` from `/web` | Typed auth context compiles. |
| `npm run lint` from `/web` | Auth helpers and route code lint cleanly. |

## Manual QA

- Sign in or simulate seeded Owner and Family Member according to the scaffold.
- Confirm Family Member cannot access Owner-only helper/action.
- Inspect server logs for token/session/header leakage.
- Confirm caregiver auth UI does not claim Patient code login exists.

## Documentation Update Rules

- Do not update canonical API docs unless endpoint/auth contract intentionally changes and the task allows it.
- If final guard/helper names differ from planning docs, record them in implementation summary.
- Keep Supabase redirect/callback notes factual and copied only from real app setup.

## Blockers / Stop Conditions

- Supabase setup is insufficient to verify caregiver identity.
- Auth implementation would require changing provider or role model.
- Logs cannot be made safe from token/session output.
- Owner/Family Member distinction cannot be tested.

## Handoff Notes

Report auth helper names, request context type, role guard names, test evidence, unsupported auth paths, and any Supabase setup gap. Packet 05 must reuse this authorization layer.

