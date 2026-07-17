# Packet 10: Faskes and BPJS Helper

Status: Done

Driver / DRI: Daniel

Contributors: Bernard, Ozan

Consulted: Al

Reviewer: Ozan

Timebox: hours 17 to 19; may overlap Packet 09 if file areas do not collide

## Role Work

- Role A - Helper UI, DRI: Daniel: build fast filter UI, result states, and safe BPJS/faskes copy.
- Role B - Facility data/API, DRI: Bernard: expose deterministic static facility and BPJS guide data without scraping.
- Role C - Demo QA, DRI: Ozan: define one stable 20-second demo sequence and no-result fallback.
- Role D - Safety wording, DRI: Al: review that copy does not imply medical ranking or guaranteed BPJS coverage.

## Goal

Give caregivers a safe, fast way to filter static Tangerang facility data and read general BPJS administrative guidance.

## User-Visible Outcome

Caregiver opens the dedicated Fasilitas Kesehatan page from the caregiver sidebar and filters facilities by area, BPJS, emergency unit, service, or specialty while the active Patient Profile remains visible.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/10-faskes-and-bpjs-helper.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`
- `docs/product/feature-scope.md`

## Dependency Inputs

- Completed Packet 05 caregiver authorization/profile context.
- Facility dataset is synthetic-safe or public-source based.
- Facility rows have source labels and review dates.
- BPJS guidance is general administrative guidance only.

## Hard Dependencies

- Packet 04 caregiver authorization must exist.
- Packet 05 active Patient Profile context must exist.

## Soft Dependencies / Parallel Prep

- Daniel can prepare UI with fixture data while Bernard formalizes API/data shape.
- Ozan can rehearse one filter sequence before live integration.
- Al can review copy in parallel with UI implementation.

## Allowed Files / Areas

- `web/src/app/api/v1/facilities/`
- `web/src/app/api/v1/bpjs-guides/`
- `web/src/components/facilities/`
- `web/src/lib/facilities/`
- `web/src/data/facilities/`
- `web/tests/**/facilities*`

## Out of Scope

- Live scraping.
- Ranking or "best" facility claims.
- Route navigation.
- Booking.
- Doctor schedules.
- Guaranteed BPJS coverage.
- Real-time emergency capacity.
- Food/menu/pantangan recommendation.
- Facility ranking for a specific diagnosis.

## Acceptance Criteria

- Facility dataset can be filtered deterministically.
- Results show source label and last reviewed date.
- Empty state asks user to adjust filters or confirm directly with facility/BPJS.
- Copy says information is based on available data.
- No UI/API response claims best facility or guaranteed BPJS acceptance.
- Copy does not imply the facility choice is clinically best for diabetes tipe 2.
- Flow can be completed within 20 seconds during rehearsal.
- Tests cover filter combinations and no-result state.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- facilities` from `/web` if supported | Deterministic filters and no-result state pass. |
| `npm run typecheck` from `/web` | Facility data/API/UI types compile. |
| `npm run lint` from `/web` | Facility helper code lint cleanly. |
| `npm run test:e2e` from `/web` if helper route is in demo | Stable filter sequence completes. |

## Manual QA

- Filter Tangerang + BPJS + penyakit dalam.
- Clear filters and test emergency unit.
- Produce no-result state.
- Read all result copy aloud for overclaim.
- Check 390x844 and 1440x900 layouts.

## Documentation Update Rules

- Do not add live scraping, booking, or ranking to docs.
- If dataset source changes, record source and review date factually.
- Do not claim BPJS acceptance certainty.

## Blockers / Stop Conditions

- Dataset source quality is too weak to show without caveat.
- Copy sounds like medical recommendation or guaranteed coverage.
- Filter UI takes too long during the two-minute demo.
- Implementation would require external live facility lookup.

## Handoff Notes

Give Ozan one stable filter sequence, one fallback screenshot, source limitation wording, dataset source notes, and any known no-result limitations.

## Completion Evidence

- Automated verification completed on 2026-07-17: 38 focused unit/integration tests, 3 Packet 10 E2E scenarios, lint, typecheck, and production build passed.
- Owner, Family Member, Patient denial, active-profile switching, filter/reset/no-result, BPJS guide, and responsive flows were covered by focused tests.
- Ozan completed final human QA on 2026-07-17 and confirmed the implementation is sesuai.
- Packet 10 status changed from `Draft` to `Done` by explicit human verdict.
