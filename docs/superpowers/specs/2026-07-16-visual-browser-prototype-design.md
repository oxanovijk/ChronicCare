# ChroniCare Visual Browser Prototype Design

**Status:** Approved direction — route-based connected prototype  
**Date:** 2026-07-16  
**Primary DRI:** Daniel (UI/UX)  
**Reviewers:** Ozan (product/QA and copy boundaries), with Bernard and Al consulted only where the UI represents locked technical, OCR, AI, or SOS constraints

## Objective

Build a visual-only browser prototype in `/web` that lets a reviewer traverse the normal ChroniCare Patient and Caregiver flows through ordinary product controls. The prototype is for visual and interaction assessment, not API, provider, database, authentication, deployment, or production-readiness evidence.

The implementation must follow `PRODUCT.md`, `DESIGN.md`, and the six documents under `docs/design/`. All visible people, care information, documents, OCR content, SOS events, and facility records are synthetic.

## Approved Approach

Use a route-based connected prototype. Each demo-critical surface has a stable browser route and normal back/forward behavior. Reviewers move between surfaces through the product UI; there is no prototype toolbar, screen gallery, or floating state switcher.

Interactive state is local and deterministic. React client state and route query parameters may represent temporary visual states such as a submitted check-in, selected Patient, OCR status, AI fallback, or SOS handling. Refresh may return a route to its documented mock default; no state is presented as persisted or synchronized.

## Route and Surface Map

| Route | Primary surface | Required connected actions |
| --- | --- | --- |
| `/` | Product role entry | Continue to Patient access or caregiver access |
| `/patient/access` | Patient code access | Enter a synthetic code and continue to Maya's home |
| `/patient/home` | Patient home | Start check-in, open Patient assistant, inspect a reminder, or start SOS |
| `/patient/check-in` | Daily check-in | Select a simple condition, add an optional note, submit, and return to a visible success state |
| `/patient/chat` | Patient assistant | Show a short safe response, a calm clinical-boundary refusal, a labeled provider fallback, and an SOS entry for possible emergency |
| `/patient/sos` | Patient SOS confirmation | Cancel or confirm; confirmation acknowledges family coordination without dispatch or delivery guarantees |
| `/caregiver/access` | Caregiver sign-in placeholder | Submit synthetic credentials and continue to the caregiver dashboard |
| `/caregiver` | Active-Patient caregiver dashboard | See Maya's current context, switch Patient, open documents, assistant, SOS handling, or faskes/BPJS |
| `/caregiver/documents` | Patient document list and upload entry | Inspect statuses and open upload or review |
| `/caregiver/documents/upload` | Private document upload visual | Choose the provided synthetic document treatment, see file constraints, and continue to review |
| `/caregiver/documents/review` | Original-first OCR review workspace | Compare original evidence with editable draft, then show pending, confirmed, rejected, validation, or `DEMO_FALLBACK` treatment |
| `/caregiver/chat` | Caregiver assistant | Show active Patient, confirmed-context provenance, safe doctor-visit preparation, context omission, and fallback boundaries |
| `/caregiver/sos` | Persistent SOS handling detail | See Maya, event time, connection/audio status, and transition from unhandled to handled or conflict state |
| `/caregiver/faskes` | Tangerang faskes/BPJS helper | Apply administrative filters and inspect sourced static results, empty state, and direct-confirmation guidance |

Routes are presentation contracts only. They do not establish authentication or authorization.

## Connected Demo Flow

1. Enter as Patient and use the synthetic access code.
2. Land on Maya's mobile-first home and complete either a check-in or a short Patient-assistant exchange.
3. Enter SOS confirmation from Patient home or the emergency assistant response.
4. Return to role entry, enter as caregiver, and arrive at Maya's dashboard.
5. Open Patient selection, switch to Raka, show a fresh loading boundary, then switch back to Maya without stale data under the new identity.
6. Open documents, upload a synthetic file, compare the original with the machine draft, correct one field, and confirm it.
7. Open the caregiver assistant and show that only confirmed OCR context contributes.
8. Open the persistent SOS alert and choose `Saya tangani`.
9. Open the Tangerang faskes/BPJS helper and inspect a sourced static result with direct-confirmation guidance.

