# ChroniCare Screen Specifications

Status: Proposed
Repository: ChronicCare
Product name: ChroniCare
DRI: Daniel
Product/QA reviewer: Ozan
Technical reviewer: Bernard
AI/OCR reviewer: Al
Validated against repository state: 2026-07-17
Input Screen Inventory: `docs/design/00-screen-inventory.md`
Input Screen Inventory SHA-256: `6D37A8DACABAE9662C7BE32A3B5FCA09C563637E3E3C03474238B52A0A23BD1C`
Input User-Flow Map: `docs/design/01-user-flow-map.md`
Input User-Flow SHA-256: `1151E8AA3F52B76D74C8B4C62FA47651FE575C77048CE263CD524060EDB67A00`

## Authority

This artifact defines product and interaction requirements for the stable surface IDs in the proposed Screen Inventory. It locks each active surface's purpose, hierarchy, information, actions, entry and exit behavior, authorization boundary, data dependencies, state obligations, accessibility, and responsive implications.

It does not define URLs, Next.js route groups, dynamic segments, implementation folders, layout files, middleware, browser redirects, component code, final UX copy, or the complete State Matrix. Product, safety, role, privacy, data, API, provider, execution, demo, and QA contracts remain authoritative. A specification is planned design coverage, not evidence that a screen has been implemented or verified.

`NEWDESIGN.md` controls visual hierarchy, component language, typography,
motion, and responsive shells. These specifications continue to control each
surface's job, information requirements, actions, access boundary, and state
obligations.

## Sources

Guardrail and strategic context:

- `AGENTS.md`
- `README.md`
- `PRODUCT.md`
- `NEWDESIGN.md`
- `docs/team/ownership.md`

Product truth:

- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`

Technical, safety, and privacy:

- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`

Design inputs:

- `docs/design/00-screen-inventory.md`
- `docs/design/01-user-flow-map.md`

Execution and verification:

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

## Source Ledger

| Source group | Current status | DRI or reviewer | Specification effect | Conflict |
|---|---|---|---|---|
| AGENTS and locked product docs | Authoritative current product truth | Ozan | Users, scope, roles, demo promise, terminology | None |
| Locked architecture, data, and API docs | Authoritative technical contracts | Bernard | Session, authorization, patientProfileId, data dependencies, errors | None |
| AI guardrails and Packet 09/11 | Authoritative AI/OCR boundary | Al; Bernard reviews integration | Human review, confirmed-only context, refusal, emergency, fallback | None |
| Security and privacy | Authoritative trust boundary | Bernard; Ozan reviews product effect | Isolation, private files, masked data, safe errors, non-destructive lifecycle | None |
| PRODUCT.md | Proposed strategic adapter | Ozan | Strategic interpretation without overriding locked docs | None |
| NEWDESIGN.md | Active canonical visual source of truth | Daniel | Care in Motion hierarchy, accessibility, responsive shells, component language, and cross-screen state expression | None |
| Screen Inventory | Proposed; 30 IDs | Daniel | Stable surfaces, priorities, actions, roles, state obligations | None |
| User-Flow Map | Proposed; 21 flows and 60 transitions | Daniel | Entry, destination, cancel, forbidden, recovery, stored-state handoff | None |
| Execution Packet 01–13 | All `Draft` | Packet drivers; status verdict by Ozan | Planned coverage and dependencies; no implementation claim | None |
| QA checklist | `Not Run` | Ozan | Verification obligations only | None |

## Scope

In scope:

- Detailed specifications for 13 P0 Demo surfaces, five P0 Support surfaces, and OWN-04 as MVP Lifecycle.
- System/access/recovery contracts for SYS-01 through SYS-07 without constructing the State Matrix.
- High-level boundaries for five P1 surfaces and four P1 expansions in existing surfaces.
- Traceability to FLOW-01 through FLOW-21, TRN-01 through TRN-60, and Packet 01–13.

Out of scope:

- URL, technical route map, navigation architecture, Next.js structure, or component tree.
- Final state combinations, trigger matrix, UX copy catalog, wireframe, or prototype.
- Implementation, scaffold, tests, deployment, or production-readiness claims.
- Active specifications for Parking Lot or Out-of-Scope capabilities.

## Specification Principles

1. One surface has one primary user job and one dominant action where interactive.
2. Patient surfaces prioritize immediate comprehension, a single-column mobile structure, 16/24 minimum body text, 18/28 primary guidance, and 48x48px targets.
3. Caregiver surfaces may be denser but keep active Patient identity adjacent to patient-bound decisions and use minimum 44x44px targets where practical.
4. Patient session, caregiver authentication, membership, role, and explicit patientProfileId remain distinct trust checks.
5. Active Patient UI context provides orientation and never substitutes for server authorization.
6. Machine output remains visibly provisional until human confirmation; fallback provenance stays visible.
7. SOS urgency is explicit and persistent without resembling official dispatch or depending on sound.
8. Each failure preserves a safe recovery destination and never exposes another Care Circle or Patient Profile.
9. Information hierarchy serves the two-minute connected demo; decorative density and unsupported metrics are excluded.
10. Responsive implications are structural guidance for later validation, not a complete Responsive Behavior artifact.

## Surface Coverage Summary

| Surface ID | Surface | Priority | Role | Mode | Flow IDs | Transition IDs | Specification Level |
|---|---|---|---|---|---|---|---|
| PAT-01 | Patient code sign-in | P0 Support | Patient | Patient | FLOW-01, FLOW-02, FLOW-16 | TRN-01, TRN-03–06, TRN-11, TRN-54–55 | Detailed |
| PAT-02 | Patient home | P0 Demo | Patient | Patient | FLOW-02, FLOW-04, FLOW-05, FLOW-10, FLOW-12 | TRN-03, TRN-13–17, TRN-33, TRN-40, TRN-54–55 | Detailed |
| PAT-03 | Daily check-in | P0 Demo | Patient | Patient | FLOW-04 | TRN-13–15, TRN-54–55 | Detailed |
| PAT-04 | Reminder and recorded medication detail | P0 Support | Patient | Patient | FLOW-05 | TRN-16–17, TRN-54–55 | Detailed; P1 mutation deferred |
| PAT-05 | Patient chatbot | P0 Demo | Patient | Patient | FLOW-10, FLOW-12 | TRN-33–36, TRN-40, TRN-54–55 | Detailed |
| CG-01 | Caregiver sign-in | P0 Support | Owner, Family Member | Caregiver | FLOW-01, FLOW-03, FLOW-16 | TRN-02, TRN-07–12, TRN-54–55 | Detailed |
| CG-02 | Active Patient caregiver dashboard | P0 Demo | Owner, Family Member | Caregiver | FLOW-03, FLOW-06–08, FLOW-11, FLOW-14–15, FLOW-17–21 | TRN-07, TRN-18, TRN-21, TRN-24, TRN-37, TRN-48, TRN-51, TRN-54–60 | Detailed |
| CG-03 | Active Patient selector | P0 Demo | Owner, Family Member | Caregiver | FLOW-06, FLOW-11 | TRN-18–20, TRN-39, TRN-54–55 | Detailed |
| CG-04 | Daily-care management | P0 Support | Owner, Family Member | Caregiver | FLOW-07 | TRN-21–23, TRN-54–55 | Detailed |
| CG-05 | Caregiver chatbot | P0 Demo | Owner, Family Member | Caregiver | FLOW-09, FLOW-11 | TRN-32, TRN-37–39, TRN-54–55 | Detailed; P1 history deferred |
| CG-06 | Faskes and BPJS helper | P0 Demo | Owner, Family Member | Caregiver | FLOW-14 | TRN-48–50, TRN-54–55 | Detailed; P1 expansion deferred |
| CG-07 | Care activity history | P1 Support | Owner, Family Member | Caregiver | FLOW-20 | TRN-59 | High-level boundary |
| OWN-01 | Care Circle member management | P1 Support | Owner | Caregiver | FLOW-17 | TRN-56 | High-level boundary |
| OWN-02 | Patient access code management | P1 Support | Owner | Caregiver | FLOW-18 | TRN-57 | High-level boundary |
| OWN-03 | Add second Patient Profile | P1 Support | Owner | Caregiver | FLOW-19 | TRN-58 | High-level boundary |
| OWN-04 | End-of-care or Patient Profile deactivation | MVP Lifecycle | Owner | Caregiver | FLOW-15 | TRN-51–55 | Detailed |
| OCR-01 | Patient document list | P0 Demo | Owner, Family Member | OCR Review | FLOW-08, FLOW-09 | TRN-24–25, TRN-27, TRN-31, TRN-54–55 | Detailed; P1 search deferred |
| OCR-02 | Private document upload | P0 Demo | Owner, Family Member | OCR Review | FLOW-08 | TRN-25–27, TRN-54–55 | Detailed |
| OCR-03 | OCR review workspace | P0 Demo | Owner, Family Member | OCR Review | FLOW-08, FLOW-09, FLOW-11 | TRN-26, TRN-28–32, TRN-54–55 | Detailed |
| SOS-01 | Patient SOS request and confirmation | P0 Demo | Patient | SOS | FLOW-10, FLOW-12, FLOW-13 | TRN-36, TRN-40–42, TRN-54–55 | Detailed |
| SOS-02 | Caregiver persistent SOS alert | P0 Demo | Owner, Family Member | SOS | FLOW-13 | TRN-43–44, TRN-47, TRN-54–55 | Detailed |
| SOS-03 | Caregiver SOS handling detail | P0 Demo | Owner, Family Member | SOS | FLOW-13 | TRN-44–47, TRN-54–55 | Detailed |
| SOS-04 | SOS history | P1 Support | Owner, Family Member | SOS | FLOW-21 | TRN-60 | High-level boundary |
| SYS-01 | Product role entry | P0 Support | Public visitor | Shared ChroniCare | FLOW-01 | TRN-01–02, TRN-54–55 | Detailed and system contract |
| SYS-02 | Forbidden access | System | Current actor | Inherited | FLOW-02–21 | TRN-11 and owning denials | System contract |
| SYS-03 | Session expired | System | Current actor | Inherited | FLOW-02–21 | TRN-05–06, TRN-09–10 | System contract |
| SYS-04 | Resource not found | System | Current actor | Inherited | FLOW-03, FLOW-05–21 | TRN-12 and owning missing-resource paths | System contract |
| SYS-05 | Offline and reconnecting | System | Current actor | Shared/SOS | FLOW-04–16 | TRN-47 and owning connection paths | System contract |
| SYS-06 | Provider or demo fallback | System | Current actor | Patient, Caregiver, OCR Review | FLOW-08–11, FLOW-14, FLOW-16 | TRN-28, TRN-34, TRN-38, TRN-49, TRN-54 | System contract |
| SYS-07 | Application error and retry | System | Current actor | Inherited | FLOW-01–21 | TRN-54–55 and owning errors | System contract |

## Detailed Specifications

### PAT-01 — Patient Code Sign-In

#### Purpose

Start a Patient session bound to exactly one active Patient Profile without revealing Patient identity before server authorization.

#### Priority

P0 Support.

#### Role

