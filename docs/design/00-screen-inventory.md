# ChroniCare Screen Inventory

Status: Proposed  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Daniel  
Product/QA reviewer: Ozan  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-17

## Authority

This inventory is a design coverage artifact for ChroniCare. It identifies the
minimum user-facing and system-facing surfaces needed to represent the approved
MVP scope. It does not establish routes, navigation architecture, user flows,
screen hierarchy, implementation paths, or implementation readiness.

Current product, safety, role, privacy, data, API, provider, execution, demo,
and QA contracts override this inventory. A surface listed here is planned
coverage, not evidence that the application or feature exists.

`NEWDESIGN.md` is the active visual source of truth. This inventory continues
to govern surface coverage, roles, primary jobs, packet mapping, and state
obligations; it does not override Care in Motion visual decisions.

## Sources

Guardrail and strategic adapters:

- `AGENTS.md`
- `README.md`
- `PRODUCT.md`
- `NEWDESIGN.md`
- `docs/team/ownership.md`

Locked product sources:

- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`

Locked technical, safety, and privacy sources:

- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`

Execution sources:

- `docs/execution/workflow.md`
- `docs/execution/packets.md`
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
- `docs/execution/packets/02-env-and-provider-boundary.md`
- `docs/execution/packets/03-data-schema-prisma-and-seed-base.md`
- `docs/execution/packets/04-caregiver-auth-and-membership-authorization.md`
- `docs/execution/packets/05-patient-access-code-and-profile-isolation.md`
- `docs/execution/packets/06-patient-profile-lifecycle-deactivation.md`
- `docs/execution/packets/07-patient-homepage-and-check-in.md`
- `docs/execution/packets/08-caregiver-dashboard-medication-and-reminder.md`
- `docs/execution/packets/09-document-upload-ocr-and-review.md`
- `docs/execution/packets/10-faskes-and-bpjs-helper.md`
- `docs/execution/packets/11-chatbot-safety-gateway-and-personas.md`
- `docs/execution/packets/12-sos-realtime-and-handling.md`
- `docs/execution/packets/13-qa-deploy-and-demo-rehearsal.md`

Demo and verification sources:

- `docs/pitch/demo-script.md`
- `docs/pitch/pitch-structure.md`
- `docs/pitch/judging-rubric-mapping.md`
- `docs/qa/demo-readiness-checklist.md`

## Scope

In scope for this artifact:

- Identify planned Patient, Caregiver, Owner-only, OCR Review, SOS, and system
  surfaces.
- Assign stable design IDs that are not routes.
- Classify P0 Demo, P0 Support, MVP Lifecycle, P1 Support, System, Parking Lot,
  and Out of Scope coverage.
- Record entry points, primary jobs, primary actions, roles, modes, packet
  coverage, state obligations, and canonical evidence.
- Trace all thirteen execution packets without treating technical-only work as
  screens.
- Make product limitations visible at inventory level.

Out of scope for this artifact:

- Route names or URL structure.
- Navigation architecture.
- User-flow sequence design.
- Screen hierarchy or detailed content hierarchy.
- State matrix or UX copy.
- Responsive layout decisions beyond obligations inherited from `NEWDESIGN.md`.
- Wireframes, prototypes, components, implementation paths, or source code.

## Priority Definitions

- **P0 Demo:** appears directly in the connected two-minute product demo and is
  necessary to prove the core product promise.
- **P0 Support:** required to enter, authorize, prepare, continue, or safely
  recover the P0 demo, but is not itself the main proof moment.
- **MVP Lifecycle:** required product lifecycle coverage that is not part of the
  main two-minute demo.
- **P1 Support:** implemented only after all P0 behavior is stable and verified.
- **System:** cross-mode access, recovery, connection, fallback, or application
  state. A System item may be a full-page state, inline state, banner, dialog,
  sheet, or persistent alert rather than a standalone screen.
- **Parking Lot:** a documented idea that receives no active implementation
  surface in this MVP.
- **Out of Scope:** behavior that must not receive a surface implying it exists.

## Inventory Rules

1. One surface represents one primary user job or one materially distinct trust
   boundary.
2. An API endpoint, database entity, packet, modal, toast, badge, loading state,
   or copy variant does not automatically become a separate screen.
3. IDs are stable design references. They do not define routes, files, or
   navigation order.
