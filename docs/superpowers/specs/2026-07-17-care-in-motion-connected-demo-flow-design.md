# Care in Motion Connected Demo Flow — Screen 03–10

**Status:** Approved for mockup implementation  
**Visual authority:** `NEWDESIGN.md`  
**Product authority:** locked product, technical, security, and journey documents  
**Affected DRI:** Daniel (UI/UX), with Ozan reviewing product/safety wording

## Goal

Extend the existing Screen 01 Patient Access and Screen 02 Patient Home mockup into a connected, responsive Screen 03–10 demo flow without adding backend behavior or implying that mocked providers are live.

## Routes

1. `/patient/check-in` — daily check-in with three large choices, optional 240-character note, validation, success, and separate SOS entry.
2. `/caregiver` — Maya-first care overview with patient switcher, review work, recent activity, and quick actions.
3. `/caregiver/documents/upload` — synthetic private-file upload mockup with type/size validation and honest server-revalidation note for PDF page count.
4. `/caregiver/documents/review` — side-by-side private document preview and editable, non-interpretive OCR fields with confirm/reject states.
5. `/caregiver/chat` — caregiver assistant mockup with a visible `Demo fallback` label and deterministic safe responses.
6. `/patient/sos` — deliberate SOS confirmation and honest delivery limitations.
7. `/caregiver/sos` — persistent visual alert, optional audio control, atomic-handling simulation, and conflict/reconnect wording.
8. `/caregiver/facilities` — static Tangerang faskes/BPJS helper with filters, source date, contact toggles, and honest empty state.

## Structure

- Keep route pages as Server Components where possible.
- Use small Client Components only for interactive mock states.
- Extend `PatientShell` with an explicit active navigation item.
- Add one shared `CaregiverShell` with a 240px desktop sidebar, mobile header/navigation, active patient context, and optional alert banner.
- Use plain React state. Do not introduce persistence, auth, cross-role session sharing, API routes, provider SDKs, or new packages.
- Keep all names and health content synthetic.

## Safety and Truthfulness

- `Butuh dukungan` is not an emergency classification.
- OCR output remains `Perlu review` until a caregiver confirms it; no clinical interpretation labels are shown.
- Assistant output is visibly identified as `Demo fallback`, never as live AI.
- SOS is a Care in Motion caregiver coordination alert, not emergency dispatch, and requires an open, connected caregiver dashboard.
- Facility data is static and never described as nearest, best, open now, clinically appropriate, or guaranteed to accept BPJS.
- No raw document, raw OCR, hidden prompt, full BPJS number, full address, or other-profile content appears in assistant context.

## Visual and Responsive Acceptance

- Preserve the canonical cream, teal, amber, coral, and deep-ink system with Plus Jakarta Sans.
- Flat editorial cards, selective organic circles/orbits, restrained shadows, no gradients, glass, emoji, or generic dashboard chrome.
- Patient screens prioritize 48px touch targets and bottom navigation; caregiver controls are at least 44px.
- Visible 3–4px focus states, semantic labels, inline validation, reduced-motion support, and no horizontal overflow.
- Validate primary views at 390×844 and 1440×900.

## Test Strategy

- Component tests cover check-in validation/success, upload validation/progress completion, OCR confirmation, assistant fallback/refusal, SOS confirmation/handling, profile switching, and facility filtering.
- Playwright covers the connected Screen 01–10 route journey and captures representative mobile/desktop screenshots.
- Fresh lint, typecheck, unit tests, build, and E2E are required before completion claims.