Patient.

#### Mode

Patient Mode.

#### Entry Conditions

Entered from SYS-01 or SYS-03 with no protected Patient context visible.

#### Permitted Actors

An unauthenticated Patient holding a Patient access code. Caregiver credentials use CG-01 instead.

#### Direct-Entry Behavior

- No Patient session: show the code form without identity.
- Valid existing Patient session: the server may restore PAT-02 for the bound active profile.
- Expired or revoked session: show SYS-03, then return here.
- Invalid, revoked, or deactivated-profile code: remain here with generic validation.
- Another Patient Profile cannot be selected or inferred.

#### Conceptual Source Surfaces

SYS-01 and SYS-03.

#### Conceptual Destination Surfaces

PAT-02 on success; PAT-01 validation state, SYS-03, SYS-02, or SYS-07 on failure.

#### Exit Behavior

Success establishes the bound Patient session and opens PAT-02. Failure remains local unless session or application recovery requires a System surface. Back returns to SYS-01 without protected state.

#### Primary Action

`Masuk dengan kode`.

#### Secondary Actions

Return to role entry; retry after a recoverable failure.

#### Information Hierarchy

1. ChroniCare and Patient access context.
2. Persistent code label and input.
3. Primary submit action.
4. Privacy-safe validation or recovery guidance.

#### Required Information

Patient access-code purpose, input label, submission progress, generic validation, and correct actor path.

#### Must Not Appear

Patient name before authorization, another profile, Care Circle data, caregiver sign-in fields, raw session information, code examples that resemble real credentials, or claims that access already succeeded.

#### Data Dependencies

Patient access-code validation, active Patient Profile status, Patient-session creation, revocation/rate-limit result, and safe error contract.

#### Authorization Boundary

Server validates the code and active profile before creating a Patient session. The browser does not choose patientProfileId or receive another profile. Codes and sessions are never logged.

#### State Obligations

Default, submitting, invalid or expired code, revoked/deactivated profile, rate-limited or locked, session-created success, offline, and generic retry.

#### Accessibility

Persistent input label, programmatic error association, visible 2px focus ring, 48x48px submit target, Patient body text at least 16px with 18/28 primary guidance, keyboard submission, and no identity disclosure through error announcements.

#### Responsive Implications

- 390x844: one focused column; primary action full width.
- 768x1024: centered readable form without decorative side content competing with access.
- 1440x900: bounded form width; unused space does not become a healthcare dashboard.

#### Flow References

FLOW-01, FLOW-02, FLOW-16.

#### Transition References

TRN-01, TRN-03–06, TRN-11, TRN-54–55.

#### Packet Coverage

Packets 01 and 05.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/technical/api.md`; `docs/security-privacy.md`; Packet 05.

### PAT-02 — Patient Home

#### Purpose

Help the Patient understand today's immediate routine and reach check-in, reminder, safe chat, or SOS without opening a dense caregiver dashboard.

#### Priority

P0 Demo.

#### Role

Patient.

#### Mode

Patient Mode, with SOS urgency overriding routine styling when active.

#### Entry Conditions

A valid Patient session is bound to one active Patient Profile after PAT-01 or safe session restoration.

#### Permitted Actors

Only the Patient represented by the bound Patient session.

#### Direct-Entry Behavior

- Valid bound session: load fresh data for that Patient Profile.
- Missing or expired session: SYS-03, then PAT-01.
- Deactivated profile: clear active content and recover through SYS-03/PAT-01.
- Wrong profile reference: SYS-02 or concealed SYS-04.

#### Conceptual Source Surfaces

PAT-01, PAT-03, PAT-04, SYS-03, and named successful-session restoration.

#### Conceptual Destination Surfaces

PAT-03, PAT-04, PAT-05, SOS-01, SYS-03, SYS-05, or SYS-07.

#### Exit Behavior

Opening a task preserves the bound Patient context. Returning from a successful check-in shows truthful completion. Session loss clears protected content before authentication recovery.

#### Primary Action

`Isi check-in hari ini`.

#### Secondary Actions

Open the next reminder or medication detail, ask the Patient chatbot, or start SOS. SOS becomes dominant only when deliberately invoked or an urgent context exists.

#### Information Hierarchy

1. Patient identity and current day/context.
2. Today's check-in status and primary action.
3. Next reminder or recorded medication information.
4. Safe chatbot entry.
5. Explicit SOS entry separated from routine encouragement.

#### Required Information

Bound Patient identity, check-in status, immediate routine, next reminder, last-refreshed or offline status when relevant, and serious SOS access.

#### Must Not Appear

Data from another Patient Profile, caregiver navigation, document administration, clinical KPIs, gamified streaks, diabetes-only framing, diagnosis, treatment targets, or AI authority cues.

#### Data Dependencies

Bound Patient Profile, today's latest check-in, upcoming active reminder, caregiver-recorded medication text, current SOS summary if applicable, and connection freshness.

#### Authorization Boundary

The Patient session determines the only readable profile. No client-supplied profile switch is accepted. Deactivated profiles and revoked sessions stop access.

#### State Obligations

Loading, empty routine, partial data, success acknowledgement, error, session expired, deactivated profile, offline, and active SOS emphasis.

#### Accessibility

Body text at least 16px with 18/28 primary guidance, 48x48px actions, one dominant focus target, logical reading order, visible focus, status conveyed by text/icon as well as color, and SOS available without motion or sound.

#### Responsive Implications

- 390x844: single column; immediate action precedes history and optional help.
- 768x1024: one or two dependent regions without equal-weight card grids.
- 1440x900: readable main column; do not stretch routine copy or add decorative metrics.

#### Flow References

FLOW-02, FLOW-04, FLOW-05, FLOW-10, FLOW-12.

#### Transition References

TRN-03, TRN-13–17, TRN-33, TRN-40, TRN-54–55.

#### Packet Coverage

Packet 07; entry support for Packets 11 and 12.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `NEWDESIGN.md` Patient shell; Packet 07.

### PAT-03 — Daily Check-In

#### Purpose

Collect a short Patient update about routine or general condition without inferring diagnosis or treatment.

#### Priority

P0 Demo.

#### Role

Patient.

#### Mode

Patient Mode.

#### Entry Conditions

The Patient enters from PAT-02 with a valid bound Patient session.

#### Permitted Actors

Only the bound Patient.

#### Direct-Entry Behavior

Valid session loads the check-in for the bound profile. Missing/expired session uses SYS-03. Wrong or deactivated profile is denied. A duplicate accepted check-in resolves to current server truth instead of creating a second record.

#### Conceptual Source Surfaces

PAT-02.

#### Conceptual Destination Surfaces

PAT-02 on success or cancel; SYS-02, SYS-03, SYS-05, or SYS-07 for recovery.

#### Exit Behavior

Successful submission returns to PAT-02 with durable acknowledgement. Cancel returns without writing. Offline or failure never appears as submitted success.

#### Primary Action

`Kirim check-in`.

#### Secondary Actions

Cancel/back to PAT-02; retry after a recoverable error.

#### Information Hierarchy

1. Bound Patient identity and today's context.
2. Short check-in questions or controls.
3. Submission action.
4. Validation, privacy, and recovery feedback.

#### Required Information

Date/context, minimum check-in fields supported by the locked model, bound-profile identity, submission status, and result acknowledgement.

#### Must Not Appear

Diagnostic interpretation, glucose targets, medication or dose advice, personal diet prescription, another Patient's prior answers, or unsupported wellness scoring.

#### Data Dependencies

Patient session, active Patient Profile, existing same-period check-in for duplicate prevention, accepted check-in fields, and safe write result.

#### Authorization Boundary

The server binds the write to the Patient session profile; Patient cannot submit a different patientProfileId. Idempotency/duplicate rules preserve one truthful result.

#### State Obligations

Default, validation, submitting, success, retry, duplicate prevention, wrong-profile forbidden, session expired, deactivated profile, and offline.

#### Accessibility

Persistent labels, 16px minimum body text with 18/28 primary guidance, 48x48px controls, keyboard operability, error summary when multiple fields fail, programmatic validation, and focus placed predictably after failure/success.

#### Responsive Implications

- 390x844: one question group at a time in one column; submit remains reachable.
- 768x1024: compact centered form; no unnecessary side panel.
- 1440x900: bounded reading width and stable action position.

#### Flow References

FLOW-04.

#### Transition References

TRN-13–15, TRN-54–55.

#### Packet Coverage

Packet 07.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/technical/api.md`; Packet 07.

### PAT-04 — Reminder and Recorded Medication Detail

#### Purpose

Let the Patient read an upcoming reminder and caregiver-recorded medication text without presenting ChroniCare as a prescribing authority.

#### Priority

P0 Support; medication-taken logging remains P1.

#### Role

Patient.

#### Mode

Patient Mode.

#### Entry Conditions

Entered from a routine item on PAT-02 under a valid bound Patient session.

#### Permitted Actors

Only the bound Patient. Caregiver maintenance occurs on CG-04.

#### Direct-Entry Behavior

Valid bound session and existing authorized item show the detail. Missing/expired session uses SYS-03. Inactive or missing item uses an owning empty state or SYS-04. Another profile is denied.

#### Conceptual Source Surfaces

PAT-02.

#### Conceptual Destination Surfaces

PAT-02, SYS-02, SYS-03, SYS-04, SYS-05, or SYS-07.

#### Exit Behavior

Back returns to PAT-02. The P0 surface performs no medication mutation. Connection recovery refreshes item status before claiming it is current.

#### Primary Action

None for P0. This is intentionally read-only; `sudah diminum` logging is a P1 expansion and is not exposed as active P0 behavior.

#### Secondary Actions

Return to PAT-02; retry loading after recoverable connection or application failure.

#### Information Hierarchy

1. Patient identity and item status.
2. Reminder time or recorded medication text.
3. Caregiver-recorded provenance and last update when available.
4. Limitation and return action.

#### Required Information

Item name/text, schedule or reminder time, active/inactive status, recorded source, freshness, and bound Patient identity.

#### Must Not Appear

AI-generated prescription framing, dose changes, clinical validation, medication recommendation, adherence score, another profile, or an active P1 mutation control.

#### Data Dependencies

Bound Patient Profile, active reminder, caregiver-recorded medication entry, item status, provenance, and last-updated metadata.

#### Authorization Boundary

Patient session reads only its bound profile. Caregiver authorship does not grant Patient administration rights. Missing resources remain concealed where required.

#### State Obligations

Loading, no upcoming reminder, inactive item, current item, session expired, offline/stale, forbidden, not found, and generic error.

#### Accessibility

16px minimum body text with 18/28 primary guidance, readable schedule formatting, 48x48px back/retry controls, status not color-only, no hover-only provenance, and 200% zoom without clipped medication text.

#### Responsive Implications

- 390x844: one-column detail with time and instruction before metadata.
- 768x1024: content-width panel; provenance remains adjacent to recorded text.
- 1440x900: bounded detail width; no dashboard metrics added.

#### Flow References

FLOW-05.

#### Transition References

TRN-16–17, TRN-54–55.

#### Packet Coverage

