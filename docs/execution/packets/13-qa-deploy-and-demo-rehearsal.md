# Packet 13: QA, Deploy, and Demo Rehearsal

Status: Draft

Driver / DRI: Ozan

Contributors: Bernard, Daniel, Al

Technical sign-off: Bernard

Timebox: evidence collection starts at hour 0; final gate hours 24 to 30

## Role Work

- Role A - QA verdict, DRI: Ozan: run demo-readiness checklist, record evidence, decide `Ready`, `Needs Fix`, or `Blocked`.
- Role B - Technical/deploy sign-off, DRI: Bernard: run build/deploy/smoke checks and fix only P0 API/data/auth/deploy blockers.
- Role C - UI/demo polish, DRI: Daniel: fix only P0 layout, loading, empty, accessibility, and rehearsal issues.
- Role D - AI/OCR safety sign-off, DRI: Al: verify AI/OCR refusals, fallback, context boundaries, and provider limitations.

## Goal

Verify the locked demo path, deploy or approve local fallback, rehearse timing, sanitize artifacts, and issue an evidence-based readiness verdict.

## Technical-Visible and User-Visible Outcome

Final checklist has evidence, demo runs in two minutes, presentation runs in five minutes, and fallback assets are ready.

## Covered Canonical Sources

- `AGENTS.md`
- `README.md`
- `docs/execution/packets.md`
- `docs/execution/packets/13-qa-deploy-and-demo-rehearsal.md`
- `docs/execution/workflow.md`
- `docs/qa/demo-readiness-checklist.md`
- `docs/pitch/demo-script.md`
- `docs/pitch/pitch-structure.md`
- `docs/technical/env-and-deploy.md`
- `docs/security-privacy.md`

## Dependency Inputs

- Packets 01 through 12 are in `Review` or `Done`, or unresolved gaps are explicitly owned.
- Feature freeze is active.
- Demo seed and synthetic documents are frozen.
- Presenter accounts/codes are available outside Git.
- Fallback mode and assets are prepared.

## Hard Dependencies

- Packet 01 command baseline must exist.
- Demo-critical packets must have handoff notes and evidence.
- No known P0 profile leak, secret leak, unsafe AI, or broken SOS state remains unowned.

## Soft Dependencies / Parallel Prep

- Ozan can collect checklist evidence from hour zero.
- Daniel can prepare screenshots/video fallback while Bernard works deploy.
- Al can pre-run prompt matrix before final rehearsal.

## Allowed Files / Areas

- `docs/qa/demo-readiness-checklist.md`
- `README.md`
- `docs/pitch/`
- `web/tests/`
- Deployment config files already created by earlier packets
- Sanitized screenshots/recordings if the repo intentionally stores them

## Out of Scope

- New features.
- New provider choices.
- Schema/API changes except approved P0 blocker fixes.
- Rewriting demo narrative.
- Adding food/menu/pantangan recommendation or real subscription/payment flows.
- Claiming production readiness.

## Acceptance Criteria

- Required commands run with recorded evidence or skipped with written risk owner.
- Happy path and negative path rows in QA checklist have evidence.
- No unresolved profile leak, auth bypass, secret exposure, unsafe AI, incorrect OCR claim, or broken SOS state remains.
- Demo completes within two minutes on the presentation machine/network or rehearsed fallback.
- Five-minute pitch is rehearsed with known limitations.
- Fallback screenshots/video open locally without external login.
- Final verdict is `Ready`, `Needs Fix`, or `Blocked` based on evidence.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm install` from `/web` | Dependencies install from lockfile. |
| `npm run db:generate` from `/web` | Prisma generation succeeds. |
| `npm run lint` from `/web` | No lint errors remain. |
| `npm run typecheck` from `/web` | No type errors remain. |
| `npm test` from `/web` | Unit/integration tests pass or failures are owned as blockers. |
| `npm run test:e2e` from `/web` | Demo-critical E2E checks pass or fallback is documented. |
| `npm run build` from `/web` | Production build succeeds before deploy. |

Record command, environment, start/end time, exit code, and artifact link. A skipped command needs a written reason.

## Manual QA

- Run the full demo happy path.
- Run wrong role/profile checks.
- Run OCR success/failure/fallback/review/confirm checks.
- Run AI allowed/refusal/emergency/fallback checks.
- Run diabetes-specific target/lab/dose/diet refusal checks.
- Run SOS Realtime/audio/conflict/disconnect checks.
- Run faskes no-result and safe-copy checks.
- Inspect 390x844 and 1440x900 layouts.
- Scan screenshots/logs/video for real data and secrets.

## Documentation Update Rules

- Update `docs/qa/demo-readiness-checklist.md` only with evidence, not assumptions.
- Update `README.md` only for verified run/deploy instructions and known limitations.
- Do not claim production readiness, medical compliance, or provider success that was not tested.
- If deployment target or command differs from `docs/technical/env-and-deploy.md`, stop for human verdict before rewriting canonical deploy docs.

## Blockers / Stop Conditions

- Deploy unavailable near deadline and local fallback is not rehearsed.
- Provider quota/network outage without labeled fallback.
- Demo exceeds two minutes and no cut path exists.
- Fallback assets are missing, stale, or contain real data/secrets.
- Any profile leak, unsafe AI answer, secret exposure, or broken SOS flow remains unresolved.

## Handoff Notes

Attach final checklist, command logs, deployed/local smoke result, rehearsal timings, fallback assets, known limitations, and sign-off names. `Not Run` is not `Pass`.