4. Patient, Caregiver, OCR Review, and SOS remain distinct modes within one
   ChroniCare identity.
5. Patient sessions are bound to one Patient Profile; Patient never receives a
   free profile selector.
6. Caregiver surfaces keep active Patient context explicit. Active Patient UI
   state is not authorization.
7. Every patient-bound operation requires an explicit `patientProfileId` and
   server-side membership or session validation.
8. Owner-only actions are not presented to Family Members as available actions.
9. Loading or switching may not show one Patient's data under another Patient's
   identity.
10. OCR remains draft until caregiver review. `PENDING_REVIEW`, `CONFIRMED`,
    `REJECTED`, `FAILED`, and `DEMO_FALLBACK` must remain distinguishable.
11. AI surfaces provide navigation, general routine support, administrative
    guidance, summaries of authorized data, and doctor-visit preparation. They
    do not provide clinical decisions.
12. SOS is open-dashboard caregiver/family coordination. It is not emergency
    dispatch and carries no closed-tab delivery guarantee.
13. Faskes/BPJS results come from a static Tangerang dataset and require direct
    confirmation.
14. Patient Profile deactivation is Owner-only and non-destructive.
15. All demo identities, documents, and health data are synthetic.
16. All execution packets remain `Draft` and QA remains `Not Run`. Current
    files on disk and fresh verification evidence, not this inventory, determine
    implementation availability.

## Patient Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| PAT-01 | Patient code sign-in | P0 Support | Patient entry from SYS-01 or an existing Patient entry context | Start a Patient session bound to exactly one Patient Profile | `Masuk dengan kode` | Patient | Patient | 01, 05 | Default, submitting, invalid or expired code, rate-limited or locked, session-created success, generic error; never reveal Patient identity before authorization | `feature-scope.md` 2.2; `user-journeys.md` Patient login; Packet 05 |
| PAT-02 | Patient home | P0 Demo | Successful PAT-01 session or restored valid Patient session | Understand today's immediate routine and available help for the bound Patient Profile | `Isi check-in hari ini` | Patient | Patient | 07; entry support for 11 and 12 | Loading, empty routine, partial data, error, session expired, deactivated profile, offline; show correct Patient identity and keep SOS serious | `feature-scope.md` 3.1; `user-journeys.md` Patient homepage; Packet 07 |
| PAT-03 | Daily check-in | P0 Demo | PAT-02 | Give a short update about the Patient's current routine or general condition | `Kirim check-in` | Patient | Patient | 07 | Default, validation, submitting, success, retry, duplicate prevention, wrong-profile forbidden, deactivated profile, offline; no diagnosis or treatment inference | `feature-scope.md` 3.2; `user-journeys.md` Patient check-in; Packet 07 |
| PAT-04 | Reminder and recorded medication detail | P0 Support | Reminder or medication entry on PAT-02 | Read the next reminder and caregiver-recorded medication text without clinical interpretation | None; read-only for P0. Medication taken logging remains P1 | Patient | Patient | 07, 08 | Loading, no upcoming reminder, inactive item, session expired, offline, error; recorded guidance must not look like a prescription generated by ChroniCare | `product-context.md` 6.1; `feature-scope.md` 3.1 and 4.2; `security-privacy.md` 3 |
| PAT-05 | Patient chatbot | P0 Demo | PAT-02 | Receive short, safe routine or navigation support for the bound Patient Profile | `Kirim pertanyaan` | Patient | Patient | 11 | Empty conversation, sending, response, safety refusal, emergency escalation, provider fallback, retry, session expired, offline; never expose hidden context or another profile | `feature-scope.md` 3.3; `ai-guardrails.md`; Packet 11 |