Packets 07 and 08; P1 mutation remains deferred.

#### Canonical Evidence

`docs/product/product-context.md`; `docs/product/feature-scope.md`; `docs/security-privacy.md`; Packets 07–08.

### PAT-05 — Patient Chatbot

#### Purpose

Provide short, safe routine or navigation support for the bound Patient Profile, including refusal, emergency escalation, and truthful provider fallback.

#### Priority

P0 Demo.

#### Role

Patient.

#### Mode

Patient Mode; a possible emergency switches the hierarchy to SOS Mode.

#### Entry Conditions

Entered from PAT-02 with a valid Patient session and minimum authorized context.

#### Permitted Actors

Only the bound Patient.

#### Direct-Entry Behavior

Valid session loads a fresh Patient persona context. Missing/expired session uses SYS-03. Another or deactivated profile is denied. Cached responses are not shown as newly authorized after session loss.

#### Conceptual Source Surfaces

PAT-02.

#### Conceptual Destination Surfaces

PAT-05 response/refusal/fallback states, SOS-01 for emergency escalation, PAT-02 on back, or SYS-03/SYS-05/SYS-06/SYS-07 for recovery.

#### Exit Behavior

Normal back returns to PAT-02. Possible emergency keeps SOS-01 as the dominant next action. Failed provider requests remain labeled and retryable without fabricated live output.

#### Primary Action

`Kirim pertanyaan`.

#### Secondary Actions

Return to PAT-02, retry a failed request, use an allowed doctor-question preparation alternative, or open SOS-01 during possible emergency.

#### Information Hierarchy

1. Bound Patient identity and Patient-assistant role.
2. Short conversation content.
3. Composer and send action.
4. Safety refusal, emergency escalation, provenance, or fallback limitation.

#### Required Information

Authorized Patient context indicator, response provenance when relevant, sending status, refusal boundary, short emergency guidance, and fallback label.

#### Must Not Appear

Another Patient, hidden prompt, raw OCR/document, full BPJS number, diagnosis, medication or dose change, lab interpretation, diabetes target, personal diet prescription, confidence score, or AI-magic decoration.

#### Data Dependencies

Patient session, minimum authorized routine context, AI safety gateway result, server-side Azure provider result or deterministic fallback, and no raw prompt/private-context logging.

#### Authorization Boundary

Server constructs minimum context for the bound Patient only. The Patient cannot request caregiver documents or another profile. Provider calls remain server-side.

#### State Obligations

Empty conversation, composing, sending, allowed response, refusal, emergency escalation, provider unavailable, labeled fallback, retry, session expired, offline, and context invalidation.

#### Accessibility

16px minimum body text with 18/28 primary guidance, 48x48px send/SOS targets, labelled composer, keyboard submission without trapping multiline input, concise live announcements, visible focus, reduced motion, and emergency information independent of color/motion.

#### Responsive Implications

- 390x844: conversation and composer stay in one column; emergency action remains reachable above the keyboard area.
- 768x1024: readable conversation measure with no decorative context panel.
- 1440x900: bounded transcript width; do not imitate a clinical command center.

#### Flow References

FLOW-10, FLOW-12.

#### Transition References

TRN-33–36, TRN-40, TRN-54–55.

#### Packet Coverage

Packets 02 and 11; SOS entry support for Packet 12.

#### Canonical Evidence

`docs/technical/ai-guardrails.md`; `docs/product/user-journeys.md`; `docs/security-privacy.md`; Packet 11.

### CG-01 — Caregiver Sign-In

#### Purpose

Authenticate a caregiver and proceed only after active Care Circle membership is server-authorized.

#### Priority

P0 Support.

#### Role

Owner and Family Member as Caregiver.

#### Mode

Caregiver Mode.

#### Entry Conditions

Entered from SYS-01 or SYS-03 without protected caregiver or Patient data visible.

#### Permitted Actors

An unauthenticated Owner or Family Member using caregiver credentials. Patient access codes use PAT-01.

#### Direct-Entry Behavior

- Valid caregiver session: server revalidates membership before loading CG-02.
- Missing or expired session: show this sign-in after SYS-03 where applicable.
- Valid authentication without active membership: SYS-02.
- Invalid credentials: remain here with generic validation.

#### Conceptual Source Surfaces

SYS-01 and SYS-03.

#### Conceptual Destination Surfaces

CG-02 on authorized success; CG-01 validation, SYS-02, SYS-03, or SYS-07 otherwise.

#### Exit Behavior

Success creates an authenticated caregiver context and opens an authorized CG-02 state. Back returns to SYS-01. Failure never exposes Care Circle or Patient data.

#### Primary Action

`Masuk`.

#### Secondary Actions

Return to role entry; retry after recoverable authentication/provider failure.

#### Information Hierarchy

1. Caregiver access context.
2. Persistent credential labels and controls.
3. Primary sign-in action.
4. Generic validation and recovery guidance.

#### Required Information

Correct actor-path label, supported credentials, submission state, membership-safe denial, and provider/application recovery state.

#### Must Not Appear

Patient access-code input, Patient names before membership validation, Care Circle details, role supplied by the client, technical auth errors, tokens, or claims that authentication alone grants Patient access.

#### Data Dependencies

Supabase Auth result, caregiver identity, active Care Circle membership, role, authorized initial Patient context, and safe error contract.

#### Authorization Boundary

Authentication establishes identity; server membership and Patient relation authorize data. Client-supplied role and careCircleId are untrusted.

#### State Obligations

Default, submitting, invalid credentials, provider unavailable, authenticated but forbidden, session success, offline, and generic retry.

#### Accessibility

Persistent labels, programmatic errors, visible focus, keyboard submission, minimum 44x44px controls, readable validation, and no membership information in announcements before authorization.

#### Responsive Implications

- 390x844: single-column sign-in with clear distinction from Patient access.
- 768x1024: centered form; no operational dashboard preview.
- 1440x900: bounded form width and restrained visual context.

#### Flow References

FLOW-01, FLOW-03, FLOW-16.

#### Transition References

TRN-02, TRN-07–12, TRN-54–55.

#### Packet Coverage

Packets 01 and 04.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/technical/architecture.md`; `docs/technical/api.md`; Packet 04.

### CG-02 — Active Patient Caregiver Dashboard

#### Purpose

Help an authorized caregiver understand the active Patient's recent care context, documents, SOS, and next actions without implying clinical monitoring.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

Caregiver Mode; an active SOS temporarily overrides routine hierarchy.

#### Entry Conditions

Valid caregiver session, active membership, and one server-authorized active Patient Profile context.

#### Permitted Actors

Owner and Family Member within their active Care Circle and permitted Patient Profiles.

#### Direct-Entry Behavior

Valid session and relation load current Patient data. Missing/expired session uses SYS-03. Wrong Care Circle/profile uses SYS-02 or concealed SYS-04. A deactivated profile is removed from active context. Loading a new profile clears or masks old data before the new identity appears.

#### Conceptual Source Surfaces

CG-01, CG-03, CG-04, CG-06, OWN-04, and authorized stored-state handoffs from PAT-03 or SOS.

#### Conceptual Destination Surfaces

CG-03, CG-04, CG-05, CG-06, OCR-01, OWN-04 for Owner, SOS-02/SOS-03, P1 destinations when later selected, and SYS-02–SYS-07 for recovery.

#### Exit Behavior

Each task carries explicit active Patient context and is reauthorized. Profile switching reloads data. Deactivation resolves to a remaining active Patient or a safe empty context. Active SOS stays persistently discoverable.

#### Primary Action

`Tinjau dokumen`; when an active unhandled SOS exists, the SOS handling action becomes dominant.

#### Secondary Actions

Switch Patient, update daily care, use caregiver chatbot, open faskes/BPJS guidance, and enter permitted lifecycle/history tasks.

#### Information Hierarchy

1. Persistent active Patient identity and freshness.
2. Active SOS, if present.
3. Latest check-in or meaningful recent change.
4. Immediate reminder/medication/health-note context.
5. Pending or recent documents and next action.
6. Chatbot and faskes/BPJS assistance.

#### Required Information

Active Patient identity, last-refreshed time, recent check-in, current routine summary, document review status, SOS status/handler when applicable, and task-specific provenance.

#### Must Not Appear

Data from another profile, cross-Care-Circle records, diagnostic KPI panels, unsupported risk scores, gamification, raw OCR text, full sensitive identifiers, Owner-only controls for Family Members, or realtime-monitoring claims.

#### Data Dependencies

Caregiver membership/role, authorized Patient Profiles, selected patientProfileId, recent check-in, medication/reminder/health-note summaries, documents/review statuses, SOS state, and freshness metadata.

#### Authorization Boundary

Every patient-bound read/action sends explicit patientProfileId and is revalidated server-side. Active selection is orientation only. Owner-only actions require a separate Owner check.

#### State Obligations

Loading, no daily-care data, partial data, fresh data, stale/offline, error, session expired, forbidden, active SOS, profile switch in progress, and deactivated-profile resolution.

#### Accessibility

Minimum 44x44px controls where practical, logical heading/region order, active Patient announced once when changed, visible focus, source/time labels, status not color-only, SOS visual equivalent without sound, and keyboard access to all primary tasks.

#### Responsive Implications

- 390x844: one main column; active Patient and SOS remain visible; dense tables become labelled lists.
- 768x1024: one or two columns by dependency; context stays adjacent to patient-bound actions.
- 1440x900: main task region plus at most one context region; avoid equal-priority card grids.

#### Flow References

FLOW-03, FLOW-06–08, FLOW-11, FLOW-14–15, FLOW-17–21.

#### Transition References

TRN-07, TRN-18, TRN-21, TRN-24, TRN-37, TRN-48, TRN-51, TRN-54–60.

#### Packet Coverage

Packet 08; entry support for Packets 05 and 09–12.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/technical/api.md`; Packet 08.

### CG-03 — Active Patient Selector

#### Purpose

Switch caregiver task context between at most two authorized Patient Profiles without stale-data leakage or authorization elevation.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

Caregiver Mode.

#### Entry Conditions

Entered from an authorized caregiver surface with a valid session and active membership.

#### Permitted Actors

Owner and Family Member may select only active Patient Profiles related to their Care Circle.

#### Direct-Entry Behavior

Valid membership loads zero-to-two authorized choices. Missing/expired session uses SYS-03. Unauthorized or deactivated profile is excluded and denied through SYS-02/SYS-04. A client-supplied profile reference grants no access.

#### Conceptual Source Surfaces

CG-02 and CG-05.

#### Conceptual Destination Surfaces

Freshly reloaded CG-02 after selection, CG-02 unchanged on cancel, or the owning caregiver task reopened with rebuilt context; SYS-02–SYS-05/SYS-07 for recovery.

#### Exit Behavior

Successful selection masks old data, validates patientProfileId, then shows the new identity with fresh data. Cancel preserves the last authorized context. Failure keeps or returns to the last safe context.

#### Primary Action

`Pilih Patient`.

#### Secondary Actions

Cancel and keep the current Patient context; retry loading authorized profiles.

#### Information Hierarchy

