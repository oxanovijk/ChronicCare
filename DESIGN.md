# ChroniCare Design System

Status: Superseded legacy visual reference  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Daniel  
Product/QA reviewer: Ozan  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-16  
Theme: Light only for the hackathon MVP

## Authority

This document preserves the previous ChroniCare visual direction for historical
traceability. It no longer governs new mockups or implementation decisions.
`NEWDESIGN.md` is the active canonical visual source of truth following the
human verdict on 2026-07-17.

Product scope, medical safety, role authorization, privacy, data, API,
provider, execution, and demo contracts override this document.

This document does not establish implementation readiness. Current files on
disk and fresh verification evidence are implementation truth. Packet status
and QA verdicts remain governed by canonical execution and QA documents.

## Product Register

product

ChroniCare is an authenticated, task-oriented web application with four
experience modes:

- Patient Mode
- Caregiver Mode
- OCR Review Mode
- SOS Mode

These modes use one identity system. They vary in density, hierarchy, urgency,
and interaction treatment; they are not separate brands.

## Physical Scene

ChroniCare is used in conditions that may involve fatigue, divided attention,
uncertainty, or urgency.

Patient use commonly occurs at home on a mobile device. The Patient may be
checking a routine, reporting how they feel, reading a reminder, asking for
general help, or requesting family assistance.

Caregiver use commonly occurs on a laptop, tablet, or mobile device while
coordinating care and comparing recent information. The caregiver must identify
the active Patient Profile before acting.

OCR Review requires focused comparison between an original private document and
a machine-generated draft.

SOS handling occurs under time pressure. The interface must remain explicit,
persistent, and operable without sound or decorative animation.

## Visual Thesis

ChroniCare is a warm daily-care companion on quiet paper.

The identity combines:

- A soft cream shell that reduces institutional coldness.
- White and cool-neutral task surfaces that preserve clarity.
- Warm dark typography for long-form readability.
- Restrained blue for trusted primary actions.
- Semantic color used only when status or urgency requires it.
- Familiar product controls with visible labels.
- Limited elevation and controlled rounding.
- Strong provenance for machine-generated or externally sourced information.

Warmth must be observable through spacing, copy rhythm, illustration restraint,
and readable hierarchy. It must not depend on decorative gradients, excessive
rounding, sentimental imagery, or playful treatment of medical and emergency
content.

## Brand Personality

ChroniCare is:

- Warm: calm cream framing, approachable language, and adequate breathing room.
- Supportive: recovery actions are visible and blame-free.
- Dependable: state, provenance, time, and active Patient context are explicit.
- Mature: color and illustration are restrained and never childish.
- Calm: ordinary daily-care surfaces avoid unnecessary urgency.
- Clear: one dominant task, familiar controls, and visible limitations.

## Experience Modes

### Patient Mode

User context:

- Used by a Patient through a Patient access code and Patient session.
- Bound to one Patient Profile.
- Usually used on a mobile device with limited attention.

Emotional target:

- Supported, oriented, and able to act without interpreting a dense dashboard.

Visual rules:

- Use a single-column mobile structure.
- Present one dominant action in the first task area.
- Keep competing high-emphasis actions to a maximum of two per view.
- Use body text of at least 18px.
- Use touch targets of at least 48x48px.
- Use short, explicit Indonesian labels.
- Show identity and session context without exposing another Patient Profile.
- Use friendly illustration only when it supports orientation or an empty state.
- Keep SOS visually separate from routine actions.

Do not use:

- Health KPIs as the Patient homepage hierarchy.
- Gamified streaks, scores, badges, or celebratory medical claims.
- Childlike mascots or toy-like controls.
- Icon-only critical actions.
- Dense data tables.
- Caregiver administration controls.

### Caregiver Mode

User context:

- Used by an Owner or Family Member through caregiver authentication.
- Coordinates daily care for a maximum of two Patient Profiles.
- Requires visible active Patient context.

Emotional target:

- Calm, informed, and able to find the next operational action quickly.

Visual rules:

- Use compact but readable lists, timelines, grouped forms, and summary bands.
- Keep the active Patient identity persistent on patient-bound surfaces.
- Show recency, source, status, and provenance near relevant information.
- Use a minimum practical target of 44x44px.
- Use one primary action per task region.
- Distinguish Owner-only actions before interaction.
- Keep daily-care information visually separate from administration and lifecycle
  controls.
- Prefer inline detail and progressive disclosure to card grids.

Do not use:

- A hospital command-center aesthetic.
- Unexplained charts or diagnostic-seeming scores.
- Dense grids with equal visual priority.
- Active Patient state as evidence of authorization.
- Family Member access to Owner-only lifecycle or membership controls.

### OCR Review Mode

User context:

- Used by an authorized caregiver reviewing a private health document.
- Machine output is a draft until human confirmation.

Emotional target:

- Focused, cautious, and able to verify provenance.

Visual rules:

- Keep the original document visually primary.
- Present extracted fields as an editable draft.
- Show file name, document type, provider mode, extraction status, and review
  state.
- Keep `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, and `DEMO_FALLBACK`
  visually and textually distinct.
- Make confirm and reject actions explicit.
- Keep validation issues adjacent to affected fields.
- Preserve access to the original while reviewing extraction.
- Never style pending content as settled profile truth.

Do not use:

- AI sparkle treatment.
- Accuracy percentages without canonical evidence.
- `Verified` language before human confirmation.
- Automatic daily-care update treatment.
- Public document links.
- Raw OCR text as a default caregiver surface.

### SOS Mode

User context:

- Used for family or caregiver coordination when the Patient requests help.
- Realtime behavior applies to an authorized caregiver dashboard that is open
  and connected.

Emotional target:

- Urgent, explicit, and controllable without implying emergency dispatch.

Visual rules:

- Use a persistent red alert region.
- Show Patient identity, event time, handling state, and connection state.
- Use one dominant `Saya tangani` action when handling is available.
- Show the current handler after atomic handling succeeds.
- Show a conflict message when another caregiver handles the event first.
- Keep a visual alert available regardless of audio state.
- Show audio enabled, blocked, or unavailable as a secondary status.
- Provide reconnect or refresh feedback after a connection interruption.
- Use direct language and restrained motion.

Do not use:

- Continuous pulse, flashing, or shaking.
- Confetti, celebratory animation, or playful iconography.
- Ambulance, dispatch, or guaranteed-delivery imagery.
- Audio as the only notification.
- Claims that closed tabs or disconnected devices received the alert.

## Color System

### Core Colors

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#F9F4F2` | ChroniCare shell and quiet Patient framing |
| `--color-surface` | `#FFFFFF` | Primary task surface |
| `--color-surface-subtle` | `#F4F6F8` | Caregiver and OCR secondary surface |
| `--color-text-strong` | `#2D2C2B` | Headings and primary body |
| `--color-text` | `#4A4744` | Standard body text |
| `--color-text-muted` | `#68635E` | Secondary metadata |
| `--color-border` | `#D8D2CE` | Standard boundary |
| `--color-border-strong` | `#AAA29C` | Strong boundary and disabled controls |
| `--color-primary` | `#356FD6` | Primary action and trusted link |
| `--color-primary-hover` | `#2859B6` | Hover and focus emphasis |
| `--color-primary-pressed` | `#204A9C` | Pressed state |
| `--color-brand-orange` | `#E87932` | Small non-text brand accent only |
| `--color-focus` | `#2859B6` | Keyboard focus ring |

Measured reference contrast:

- `#2D2C2B` on `#F9F4F2`: 12.78:1.
- `#4A4744` on `#F9F4F2`: 8.46:1.
- `#68635E` on `#F9F4F2`: 5.45:1.
- White on `#356FD6`: 4.78:1.
- White on `#2859B6`: 6.57:1.