## Caregiver Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CG-01 | Caregiver sign-in | P0 Support | Caregiver entry from SYS-01 or an existing caregiver entry context | Start an authenticated caregiver session | `Masuk` | Owner, Family Member | Caregiver | 01, 04 | Default, submitting, invalid credentials, provider unavailable, session success, generic error; do not imply Patient code login uses the same auth path | `feature-scope.md` 2.1; `architecture.md` 4.1; Packet 04 |
| CG-02 | Active Patient caregiver dashboard | P0 Demo | Successful CG-01 session and authorized active Patient selection | Understand the active Patient's latest condition, routine, documents, SOS, and next actions | `Tinjau dokumen`; an active SOS overrides routine action hierarchy | Owner, Family Member | Caregiver | 08; entry support for 09-12 | Loading, empty daily care, partial data, error, stale data, session expired, forbidden, active SOS, profile switching; active Patient identity is persistent | `feature-scope.md` 4.1; `user-journeys.md` caregiver dashboard; Packet 08 |
| CG-03 | Active Patient selector | P0 Demo | Persistent active Patient control from caregiver context | Switch between a maximum of two authorized Patient Profiles without stale data | `Pilih Patient` | Owner, Family Member | Caregiver | 05, 08 | Loading available profiles, one-profile state, two-profile state, switch in progress, switch error, forbidden profile, deactivated profile excluded; never render old data under the new identity | `feature-scope.md` 2.3; `user-journeys.md` profile switch; Packet 05 |
| CG-04 | Daily-care management | P0 Support | Daily-care entry from CG-02 | Review and maintain recorded medication text, reminders, and basic health notes for the active Patient | `Simpan catatan` or `Simpan pengingat`, according to the active task | Owner, Family Member | Caregiver | 08 | Loading, empty, validation, saving, success, error, forbidden, stale update, active/inactive item, profile switch; no dose recommendation or clinical validation | `feature-scope.md` 4.2; `data-model.md` daily-care entities; Packet 08 |
| CG-05 | Caregiver chatbot | P0 Demo | Patient-bound preparation entry from CG-02 | Prepare concise questions or administrative next steps using authorized daily-care and confirmed OCR context | `Kirim pertanyaan` | Owner, Family Member | Caregiver | 11 | Context loading, empty context, response, refusal, emergency escalation, confirmed-context provenance, provider fallback, retry, profile switch, session expired, offline | `feature-scope.md` 4.4; `ai-guardrails.md`; Packet 11 |
| CG-06 | Faskes and BPJS helper | P0 Demo | Patient-bound helper entry from CG-02 | Filter static Tangerang facility information and understand general administrative next steps | `Terapkan filter` | Owner, Family Member | Caregiver | 10 | Initial results, filtering, empty result, data unavailable, source/review-date visibility, stale dataset notice, profile context, offline; no ranking, realtime availability, or guaranteed BPJS acceptance | `product-context.md` 10; `feature-scope.md` faskes/BPJS; Packet 10 |
| CG-07 | Care activity history | P1 Support | Caregiver history entry from the active Patient context | Review a concise history of SOS and audited care activity without exposing sensitive payloads | `Lihat aktivitas` | Owner, Family Member within permitted data | Caregiver | 08, 12; P1 expansion | Loading, empty history, filtered Patient context, pagination or limited history, forbidden, error; audit summary excludes sensitive content | `PRODUCT.md` P1 Support; `security-privacy.md` 15 |

## Owner-Only Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| OWN-01 | Care Circle member management | P1 Support | Owner administration context | Review, invite, or remove Family Members in the single Care Circle | `Undang anggota` | Owner | Caregiver | 04; P1 expansion | Loading, current members, invite pending, validation, success, removal confirmation, forbidden, error; exactly one active Owner remains | `feature-scope.md` P1; `security-privacy.md` 3; Packet 04 out-of-scope note |
| OWN-02 | Patient access code management | P1 Support | Owner Patient Profile administration context | Create or regenerate a Patient access code and revoke old Patient sessions safely | `Buat ulang kode akses` | Owner | Caregiver | 05; P1 expansion | No active code, active code, confirmation, generating, one-time reveal rules, success, error, forbidden, old-session revocation; no code or session in logs | `PRODUCT.md` Owner Jobs and P1 Support; `security-privacy.md` 5 |
| OWN-03 | Add second Patient Profile | P1 Support | Owner Care Circle administration context when fewer than two Patient Profiles exist | Add the permitted second Patient Profile without exceeding the MVP limit | `Tambah Patient Profile` | Owner | Caregiver | 03, 05; P1 user-facing expansion | Current count, form validation, saving, success, two-profile limit reached, forbidden, conflict; no third profile and no second Care Circle | `AGENTS.md` 7-8; `product-context.md` 3.1; `data-model.md` 4.1 |
| OWN-04 | End-of-care or Patient Profile deactivation | MVP Lifecycle | Owner-only Patient Profile administration context | Remove a Patient Profile from active care safely while retaining authorized history | `Nonaktifkan profil pasien` | Owner | Caregiver | 06 | Consequence explanation, reason selection, explicit confirmation, submitting, success, error, forbidden, conflict, access revocation, active-list removal; never imply hard delete or subscription cancellation | `feature-scope.md` MVP lifecycle; `user-journeys.md` 13; Packet 06 |