1. Current active Patient.
2. Available authorized Patient Profiles, maximum two.
3. Selection progress and freshness warning.
4. Cancel/recovery action.

#### Required Information

Profile names/identifiers suitable for synthetic demo distinction, current selection, active/deactivated eligibility, and switch progress.

#### Must Not Appear

Third-profile affordance, another Care Circle, deactivated profile as selectable, old Patient data under new identity, clinical summaries inside the selector, or wording that selection itself grants authorization.

#### Data Dependencies

Caregiver membership, related active Patient Profiles, current patientProfileId, profile lifecycle state, and authorized destination refetch.

#### Authorization Boundary

The server validates membership and profile relation on selection and on every destination request. Maximum two profiles is a product constraint, not a subscription gate.

#### State Obligations

Loading, zero/one/two authorized profiles, current selection, switching, switch success, switch error, forbidden profile, deactivated exclusion, offline, and stale-data prevention.

#### Accessibility

Keyboard-selectable options, current selection conveyed beyond color, visible focus, minimum 44x44px rows, concise announced context change, and no focus placement on stale underlying data.

#### Responsive Implications

- 390x844: compact sheet/dialog-like selection list; underlying Patient data is not readable during switch.
- 768x1024: centered compact selector or inline disclosure without wide table.
- 1440x900: selection control remains near persistent Patient identity; no new navigation hierarchy is implied.

#### Flow References

FLOW-06, FLOW-11.

#### Transition References

TRN-18–20, TRN-39, TRN-54–55.

#### Packet Coverage

Packets 05 and 08.

#### Canonical Evidence

`AGENTS.md` Role and Access; `docs/product/user-journeys.md`; `docs/technical/api.md`; Packet 05.

### CG-04 — Daily-Care Management

#### Purpose

Let an authorized caregiver review and maintain recorded medication text, reminders, and basic health notes for one active Patient Profile.

#### Priority

P0 Support.

#### Role

Owner and Family Member.

#### Mode

Caregiver Mode.

#### Entry Conditions

Entered from CG-02 with valid caregiver membership and explicit authorized patientProfileId.

#### Permitted Actors

Owner and Family Member may perform permitted daily-care updates; neither role gains clinical-authority behavior.

#### Direct-Entry Behavior

Valid session/relation loads current server data. Missing/expired session uses SYS-03. Wrong profile/Care Circle uses SYS-02. Missing/deactivated resource uses SYS-04. Profile change discards or resolves unsaved work before loading new data.

#### Conceptual Source Surfaces

CG-02.

#### Conceptual Destination Surfaces

CG-04 saved/current state, CG-02 on cancel/back, or SYS-02–SYS-05/SYS-07 for recovery.

#### Exit Behavior

Successful save shows accepted server truth and may refresh CG-02. Cancel returns without writing after discard confirmation when necessary. Conflict requires refresh/reconciliation before another write.

#### Primary Action

`Simpan catatan` or `Simpan pengingat`, determined by the active daily-care task.

#### Secondary Actions

Cancel/back, activate or inactivate supported items where canonical behavior permits, and retry after refresh.

#### Information Hierarchy

1. Active Patient identity and active task.
2. Current recorded information and status.
3. Editable fields with provenance/time context.
4. Save action.
5. Validation, conflict, and recovery.

#### Required Information

Patient identity, record type, current text/time/status, author/provenance when relevant, last update, validation constraints, and save result.

#### Must Not Appear

Dose recommendation, drug substitution, clinical validation badge, diagnosis, lab interpretation, another profile's record, or Owner-only membership/lifecycle actions.

#### Data Dependencies

Authorized patientProfileId, medication records, reminders, health notes, active/inactive status, timestamps, author/audit metadata, and concurrency/latest-state result.

#### Authorization Boundary

Server revalidates caregiver membership and Patient relation on every read/write. Browser code does not mutate application tables directly. Family Member access remains limited to daily care.

#### State Obligations

Loading, empty, editing, validation, saving, success, error, forbidden, session expired, offline, stale update/conflict, active/inactive item, and profile-switch interruption.

#### Accessibility

Persistent labels, minimum 44x44px controls, keyboard operation, programmatic validation, visible focus, status text/icons, discard confirmation, and no reliance on drag or hover.

#### Responsive Implications

- 390x844: one active task/form per column; save remains reachable without horizontal scroll.
- 768x1024: related fields may form two columns only when labels remain clear.
- 1440x900: editing region plus optional provenance context; avoid nested panels.

#### Flow References

FLOW-07.

#### Transition References

TRN-21–23, TRN-54–55.

#### Packet Coverage

Packet 08.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/technical/data-model.md`; `docs/technical/api.md`; Packet 08.

### CG-05 — Caregiver Chatbot

#### Purpose

Help an authorized caregiver prepare concise doctor questions or administrative next steps using minimum daily-care and confirmed OCR context only.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

Caregiver Mode, with explicit confirmed-context provenance and SOS escalation when necessary.

#### Entry Conditions

Entered from CG-02 with a valid caregiver session, membership, and explicit authorized patientProfileId.

#### Permitted Actors

Owner and Family Member for Patient Profiles related to their Care Circle.

#### Direct-Entry Behavior

Valid authorization builds a fresh minimum context. Missing/expired session uses SYS-03. Wrong profile uses SYS-02/SYS-04. A profile switch uses CG-03 and clears old conversation/context before reopening.

#### Conceptual Source Surfaces

CG-02; confirmed-context stored-state handoff from OCR-03; CG-03 after explicit profile change.

#### Conceptual Destination Surfaces

CG-05 response/refusal/fallback states, CG-03 for profile switch, CG-02 on back, active SOS context for emergency coordination, or SYS-02–SYS-07 for recovery.

#### Exit Behavior

Back returns to CG-02. Profile change discards cross-profile context. Provider/context failure omits unavailable data or uses labeled fallback instead of guessing.

#### Primary Action

`Kirim pertanyaan`.

#### Secondary Actions

Switch Patient through CG-03, retry, return to CG-02, or follow short emergency escalation guidance.

#### Information Hierarchy

1. Explicit active Patient identity.
2. Caregiver-assistant purpose and confirmed-context provenance.
3. Conversation content.
4. Composer/send action.
5. Refusal, emergency, context limitation, or fallback notice.

#### Required Information

Active Patient, context-loading status, whether confirmed OCR contributed, response source/fallback state, refusal boundary, and emergency escalation.

#### Must Not Appear

Pending/rejected OCR as context, raw document/OCR text, hidden prompt, another profile, full BPJS/address, diagnosis, dose/medication change, lab interpretation, personal nutrition prescription, or AI confidence score.

#### Data Dependencies

Caregiver session/membership, authorized patientProfileId, minimum daily-care context, confirmed-extraction selector, safety gateway, server-side provider result, and deterministic fallback.

#### Authorization Boundary

Server revalidates the profile and assembles minimum context. Only `CONFIRMED` extraction is eligible. Raw prompt/private context is not logged, and profile switching invalidates old context.

#### State Obligations

Context loading, empty context, composing, sending, response, refusal, emergency escalation, confirmed provenance, provider unavailable, labeled fallback, retry, profile switch, session expired, offline, and context conflict.

#### Accessibility

Minimum 44x44px controls, labelled composer, visible focus, keyboard submission, concise live response announcements, provenance in text, emergency guidance independent of color/motion, and readable transcript measure.

#### Responsive Implications

- 390x844: active Patient remains visible; transcript/composer form one column.
- 768x1024: context provenance may sit above conversation, not in a competing side dashboard.
- 1440x900: bounded conversation plus one optional context region; no AI command-center treatment.

#### Flow References

FLOW-09, FLOW-11.

#### Transition References

TRN-32, TRN-37–39, TRN-54–55.

#### Packet Coverage

Packets 02, 05, 09, and 11.

#### Canonical Evidence

`docs/technical/ai-guardrails.md`; `docs/security-privacy.md`; `docs/pitch/demo-script.md`; Packet 11.

### CG-06 — Faskes and BPJS Helper

#### Purpose

Let a caregiver filter static Tangerang facility information and understand administrative next steps while requiring direct confirmation.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

Caregiver Mode.

#### Entry Conditions

Entered from CG-02 under a valid caregiver session. Patient context may orient the task but does not personalize clinical ranking.

#### Permitted Actors

Owner and Family Member with active membership.

#### Direct-Entry Behavior

Valid caregiver session loads the static dataset and source metadata. Missing/expired session uses SYS-03. Dataset unavailability uses SYS-06/SYS-07. No Patient authorization is inferred from facility data.

#### Conceptual Source Surfaces

CG-02.

#### Conceptual Destination Surfaces

CG-06 result, empty, stale, or fallback state; CG-02 on back; SYS-03, SYS-05, SYS-06, or SYS-07 for recovery.

#### Exit Behavior

Filters remain visible in results/empty states. Back returns to CG-02. Failure allows clear/filter retry or labeled fallback without claiming realtime availability.

#### Primary Action

`Terapkan filter`.

#### Secondary Actions

Clear or adjust filters, view facility details/contact information, return to CG-02, or retry data loading.

#### Information Hierarchy

1. Administrative-guidance limitation.
2. Active filters.
3. Matching facility identity and contact details.
4. Source and review date.
5. Direct-confirmation instruction.

#### Required Information

Static Tangerang dataset source, review date, supported filter values, result count, facility identity/contact, empty-state recovery, stale/fallback label, and direct confirmation requirement.

#### Must Not Appear

Ranking, predicted suitability, clinical recommendation, realtime capacity, booking, hospital integration, guaranteed BPJS acceptance, unsourced facility claim, or real Patient data.

#### Data Dependencies

Static Tangerang facility dataset, source/review metadata, deterministic filter result, data-availability state, and optional labeled demo fixture.

#### Authorization Boundary

Caregiver session gates the product surface. Facility data does not expose another Patient Profile or expand Care Circle permission. No patientProfileId-based clinical ranking is produced.

#### State Obligations

Initial results, filtering, results, empty result, stale source, data unavailable, offline, provider/demo fallback, retry, session expired, and source/review-date visibility.

#### Accessibility

Persistent filter labels, keyboard-operable controls, minimum 44x44px targets, result count/status announcement, no color-only availability meaning, contact text selectable/readable, and 200% zoom without horizontal critical scroll.

#### Responsive Implications

- 390x844: filters collapse into a clear task region; results become labelled list rows.
- 768x1024: filters and results may stack or use a narrow/wide split.
- 1440x900: filter region plus readable result list; no map/dashboard is invented.

#### Flow References

FLOW-14.

#### Transition References

TRN-48–50, TRN-54–55.

#### Packet Coverage

Packets 02 and 10.

#### Canonical Evidence

`docs/product/product-context.md`; `docs/product/feature-scope.md`; `docs/pitch/demo-script.md`; Packet 10.

### OWN-04 — End-of-Care or Patient Profile Deactivation

#### Purpose

Allow only the active Owner to remove a Patient Profile from active care through a reasoned, explicit, non-destructive lifecycle transition.

#### Priority

MVP Lifecycle.

#### Role

Owner only.

#### Mode

Caregiver Mode with sensitive lifecycle treatment.

#### Entry Conditions

Entered from an authorized caregiver context for an active Patient Profile after a server-verifiable Owner check.

#### Permitted Actors

Exactly the active Owner. Family Member and Patient are denied.

#### Direct-Entry Behavior

Valid Owner/profile relation loads consequences. Family Member, Patient, wrong Care Circle, or wrong role uses SYS-02. Missing/already deactivated target uses SYS-04 or conflict truth. Missing/expired Owner session uses SYS-03.

#### Conceptual Source Surfaces

CG-02 or an Owner-authorized Patient Profile administration context.

#### Conceptual Destination Surfaces

CG-02 on cancel; named deactivated-profile exit and a valid remaining caregiver context on success; SYS-02–SYS-05/SYS-07 on denial or recovery.

#### Exit Behavior

Cancel leaves the profile active. Successful confirmation revokes Patient access codes/sessions, removes the profile from active selection, retains authorized history/audit, and resolves caregiver context safely. Failure leaves status visibly unchanged until server truth is refreshed.

#### Primary Action

`Nonaktifkan profil pasien`.

#### Secondary Actions

Cancel; return to the active Patient context; refresh current lifecycle status after conflict.

#### Information Hierarchy

1. Affected Patient Profile identity.
2. Immediate access and active-flow consequences.
3. Non-destructive retention explanation.
4. Supported reason selection.
5. Explicit confirmation and neutral cancel.

#### Required Information

Patient identity, current active status, reason options, access-code/session revocation consequence, active-list removal, retained-history explanation, and current Owner identity/authority context.

#### Must Not Appear

Hard-delete language, permanent-erasure guarantee, subscription/payment cancellation, billing, Family Member action control, Patient action control, legal-retention certainty, or misleading undo promise.

#### Data Dependencies

Owner membership/role, target patientProfileId and lifecycle status, active Patient Profile count, Patient access codes/sessions, retained records, audit event, and current caregiver context resolution.

#### Authorization Boundary

The server verifies exactly-one-active-Owner authority and target relation at entry and confirmation. Family Member and Patient receive no actionable control. The transition is non-destructive.

#### State Obligations

Consequence explanation, reason selection, validation, explicit confirmation, submitting, success, error, forbidden, session expired, conflict/already deactivated, access revocation, active-list removal, offline, and safe retry.

#### Accessibility

Clear dialog/sensitive-region title, affected identity announced, destructive action separated from cancel, keyboard focus contained only while an actual dialog is open, visible focus, minimum 44x44px controls, programmatic validation, and no color-only destructive meaning.

#### Responsive Implications

- 390x844: near-full-width confirmation region with consequences before actions; no clipped content.
- 768x1024: centered bounded dialog/region within viewport height.
- 1440x900: compact sensitive workflow visually separated from routine controls.

#### Flow References

FLOW-15.

#### Transition References

TRN-51–55.

#### Packet Coverage

Packet 06.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/security-privacy.md`; `docs/technical/api.md`; Packet 06.

