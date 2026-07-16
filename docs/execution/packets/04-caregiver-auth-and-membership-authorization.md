# Packet 04: Caregiver Auth and Membership Authorization

Status: Done

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

## Entry Readiness Evidence

- Packet 03 is `Done`; its migration is applied and its idempotent synthetic seed is present on the development Supabase.
- Supabase Auth is reachable and contains the synthetic Owner and Family Member identities.
- Email/password remains the locked caregiver auth method. Usable demo passwords are established as part of Packet 04 and are never committed.
- Required local env values are available through ignored `web/.env`; `PATIENT_SESSION_SECRET` is provisioned with at least 32 bytes without exposing its value.
- Packet 01 scripts/test harness and Packet 02 server-only env/provider boundaries pass fresh regression checks.
- No schema, provider, role, privacy, or product decision remains unresolved.

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
- `web/src/app/caregiver/`
- `web/src/app/page.tsx`
- `web/src/components/auth/`
- `web/tests/**/auth*`
- `web/tests/**/membership*`
- `web/tests/**/caregiver*`
- `web/tests/e2e/shell-routes.spec.ts`

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

## Exit Review Evidence

Implementation reviewed: commit `1a3c89c` on branch `P4`, plus the independent
QA corrections and evidence recorded in the current P4 worktree.

### Domain Sign-Off

| Reviewer role | Verdict | Evidence |
| --- | --- | --- |
| Daniel - UI/UX | Pass | Caregiver page now provides loading, signed-out, signed-in, generic denial/error, failed-logout, and logout states; stale shell copy was removed; keyboard order and responsive layout passed at 390x844 and 1440x900 with no horizontal overflow or overlap. |
| Al - privacy/minimization | Pass | Auth context contains only verified caregiver id, display name, Care Circle id, and role; no AI/OCR/document context was introduced; browser/server source contains no token, session, auth-header, key, or credential logging; sensitive-value scan passed. |
| Ozan - QA/product | Pass | All eight acceptance criteria passed through source review, targeted auth/membership tests, real Owner/Family Member Supabase login, server response inspection, role-spoofing tests, logout verification, Auth-user audit, manual responsive QA, and full regression checks. |

### Acceptance Criteria Verdict

| # | Verdict | Evidence |
| --- | --- | --- |
| 1 | Pass | `resolveCaregiverAuthContext` uses Supabase `getUser()` and returns only verified user id/display name plus membership; `/api/v1/auth/me` tests and live E2E confirm no raw token or session property is returned. |
| 2 | Pass | Active membership is loaded from Prisma with an active Care Circle requirement; live Owner and Family Member logins resolve their expected server-side roles. |
| 3 | Pass | `requireOwner` rejects missing/unauthenticated context and Family Member context with typed generic errors; targeted membership tests pass. |
| 4 | Pass | The resolver reads role and `careCircleId` only from the database; hostile `user_metadata` values are ignored in unit coverage. |
| 5 | Pass | Route responses use generic `UNAUTHENTICATED`/`FORBIDDEN` messages; invalid login UI hides provider detail and clears the password field before the provider request completes. |
| 6 | Pass | Source and artifact scans found no raw token, decoded payload, session, auth header, database URL, password, or secret value in implementation files or QA artifacts. |
| 7 | Pass | Targeted auth tests cover unauthenticated, verified Owner/Family Member, generic failures, logout success/failure, and server-context precedence; membership tests cover both allowed roles and Family Member/unauthenticated Owner denial. |
| 8 | Pass | Supabase admin audit found exactly the two synthetic caregiver Auth users and zero Patient-like Auth users; Patient mode remains code/session scope for Packet 05. |

### Fresh Command And Manual Evidence

| Command/check | Result |
| --- | --- |
| `npm test -- auth` | Pass; 9 tests in 3 files. |
| `npm test -- membership` | Pass; 3 tests in 1 file. |
| `npm run lint` | Pass. |
| `npm run typecheck` | Pass. |
| `npm test` | Pass; 45 tests in 11 files. |
| `npm run build` | Pass; `/`, `/caregiver`, and `/patient/login` prerender, while `/api/v1/auth/me` remains dynamic. |
| `npm run test:e2e` | Pass; 7 tests including real Owner/Family Member login, server role verification, server-confirmed logout, shell regressions, and both target viewports. |
| Manual QA at 390x844 | Pass; Owner signed in with server role, all main actions were keyboard reachable, no horizontal overflow, no happy-path console/page errors, no sensitive response fields, and logout returned `/auth/me` to 401. |
| Manual QA at 1440x900 | Pass; Family Member signed in with server role with the same keyboard, layout, console, response-minimization, and logout results. |
| Invalid-login manual QA | Pass; generic Indonesian copy shown, provider detail hidden, password cleared from DOM. Chromium emitted only the expected status-only provider 400 resource entry, with no credential or provider message. |
| Supabase Auth audit | Pass; two synthetic caregiver users present and no Patient Auth user detected. |
| Env/secret/artifact scan | Pass; local `.env` is ignored, required local values are present, and 9 sensitive values were absent from 120 source/doc files and 7 QA artifacts. |

### Corrected Findings

- Replaced the stale caregiver shell with the actual caregiver login/session UI.
- Updated root and caregiver copy so implemented caregiver auth is no longer
  described as unavailable.
- Added a local session preflight so a normal signed-out page does not create a
  fresh `/auth/me` 401 console entry; server verification remains authoritative
  whenever a session exists or sign-in succeeds.
- Fixed `requireOwner` so missing context returns `UNAUTHENTICATED` instead of a
  runtime property-access error.
- Fixed logout handling so a real provider error keeps the verified UI state and
  shows generic copy instead of falsely appearing signed out.
- Rotated both synthetic caregiver demo passwords and stored them only in ignored
  local env keys without printing or committing their values.

No P4 blocker or deferred correction remains. Password reset, production invite
flow, Patient access code/session, profile switching, daily care, deployment,
and production migration/seed remain outside Packet 04.

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

Final handoff:

- Auth resolver: `resolveCaregiverAuthContext`.
- Request context: `CaregiverAuthContext`.
- Owner guard: `requireOwner`.
- Auth route: `GET /api/v1/auth/me`.
- Browser client factory: `createSupabaseBrowserClient`.
- Caregiver UI: `CaregiverAuthPanel` on `/caregiver`.
- Unsupported paths: password reset, invite delivery, social login, and Patient
  code/session remain intentionally outside Packet 04.
- Supabase setup gaps: none for Packet 04.
- Blockers: none.