## OCR Review Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| OCR-01 | Patient document list | P0 Demo | Document entry from CG-02 for the active Patient | Find an existing document to review or start a private upload | `Unggah dokumen` | Owner, Family Member | OCR Review | 09 | Loading, no documents, status-grouped list, error, forbidden, profile switch, search/filter P1 enhancement; file provenance and Patient identity remain visible | `feature-scope.md` 4.3; `user-journeys.md` document journey; Packet 09 |
| OCR-02 | Private document upload | P0 Demo | OCR-01 | Select and submit one supported synthetic health document for the active Patient | `Unggah dan proses` | Owner, Family Member | OCR Review | 09 | File selection, client validation, uploading, upload success, upload error/retry, unsupported type, over 5 MB, over three pages, duplicate or integrity warning, session expired, profile switch; no public URL | `feature-scope.md` 4.3; `security-privacy.md` 8; Packet 09 |
| OCR-03 | OCR review workspace | P0 Demo | Uploaded or existing document requiring review from OCR-01 or OCR-02 | Compare the original private document with a machine-generated draft, edit it, and make a human review decision | `Konfirmasi hasil` | Owner, Family Member | OCR Review | 09 | `PROCESSING`, `REVIEW_REQUIRED`, `PENDING_REVIEW`, editable draft, validation issue, confirm pending/success, reject confirmation/success, `CONFIRMED`, `REJECTED`, `FAILED`, retry, `DEMO_FALLBACK`, forbidden, profile switch; only confirmed output may enter chatbot context | `feature-scope.md` 4.3; `ai-guardrails.md` 10; Packet 09 |

## SOS Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| SOS-01 | Patient SOS request and confirmation | P0 Demo | Persistent SOS entry from PAT-02 or emergency escalation from PAT-05 | Deliberately request help from the Patient's family or caregivers through ChroniCare | `Kirim SOS` | Patient | SOS | 12 | Confirmation, creating, success recorded, duplicate/idempotent request, error/retry, offline, session expired, deactivated profile; never claim ambulance dispatch or closed-tab delivery | `feature-scope.md` 3.4; `user-journeys.md` 11; Packet 12 |
| SOS-02 | Caregiver persistent SOS alert | P0 Demo | New or active SOS discovered by Realtime or REST refetch while caregiver context is authorized | Notice an active SOS and identify the Patient, time, connection, audio, and handling state | `Lihat dan tangani` | Owner, Family Member | SOS | 12 | New alert, persistent visual-only state, audio enabled/blocked/muted, disconnected/reconnecting, refreshed, already handled; no sound-only or color-only meaning | `architecture.md` 8; `security-privacy.md` 11; Packet 12 |
| SOS-03 | Caregiver SOS handling detail | P0 Demo | SOS-02 | Claim family handling atomically and understand who is currently handling the event | `Saya tangani` | Owner, Family Member | SOS | 12 | Available, claiming, handled success, first-handler conflict, current handler, cancelled, stale state, reconnect/refetch, forbidden, wrong Care Circle denial; minimum Patient context only | `feature-scope.md` SOS; `user-journeys.md` 11; Packet 12 |
| SOS-04 | SOS history | P1 Support | Patient-bound history entry from caregiver context | Review prior SOS states and handlers for coordination or audit | `Lihat riwayat SOS` | Owner, Family Member within permitted data | SOS | 12; P1 expansion | Loading, empty, handled/cancelled history, error, forbidden, Patient filter, limited audit detail; no full medical history | `PRODUCT.md` P1 Support; `security-privacy.md` 11 and 15 |

## System and Recovery Surfaces