The flow may use deterministic mock transitions to represent cross-actor stored-state handoffs. It must never imply that Realtime, Supabase, Azure, or persistence is running.

## Information Architecture

### Shared public entry

The root surface explains the two distinct access paths without a marketing hero. Patient access and caregiver access are separate choices with concise role descriptions. No Patient identity or protected-looking care details appear before the relevant placeholder access step.

### Patient mode

Patient surfaces use one primary column, body text at least 18px, touch targets at least 48px, and no more than two simultaneous high-emphasis actions. The first task area emphasizes today's check-in. Reminder and assistant access follow. SOS is visually separate from routine actions and uses serious, direct language.

### Caregiver mode

Desktop caregiver surfaces use a restrained 216px sidebar, a persistent active-Patient context bar, one main content region, and at most one supporting context region. Mobile reflows to a single reading column with compact labeled navigation. Active Patient identity, freshness, source, and status remain adjacent to patient-bound information.

The dashboard is organized by operational hierarchy rather than equal cards: active SOS first when present, latest check-in, today's routine, documents requiring action, then assistance links.

### OCR review mode

At 1440px the review workspace uses an approximately 45/55 original-to-extraction split. The synthetic original is visually primary and clearly marked as demo material. The machine result is an editable draft with adjacent status and provenance. On 390px, explicit `Dokumen asli` and `Hasil ekstraksi` tabs or stacked sections preserve access to both, with decision actions kept reachable.

`PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, and `DEMO_FALLBACK` are expressed with distinct text, icon, border, and surface treatments. Confirmation never looks automatic, and extraction never looks like an automatic update to daily-care records.

### SOS mode

An active SOS appears as a persistent red alert region on caregiver surfaces and as a focused confirmation/acknowledgement flow for the Patient. It includes Patient identity, event time, handling state, and connection or refresh state. `Saya tangani` is the dominant caregiver action while available. Audio state is secondary and always has a visual equivalent.

The UI does not flash, shake, pulse continuously, depict an ambulance, or claim emergency dispatch, closed-tab delivery, SMS, WhatsApp, Push API, or official-service contact.

## Visual System

Use the canonical tokens in `DESIGN.md`:

- Cream `#F9F4F2` only for the quiet shell, not every panel.
- White task surfaces and cool-neutral `#F4F6F8` secondary surfaces.
- Warm dark typography with `#356FD6` as the single trusted action accent.
- Semantic colors only for information, pending, confirmed, attention, error/fallback, and SOS states.
- Plus Jakarta Sans with the documented fallback stack and weights 400–700.
- Standard controls use 10px radius; caregiver/OCR/SOS panels 12px; Patient panels 16px; pills are reserved for compact status labels.
- Flat bordered surfaces are the default. Shadows are limited to raised interaction, dialogs, and SOS overlays.
- One outline icon family with a consistent 2px visual stroke; critical actions pair icons with text.

No gradients, gradient text, glassmorphism, glow, decorative AI sparkles, oversized rounded cards, SaaS hero layout, repeated equal-size feature cards, random illustration, unsupported charts, diagnostic KPIs, or gamification.

## Mock Data Contract

The visible prototype uses only these synthetic identities:

- Dimas Pratama — Owner and signed-in caregiver.
- Rina Pratama — Family Member used where handler attribution or role distinction is needed.
- Maya Pratama — active demo Patient with synthetic diabetes tipe 2 routine context.
- Raka Pratama — second Patient used to demonstrate visual context isolation.

Mock content includes:

- Maya's short check-in and non-diagnostic care note.
- Caregiver-recorded medication text and reminder wording without generated prescribing language.
- A clearly synthetic three-page-or-less document representation with a masked BPJS number.
- Pending, confirmed, rejected, failed, and `DEMO_FALLBACK` OCR examples.
- Safe Patient and caregiver assistant messages, refusal copy, emergency escalation, and provider fallback.
- A broad-location SOS event with unhandled, handling, handled, reconnecting, and conflict representations.
- Static Tangerang facility results with synthetic or clearly labeled source/review metadata and direct-confirmation guidance.