### OCR-01 — Patient Document List

#### Purpose

Help an authorized caregiver find a Patient-bound document requiring review or start one private upload.

#### Priority

P0 Demo; search/filter controls remain P1 expansion.

#### Role

Owner and Family Member.

#### Mode

OCR Review Mode.

#### Entry Conditions

Entered from CG-02 with valid caregiver membership and explicit authorized patientProfileId, or returned from OCR-02/OCR-03.

#### Permitted Actors

Owner and Family Member authorized for the active Patient Profile.

#### Direct-Entry Behavior

Valid session/relation loads Patient-bound document metadata. Missing/expired session uses SYS-03. Wrong profile/document uses SYS-02/SYS-04. Profile switch clears the list before showing a new Patient identity.

#### Conceptual Source Surfaces

CG-02, OCR-02 on cancel, and OCR-03 when leaving review.

#### Conceptual Destination Surfaces

OCR-02 for upload, OCR-03 for an existing reviewable document, CG-02 on back, or SYS-02–SYS-07 for recovery.

#### Exit Behavior

Opening a document preserves Patient/provenance context. Starting upload opens OCR-02. Leaving a pending review returns here without changing its status.

#### Primary Action

`Unggah dokumen`.

#### Secondary Actions

Open a reviewable document, return to CG-02, retry loading. Search/filter remains P1 and is not required for P0.

#### Information Hierarchy

1. Active Patient identity.
2. Document status groups, especially pending review.
3. Document identity, date, and provenance.
4. Upload action.
5. Empty/error/recovery guidance.

#### Required Information

Patient identity, document name/type/date, uploader or source, processing/review status, fallback provenance when applicable, and next permitted action.

#### Must Not Appear

Public file URL, another Patient's document, raw OCR text, clinical interpretation, pending-as-confirmed styling, unsupported batch action, or active P1 search requirement.

#### Data Dependencies

Authorized patientProfileId, private document metadata, extraction/review status, provenance/provider label, upload availability, and profile freshness.

#### Authorization Boundary

Server validates membership and Patient/document relation. Storage remains private; signed access is short-lived and not exposed as a public URL.

#### State Obligations

Loading, no documents, status-grouped list, processing/pending/confirmed/rejected/failed/fallback labels, error, forbidden, session expired, offline, and profile switch.

#### Accessibility

Status text/icons, keyboard-openable rows, minimum 44x44px actions, meaningful document labels, visible focus, no color-only review status, and list reflow at 200% zoom.

#### Responsive Implications

- 390x844: labelled document rows; status and next action remain readable without table scroll.
- 768x1024: list with clear metadata columns only when they reflow safely.
- 1440x900: compact evidence-oriented list; avoid a generic card gallery.

#### Flow References

FLOW-08, FLOW-09.

#### Transition References

TRN-24–25, TRN-27, TRN-31, TRN-54–55.

#### Packet Coverage

Packet 09.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/security-privacy.md`; Packet 09.

### OCR-02 — Private Document Upload

#### Purpose

Select and submit one supported synthetic health document privately for the active Patient Profile.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

OCR Review Mode.

#### Entry Conditions

Entered from OCR-01 under a valid caregiver session and authorized active Patient context.

#### Permitted Actors

Owner and Family Member authorized for the active Patient Profile.

#### Direct-Entry Behavior

Valid authorization shows the upload constraints. Missing/expired session uses SYS-03. Wrong profile uses SYS-02/SYS-04. A profile switch clears selected local file state. No upload resumes or appears accepted unless server storage confirms it.

#### Conceptual Source Surfaces

OCR-01.

#### Conceptual Destination Surfaces

OCR-03 on accepted upload/processing, OCR-01 on cancel, or OCR-02/SYS-02–SYS-07 for validation and recovery.

#### Exit Behavior

Cancel before acceptance returns to OCR-01 without a record. Successful private upload proceeds to OCR-03 processing/pending state. Failure remains retryable and does not claim live OCR success.

#### Primary Action

`Unggah dan proses`.

#### Secondary Actions

Choose/replace file, cancel, retry upload, or continue to explicitly labeled demo fallback when permitted.

#### Information Hierarchy

1. Active Patient identity.
2. Accepted formats, 5 MB limit, and three-page limit.
3. Selected file identity and validation.
4. Upload/process action.
5. Privacy, progress, error, and fallback guidance.

#### Required Information

PDF/JPEG/PNG acceptance, maximum 5 MB, maximum three pages, selected filename/type/size, synthetic-data reminder, private-storage statement, upload/progress state, and fallback provenance.

#### Must Not Appear

Public URL, unsupported format acceptance, batch upload, background queue promise, real Patient data, automatic care update, diagnosis interpretation, or fallback presented as live OCR.

#### Data Dependencies

Authorized patientProfileId, client/server file validation, private Supabase Storage result, document record, provider availability, integrity/duplicate handling, and `DEMO_FALLBACK` fixture when selected.

#### Authorization Boundary

Server validates caregiver/profile relation before private upload and provider processing. Provider calls remain server-side; secrets and signed URLs are not logged.

#### State Obligations

No file, selected file, client validation, uploading, accepted upload, upload error/retry, unsupported type, over 5 MB, over three pages, duplicate/integrity warning, session expired, forbidden, profile switch, offline, and provider fallback.

#### Accessibility

Accessible file control label, constraints announced before selection, keyboard file action, minimum 44x44px controls, programmatic validation, visible progress text, focus on actionable error, and no drag-only upload requirement.

#### Responsive Implications

- 390x844: single-column file task with persistent constraints and full-width primary action.
- 768x1024: centered upload region; selected-file metadata wraps safely.
- 1440x900: compact upload task, not a decorative drop-zone page.

#### Flow References

FLOW-08.

#### Transition References

TRN-25–27, TRN-54–55.

#### Packet Coverage

Packets 02 and 09.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/security-privacy.md`; `docs/technical/ai-guardrails.md`; Packet 09.

### OCR-03 — OCR Review Workspace

#### Purpose

Let an authorized caregiver compare the private original with a machine-generated draft, edit supported fields, and explicitly confirm or reject it.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

OCR Review Mode.

#### Entry Conditions

Entered from OCR-02 after an accepted upload or OCR-01 for an existing authorized document requiring review.

#### Permitted Actors

Owner and Family Member authorized for the document's Patient Profile.

#### Direct-Entry Behavior

Server revalidates caregiver, document, Patient relation, and current review status. Missing/expired session uses SYS-03. Wrong document/profile uses SYS-02/SYS-04. Current server status replaces stale pending/confirmed assumptions.

#### Conceptual Source Surfaces

OCR-01, OCR-02, and named provider-processing result.

#### Conceptual Destination Surfaces

OCR-03 confirmed/rejected/pending/fallback states, OCR-01 on leave, confirmed-context named handoff for CG-05, or SYS-02–SYS-07 for recovery.

#### Exit Behavior

Confirm produces `CONFIRMED`; reject produces `REJECTED`; leaving without decision preserves `PENDING_REVIEW`. Conflict refreshes current server status. Only confirmed data becomes eligible for CG-05 context.

#### Primary Action

`Konfirmasi hasil`.

#### Secondary Actions

Edit supported fields, explicitly reject, retry failed processing, return to OCR-01, or review a labeled `DEMO_FALLBACK` draft.

#### Information Hierarchy

1. Active Patient and document identity.
2. Original private document as primary evidence.
3. Provider/fallback provenance and current review status.
4. Field-by-field editable extraction draft.
5. Validation and explicit confirm/reject actions.

#### Required Information

Patient identity, original preview, document metadata, extraction provenance, `PROCESSING`/review status, editable structured fields, validation, reviewer decision, timestamps, and fallback label.

#### Must Not Appear

Pending or fallback data styled as confirmed truth, automatic diagnosis/lab interpretation, clinical confidence score, raw OCR in chatbot context, automatic medication/reminder/check-in updates, public document URL, or hidden provider details.

#### Data Dependencies

Private document access, provider processing result, Zod-validated `document-extraction.v1` draft, review status, editable allowed fields, reviewer identity, conflict/latest status, and confirmed-context selector.

#### Authorization Boundary