| ID | Surface | Priority | Entry Point | Primary Job | Primary Action | Role | Mode | Packet | State Obligations | Product Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| SYS-01 | Product role entry | P0 Support | Public application entry | Choose the correct Patient or caregiver authentication path without merging their session models | `Masuk sebagai Patient` or `Masuk sebagai Caregiver` | Public visitor | Shared ChroniCare identity | 01 | Default, unavailable path, keyboard focus, honest pre-feature shell; no feature-success claim | `architecture.md` 1 and 5; Packet 01 |
| SYS-02 | Forbidden access | System | Server denial from any protected surface | Understand that the current actor cannot perform or view the requested action without exposing protected data | `Kembali` | Patient, Owner, Family Member, unauthenticated actor | Mode inherited from denied context | 04-06, 09-12 | Full-page or inline denial, generic explanation, request-safe recovery; no hidden Patient, Care Circle, document, or membership details | `api.md` error contract; `security-privacy.md` 3-6 |
| SYS-03 | Session expired | System | Expired or revoked caregiver or Patient session | Restore access through the correct authentication path | `Masuk kembali` | Patient, Owner, Family Member | Mode inherited from session | 04, 05, 06 | Persistent notice, unsaved-change handling where safe, separate Patient/caregiver recovery, no token or profile leakage | `security-privacy.md` 5; `NEWDESIGN.md` Cross-Screen State Model |
| SYS-04 | Resource not found | System | Missing or safely concealed protected resource | Recover without learning whether an unauthorized Patient Profile or record exists | `Kembali` | Patient, Owner, Family Member | Mode inherited from request | 04-12 | Full-page or inline state, generic copy, no cross-profile detail, optional safe retry | `architecture.md` 5; `api.md` public error behavior |
| SYS-05 | Offline and reconnecting | System | Browser connectivity loss, Realtime disconnect, or refocus | Understand connection state and restore current server truth | `Coba lagi` or `Muat ulang` | Patient, Owner, Family Member | Shared; SOS treatment becomes persistent when relevant | 08, 12 | Offline banner, reconnecting progress, last-refreshed time, REST refetch success/error, stale-data distinction; active SOS remains visually discoverable | `architecture.md` 9; `user-journeys.md` SOS fallback; Packet 12 |
| SYS-06 | Provider or demo fallback | System | Azure AI, OCR, data provider, or demo service unavailable | Continue safely with an explicit limitation or labeled fallback | Context-specific retry or safe continuation | Patient, Owner, Family Member | Patient, Caregiver, or OCR Review | 02, 09-11, 13 | Provider unavailable, deterministic safe response, OCR `FAILED`, `DEMO_FALLBACK`, retry, source label; never present fallback as live success | `hackathon-mvp-scope-demo.md` 13; `ai-guardrails.md` fallback rules |
| SYS-07 | Application error and retry | System | Unexpected request or data failure not covered by a more specific state | Recover from a safe generic failure without losing authorization boundaries | `Coba lagi` | Patient, Owner, Family Member | Mode inherited from task | 01-13 | Inline or full-page error, request ID where safe, retry, return, duplicate prevention, no stack/provider/SQL detail | `architecture.md` 9; `security-privacy.md` 6 and 13 |

Loading, empty, disabled, validation, success, conflict, pending, confirmed,
rejected, and retry treatments remain state obligations on the owning surface.
They are not independent screens unless a later screen specification proves a
separate primary job and trust boundary.

## P1 Support Surfaces

| Surface ID | P1 capability | Existing surface treatment | Canonical source |
|---|---|---|---|
| OWN-01 | Invite and remove Family Member with complete states | Dedicated Owner-only member management surface | `feature-scope.md` P1; `PRODUCT.md` P1 Support |
| OWN-02 | Regenerate Patient access code and revoke old Patient sessions | Dedicated Owner-only access management surface | `feature-scope.md` P1; `security-privacy.md` 5 |
| OWN-03 | Add the permitted second Patient Profile | Dedicated Owner-only administration surface; third profile remains prohibited | `AGENTS.md` 7-8; `data-model.md` 4.1 |
| PAT-04 | Medication log `sudah diminum` | Additional action and state within the existing routine detail, not a new screen | `feature-scope.md` P1 |
| OCR-01 | Document search and filter | Controls within the document list, not a separate screen | `feature-scope.md` P1 |
| CG-06 | Additional facility search and filters plus richer provenance | Expansion within the existing faskes/BPJS helper | `feature-scope.md` P1 |
| CG-05 | Limited same-session chat history | Expansion within the existing persona-specific chat surface | `feature-scope.md` P1 |
| SOS-04 | SOS history | Dedicated Patient-bound history surface | `PRODUCT.md` P1 Support |
| CG-07 | Simple audit activity | Dedicated concise history surface with redacted details | `PRODUCT.md` P1 Support; `security-privacy.md` 15 |

