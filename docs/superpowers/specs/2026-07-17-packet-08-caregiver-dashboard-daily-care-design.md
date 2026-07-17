# Packet 08 Caregiver Dashboard and Daily Care Design

**Status:** Approved by the human on 2026-07-17. Packet status remains `Draft`.

## Goal

Deliver the production `/caregiver` daily-care workspace for one explicit active Patient Profile: latest Packet 07 check-in, advisory setup checklist, medication and medication-log basics, reminders, and short caregiver health notes. Packet 09–12 surfaces remain unavailable and make no production claims.

## Architecture

The existing caregiver authentication state machine remains the entry boundary. A focused caregiver workspace composes the existing Patient Profile lifecycle controls with a new dashboard client. The dashboard client owns only active-profile daily-care fetching, request cancellation/generation checks, forms, and feedback; it never authorizes a Patient Profile.

Server code is split by responsibility under `web/src/lib/daily-care/`: Zod contracts, shared caregiver/profile authorization helpers, dashboard aggregation, medication transactions, reminder operations, and health-note operations. Thin route handlers under the locked `/api/v1/patient-profiles/{patientProfileId}/...` paths parse, resolve caregiver auth, call a service, and return the repository's safe response envelope with `Cache-Control: private, no-store`.

## Data Model

Add the locked enums `MedicationStatus`, `MedicationLogStatus`, `ReminderType`, and `ReminderStatus`, plus `Medication`, `MedicationLog`, `Reminder`, and `HealthNote`. Every record has explicit `patientProfileId`, restrictive relations, locked field sizes, and the documented indexes.

Medication creation/reactivation and `currentMedicationsStatus = REPORTED` occur in one transaction. Pausing/ending the final active Medication and changing the profile status to `UNKNOWN` also occur in one transaction. Neither service nor seed selects `NONE_REPORTED` automatically. Medication-log and related-reminder writes verify that the Medication belongs to the same explicit Patient Profile.

The migration is additive and reviewable. The seed remains idempotent and uses distinct synthetic Maya/Raka Packet 08 states without Packet 09–12 records.

## API and Concurrency

The dashboard aggregate returns a whitelisted active Patient Profile summary, derived setup checklist, latest check-in, active medications, upcoming reminders, and recent health notes. It intentionally omits documents, chat, SOS, and faskes data for this packet.

List and mutation services first resolve the caregiver session, active membership, active Care Circle, and matching active Patient Profile. Owner and Family Member have the same Packet 08 daily-care permissions. Patient actors cannot enter these caregiver routes.

Medication and reminder PATCH requests include the record's latest `updatedAt` value. The service performs a conditional update and returns `CONFLICT` when the current server version differs, preventing silent stale overwrites.

## UI and Interaction

`NEWDESIGN.md` remains visual authority: warm canvas, white bordered surfaces, Plus Jakarta Sans, teal primary, amber rhythm accent, Phosphor icons, 14–18 px caregiver radii, 4/8 px spacing, visible blue focus, and minimum 44×44 px controls.

Desktop uses a 240 px caregiver sidebar, a scannable main column, and an optional Packet 07–08 activity rail. Mobile uses a compact header, sticky Patient Context Bar, one-column cards, and a small labeled navigation set. `Ringkasan` and `Perawatan` are functional within `/caregiver`; later destinations are disabled with `Belum tersedia` or omitted. No fake badge, document review, assistant, SOS, audio, Realtime, or faskes action appears.

When the active Patient changes, the context label changes immediately, all prior patient-bound data is removed, a named skeleton is shown, and only the newest request may publish results. A failure keeps the new Patient identity visible with `Coba lagi`.

Forms use visible labels, inline validation, disabled pending submit, `aria-live` status, safe helper copy, and no clinical recommendation. Medication dose/schedule are explicitly recorded text. Reminder copy states that ChroniCare does not provide OS notification delivery. Health notes request short coordination notes rather than diagnosis or raw medical narrative.

## States and Errors

The existing auth states remain intact: checking, signed out, onboarding required, denied, error, signed in, session expiry, and logout. Packet 08 adds no-profile, active-profile loading, empty/latest check-in, medication `UNKNOWN`/`NONE_REPORTED`/recorded states, reminder and health-note empty/current states, saving, success, validation, forbidden, deactivated, server/network error, conflict, and profile switching.

Errors use generic codes and recovery actions without stack, database text, UUID detail, session, email, notes, or provider information. Status always uses text and icon rather than color alone.

## Testing

TDD proceeds RED→GREEN for schema/contract behavior, service authorization and transactions, API validation/no-store/error envelopes, then UI stale-response and accessibility states. Full verification includes Prisma generate/validate/migration checks, lint, typecheck, focused tests, all unit tests, build, E2E, and manual 390×844 plus 1440×900 review when local credentials permit.

## Ownership Handoff

- Daniel: Caregiver dashboard hierarchy, responsive behavior, accessibility, and visual acceptance.
- Bernard: schema, migration, route/service contracts, authorization, concurrency, and profile isolation.
- Ozan: product acceptance, Packet status, automated evidence, and manual QA.
- Al: medication/reminder/health-note medical-safety copy.
