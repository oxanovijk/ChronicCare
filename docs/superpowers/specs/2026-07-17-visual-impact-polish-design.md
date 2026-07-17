# ChroniCare Visual Impact Polish Design

**Status:** Approved for inline execution
**Date:** 2026-07-17
**Primary DRI:** Daniel (UI/UX)
**Reviewers:** Ozan (product/QA), Al (AI/OCR safety copy), Bernard (future wiring boundaries)

## Objective

Raise the visual-only `/web` prototype from a tokenized wireframe to an intentional product UI without changing its medical, privacy, synthetic-data, or provider boundaries. The direction is **Functional Warmth + Operational Precision**: Patient surfaces feel personal and reassuring; Caregiver surfaces feel precise and operational; OCR behaves like an evidence workspace; SOS behaves like persistent family coordination.

## Visual Direction

### Patient

- A compact identity shell and a single functional `Hari ini` anchor establish the first viewport.
- Check-in remains the dominant action; the next reminder is integrated as supporting context rather than an equal card.
- Main reading copy uses at least 18px/28px and Patient targets use at least 48px hit areas.
- Warmth comes from supportive pacing, a restrained orange accent, and closure after actions—not a cream-everywhere canvas or decorative illustration.
- Patient SOS uses a focused shell with no routine bottom navigation during confirmation.

### Caregiver

- One persistent active-Patient context replaces duplicate context bands.
- `Terbaru` and `Perlu tindakan` become the dashboard's two scan anchors.
- The desktop working proportion is approximately 65/35; mobile returns to one ordered task sequence.
- Operational body copy targets 16px/24px and important metadata targets 14px/20px.
- Active navigation, source, recency, status, and next action remain immediately visible.

### OCR

- Original evidence and the extraction draft form one comparison task.
- Desktop uses a fixed-height 45/55 workspace with independent pane scrolling.
- Mobile uses explicit `Dokumen asli` and `Hasil ekstraksi` tabs; status and provenance stay outside the tab panels.
- Review fields retain a visible focus ring. Zoom opens an accessible evidence viewer instead of acting as an inert control.
- Pending, confirmed, rejected, and fallback states remain visually and textually distinct.

### SOS

- IDLE never renders event facts. ACTIVE/HANDLING/HANDLED/CONFLICT render Patient, time, connection, audio, and handler truth.
- Red remains reserved for an active urgent alert. Handled means coordination is claimed, not that the Patient is safe or the situation is resolved.
- Patient confirmation is concise, serious, and separated from routine navigation.

## Shared Design System

- Plus Jakarta Sans is the only application UI family; serif remains allowed only inside the synthetic source-document facsimile.
- Application weights are 400, 500, 600, and 700.
- Fixed product type scale replaces fluid product headings.
- Spacing follows 4, 8, 12, 16, 24, 32, and 48px steps.
- Radius remains controlled: 8–10px controls, 12px Caregiver/OCR panels, up to 16px Patient task panels.
- Primary blue is used for action and selection; orange is a restrained Patient warmth cue; purple is pending; green is confirmed; red is active SOS/error.
- Product motion is 150–200ms with ease-out-quart-like easing and a reduced-motion fallback.
- No gradient text, glassmorphism, glow, decorative cards, SaaS hero, random illustration, neon, or decorative motion.

## Interaction and State Contract

- Patient and Caregiver navigation expose a visible active state and `aria-current="page"`.
- Patient switcher supports Escape, outside dismissal, initial focus placement, and focus return.
- Check-in success summarizes the selected condition and optional note.
- OCR mobile tabs are keyboard accessible and decision actions remain reachable.
- Caregiver SOS direct entry shows a neutral empty state when no SOS exists.
- Faskes provenance appears before filters and within each result; direct-confirmation copy appears before and after the list.

## Verification Contract

- Test behavior changes first: SOS IDLE truth, check-in closure, OCR tabs/viewer, and state semantics.
- Compare before/after screenshots at 390×844 and 1440×900.
- Check horizontal overflow, visible focus, 48/44px targets, contrast, keyboard order, and responsive reflow.
- Run lint, typecheck, unit tests, Playwright, build, detector, and a fresh Impeccable critique.
- Do not create a branch, commit, push, provider integration, API, database, auth, Realtime, OCR/AI wiring, or deployment change.

## Acceptance Criteria

The result is accepted only if the before/after comparison shows a structural hierarchy and composition change—not merely new color and spacing. Patient and Caregiver must remain recognizably one ChroniCare product while communicating different modes. The connected demo flow, safety copy, synthetic data, and product boundaries must remain intact.