P1 also permits refinement of loading, empty, error, reconnect, and retry
behavior, but every P0 surface already requires a safe minimum representation of
those states. P1 may polish recovery; it may not defer P0 safety or profile
isolation.

## Parking Lot

The following ideas receive no active implementation surface in this inventory:

- Food, menu, and pantangan guidance.
- Personalized chronic-condition onboarding.
- Caregiver profile editing.
- Non-critical settings.
- In-app notification preferences beyond the P0 SOS audio control.
- Non-clinical insight cards based on seed data.
- Future recorded clinician or nutritionist guidance beyond current daily-care
  text.

Any future food or nutrition surface requires a new human verdict and must not
become personal clinical advice generated by AI.

## Explicitly Out of Scope

No active product screen may imply the availability of:

- Diagnosis, prognosis, clinical risk scoring, triage, or clinical decision
  support.
- Drug recommendation, dose calculation, dose change, or instruction to stop
  medication.
- Personal diabetes targets, insulin adjustment, oral medication adjustment,
  final lab interpretation, or personal nutrition prescription.
- OCR without human review or automatic daily-care updates from OCR.
- Medical image analysis, batch OCR, background OCR queues, documents over 5 MB,
  or documents over three pages.
- Voice-to-text, text-to-speech, wearable devices, sensors, or live monitoring.
- Live or precise location.
- WhatsApp, SMS, email alerts, Push API, service worker, OS notifications, or
  background SOS delivery.
- Ambulance calls, IGD dispatch, or official emergency-service integration.
- Realtime facility scraping, booking, route navigation, doctor schedules,
  hospital integration, BPJS integration, facility ranking, or availability
  guarantees.
- Family chat.
- Real payment or subscription.
- Multiple Care Circles, a third Patient Profile, or custom granular roles.
- Hard deletion as the Patient Profile deactivation default.
- Formal retention, consent, legal hold, right-to-erasure, or production
  incident workflows.
- HIPAA, clinical validation, medical-device, legal approval, security
  certification, deployment-success, or production-readiness claims.

## Requirement Coverage

