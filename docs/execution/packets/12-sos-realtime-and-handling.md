# Packet 12: SOS Realtime and Handling

Status: Draft

Driver / DRI: Bernard

Contributors: Daniel, Al, Ozan

Reviewer: Ozan

Timebox: hours 21 to 24

## Role Work

- Role A - SOS API/Realtime, DRI: Bernard: implement SOS event creation, authorization, Supabase Realtime subscription, reconnect fetch, and atomic handling.
- Role B - Alert UI, DRI: Daniel: build Patient SOS action, caregiver persistent visual alert, audio opt-in/test/mute, and handling states.
- Role C - Emergency wording, DRI: Al: review copy so SOS is family coordination and not official emergency dispatch.
- Role D - Two-context QA, DRI: Ozan: verify Patient-to-caregiver demo path, audio blocked path, conflict, disconnect, and wrong-Care-Circle denial.

## Goal

Implement the Patient-to-caregiver SOS path through Supabase Realtime, including visual alert, audio opt-in, reconnect fallback, and atomic `Saya tangani`.

## User-Visible Outcome

Patient creates SOS; an open authorized caregiver dashboard receives a persistent visual alert; caregiver can opt into sound and one caregiver can claim handling.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/12-sos-realtime-and-handling.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/technical/architecture.md`
- `docs/security-privacy.md`
- `docs/technical/ai-guardrails.md`

## Dependency Inputs

- Completed Packet 07 Patient homepage exists.
- Completed Packet 08 caregiver dashboard exists.
- Patient/caregiver authorization from Packet 05 works.
- Supabase Realtime can be enabled for `sos_events` or fallback polling/reconnect is documented.
- Audio asset is synthetic/simple and does not require external service.

## Hard Dependencies

- Packet 04 caregiver authorization must exist.
- Packet 05 Patient session/profile isolation must exist.
- Packet 07 Patient surface must exist.
- Packet 08 caregiver dashboard must exist.

## Soft Dependencies / Parallel Prep

- Daniel can build alert UI using fixture event while Bernard implements Realtime.
- Al can review emergency copy before final provider integration.
- Ozan can prepare two-browser manual QA setup.

## Allowed Files / Areas

- `web/src/app/api/v1/patient-profiles/[patientProfileId]/sos/`
- `web/src/app/api/v1/sos-events/`
- `web/src/components/sos/`
- `web/src/lib/sos/`
- `web/src/lib/realtime/`
- `web/public/audio/`
- `web/prisma/` only for SOS model if not already added
- `web/tests/**/sos*`
- `web/tests/e2e/**/sos*`

## Out of Scope

- WhatsApp.
- SMS.
- OS notification.
- Push API.
- Service worker.
- Background delivery.
- Live location.
- Ambulance dispatch.
- Family chat.
- Claiming delivery when caregiver tab is closed or disconnected.

## Acceptance Criteria

- SOS row is bound to the Patient Profile that created it.
- Authorized open caregiver dashboard receives Realtime insert/update.
- Unauthorized Care Circle receives no event.
- Visual alert works even if audio is blocked.
- Audio requires opt-in and can be tested/muted.
- Two simultaneous `Saya tangani` attempts produce one handler and one conflict.
- Reconnect/focus refetch recovers active SOS events.
- UI says family alert, not official emergency service.
- Minimum SOS data is stored; no raw precise live location is added.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- sos` from `/web` if supported | SOS create, authorization, handler conflict, and wrong-Care-Circle denial pass. |
| `npm run typecheck` from `/web` | SOS API, Realtime, and UI types compile. |
| `npm run lint` from `/web` | SOS code lint cleanly. |
| `npm run test:e2e` from `/web` if SOS E2E exists | Two-context SOS flow, visual alert, and handling path pass. |

## Manual QA

- Open Patient Maya and caregiver dashboard in separate browser contexts.
- Enable and test alert sound.
- Trigger SOS from Patient.
- Handle as one caregiver while another dashboard is open.
- Repeat with sound disabled and Realtime disconnected.
- Try a wrong Care Circle subscriber and inspect denial.

## Documentation Update Rules

- Do not add WhatsApp/SMS/push/background delivery to docs.
- Do not claim official emergency dispatch, delivery guarantee, or closed-tab notification.
- If Realtime fallback differs from architecture docs, record actual behavior in handoff and ask before changing canonical docs.

## Blockers / Stop Conditions

- Realtime RLS policy cannot prevent wrong-Care-Circle event access.
- Browser autoplay blocks sound and visual fallback is not persistent.
- Handler conflict is not atomic.
- Presenter copy would overclaim emergency delivery or dispatch.

## Handoff Notes

Provide two-context setup instructions, sound opt-in step, Realtime indicator behavior, REST recovery method, conflict evidence, wrong-Care-Circle evidence, and visual-only fallback screenshot.