White text on `#E87932` is prohibited because the measured ratio is 2.91:1.

### Semantic Colors

| State | Text | Surface | Border | Non-color indicator |
|---|---|---|---|---|
| Information | `#2859B6` | `#EAF1FF` | `#AFC5EC` | Info icon and label |
| Pending review | `#5B3F8C` | `#F0EBF8` | `#C7B9DF` | Clock icon and `Menunggu tinjauan` |
| Confirmed | `#2F6B52` | `#E8F4EE` | `#A8CDBD` | Check icon and `Dikonfirmasi` |
| Attention | `#8A5B00` | `#FFF4D6` | `#E6C76A` | Warning icon and explicit label |
| Error or rejected | `#B42318` | `#FDECEA` | `#E5AAA5` | Error icon and reason |
| Demo fallback | `#5B3F8C` | `#F0EBF8` | `#C7B9DF` | `DEMO_FALLBACK` label |
| SOS | `#B42318` | `#FDECEA` | `#D66A63` | SOS icon, heading, and status text |
| Disabled | `#68635E` | `#E8E4E1` | `#C7C0BB` | Disabled attribute and helper reason |

Semantic states must never be identified by color alone.

## Typography

### Font Family

Canonical family:

`"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`

Rules:

- Plus Jakarta Sans is the intended product typeface.
- Inter and system UI fonts are fallbacks, not alternate directions.
- Font files must be bundled or resolved locally by the implementation.
- The product must remain readable when the fallback stack is active.
- Use weights 400, 500, 600, and 700 only.
- Do not use a second display or serif family in the MVP.

### Product Type Scale

| Role | Size | Line height | Weight |
|---|---:|---:|---:|
| Page title | 32px | 40px | 700 |
| Section title | 24px | 32px | 700 |
| Patient task title | 22px | 30px | 700 |
| Component title | 18px | 26px | 600 |
| Patient body | 18px | 28px | 400 |
| Caregiver body | 16px | 24px | 400 |
| Control label | 16px | 22px | 600 |
| Metadata | 14px | 20px | 500 |
| Incidental caption | 13px | 18px | 500 |

Rules:

- Information required for a decision may not rely on incidental caption size.
- Body copy should normally remain within 65-75 characters per line.
- Indonesian copy may expand by at least 30% without clipping.
- Avoid all-uppercase sentences.
- All-uppercase is permitted only for short system labels such as
  `DEMO_FALLBACK`, with adequate letter spacing.

## Spacing and Density

Base unit: 4px.

Canonical spacing tokens:

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px

Patient Mode:

- Use 16-24px internal task spacing.
- Use at least 24px between major task regions.
- Avoid more than three competing regions before the first scroll at 390x844.

Caregiver Mode:

- Use 12-16px within dense list or form groups.
- Use 24-32px between major sections.
- Preserve white space around state changes and high-risk actions.

OCR and SOS:

- Use spacing to separate evidence, status, and actions.
- Do not compress critical provenance or handling information to gain density.

## Radius, Borders, and Elevation

### Radius

- Small indicator: 8px.
- Standard control: 10px.
- Caregiver panel: 12px.
- Patient control: 14px.
- Patient panel: 16px.
- OCR panel: 12px.
- SOS panel: 12px.
- Status badge: pill radius, only for compact status labels.

Do not apply pill shapes to ordinary buttons, fields, cards, or navigation items.

### Borders

- Standard: 1px solid `--color-border`.
- Strong or selected: 1px solid `--color-border-strong`.
- Focus is not represented by border color alone.
- Section grouping should prefer spacing before adding additional borders.

### Elevation

- Base panel: no shadow or `0 1px 2px rgba(45,44,43,0.08)`.
- Raised interactive panel: `0 4px 12px rgba(45,44,43,0.10)`.
- Dialog: `0 12px 32px rgba(45,44,43,0.16)`.
- SOS overlay may use dialog elevation without decorative glow.