| Requirement | Canonical Source | Surface ID | Coverage | Notes |
|---|---|---|---|---|
| Public role entry | Architecture; Packet 01 | SYS-01 | Covered | Separates Patient and caregiver authentication paths |
| Patient access code login | Feature scope; Packet 05 | PAT-01 | Covered | Generic invalid/expired response; one bound Patient Profile |
| Patient session | API; Security | PAT-01, PAT-02, SYS-03 | Covered | Patient cannot choose another profile or enter caregiver UI |
| Caregiver authentication | Feature scope; Packet 04 | CG-01, SYS-03 | Covered | Supabase Auth remains distinct from Patient session |
| Membership authorization | Security; Packet 04 | CG-01, SYS-02 | Covered | Server membership and role remain authoritative |
| Active Patient Profile switching | Feature scope; Packet 05 | CG-03 | Covered | Maximum two profiles; deactivated profiles excluded |
| Wrong-profile isolation | Architecture; Security; QA AUTH-07/08 | CG-03, SYS-02, SYS-04 | Covered | UI switching cannot replace server authorization |
| Patient homepage | Feature scope; Packet 07 | PAT-02 | Covered | Immediate routine, reminder, chatbot, and SOS entries |
| Daily check-in | Feature scope; Packet 07 | PAT-03 | Covered | Bound write, duplicate prevention, non-clinical copy |
| Patient reminder and medication text | Product context; Packet 07/08 | PAT-04 | Covered | Read recorded content; taken log remains P1 |
| Caregiver dashboard | Feature scope; Packet 08 | CG-02 | Covered | Active Patient, recency, states, and next actions |
| Medication, reminder, and health-note basics | Feature scope; Packet 08 | CG-04 | Covered | P0 support surface; no clinical dose logic |
| Private document list | Feature scope; Packet 09 | OCR-01 | Covered | Patient-bound status and provenance |
| Private document upload | Security; Packet 09 | OCR-02 | Covered | PDF/JPEG/PNG, 5 MB, three pages, private Storage |
| OCR processing and human review | AI guardrails; Packet 09 | OCR-03 | Covered | Original-first, editable draft, explicit decision |
| OCR confirm and reject | Data model; Packet 09 | OCR-03 | Covered | Only `CONFIRMED` may enter chatbot context |
| OCR/provider fallback | Demo scope; Packet 09 | OCR-03, SYS-06 | Covered | `FAILED`, retry, and visible `DEMO_FALLBACK` |
| Patient chatbot | Feature scope; Packet 11 | PAT-05 | Covered | Short persona, refusal, emergency, fallback |
| Caregiver chatbot | Feature scope; Packet 11 | CG-05 | Covered | Active profile plus confirmed context only |
| AI refusal and emergency response | AI guardrails; Packet 11 | PAT-05, CG-05 | Covered | No diagnosis, dose, lab-final, target, or diet authority |
| AI provider fallback | AI guardrails; Packet 11 | PAT-05, CG-05, SYS-06 | Covered | Labeled deterministic safe response |
| SOS creation and confirmation | Feature scope; Packet 12 | SOS-01 | Covered | Patient-bound and deliberate confirmation |
| Caregiver SOS alert | Architecture; Packet 12 | SOS-02 | Covered | Persistent visual alert; open authorized dashboard only |
| Audio opt-in | Security; Packet 12 | SOS-02 | Covered | State within alert/dashboard; not a standalone screen |
| Atomic SOS handling | API; Packet 12 | SOS-03 | Covered | First handler wins |
| SOS conflict | User journeys; Packet 12 | SOS-03 | Covered | Losing caregiver sees current handler |
| Reconnect and REST refetch | Architecture; Packet 12 | SYS-05, SOS-02, SOS-03 | Covered | Database remains source of truth |
| Faskes/BPJS helper | Feature scope; Packet 10 | CG-06 | Covered | Static Tangerang data and direct confirmation limitation |
| Owner membership management | Product context; feature P1 | OWN-01 | P1 covered | Full invite/remove behavior is not P0 demo scope |
| Patient access code regeneration | Feature scope P1; Security | OWN-02 | P1 covered | Revokes old code/session; no secret logging |
| Second Patient Profile creation | Product context; data model | OWN-03 | P1 covered | Demo uses seeded Maya/Raka; no third profile |
| End-of-care/deactivation | Feature scope lifecycle; Packet 06 | OWN-04 | MVP Lifecycle covered | Owner-only, non-destructive, access revoked |
| Forbidden | API; Security | SYS-02 | Covered | Does not leak resource existence |
| Session expired or revoked | Security | SYS-03 | Covered | Actor-specific recovery path |
| Not found | Architecture; API | SYS-04 | Covered | Safe concealment for unauthorized resources |
| Offline and reconnecting | Architecture; Design | SYS-05 | Covered | Includes stale-data and last-refreshed treatment |
| Provider fallback | Demo scope; AI guardrails | SYS-06 | Covered | Never represented as live success |
| Generic application error | Architecture; Security | SYS-07 | Covered | Safe retry without implementation detail leakage |
| Synthetic demo data | Product scope; Security | All demo surfaces | Covered as constraint | Dimas, Rina, Maya, and Raka remain fictional |
| Accessibility and responsive obligations | Design; QA UX-01-06 | All interactive surfaces | Covered as inherited obligation | 390x844, 768x1024, 1440x900; WCAG AA target |

## Packet Coverage