Server validates caregiver/profile/document relation at every read and decision. Human confirmation is mandatory. Only minimum `CONFIRMED` structured data may later enter CG-05; raw file/OCR remain excluded.

#### State Obligations

`PROCESSING`, `REVIEW_REQUIRED`, `PENDING_REVIEW`, editable draft, validation issue, confirming, confirm success, reject confirmation, reject success, `CONFIRMED`, `REJECTED`, `FAILED`, retry, `DEMO_FALLBACK`, forbidden, session expired, profile switch, offline, and decision conflict.

#### Accessibility

Original and extraction regions have clear labels, field errors are associated, status uses text/icons, minimum 44x44px actions, confirm/reject are distinguishable beyond color, keyboard review order is logical, focus returns safely after dialogs, and document alternatives are available where preview is inaccessible.

#### Responsive Implications

- 390x844: explicit labelled tabs or stacked original/extraction regions; decision controls remain reachable.
- 768x1024: stacked or approximately 40/60 evidence/draft split.
- 1440x900: approximately 45/55 original/draft split with persistent review actions and no critical horizontal scroll.

#### Flow References

FLOW-08, FLOW-09, FLOW-11.

#### Transition References

TRN-26, TRN-28–32, TRN-54–55.

#### Packet Coverage

Packets 02, 09, and confirmed-context support for Packet 11.

#### Canonical Evidence

`docs/technical/ai-guardrails.md`; `docs/technical/data-model.md`; `docs/security-privacy.md`; Packet 09.

### SOS-01 — Patient SOS Request and Confirmation

#### Purpose

Let the Patient deliberately request family/caregiver help through ChroniCare while understanding that it is not official emergency dispatch.

#### Priority

P0 Demo.

#### Role

Patient.

#### Mode

SOS Mode within the Patient experience.

#### Entry Conditions

Entered from PAT-02 or emergency escalation in PAT-05 under a valid bound Patient session.

#### Permitted Actors

Only the bound Patient.

#### Direct-Entry Behavior

Valid bound session loads explicit confirmation. Missing/expired session uses SYS-03. Deactivated/wrong profile is denied. Offline entry shows that no event has been sent and retains official-emergency limitation guidance.

#### Conceptual Source Surfaces

PAT-02 and PAT-05.

#### Conceptual Destination Surfaces

Named stored SOS event plus Patient acknowledgement on confirmation; originating Patient surface on cancel; SYS-03, SYS-05, or SYS-07 on recovery.

#### Exit Behavior

Cancel creates no event. Confirm creates one idempotent minimum-data SOS event and acknowledges recording without promising delivery. Back after success does not imply cancellation.

#### Primary Action

`Kirim SOS`.

#### Secondary Actions

Cancel/back before confirmation; retry a failed creation; use official emergency services when the situation requires them.

#### Information Hierarchy

1. Explicit SOS/family-coordination purpose.
2. Patient identity and broad event context.
3. Delivery and emergency-service limitation.
4. Dominant confirm action.
5. Neutral cancel and failure recovery.

#### Required Information

Bound Patient identity, current time, minimum/broad location only when supported, confirmation consequence, app-delivery limitation, creation progress, and recorded/failure result.

#### Must Not Appear

Ambulance/IGD dispatch claim, closed-tab guarantee, live-location tracking, WhatsApp/SMS/Push promise, countdown theatrics, continuous pulse, clinical triage, or another Patient Profile.

#### Data Dependencies

Patient session, active Patient Profile, minimum SOS payload, broad location if deliberately available, event idempotency, stored-event result, and current connection state.

#### Authorization Boundary

The server binds the event to the Patient session profile. Patient cannot select another profile. No external dispatch integration is implied or invoked.

#### State Obligations

Confirmation, cancelling, creating, stored success, duplicate/idempotent result, error/retry, offline, session expired, deactivated profile, and not-sent truth.

#### Accessibility

16px minimum body text with 18/28 urgent guidance, 48x48px controls, explicit text plus icon/color, visible focus, no motion/sound dependency, concise urgent copy, cancel separated from confirm, and immediate static presentation under reduced motion.

#### Responsive Implications

- 390x844: confirmation and limitation fit one column; primary action remains reachable.
- 768x1024: centered urgent region with no competing routine panels.
- 1440x900: bounded confirmation; urgency does not become a dispatch dashboard.

#### Flow References

FLOW-10, FLOW-12, FLOW-13.

#### Transition References

TRN-36, TRN-40–42, TRN-54–55.

#### Packet Coverage