No real identifiers, medical documents, phone numbers, addresses, credentials, tokens, or provider details are included.

## Component Boundaries

- `PrototypeStateProvider` owns only cross-route mock presentation state: selected Patient, last check-in display, OCR review status, confirmed-context availability, and SOS handling state.
- `PatientShell` supplies Patient identity, mobile-safe content width, and Patient navigation boundaries.
- `CaregiverShell` supplies navigation, active-Patient context, responsive reflow, and persistent SOS visibility.
- Status, notice, field, button, and dialog primitives encode the documented visual language and accessibility behavior.
- Domain components remain small: Patient selector, check-in form, chat transcript, document evidence, extraction form, SOS alert/detail, facility filters, and facility result list.
- Mock records and copy live in a dedicated typed module so screen components do not invent inconsistent data.

No abstraction is added for providers, repositories, API clients, schemas, persistence, feature flags, or future production behavior.

## State and Recovery Representation

The prototype must visibly cover the states needed to judge the critical flow without a debug toolbar:

- Access forms: default, submitting, generic invalid input, and placeholder success.
- Patient check-in: default, validation, submitting, and success.
- Patient switch: selection, labeled switching/loading, success, and safe restoration on mock failure.
- OCR: upload constraints, processing, pending review, validation, confirmed, rejected, failed, and labeled fallback.
- AI: empty, sending, safe response, refusal, emergency escalation, provider unavailable, and labeled fallback.
- SOS: confirmation, unhandled alert, handling, handled, conflict, audio enabled/blocked, reconnecting, and refreshed.
- Faskes/BPJS: initial results, filtered results, empty results, stale/fallback notice, and source/review information.

Critical state is never conveyed by color alone. Toasts may confirm ordinary actions but are not the sole record of OCR confirmation or SOS handling.

## Accessibility and Responsive Contract

- Validate Patient surfaces at 390×844 and caregiver/OCR surfaces at 1440×900.
- Also keep the documented 768×1024 tablet behavior structurally sound.
- Patient targets are at least 48×48px; caregiver targets are at least 44×44px where practical.
- All controls have visible labels, keyboard access, logical focus order, and a visible two-pixel focus ring.
- Status includes text plus an icon or explicit shape.
- Important copy wraps without clipping and supports 200% zoom without critical horizontal scrolling.
- Motion is limited to short functional transitions and respects `prefers-reduced-motion`.
- No critical action requires hover, dragging, precision gestures, sound, or animation.

## Verification Strategy

Automated checks will cover:

- TypeScript, lint, unit/component tests, and production build using commands that actually exist after scaffolding.
- Route availability and the normal connected navigation path.
- Patient check-in validation and success.
- Patient switching without Maya content under Raka identity.
- OCR pending-versus-confirmed copy and confirmed-context boundary.
- AI refusal, emergency, and labeled fallback treatments.
- SOS confirmation, persistent alert, handling, and no-dispatch limitation copy.
- Faskes/BPJS source/review metadata and direct-confirmation language.

Manual visual QA will inspect screenshots at 390×844 and 1440×900 for overflow, hierarchy, touch targets, focus visibility, responsive reflow, copy wrapping, state distinction, and prohibited visual patterns. Any unexecuted check must be reported as unavailable rather than passing.

## Explicit Non-Goals

This prototype does not include API wiring, database access, Supabase Auth, Patient session security, Supabase Storage, Realtime, Azure AI Document Intelligence, Azure OpenAI, Prisma, migrations, seeds, deployment, live facility data, emergency-service integration, production data, or any claim that those capabilities work.

It also does not implement lifecycle deactivation, Care Circle administration, real medication logging, full chat history, document search, SOS history, payment/subscription, or other P1/parking-lot work unless required to keep a demo-critical surface visually coherent.

## Acceptance Criteria

The design is accepted when a reviewer can traverse the normal Patient and Caregiver flow without a prototype toolbar; distinguish Maya from Raka; see original-first OCR review and confirmed-only AI context; see a persistent, truthful SOS handling flow; inspect sourced administrative faskes/BPJS guidance; and verify that Patient warmth and caregiver operational clarity remain visually distinct at the target viewports.