Avoid combining a strong border with a wide shadow on the same ordinary panel.

### Layer Order

- Dropdown and popover: 10.
- Sticky context: 20.
- Backdrop: 30.
- Dialog and sheet: 40.
- Toast: 50.
- Tooltip: 60.

SOS urgency must not be implemented by arbitrarily exceeding the canonical
layer order.

## Layout Principles

- Use content hierarchy, not equal-sized cards, to define structure.
- Patient Mode uses one primary column.
- Caregiver Mode may use a main column plus one contextual column.
- OCR Review may use a document/evidence split at larger viewports.
- Keep critical actions in the reading path.
- Avoid nested panels deeper than two visible levels.
- Do not place unrelated task categories in a decorative bento grid.
- Prevent horizontal scrolling for critical content and actions.
- Long IDs, file names, and source labels must wrap or truncate with an
  accessible full-value mechanism.

## Navigation Principles

- Navigation communicates mode and task location; it does not establish access.
- Patient navigation exposes only Patient-appropriate tasks.
- Caregiver navigation preserves active Patient context.
- Owner-only destinations or actions are not presented to Family Members as
  ordinary available controls.
- A forbidden response must replace unauthorized content without revealing
  protected data.
- Mobile navigation may compact labels but may not reduce critical actions to
  ambiguous icons.
- Navigation changes must not hide an active SOS alert.

This document does not define route names or screen inventory.

## Active Patient Context

Every patient-bound caregiver task must present:

- Patient display name.
- Clear active state.
- A visual boundary between Patient context and task content.
- Loading or switching feedback.
- No data belonging to another Patient Profile.

When switching Patient Profile:

1. Preserve the old context until the new relation is accepted.
2. Show a labeled loading state.
3. Do not display old Patient data under the new Patient identity.
4. On failure, restore the last valid context and show recovery.
5. Treat server authorization as authoritative.

Active Patient UI state is never evidence of authorization.

## Core Component Language

### Buttons

- One solid primary button per task region.
- Secondary actions use outline or neutral treatment.
- Tertiary actions use text treatment only when their hierarchy is genuinely
  lower.
- Destructive or SOS actions use explicit labels.
- Icon-only buttons require an accessible name and minimum target size.
- Disabled controls show a reason when the reason is not obvious.

### Panels

- Use panels to group one coherent task, evidence set, or state.
- Default to flat surfaces with a border.
- Avoid repeated identical card grids.
- Avoid decorative icons in every panel heading.

### Lists and Timelines

- Use lists for repeated care activity.
- Show time, author/source, Patient context, and status where relevant.
- Separate primary content from metadata using type weight and spacing.
- On mobile, table-like data becomes labeled list rows.

### Status Badges

- Include text and an icon or shape.
- Use compact labels.
- Do not use badges as decoration.
- Pending, confirmed, rejected, fallback, and SOS states must not share the same
  treatment.

### Notices

- Use inline notices for local recovery or limitation.
- Use banners for session, connection, provider, or cross-surface states.
- Use dialogs only when an explicit decision is required.
- Error notices must provide a safe next action when recovery is available.

## Form and Validation Language

- Every field has a persistent visible label.
- Placeholder text does not replace a label.
- Required status is announced textually.
- Validation appears next to the affected field and in a summary when multiple
  fields fail.
- Error text explains the correction without exposing sensitive data.
- Focus moves only when necessary and predictably.
- Submitted controls enter a visible loading state.
- Repeated submission is prevented without silently discarding input.
- Sensitive values such as BPJS numbers remain masked.
- File controls show accepted formats and limits before submission.

## Document and OCR Review Language