Packet 12.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/security-privacy.md`; Packet 12.

### SOS-02 — Caregiver Persistent SOS Alert

#### Purpose

Make an active SOS persistently visible on an authorized open caregiver dashboard and identify the Patient, time, connection, audio, and handling state.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

SOS Mode over Caregiver Mode.

#### Entry Conditions

A stored SOS event is discovered by Realtime on an authorized open dashboard or by REST refetch after reconnect/focus.

#### Permitted Actors

Owner and Family Member with active membership and relation to the SOS Patient Profile.

#### Direct-Entry Behavior

Valid session/relation may load an active event through REST. Missing/expired session uses SYS-03. Wrong Care Circle/profile uses SYS-02/SYS-04. Closed/disconnected tabs have no guaranteed notification; refocus requires REST recovery.

#### Conceptual Source Surfaces

Named stored SOS event via Realtime, SYS-05 via REST recovery, and active caregiver context.

#### Conceptual Destination Surfaces

SOS-03, refreshed SOS-02 state, authorized caregiver context when already handled, or SYS-02–SYS-05/SYS-07 for recovery.

#### Exit Behavior

`Lihat dan tangani` opens SOS-03. The alert remains visually persistent while unhandled. Audio disabled/blocked/muted does not hide it. Refresh replaces stale state with server truth.

#### Primary Action

`Lihat dan tangani`.

#### Secondary Actions

Enable/mute audio where allowed, refresh after reconnect, acknowledge already-handled truth, or return to the owning caregiver context when no longer active.

#### Information Hierarchy

1. Explicit Patient identity.
2. SOS event time and current status.
3. Dominant handling entry.
4. Connection/last-refreshed state.
5. Secondary audio state.

#### Required Information

Patient identity, event timestamp, status, current handler when known, connection/freshness, visual alert, audio enabled/blocked/muted state, and open-dashboard limitation.

#### Must Not Appear

Sound-only meaning, color-only meaning, ambulance/dispatch claim, closed-tab delivery claim, exact/live location, medical history, continuous animation, or another Care Circle's event.

#### Data Dependencies

Authorized Realtime subscription, stored SOS event, Patient relation, handler state, connection/focus state, REST refetch result, last-refreshed time, and local audio opt-in/capability.

#### Authorization Boundary

Realtime and REST reads require active caregiver membership and matching Care Circle/Patient relation. Audio preference grants no data access. Database state remains source of truth.

#### State Obligations

New alert, persistent visual-only, audio enabled, audio blocked, audio muted, disconnected, reconnecting, refreshing, refreshed, already handled, stale, forbidden, session expired, and generic error.

#### Accessibility

Persistent semantic alert, text/icon/color redundancy, optional audio with visual equivalent, minimum 44x44px action, focus not stolen repeatedly, concise live announcement once per new event, reduced-motion static state, and no continuous pulse.

#### Responsive Implications

- 390x844: compact persistent alert keeps identity/action visible without obscuring the entire task.
- 768x1024: alert may span the task region; handling action remains immediate.
- 1440x900: persistent alert integrates with caregiver context without becoming a decorative banner.

#### Flow References

FLOW-13.

#### Transition References

TRN-43–44, TRN-47, TRN-54–55.

#### Packet Coverage

Packet 12.

#### Canonical Evidence

`docs/technical/architecture.md`; `docs/product/user-journeys.md`; `docs/security-privacy.md`; Packet 12.

### SOS-03 — Caregiver SOS Handling Detail

#### Purpose

Let an authorized caregiver atomically claim family handling and understand the current handler and event truth.

#### Priority

P0 Demo.

#### Role

Owner and Family Member.

#### Mode

SOS Mode.

#### Entry Conditions

Entered from SOS-02 or restored through REST refetch for an authorized active SOS event.

#### Permitted Actors

Owner and Family Member in the event's Care Circle and related Patient Profile.

#### Direct-Entry Behavior

Valid authorization loads current event state. Missing/expired session uses SYS-03. Wrong Care Circle/profile uses SYS-02/SYS-04. An already-handled or cancelled event shows current server truth and no available claim control.

#### Conceptual Source Surfaces

SOS-02 and SYS-05/REST recovery.

#### Conceptual Destination Surfaces

SOS-03 handled/current-handler/conflict state, SOS-02 or caregiver context on exit, or SYS-02–SYS-05/SYS-07 for recovery.

#### Exit Behavior

The first accepted `Saya tangani` wins. A losing caregiver sees the current handler. Reconnect refetches before another action. Leaving detail does not visually dismiss an unhandled event.

#### Primary Action

`Saya tangani` when the event is available.

#### Secondary Actions

Refresh, acknowledge the current handler, return to the persistent alert/caregiver context, or retry a failed claim after current-state refetch.

#### Information Hierarchy

1. Patient identity and event time.
2. Current SOS and connection status.
3. Dominant claim action when available.
4. Current handler or conflict truth.
5. Minimum coordination context and recovery.

#### Required Information

Patient identity, event timestamp, broad location only if stored, current status, handler identity appropriate for the Care Circle, claim progress, conflict result, connection/freshness, and limitation.

#### Must Not Appear

Clinical triage, diagnosis, full address, exact live location, official dispatch, guaranteed delivery, overwrite-current-handler control, another Care Circle, or unnecessary medical history.

#### Data Dependencies

Stored SOS event, authorized Patient relation, current status/handler, atomic claim result, connection state, REST refetch, and audit-safe handling metadata.

#### Authorization Boundary

Server authorizes event access and performs an atomic first-handler-wins update. Stale client state never overwrites the winning handler. Wrong Care Circle is denied without disclosure.

#### State Obligations

Available, claiming, handled success, first-handler conflict, current handler, cancelled, stale, disconnected/reconnecting, REST refresh, forbidden, wrong-Care-Circle denial, session expired, and generic error.

#### Accessibility

Minimum 44x44px action, status text/icon/color redundancy, claim progress announcement, conflict/current handler announced once, logical focus after claim, reduced-motion persistence, and no audio requirement.

#### Responsive Implications

- 390x844: identity, status, and claim action precede secondary context.
- 768x1024: event facts and handling region may form two dependent regions.
- 1440x900: focused handling detail; nonessential caregiver dashboard content remains secondary.

#### Flow References

FLOW-13.

#### Transition References

TRN-44–47, TRN-54–55.

#### Packet Coverage

Packet 12.

#### Canonical Evidence

`docs/product/feature-scope.md`; `docs/product/user-journeys.md`; `docs/technical/api.md`; Packet 12.

### SYS-01 — Product Role Entry

#### Purpose

Let a public visitor choose the correct Patient or Caregiver access path without merging their session models.

#### Priority

P0 Support.

#### Role

Public visitor choosing Patient or Caregiver context.

#### Mode

Shared ChroniCare identity before an authenticated mode.

#### Entry Conditions

Public application entry with no protected data loaded.

#### Permitted Actors

Any public visitor. Subsequent access controls belong to PAT-01 or CG-01.

#### Direct-Entry Behavior

Always public when the application shell is available. Existing sessions may be recognized only by actor-specific server behavior; one actor session never silently becomes the other. Unavailable entry uses SYS-07.

#### Conceptual Source Surfaces

External product entry and safe sign-out/back outcomes.

#### Conceptual Destination Surfaces

PAT-01 or CG-01; SYS-07 if the entry cannot load.

#### Exit Behavior

Selecting Patient opens PAT-01. Selecting Caregiver opens CG-01. Leaving has no protected-state consequence.

#### Primary Action

Two co-primary actor choices: `Masuk sebagai Patient` and `Masuk sebagai Caregiver`. They are mutually exclusive paths rather than competing task actions.

#### Secondary Actions

Retry if an access path fails to load.

#### Information Hierarchy

1. ChroniCare product identity and concise purpose.
2. Patient access path.
3. Caregiver access path.
4. Honest availability/recovery information.

#### Required Information

Clear difference between Patient access code/session and caregiver authentication, with no product-feature success claim.

#### Must Not Appear

Protected Patient/Care Circle data, clinical dashboard preview, shared login implication, implementation-readiness claim, or role descriptions that imply unavailable features.

#### Data Dependencies

Public application shell and actor-path availability only.

#### Authorization Boundary

No protected authorization occurs here. PAT-01 and CG-01 establish distinct session/auth boundaries later.

#### State Obligations

Default, keyboard focus, unavailable Patient path, unavailable caregiver path, offline/application error, and honest feature-availability behavior based on current implementation evidence.

#### Accessibility

Distinct descriptive controls, visible focus, keyboard access, targets at least 48x48px for Patient choice and 44x44px for caregiver choice, clear reading order, and no color-only actor distinction.

#### Responsive Implications

- 390x844: stacked actor choices with equal clarity and adequate separation.
- 768x1024: compact two-choice composition without feature cards.
- 1440x900: bounded role entry; do not fill space with decorative healthcare claims.

#### Flow References

FLOW-01.

#### Transition References

TRN-01–02, TRN-54–55.

#### Packet Coverage

Packet 01 with conceptual support for Packets 04 and 05.

#### Canonical Evidence

`docs/technical/architecture.md`; `docs/design/00-screen-inventory.md`; Packet 01.

## System Surface Contracts

These contracts define cross-flow behavior and presentation obligations only. Their complete trigger/state combinations belong in the subsequent State Matrix.

| System ID | Purpose | Owning flows | Presentation classification | Actor/session context | Entry trigger | Permitted recovery | Forbidden information | Conceptual destination | Limitation |
|---|---|---|---|---|---|---|---|---|---|
| SYS-01 | Separate Patient and Caregiver entry paths | FLOW-01 | Public full-page entry | Public; no session | Application entry | Choose PAT-01 or CG-01; retry SYS-07 | Protected Patient, Care Circle, session, or feature-success data | PAT-01 or CG-01 | Does not authenticate or authorize |
| SYS-02 | Explain access denial without disclosure | FLOW-02–21 owning denials | Full-page, inline state, dialog, or sheet according to owning context | Patient session, caregiver session, or unauthenticated request | Wrong role, Care Circle, Patient relation, or Owner requirement | Return to last authorized surface or actor sign-in | Denied Patient, membership, document, Care Circle, or reason details | Last authorized context, PAT-01, or CG-01 | Cannot grant elevation or confirm concealed resource existence |
| SYS-03 | Restore access through the correct actor path | FLOW-02–21 protected flows | Persistent notice plus full-page/inline recovery | Expired/revoked Patient session or caregiver auth | Protected request fails session validation | Patient to PAT-01; Caregiver to CG-01 | Token, secret, old protected content, or merged actor path | PAT-01 or CG-01 | Unsaved protected data is retained only when explicitly safe |
| SYS-04 | Recover from missing or safely concealed resource | FLOW-03, FLOW-05–21 where relevant | Full-page or inline state | Current actor session may still be valid | Resource missing, deactivated, or concealed | Return to last authorized context; safe refetch | Whether another Patient/Care Circle/document exists | Last authorized owning surface | Not a substitute for forbidden details |
| SYS-05 | Make offline/Reconnecting truth visible | FLOW-04–16 | Banner, inline state, or persistent SOS connection notice | Current Patient/caregiver session; authorization rechecked after recovery | Browser offline, Realtime disconnect, focus return | Reconnect then authorized refetch; SOS uses TRN-47 REST recovery | Claim of uninterrupted connection, new success, or closed-tab delivery | Owning surface, SOS-02, or SOS-03 with fresh truth | Last-known data is labelled stale until refreshed |
| SYS-06 | Continue safely when a provider/demo service is unavailable | FLOW-08–11, FLOW-14, FLOW-16 | Banner, inline notice, or owning fallback state | Authorized actor and owning surface | Azure/OCR/AI/static demo service failure or fixture selection | Retry or continue within deterministic safe fallback | Live-provider success claim, hidden provider detail, unreviewed truth | Owning OCR/chat/faskes surface | `DEMO_FALLBACK` remains visible while active |
| SYS-07 | Recover from a safe generic application failure | FLOW-01–21 owning failures | Inline error, banner, dialog, or full-page state | Current actor context; original guard revalidated | Unexpected request/data failure not covered above | TRN-55 guarded retry, refresh, return, or reauthenticate | Stack trace, SQL/provider details, secrets, cross-profile data | Owning surface, SYS-02, or SYS-03 | Retry must stop when authorization/session truth changes |

## P1 Specification Boundaries

P1 remains outside the connected P0 demo and may proceed only after P0 stability and human priority confirmation. These rows are boundaries, not detailed implementation specifications.

| Surface or expansion | Primary job/action | Entry and actor boundary | Required obligations | Must not become | Flow/transition | Dependency |
|---|---|---|---|---|---|---|
| OWN-01 | Invite or remove Family Members; `Undang anggota` | Active Owner only from authorized caregiver context | Current members, invitation/removal states, exactly one active Owner, audit-safe confirmation | Family Member action, second Care Circle, granular-role system | FLOW-17 / TRN-56 | Packet 04 P1 selection |
| OWN-02 | Regenerate Patient access code; `Buat ulang kode akses` | Active Owner plus authorized Patient relation | One-time reveal, old-code/session revocation, no secret logging | Public code display, Family Member control, reusable leaked secret | FLOW-18 / TRN-57 | Packet 05 P1 selection |
| OWN-03 | Add permitted second Patient Profile; `Tambah Patient Profile` | Active Owner when fewer than two profiles exist | Validation, save, capacity conflict, strict two-profile limit | Third profile, second Care Circle, subscription upsell | FLOW-19 / TRN-58 | Packets 03/05/06 P1 selection |
| CG-07 | Read concise redacted care activity; `Lihat aktivitas` | Owner/Family Member for explicit authorized patientProfileId | Empty/loading/error, timestamp/source, redacted audit content | Full sensitive payload, clinical inference, cross-profile history | FLOW-20 / TRN-59 | Packet 08/12 P1 selection |
| SOS-04 | Read prior SOS and handler states; `Lihat riwayat SOS` | Owner/Family Member for authorized Patient relation | Patient filter, limited event/handler provenance, no delivery claim | Full medical history, dispatch log, cross-Care-Circle access | FLOW-21 / TRN-60 | Packet 12 P1 selection |
| PAT-04 expansion | Record `sudah diminum` | Bound Patient session within PAT-04 | Explicit confirmation, duplicate/conflict handling, no clinical inference | P0 mutation, dose advice, adherence score | Existing FLOW-05; transition not yet promoted | Packet 07/08 P1 selection |
| OCR-01 expansion | Search/filter documents | Authorized caregiver on current Patient document list | Filters preserve patientProfileId and status provenance | New screen, batch OCR, cross-profile search | Existing FLOW-08/09 | Packet 09 P1 selection |
| CG-05 expansion | Limited same-session chat history | Authorized caregiver with unchanged active Patient context | Profile switch clears history; safe content/logging boundary | Persistent cross-profile history, raw prompt log | Existing FLOW-11 / TRN-39 isolation | Packet 11 P1 selection |
| CG-06 expansion | Additional search/filter and richer provenance | Authorized caregiver on the same static helper | Source/review date remains visible; direct confirmation required | Realtime scraping, ranking, booking, guaranteed BPJS acceptance | Existing FLOW-14 | Packet 10 P1 selection |

## Transition Reference Index

This index makes every conceptual transition from the proposed User-Flow Map explicitly traceable. It does not add routing behavior or state combinations.

| Contract group | Explicit Transition IDs | Specification effect |
|---|---|---|
| Role entry and Patient access | TRN-01, TRN-02, TRN-03, TRN-04, TRN-05, TRN-06 | SYS-01, PAT-01, PAT-02, SYS-03 |
| Caregiver auth and access denial | TRN-07, TRN-08, TRN-09, TRN-10, TRN-11, TRN-12 | CG-01, CG-02, SYS-02, SYS-03, SYS-04 |
| Patient check-in and routine | TRN-13, TRN-14, TRN-15, TRN-16, TRN-17 | PAT-02, PAT-03, PAT-04 |
| Patient switch and daily care | TRN-18, TRN-19, TRN-20, TRN-21, TRN-22, TRN-23 | CG-02, CG-03, CG-04 |
| Private upload and OCR review | TRN-24, TRN-25, TRN-26, TRN-27, TRN-28, TRN-29, TRN-30, TRN-31, TRN-32 | OCR-01, OCR-02, OCR-03, CG-05 |
| Patient chatbot and emergency entry | TRN-33, TRN-34, TRN-35, TRN-36 | PAT-02, PAT-05, SOS-01, SYS-06 |
| Caregiver chatbot and context switch | TRN-37, TRN-38, TRN-39 | CG-02, CG-03, CG-05, SYS-06 |
| SOS creation, Realtime, handling, and REST recovery | TRN-40, TRN-41, TRN-42, TRN-43, TRN-44, TRN-45, TRN-46, TRN-47 | SOS-01, SOS-02, SOS-03, SYS-05 |
| Faskes/BPJS guidance | TRN-48, TRN-49, TRN-50 | CG-02, CG-06, SYS-06 |
| Owner lifecycle | TRN-51, TRN-52, TRN-53 | CG-02, OWN-04, SYS-02–SYS-04 |
| Generic recovery | TRN-54, TRN-55 | SYS-07 and owning surfaces |
| P1 entries | TRN-56, TRN-57, TRN-58, TRN-59, TRN-60 | OWN-01, OWN-02, OWN-03, CG-07, SOS-04 |

## Requirement Coverage

| Requirement | Canonical Source | Screen IDs | Flow IDs | Specification Coverage | Gap |
|---|---|---|---|---|---|
| Separate role entry | Architecture; Packets 01, 04, 05 | SYS-01, PAT-01, CG-01 | FLOW-01–03 | Detailed entry/auth specifications | None |
| Bound Patient session | API; Packet 05 | PAT-01, PAT-02, SYS-03 | FLOW-02 | Code, session, direct-entry, expiry, and isolation covered | None |
| Caregiver auth and membership | Architecture/API; Packet 04 | CG-01, CG-02, SYS-02, SYS-03 | FLOW-03 | Authentication and membership boundary separated | None |
| Active Patient switch/isolation | User journeys; Packet 05 | CG-02, CG-03 | FLOW-06 | Fresh-context loading and stale-data prevention covered | None |
| Patient routine/check-in | Feature scope; Packet 07 | PAT-02, PAT-03, PAT-04 | FLOW-04–05 | Hierarchy, read/write boundary, and recovery covered | None |
| Caregiver daily care | Feature scope; Packet 08 | CG-02, CG-04 | FLOW-07 | Authorized task/data hierarchy and conflict covered | None |
| Private documents | Security; Packet 09 | OCR-01, OCR-02 | FLOW-08 | List/upload privacy and file limits covered | None |
| Human OCR review | AI guardrails; Packet 09 | OCR-03 | FLOW-09 | Original-first, edit, confirm/reject, fallback covered | None |
| Confirmed-only context | AI guardrails; Packets 09/11 | OCR-03, CG-05 | FLOW-09, FLOW-11 | Stored-state boundary and provenance covered | None |
| Patient chatbot safety | AI guardrails; Packet 11 | PAT-05, SOS-01, SYS-06 | FLOW-10 | Allowed/refusal/emergency/fallback covered | None |
| Caregiver chatbot safety | AI guardrails; Packet 11 | CG-03, CG-05, OCR-03 | FLOW-11 | Profile isolation and confirmed context covered | None |
| SOS creation | User journeys; Packet 12 | SOS-01 | FLOW-12 | Confirmation, stored event, failure, limitation covered | None |
| SOS alert/handling | Architecture/API; Packet 12 | SOS-02, SOS-03, SYS-05 | FLOW-13 | Visual/audio, Realtime/REST, atomic conflict covered | None |
| Static faskes/BPJS | Product context; Packet 10 | CG-06, SYS-06 | FLOW-14 | Source, filters, empty, fallback, confirmation covered | None |
| Owner deactivation | Security/API; Packet 06 | OWN-04, SYS-02–04 | FLOW-15 | Reason, confirmation, revocation, retention covered | None |
| System recovery | API; security; QA | SYS-02–SYS-07 | FLOW-16 | Seven system contracts defined without State Matrix | None |
| P1 boundaries | Feature scope; PRODUCT.md | OWN-01–03, CG-07, SOS-04 plus four expansions | FLOW-17–21 | High-level only; no P0 promotion | None |

## Flow and Transition Coverage

| Flow ID | Screen Specifications | Transition IDs | Entry Covered | Exit Covered | Recovery Covered |
|---|---|---|---|---|---|
| FLOW-01 | SYS-01, PAT-01, CG-01 | TRN-01–02 | Yes | Yes | SYS-07 |
| FLOW-02 | PAT-01, PAT-02, SYS-02, SYS-03, SYS-07 | TRN-03–06, TRN-11 | Yes | Yes | Yes |
| FLOW-03 | CG-01, CG-02, SYS-02–04, SYS-07 | TRN-07–12 | Yes | Yes | Yes |
| FLOW-04 | PAT-02, PAT-03, SYS-02, SYS-03, SYS-05, SYS-07 | TRN-13–15, TRN-54–55 | Yes | Success/cancel | Yes |
| FLOW-05 | PAT-02, PAT-04, SYS-02–05, SYS-07 | TRN-16–17, TRN-54–55 | Yes | Back/read-only | Yes |
| FLOW-06 | CG-02, CG-03, SYS-02–05, SYS-07 | TRN-18–20, TRN-54–55 | Yes | Switch/cancel | Yes |
| FLOW-07 | CG-02, CG-04, SYS-02–05, SYS-07 | TRN-21–23, TRN-54–55 | Yes | Save/cancel | Yes |
| FLOW-08 | CG-02, OCR-01–03, SYS-02–07 | TRN-24–28, TRN-54–55 | Yes | Upload/cancel/fallback | Yes |
| FLOW-09 | OCR-01, OCR-03, CG-05, SYS-02–07 | TRN-28–32, TRN-54–55 | Yes | Confirm/reject/pending | Yes |
| FLOW-10 | PAT-02, PAT-05, SOS-01, SYS-02–07 | TRN-33–36, TRN-54–55 | Yes | Response/refusal/emergency | Yes |
| FLOW-11 | CG-02, CG-03, CG-05, OCR-03, SYS-02–07 | TRN-32, TRN-37–39, TRN-54–55 | Yes | Response/switch/fallback | Yes |
| FLOW-12 | PAT-02, PAT-05, SOS-01, SYS-02–05, SYS-07 | TRN-40–42, TRN-54–55 | Yes | Cancel/stored event | Yes |
| FLOW-13 | SOS-01–03, SYS-02–05, SYS-07 | TRN-42–47, TRN-54–55 | Stored/Realtime entry | Handle/conflict | REST recovery covered |
| FLOW-14 | CG-02, CG-06, SYS-03, SYS-05–07 | TRN-48–50, TRN-54–55 | Yes | Results/empty/back | Yes |
| FLOW-15 | CG-02, OWN-04, SYS-02–05, SYS-07 | TRN-51–55 | Owner-only | Cancel/deactivate | Yes |
| FLOW-16 | SYS-02–SYS-07 plus owning surfaces | TRN-05–12, TRN-47, TRN-54–55 | Owning triggers | Safe destination | Yes |
| FLOW-17 | OWN-01 boundary | TRN-56 | P1 boundary | High-level | System contracts |
| FLOW-18 | OWN-02 boundary | TRN-57 | P1 boundary | High-level | System contracts |
| FLOW-19 | OWN-03 boundary | TRN-58 | P1 boundary | High-level | Capacity/denial |
| FLOW-20 | CG-07 boundary | TRN-59 | P1 boundary | High-level | System contracts |
| FLOW-21 | SOS-04 boundary | TRN-60 | P1 boundary | High-level | System contracts |

## Packet Coverage

| Packet | Screen IDs | Flow IDs | Specification Impact | Technical-Only Boundary | Coverage |
|---|---|---|---|---|---|
| 01 — Scaffold and tooling baseline | SYS-01, PAT-01, CG-01; all modes as shell inputs | FLOW-01 | Actor entry and honest feature-availability specification | Scaffold, tooling, commands, and file paths are governed by current files and Packet 01 evidence | Covered without implementation claim |
| 02 — Env and provider boundary | OCR-02–03, PAT-05, CG-05, CG-06, SYS-06 | FLOW-08–11, FLOW-14, FLOW-16 | Provider/fallback information and actions | Environment validation and adapters | Covered |
| 03 — Schema, Prisma, and seed base | All domain surfaces; OWN-03 P1 | FLOW-02–15, FLOW-19 | Data dependencies and synthetic Maya/Raka context | Schema/Prisma/seed implementation | Covered |
| 04 — Caregiver auth and membership | CG-01–02, SYS-02–03, OWN-01 P1 | FLOW-01, FLOW-03, FLOW-15, FLOW-17 | Caregiver entry, membership denial, Owner gate | Auth/session/membership services | Covered |
| 05 — Patient access and isolation | PAT-01–02, CG-03, SYS-02–04, OWN-02/03 P1 | FLOW-01–03, FLOW-06, FLOW-11, FLOW-18–19 | Bound Patient access and isolated switching | Code/session/profile enforcement | Covered |
| 06 — Lifecycle deactivation | OWN-04, SYS-02–04 | FLOW-15 | Owner consequences, reason, confirmation, recovery | Transaction, revocation, audit | Covered |
| 07 — Patient homepage/check-in | PAT-02–04, PAT-05/SOS entry | FLOW-04–05, FLOW-10, FLOW-12 | Patient hierarchy, check-in, routine detail | Patient domain services | Covered |
| 08 — Caregiver dashboard/daily care | CG-02–04, CG-07 P1 | FLOW-06–07, FLOW-20 | Active Patient, care update, conflict | Aggregation and writes | Covered |
| 09 — Document/OCR review | OCR-01–03, SYS-06 | FLOW-08–09 | Private upload, evidence review, decisions, fallback | Storage/OCR/extraction pipeline | Covered |
| 10 — Faskes/BPJS | CG-06, SYS-06 | FLOW-14 | Static filters, results, empty, source limitation | Static dataset service | Covered |
| 11 — Chatbot safety/personas | PAT-05, CG-05, OCR-03, SOS-01, SYS-06 | FLOW-09–11 | Persona, context, refusal, emergency, fallback | Context builder/safety/provider | Covered |
| 12 — SOS Realtime/handling | SOS-01–04, SYS-05 | FLOW-12–13, FLOW-21 | Confirmation, persistent alert, audio, atomic conflict, REST recovery | Realtime auth and atomic claim | Covered; SOS-04 remains P1 |
| 13 — QA/deploy/rehearsal | All P0/System IDs | FLOW-01–16 | Verification obligations and demo-safe fallback | Checks, deploy, rehearsal evidence | Covered without QA/deploy claim |

## Deferred Decisions

The following remain deliberately deferred and are not Open Decisions:

- Exact URL paths, route groups, dynamic segments, layout ownership, middleware/server guards, browser redirects, exact route files, deep links, and History API behavior.
- Component implementation, component APIs, file structure, data-fetching hooks, and database queries.
- Final state combinations and triggers in `docs/design/03-state-matrix.md`.
- Final Indonesian state/recovery copy in `docs/design/04-ux-copy-matrix.md`.
- Complete cross-screen responsive rules in `docs/design/05-responsive-behavior.md`.
- Wireframes, prototype mechanics, and implementation paths.

## Screen Inventory Gaps

None.

## Open Decisions

None.

## Canonical References

- `AGENTS.md`
- `README.md`
- `PRODUCT.md`
- `NEWDESIGN.md`
- `docs/design/00-screen-inventory.md`
- `docs/design/01-user-flow-map.md`
- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`
- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`
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
- `docs/team/ownership.md`

## Authority and Change Control

- Daniel owns information hierarchy, interaction requirements, responsive implications, accessibility, and traceability in this artifact.
- Ozan reviews product priority, acceptance, demo continuity, QA obligations, and overclaim.
- Bernard reviews auth/session separation, patientProfileId, membership/profile authorization, API/data dependencies, Storage, Realtime/REST, and lifecycle effects.
- Al reviews OCR provenance/review, confirmed-only AI context, refusals, emergency behavior, and provider fallback.
- Adding, removing, or renaming a surface ID requires Screen Inventory revision first.
- Changing conceptual entry, destination, or recovery requires User-Flow Map revision first.
- Product scope, roles, authorization, medical safety, privacy, data model, API, provider, execution structure, or demo promise changes require the relevant human verdict and canonical-document update.
- Exact technical routing remains deferred until `/web` and implementation contracts exist. The repository name `ChronicCare` never changes the product name `ChroniCare`.