| Packet | User-visible outcome | Surface IDs | Technical-only outcome | Coverage |
|---|---|---|---|---|
| 01 Scaffold and Tooling Baseline | Root role entry plus Patient and caregiver authentication shells without false feature claims | SYS-01, PAT-01, CG-01 | `/web`, scripts, test harness, framework configuration | Covered; no implementation claimed |
| 02 Env and Provider Boundary | Safe provider-unavailable or labeled fallback expression when later features need it | SYS-06 | Typed env validation, server-only provider factories, secret boundary | Covered; no standalone screen invented |
| 03 Data Schema, Prisma, and Seed Base | Synthetic Dimas, Rina, Maya, and Raka provide data for later surfaces | PAT-02, CG-02, CG-03 and all patient-bound surfaces | Prisma schema, constraints, audit helper, seed foundation | Covered; no schema screen invented |
| 04 Caregiver Auth and Membership Authorization | Caregiver sign-in plus role-safe forbidden/session states | CG-01, SYS-02, SYS-03 | Verified auth context and Owner/Family Member guards | Covered |
| 05 Patient Access Code and Profile Isolation | Patient code sign-in and caregiver active Patient selector | PAT-01, CG-03, SYS-02, SYS-04 | Patient session helpers and profile isolation enforcement | Covered |
| 06 Patient Profile Lifecycle Deactivation | Owner-only non-destructive deactivation | OWN-04, SYS-02, SYS-03 | Transactional status/access revocation and audit | Covered as MVP Lifecycle |
| 07 Patient Homepage and Check-In | Patient home, routine detail, and check-in | PAT-02, PAT-03, PAT-04 | Profile-bound check-in data/API | Covered |
| 08 Caregiver Dashboard, Medication, and Reminder | Active Patient dashboard and daily-care management | CG-02, CG-03, CG-04 | Daily-care aggregation and patient-bound read/write services | Covered |
| 09 Document Upload, OCR, and Review | Document list, private upload, review/edit/confirm/reject, and visible fallback | OCR-01, OCR-02, OCR-03, SYS-06 | Storage policy, provider integration, extraction validation, confirmed selector | Covered |
| 10 Faskes and BPJS Helper | Static Tangerang filter and result helper | CG-06 | Deterministic facility dataset/API | Covered |
| 11 Chatbot Safety Gateway and Personas | Patient and caregiver chat with refusal, emergency, and fallback states | PAT-05, CG-05, SYS-06 | Context builder, safety pre-routing, Azure gateway | Covered |
| 12 SOS Realtime and Handling | Patient SOS, persistent caregiver alert, atomic handling, reconnect, and conflict | SOS-01, SOS-02, SOS-03, SOS-04, SYS-05 | Realtime authorization, atomic claim, REST recovery | Covered; SOS-04 remains P1 |
| 13 QA, Deploy, and Demo Rehearsal | No new product screen; verifies all planned surfaces and fallback claims | All P0 and System IDs | Command evidence, deploy/local fallback, rehearsal, readiness verdict | Covered as verification gate; no QA screen invented |

All thirteen packets are represented. Packet 02, Packet 03, and Packet 13 are
primarily technical or verification work and therefore do not receive invented
standalone product screens.

The stale `9 packet` wording in `docs/pitch/judging-rubric-mapping.md` and the
older rehearsal packet number in `docs/product/hackathon-mvp-scope-demo.md` are
non-blocking editorial drift. Current `docs/execution/workflow.md`,
`docs/execution/packets.md`, and Packet 01-13 files establish the active
thirteen-packet structure.

## Open Decisions

None.

## Canonical References

Strategic adapters:

- `PRODUCT.md`
- `NEWDESIGN.md`

Product and role authority:

- `AGENTS.md`
- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`
- `docs/team/ownership.md`

Technical and trust authority:

- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`

Execution and evidence authority:

- `docs/execution/workflow.md`
- `docs/execution/packets.md`
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
- `docs/execution/packets/02-env-and-provider-boundary.md`
- `docs/execution/packets/03-data-schema-prisma-and-seed-base.md`
- `docs/execution/packets/04-caregiver-auth-and-membership-authorization.md`
- `docs/execution/packets/05-patient-access-code-and-profile-isolation.md`
- `docs/execution/packets/06-patient-profile-lifecycle-deactivation.md`
- `docs/execution/packets/07-patient-homepage-and-check-in.md`
- `docs/execution/packets/08-caregiver-dashboard-medication-and-reminder.md`
- `docs/execution/packets/09-document-upload-ocr-and-review.md`
- `docs/execution/packets/10-faskes-and-bpjs-helper.md`
- `docs/execution/packets/11-chatbot-safety-gateway-and-personas.md`
- `docs/execution/packets/12-sos-realtime-and-handling.md`
- `docs/execution/packets/13-qa-deploy-and-demo-rehearsal.md`
- `docs/pitch/demo-script.md`
- `docs/qa/demo-readiness-checklist.md`

## Authority and Change Control

This inventory is owned by Daniel and reviewed by Ozan. Bernard reviews
authorization, API, Patient session, Patient Profile isolation, data, Storage,
Realtime, and lifecycle assumptions. Al reviews AI, OCR, extraction, emergency,
and provider-fallback assumptions.

Changes to scope, priority, roles, Patient Profile limits, Care Circle limits,
authorization, medical safety, OCR trust, AI behavior, SOS delivery, BPJS
claims, privacy, data model, API, provider, execution structure, or demo promise
require a human verdict from the relevant DRI before this inventory changes.

The repository name ChronicCare does not change the product name ChroniCare.