- Accepted document formats: PDF, JPEG, and PNG.
- Maximum file size: 5 MB.
- Maximum page count: three.
- The original document remains private and visually available during review.
- Machine extraction is labeled as a draft.
- Provider provenance is visible.
- `PENDING_REVIEW` uses pending treatment.
- `CONFIRMED` uses confirmed treatment only after caregiver confirmation.
- `REJECTED` keeps a visible audit state without suggesting confirmed truth.
- `DEMO_FALLBACK` remains visible while fixture data is in use.
- Confirm and reject are separate explicit actions.
- Field validation never implies medical interpretation.
- OCR output does not visually resemble an automatic update to medication,
  reminder, check-in, or health-note records.

## AI Response and Fallback Language

AI surfaces must distinguish:

- Patient persona.
- Caregiver persona.
- General assistance.
- Safety refusal.
- Emergency escalation.
- Provider fallback.

Visual rules:

- Show which authorized Patient context is in use.
- Show when confirmed OCR context contributed to a response.
- Do not expose raw OCR, hidden prompts, full BPJS numbers, or another Patient
  Profile.
- Refusal responses use calm attention treatment, not error blame.
- Emergency responses prioritize short escalation guidance over continued chat.
- Provider failure displays a labeled fallback.
- Fallback content must not appear identical to a live provider response.
- Do not use AI sparkle icons, magic gradients, intelligence scores, or
  diagnostic-seeming confidence meters.

## SOS Alert and Handling Language

Every active SOS alert shows:

- Patient identity.
- Event time.
- Current status.
- Connection or last-refreshed state.
- Visual alert independent of audio.
- Dominant handling action when available.

Handling behavior:

- `Saya tangani` enters a clear pending state.
- First successful handler wins.
- A losing handler sees a conflict explanation and current handler.
- Reconnect triggers visible refresh feedback.
- Audio state is secondary and may be enabled, blocked, or unavailable.
- No interface claims delivery to a closed tab, disconnected device, ambulance,
  IGD, or official emergency service.

## Faskes and BPJS Result Language

- Present results as administrative guidance from a static Tangerang dataset.
- Show source and review date.
- Show active filters.
- Keep facility identity and contact details readable.
- Do not display ranking, predicted suitability, or realtime availability.
- Do not imply guaranteed BPJS acceptance.
- Include a visible instruction to confirm directly with the facility or BPJS.
- Empty results preserve filters and provide a clear adjustment action.
- Stale or unavailable data uses an information or fallback notice.

## Sensitive Lifecycle Dialog

Patient Profile deactivation is:

- Owner-only.
- Non-destructive.
- A sensitive lifecycle action, not a payment cancellation.
- Visually separated from ordinary daily-care controls.

The dialog must:

- Identify the affected Patient Profile.
- Explain the immediate access consequence.
- Explain that historical data is not presented as permanently deleted.
- Require explicit Owner confirmation.
- Provide a neutral cancel action.
- Show forbidden treatment for Family Members.
- Avoid subscription, billing, hard-delete, or irreversible-erasure imagery.

## System State Vocabulary

| State | Required visual expression | Required action behavior |
|---|---|---|
| Default | Current content and active context | Normal actions |
| Loading | Context-specific skeleton or progress label | Prevent duplicate action |
| Empty | Explanation plus next permitted action | Preserve context and filters |
| Error | Safe reason plus recovery | Retry or return |
| Forbidden | No protected content; role-safe explanation | Return to permitted area |
| Session expired | Persistent session notice | Sign in again |
| Offline | Connection banner and last-known-state label | Retry when connection returns |
| Reconnecting | Persistent progress indicator | REST refresh after reconnect |
| Fallback | Explicit provider or demo fallback label | Continue only within safe limits |
| Conflict | State changed elsewhere or first handler won | Refresh and show current truth |
| Pending | Clock/progress indicator plus status text | Avoid treating data as final |
| Confirmed | Check indicator plus provenance | Permit confirmed-context use |
| Rejected | Error/rejected indicator plus reason | Review original or exit |
| Disabled | Reduced emphasis plus reason | No activation |
| Success | Confirmation plus resulting state | Continue to logical next task |

Rules:

- Loading skeletons approximate the final structure and do not mix Patient data.
- Empty states are not errors.
- Toasts may confirm a result but may not be the sole record of a critical state.
- Forbidden and session-expired states must not leak names or records.
- Fallback remains visible for as long as fallback data or behavior is active.
- Patient, Caregiver, OCR, and SOS modes use the same semantic vocabulary with
  mode-appropriate density.

## Motion and Reduced Motion

Motion is functional.

Allowed:

- 120-180ms control feedback.
- 160-220ms panel or disclosure transition.
- Short opacity and position changes that preserve spatial context.
- One entrance animation for a newly received SOS alert.

Forbidden:

- Continuous SOS pulse.
- Decorative floating elements.
- Parallax.
- Scroll hijacking.
- Animated gradients.
- Motion that delays access to a critical action.

Reduced motion:

- Honor `prefers-reduced-motion`.
- Remove nonessential translation, scale, and looping animation.
- Replace SOS entrance motion with an immediate persistent visual state.
- Preserve loading, progress, and state information using static text and icons.
- No essential information depends on motion.

## Responsive Behavior

Target validation viewports:

- Mobile: 390x844.
- Tablet: 768x1024.
- Desktop: 1440x900.

### Mobile

- Use one primary column.
- Use full-width primary actions where appropriate.
- Keep Patient targets at least 48x48px.
- Compact caregiver navigation without relying on hover.
- Convert tables to labeled lists.
- Use near-full-width sheets for complex confirmation.
- OCR review switches between original and extraction using explicit labeled
  tabs or stacked regions.
- Keep confirm/reject controls persistently reachable.
- Keep active Patient and SOS context visible without blocking the task.

### Tablet

- Use one or two columns according to information dependency.
- Caregiver navigation may use a collapsible rail.
- OCR may use stacked layout or a 40/60 split.
- Dialogs are centered and remain within viewport height.
- Critical actions remain visible without horizontal scrolling.

### Desktop

- Caregiver navigation may use a 216px sidebar.
- Use a main content region plus one optional context region.
- OCR uses approximately a 45/55 original-to-extraction split.
- Do not expand text lines beyond readable measure.
- Do not fill available width with decorative cards.
- SOS remains persistent without obscuring required handling controls.

### Reflow

- Support 200% browser zoom without loss of content or action.
- No critical horizontal scrolling.
- Sticky areas must not consume an unusable share of short viewports.
- Copy wraps without clipping or overlapping icons.
- Hover is an enhancement, never the only way to discover critical information.

## Accessibility

Target: WCAG 2.1 AA or later AA-equivalent requirements applicable to the
implemented product.

Requirements:

- Patient touch targets: minimum 48x48px.
- Caregiver targets: minimum 44x44px where practical.
- Patient body text: minimum 18px.
- Body text contrast: minimum 4.5:1.
- Large text contrast: minimum 3:1.
- Non-text control boundaries and focus indicators: minimum 3:1 against adjacent
  colors.
- Keyboard access for every interactive control.
- Logical focus order.
- Visible 2px focus ring with at least 2px offset.
- Persistent form labels.
- Programmatic error association.
- No color-only status.
- Textual and visual equivalent for audio.
- Reduced-motion support.
- Meaningful icons with accessible names.
- Decorative icons hidden from assistive technology.
- Critical actions do not require hover, drag, precision gesture, or sound.
- Sensitive actions require clear confirmation.
- Indonesian copy remains direct and readable.
- Interface reflows at 200% zoom.
- Live status announcements are concise and do not repeatedly interrupt.

## Data Density

Patient Mode:

- Show the immediate routine or action before history.
- Avoid multi-metric summary grids.
- Use progressive disclosure for history.
- Limit simultaneous high-emphasis elements.

Caregiver Mode:

- Group information by task and recency.
- Use lists and timelines before charts.
- Show source and timestamp for information that may change.
- Keep profile identity adjacent to patient-bound mutations.

OCR Review:

- Preserve evidence and field correspondence.
- Avoid compressing provenance.
- Keep document and extraction relationships clear.

SOS:

- Prioritize identity, time, status, and handling.
- Hide nonessential background content while preserving recovery controls.

## Iconography and Asset Direction

- Use one consistent outline icon family.
- Use a 2px visual stroke at standard sizes.
- Use filled icons only for selected or urgent states.
- Pair critical icons with text.
- Avoid anatomical illustrations, hospital machinery, sirens, ambulances, AI
  brains, and medical authority symbols.
- Patient illustrations, if used, should be mature, simple, culturally neutral,
  and secondary to the task.
- Do not generate synthetic health documents that visually resemble real
  personal records without clear demo treatment.
- All demo identities and documents remain synthetic.

## Anti-References

ChroniCare is not visually modeled as:

- A childish wellness application: care coordination requires mature trust.
- A hospital dashboard: ChroniCare does not provide clinical monitoring or
  hospital operations.
- A gamified health tracker: routines are not scored or rewarded as medical
  performance.
- An AI health command center: AI is bounded assistance, not authority.
- A clinical decision-support interface: the product does not diagnose or
  recommend treatment.
- A colorful category dashboard: equal-priority color blocks obscure task
  hierarchy.
- An emergency dispatch application: SOS coordinates family or caregivers and
  does not dispatch services.
- A diabetes treatment application: diabetes tipe 2 is a demo condition only.
- A generic AI-generated healthcare dashboard: avoid excessive cards, gradients,
  glow, glass, vague charts, and decorative medical icons.

## Anti-AI-Slop Rules

- No gradients as default identity treatment.
- No glassmorphism.
- No glow around ordinary controls.
- No decorative AI sparkle.
- No repeated equal-sized cards for unrelated categories.
- No excessive pill shapes.
- No oversized border radius on every surface.
- No warm cream applied indiscriminately to every layer.
- No generic blue-purple AI palette.
- No unsupported metric, confidence score, chart, or health indicator.
- No decorative eyebrow label above every heading.
- No icon container for every line item.
- No generic `smart health` imagery.
- No motion added solely to make the interface feel advanced.
- No copy or visual treatment that implies diagnosis, delivery, live availability,
  BPJS acceptance, or medical certainty.

## Do and Do Not

Do:

- Make the active Patient context explicit.
- Keep one dominant action per task region.
- Show provenance, timestamp, and status.
- Design recovery as part of the primary experience.
- Use semantic text and icons alongside color.
- Preserve a visual SOS alert without audio.
- Keep fallback labels visible.
- Use familiar form, list, dialog, and status patterns.
- Verify at all three target viewports.
- Use synthetic data only.

Do not:

- Treat active UI state as authorization.
- Present pending OCR as confirmed truth.
- Present AI as a doctor or diagnostic authority.
- Promise SOS delivery outside an open connected dashboard.
- Promise realtime facility availability or BPJS acceptance.
- Present deactivation as hard deletion or subscription cancellation.
- Hide critical information behind hover.
- Use another Patient Profile's data during loading or switching.
- Claim accessibility, implementation, deployment, or production readiness
  without evidence.

## Canonical Tokens

