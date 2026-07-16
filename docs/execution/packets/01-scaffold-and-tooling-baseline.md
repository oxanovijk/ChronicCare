# Packet 01: Scaffold and Tooling Baseline

Status: Done

Driver / DRI: Bernard

Contributors: Daniel, Al, Ozan

Reviewer: Ozan

Timebox: hours 2 to 4

## Role Work

- Role A - App/tooling, DRI: Bernard: scaffold `/web`, lock package scripts, configure TypeScript, Tailwind, shadcn/ui, Vitest, and Playwright.
- Role B - Shell UX, DRI: Daniel: create minimal root, caregiver shell, and Patient login shell with ChroniCare positioning and no fake feature claims.
- Role C - Provider boundary review, DRI: Al: review that scaffold leaves clean server-side extension points for Azure OpenAI and Azure Document Intelligence.
- Role D - QA/product check, DRI: Ozan: confirm scripts, routes, and copy match the demo-first MVP scope.

## Goal

Create the `/web` Next.js application with the locked toolchain, baseline shell routes, package scripts, and test harness.

## Technical-Visible Outcome

The repo has a runnable `/web` app with root, caregiver shell, Patient login shell, baseline tests, and planned commands from `docs/technical/dev-installations.md`.

## Covered Canonical Sources

- `AGENTS.md`
- `README.md`
- `docs/execution/packets.md`
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
- `docs/technical/dev-installations.md`
- `docs/technical/architecture.md`
- `docs/technical/env-and-deploy.md`

## Dependency Inputs

- Node.js 24 LTS and npm are installed.
- Stack decisions in `AGENTS.md` and `docs/technical/dev-installations.md` are locked.
- No existing `/web` directory blocks scaffold.
- No real provider credentials are required for this packet.

## Hard Dependencies

- Workstation setup and locked docs are available.

## Soft Dependencies / Parallel Prep

- Daniel can prepare shell copy and layout states while Bernard scaffolds.
- Al can prepare the provider-boundary checklist for Packet 02.
- Ozan can prepare smoke-test notes for root, caregiver, and Patient login routes.

## Allowed Files / Areas

- `web/package.json`, `web/package-lock.json`
- `web/src/app/`
- `web/src/components/`
- `web/tests/`
- `web/playwright.config.*`
- `web/vitest.config.*`
- `web/tsconfig.json`
- `web/next.config.*`
- `web/tailwind.config.*`
- `web/postcss.config.*`

## Out of Scope

- Working caregiver auth.
- Patient code/session behavior.
- Real database migration.
- Env validation and provider clients beyond placeholders for Packet 02.
- OCR, chatbot, SOS, faskes, and daily-care behavior.
- Real provider calls from UI.

## Acceptance Criteria

- `/web` is created using the locked Next.js App Router setup.
- Required npm scripts exist in `web/package.json`.
- Root, caregiver shell, and Patient login shell render without blank pages.
- Baseline TypeScript, Tailwind, shadcn/ui, Vitest, Testing Library, and Playwright config exists.
- Shell copy positions ChroniCare as chronic illness care coordination, not diagnosis or treatment.
- No app UI claims daily care, OCR, chatbot, SOS, auth, or deployment is already working.
- No real credential or family data is committed.
- Packet 02 can add env/provider boundaries without replacing the scaffold.

## Automated Checks

| Command | Expected |
| --- | --- |
| `node --version` | Reports Node.js 24.x. |
| `npm --version` | Reports an available npm version. |
| `npm install` from `/web` | Installs dependencies and creates/updates lockfile. |
| `npm run lint` from `/web` | Lint command exists and passes for scaffold. |
| `npm run typecheck` from `/web` | TypeScript command exists and passes for scaffold. |
| `npm test` from `/web` | Baseline tests exist and pass. |
| `npm run build` from `/web` | Production build succeeds for scaffold routes. |

## Manual QA

- Open `/`, `/caregiver`, and `/patient/login` at 390x844 and 1440x900.
- Confirm keyboard navigation reaches the main actions.
- Confirm copy does not imply clinical advice, live auth, live OCR, live AI, or live SOS.
- Inspect console for hydration errors and accidental secret output.

## Documentation Update Rules

- Do not update product scope docs for scaffold-only UI.
- If generated script names differ from `docs/technical/dev-installations.md`, record the difference in handoff and ask before changing the locked doc.
- Do not mark any feature as implemented in `README.md`.

## Blockers / Stop Conditions

- Node.js version is not compatible with the locked setup.
- Existing `/web` directory contains user work that would be overwritten.
- shadcn/ui or Next.js initialization would require a different framework or package manager.
- Any scaffold step asks for real credentials.

## Completion Evidence

Status remains `Done`.

- Reverified on 2026-07-16 at Packet 02 HEAD `9afe1fc` plus the local pre-Packet-03 polish diff.
- Node `v24.16.0`, npm `11.13.0`, and credential-free `npm install` with Prisma postinstall passed.
- `npm run lint`, `npm run typecheck`, all 23 Vitest tests, all 3 Playwright shell tests, and `npm run build` passed.
- Build prerendered `/`, `/caregiver`, and `/patient/login`.
- Manual QA passed for all three routes at 390x844 and 1440x900 with keyboard reachability, no horizontal scroll, no fresh console/page/request errors, and no provider request.
- The progressive Patient Profile data-model refinement does not change Packet 01 scripts, routes, scaffold dependencies, or Prisma placeholder responsibilities. Schema implementation remains Packet 03 scope.
- Known residual: `npm audit --omit=dev` reports five moderate transitive advisories under the locked Prisma/Next dependency graph. The available forced fixes would introduce breaking Prisma/Next downgrades, so no dependency mutation was made inside Packet 01/02 polish.

## Handoff Notes

Report changed paths, exact commands run, script availability, local URL if dev server was started, and any unavailable dependency. Packet 02 starts only after `/web` and package scripts exist.

QA must use the latest `origin/P1` HEAD as the Packet 01 baseline and record the resolved SHA at the start of the session. Earlier SHAs in pre-final handoff messages are historical references, not the verification baseline.
