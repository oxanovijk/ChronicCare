# Packet 10 Faskes and BPJS Helper Design

**Status:** Implemented and accepted through human QA on 2026-07-17. Packet status is `Done`.

## Goal

Deliver a production caregiver helper that deterministically filters 20 public-source facilities across Tangerang Raya and presents seven general BPJS administrative guides. The flow must remain safe, fast enough for a 20-second demo segment, and honest about unknown data and changing facility/BPJS information.

## Architecture

Packet 10 uses validated static JSON rather than Prisma or a live provider. Server-only Zod parsing establishes the runtime contract; a focused filtering module returns deterministic results; thin authenticated Route Handlers expose `/api/v1/facilities` and `/api/v1/bpjs-guides`; and a client experience under `web/src/components/facilities/` integrates into the active Patient caregiver dashboard.

The facility data is global administrative reference data and is not patient-bound. Caregiver authentication is still required. The currently active Patient Profile remains visible for orientation, but its health facts never alter, rank, or personalize facility results.

## Data Contract

`facilities.packet10.json` contains exactly 20 records with unique `sourceKey` values. `bpjs-guides.packet10.json` contains exactly seven versioned guides with unique IDs. Zod rejects unknown keys, malformed URLs/dates, unsupported city/type/category values, empty required arrays, and invalid nullable booleans.

The supported geography is Tangerang Raya with three distinct city labels: `Kota Tangerang`, `Tangerang Selatan`, and `Kabupaten Tangerang`. `sourceKey` is the stable static identifier. There is no Packet 10 database table, migration, UUID generation, raw research payload, Google Places lookup, map route, or runtime scraping.

`null` is a first-class verified state: unknown BPJS support is not false, unknown emergency-unit information is not false, and an absent phone number is not fabricated. Empty specialties are valid when no source-backed specialty exists.

## API and Filtering

Both endpoints resolve a caregiver session and return the existing safe API envelope with `Cache-Control: private, no-store`. Facility filters are `city`, `area`, `facilityType`, `supportsBpjs`, `hasEmergencyUnit`, `service`, and `specialty`. Text matching is normalized case-insensitively while response labels preserve source spelling. Invalid parameters return a generic `400` validation response.

Filter metadata is derived from the validated dataset so the UI cannot present impossible options. Area options narrow to the selected city. Binary `true` filters include only positively verified records; `null` never matches either positive filter. No API field or sort order implies ranking, nearest distance, medical suitability, live availability, or guaranteed BPJS acceptance.

## UI and Interaction

The production caregiver dashboard receives a focused Faskes/BPJS entry point. The helper retains the active Patient name as orientation and provides two tabs: `Cari faskes` and `Panduan BPJS`.

Facility controls use selects for city, area, facility type, service, and specialty; checkboxes for verified BPJS information and recorded emergency units; and one clear reset command. Results display name, type, city/area, concise address, relevant service/specialty labels, BPJS and emergency information, phone only when present, source label, and review date.

`null` copy uses `Belum terverifikasi`. The no-result state says the dataset has no matching result and asks the caregiver to adjust filters or confirm with the facility/BPJS; it never states that no facility exists. BPJS guides use compact expandable rows with source, review date, steps, and a changing-rules caveat.

The layout is dense and scannable rather than card-heavy. Desktop targets 1440x900; mobile targets 390x844 with one-column controls, stable touch targets, visible focus, no horizontal overflow, and text/icon status that does not rely on color alone.

## States and Errors

Facility and guide requests have independent loading, ready, empty, error, retry, and expired-session states. Switching Patient Profile remounts the helper so prior filters and request state do not appear under the new Patient identity. Network and server errors remain generic and expose no source internals, stack traces, or session data.

## Testing and Verification

TDD covers static-data validation, uniqueness, null semantics, deterministic single/combined filters, no-result behavior, metadata derivation, route authentication/validation/cache headers, UI loading/error/reset/null states, BPJS guide disclosure, and active-profile switching.

Playwright covers the stable demo flow: open from Maya's dashboard, choose Kota Tangerang, require verified BPJS, choose Penyakit Dalam, inspect source/review copy, reset, test emergency-unit filtering, and deliberately produce no result. The same journey is inspected at 390x844 and 1440x900. Full verification includes focused and full Vitest suites, lint, typecheck, build, E2E, copy/secret scans, screenshots, keyboard review, and console inspection.

## Human-Only Closure

Codex performs every automatable and browser-observable check. Remaining human authority is limited to Daniel's subjective UX/DRI acceptance, Ozan's packet status verdict and spoken 20-second rehearsal, and any phone-based verification of current facility details. No source claim is upgraded from unknown merely to remove a human verification item.

## Ownership Handoff

- Daniel: DRI for production hierarchy, responsive behavior, and final UX acceptance.
- Bernard: static API contract, caregiver authorization, deterministic filtering, and technical review.
- Al: BPJS/faskes safety wording and no-clinical-ranking review.
- Ozan: evidence review, human rehearsal, and Packet 10 status.