```css
:root {
  --color-canvas: #F9F4F2;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F4F6F8;

  --color-text-strong: #2D2C2B;
  --color-text: #4A4744;
  --color-text-muted: #68635E;

  --color-border: #D8D2CE;
  --color-border-strong: #AAA29C;

  --color-primary: #356FD6;
  --color-primary-hover: #2859B6;
  --color-primary-pressed: #204A9C;
  --color-brand-orange: #E87932;
  --color-focus: #2859B6;

  --color-info-text: #2859B6;
  --color-info-surface: #EAF1FF;
  --color-info-border: #AFC5EC;

  --color-pending-text: #5B3F8C;
  --color-pending-surface: #F0EBF8;
  --color-pending-border: #C7B9DF;

  --color-confirmed-text: #2F6B52;
  --color-confirmed-surface: #E8F4EE;
  --color-confirmed-border: #A8CDBD;

  --color-attention-text: #8A5B00;
  --color-attention-surface: #FFF4D6;
  --color-attention-border: #E6C76A;

  --color-error-text: #B42318;
  --color-error-surface: #FDECEA;
  --color-error-border: #E5AAA5;

  --color-sos: #B42318;
  --color-sos-surface: #FDECEA;
  --color-sos-border: #D66A63;

  --font-sans: "Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui,
    -apple-system, "Segoe UI", sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-small: 8px;
  --radius-control: 10px;
  --radius-panel: 12px;
  --radius-patient-control: 14px;
  --radius-patient-panel: 16px;

  --shadow-base: 0 1px 2px rgba(45, 44, 43, 0.08);
  --shadow-raised: 0 4px 12px rgba(45, 44, 43, 0.10);
  --shadow-dialog: 0 12px 32px rgba(45, 44, 43, 0.16);

  --motion-control: 160ms;
  --motion-panel: 200ms;
}
```

Tokens are visual contracts, not evidence that implementation exists.

## Verification Checklist

- [ ] Product name is ChroniCare and repository name is ChronicCare.
- [ ] Patient, Caregiver, OCR Review, and SOS use one identity.
- [ ] Patient body text is at least 18px.
- [ ] Patient touch targets are at least 48x48px.
- [ ] Caregiver targets are at least 44x44px where practical.
- [ ] Body and control contrast meet WCAG AA targets.
- [ ] White text is not used on brand orange.
- [ ] Keyboard focus is visible.
- [ ] Status never relies on color alone.
- [ ] Pending OCR is not styled as confirmed.
- [ ] `DEMO_FALLBACK` remains visible while active.
- [ ] AI refusal and provider fallback are visually distinct.
- [ ] SOS remains visible without audio.
- [ ] SOS does not imply dispatch or closed-tab delivery.
- [ ] BPJS/faskes results show source and review date.
- [ ] Deactivation is Owner-only and non-destructive.
- [ ] Active Patient context is explicit.
- [ ] Profile switching does not mix Patient data.
- [ ] Loading, empty, error, forbidden, session-expired, offline, reconnecting,
      fallback, conflict, pending, confirmed, rejected, disabled, and success
      states are represented.
- [ ] Reduced motion preserves all information.
- [ ] 390x844, 768x1024, and 1440x900 are manually checked.
- [ ] 200% zoom preserves content and actions.
- [ ] No critical horizontal scroll exists.
- [ ] No medical, OCR, SOS, BPJS, privacy, or implementation overclaim appears.
- [ ] All visible demo data is synthetic.

## Canonical References

Product and guardrails:

- `AGENTS.md`
- `PRODUCT.md`
- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`

Technical and trust:

- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`

Execution:

- `docs/execution/workflow.md`
- `docs/execution/packets.md`
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
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

Demo, QA, and ownership:

- `docs/pitch/demo-script.md`
- `docs/qa/demo-readiness-checklist.md`
- `docs/team/ownership.md`

## Authority and Change Control

This `DESIGN.md` is a superseded visual reference. It may be consulted to
understand historical decisions, but its tokens, layout language, components,
motion, and responsive direction must not be used for new implementation work.
`NEWDESIGN.md` governs the active Care in Motion visual system.

It does not replace canonical product, safety, role, privacy, data, API,
provider, execution, demo, or QA contracts.

Changes to product scope, roles, authorization, medical boundaries, OCR trust,
AI behavior, SOS delivery, BPJS claims, data model, provider, execution packet
structure, or demo promise require a human verdict from the appropriate DRI.

Visual token and interaction-language changes are owned by Daniel and reviewed
by Ozan. Technical feasibility is reviewed by Bernard. AI/OCR and emergency
behavior are reviewed by Al.

The repository name ChronicCare does not change the product name ChroniCare.
