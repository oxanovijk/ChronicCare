# Packet 02: Env and Provider Boundary

Status: Done

Driver / DRI: Bernard

Contributors: Al, Ozan

Consulted: Daniel

Reviewer: Ozan

Timebox: hours 4 to 5

## Role Work

- Role A - Env/config, DRI: Bernard: implement typed env validation, public/private env split, and safe app config accessors.
- Role B - Provider boundary, DRI: Al: define server-only Azure OpenAI and Azure AI Document Intelligence entry points without adding feature behavior.
- Role C - Security/QA, DRI: Ozan: review `.env.example`, logs, and fallback labels for secret/privacy safety.
- Role D - UI integration check, DRI: Daniel: confirm Client Components only read public display config when needed.

## Goal

Create typed env validation and server-only provider boundaries so later packets cannot accidentally leak Supabase or Azure secrets into browser code.

## Technical-Visible Outcome

The app has safe env parsing, placeholder-only env documentation, server-only Supabase/Azure provider factories, and explicit demo fallback flags.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/02-env-and-provider-boundary.md`
- `docs/technical/env-and-deploy.md`
- `docs/technical/dev-installations.md`
- `docs/technical/architecture.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Completed Packet 01 scaffold.
- Confirmed env var placeholder names from `docs/technical/env-and-deploy.md`.
- Real provider values live only in local untracked env files or hosting dashboard.
- Supabase, Azure OpenAI, Azure AI Document Intelligence, and Vercel remain locked providers.

## Hard Dependencies

- Packet 01 must be complete.
- `/web/package.json` scripts must exist.

## Soft Dependencies / Parallel Prep

- Al can validate Azure env names and fallback flags while Bernard implements Zod env parsing.
- Ozan can prepare a secret-scan checklist before tests exist.
- Daniel can review public env usage once shell components import config.

## Allowed Files / Areas

- `web/.env.example`
- `web/src/lib/env/`
- `web/src/lib/config/`
- `web/src/lib/supabase/`
- `web/src/lib/azure/`
- `web/src/lib/ai/`
- `web/src/lib/ocr/`
- `web/tests/**/env*`
- `web/tests/**/provider*`

## Out of Scope

- Real Supabase auth behavior.
- Real Azure OCR or chatbot calls.
- Database schema or migrations.
- UI flows beyond safe config display if needed.
- Adding a new provider or package not already locked.

## Acceptance Criteria

- Env schema separates public browser-safe values from server-only secrets.
- `.env.example` contains placeholder names only and no real values.
- Server-only Supabase and Azure modules cannot be imported by Client Components without a build/type failure or explicit guard.
- Missing server credentials fail with a clear safe error in development or a labeled demo fallback when permitted.
- Provider factories do not log keys, endpoints, raw tokens, sessions, prompts, or document content.
- Public env names are limited to values safe for browser exposure.
- Tests cover missing required env and public/private separation where scaffold supports tests.
- No package, provider, or deploy target changes are introduced.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm run lint` from `/web` | Env/provider modules lint cleanly. |
| `npm run typecheck` from `/web` | Server/client env access types compile. |
| `npm test -- env` from `/web` if supported | Missing/private/public env behavior is covered. |
| `npm run build` from `/web` | Client bundle does not import server-only provider modules. |

## Manual QA

- Inspect `.env.example` for placeholder-only values.
- Search logs/tests for accidental secret, token, endpoint key, or session output.
- Confirm no provider call is triggered by opening scaffold routes.
- Confirm fallback labels are factual and not described as live provider success.

## Documentation Update Rules

- Do not change provider choices in architecture or env docs without human verdict.
- If final env var names differ from locked docs, stop and ask before changing docs.
- Record any unavailable provider value in handoff, not in committed env files.

## Blockers / Stop Conditions

- Env names in docs conflict with scaffold requirements.
- A required provider package would change the locked stack.
- Any implementation path requires committing real `.env` values.
- Server-only protection cannot be verified with available tooling.

## Completion Evidence

- Verified on 2026-07-16 at HEAD `9afe1fc` plus the local pre-Packet-03 polish diff.
- `.env.example` contains exactly the 18 locked names and non-secret defaults; only `.env.example` is tracked.
- Public and server schemas, Supabase admin, Azure OpenAI, Azure Document Intelligence, and labeled OCR fallback boundaries are implemented without live provider calls.
- `npm test -- env-validation` passed 7 tests and `npm test -- provider-boundary` passed 6 tests against the real provider entry points.
- A disposable Client Component import of `@/lib/env/server` made `npm run build` fail with the expected `server-only` error. After removing it, the production build passed.
- Full verification passed: install/postinstall, lint, typecheck, 23 Vitest tests in 5 files, 3 Playwright tests, and production build.
- Manual production-server QA at 390x844 and 1440x900 emitted no provider request and no fresh console, page, or failed-request error.
- The progressive Patient Profile data model adds no Packet 02 env variable or provider dependency. Its schema, constraints, and seed behavior begin in Packet 03.

## Handoff Notes

Report env files touched, placeholder names added, provider factory names, fallback flags, checks run, and any unavailable provider credential. Packet 03 may start after env parsing and scripts are stable.
