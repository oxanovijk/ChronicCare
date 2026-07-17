# ChroniCare Visual Impact Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking. The user explicitly prohibited a new branch, commit, or push.

**Goal:** Transform the existing ChroniCare visual prototype into a distinctive, intentional product UI while preserving the connected demo flow and all health-safety boundaries.

**Architecture:** Fix root causes in `globals.css`, shared UI primitives, and Patient/Caregiver shells before changing page composition. Behavior changes receive failing component tests first; CSS-driven visual changes are validated with exact viewport screenshots and browser measurements. No backend or provider layer is introduced.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS entrypoint with project CSS tokens, Phosphor icons, Vitest, Testing Library, and Playwright Chromium.

## Global Constraints

- Follow `PRODUCT.md`, `DESIGN.md`, `docs/design/00-screen-inventory.md` through `05-responsive-behavior.md`, and the latest Impeccable critique snapshot.
- Use only synthetic mock data and local visual state.
- Preserve Patient, Caregiver, OCR, AI, SOS, and Faskes safety copy and boundaries.
- Patient: warm, personal, reassuring, mobile-native; minimum 18px reading copy and 48px targets.
- Caregiver: precise, calm, operational, information-rich; minimum 44px practical targets.
- OCR: documentary, original-first, evidence-oriented; pending and confirmed remain unmistakable.
- SOS: urgent, persistent, serious; no emergency dispatch or delivery guarantee.
- Motion is 150–200ms for state feedback only and respects `prefers-reduced-motion`.
- No gradient text, glassmorphism, neon, illustration, decorative card grid, oversized radius, SaaS hero, or backend/provider work.
- Do not create a branch, commit, or push.

---

### Task 1: Lock Behavioral Regression Contracts

**Files:**
- Modify: `web/src/test/patient.test.tsx`
- Modify: `web/src/test/document-review.test.tsx`
- Modify: `web/src/test/sos-alert.test.tsx`
- Create: `web/src/test/caregiver-sos.test.tsx`

**Interfaces:** Tests define visible contracts for check-in closure, OCR mobile controls/viewer semantics, active SOS operational truth, and neutral IDLE detail.

- [ ] Add a Patient check-in assertion that success repeats `Cukup baik` and the optional note.
- [ ] Add OCR assertions for `Dokumen asli` / `Hasil ekstraksi` tabs and an evidence viewer that opens and closes.
- [ ] Add caregiver SOS IDLE assertions for `Tidak ada SOS aktif` and absence of `SOS dicatat`/`diminta baru saja`.
- [ ] Extend active SOS assertions to require event time, connection text, and visible audio status.
- [ ] Run `npm.cmd test -- patient document-review caregiver-sos sos-alert` and confirm the new assertions fail for the missing behavior.

### Task 2: Rebuild Shared Tokens, Controls, and Navigation

**Files:**
- Modify: `web/src/app/globals.css`
- Modify: `web/src/components/ui.tsx`
- Modify: `web/src/components/patient-shell.tsx`
- Modify: `web/src/components/caregiver-shell.tsx`
- Modify: `web/src/components/patient-switcher.tsx`

**Interfaces:** Shells derive active navigation from `usePathname`; shared controls expose consistent focus, touch size, and motion; switcher preserves the existing `switchPatient(id)` contract.

- [ ] Consolidate fixed typography, spacing, surface, semantic-link, motion, and z-index tokens in `globals.css`.
- [ ] Remove app-level serif usage and non-system weights while retaining the document facsimile type treatment.
- [ ] Add `aria-current="page"` and selected visual treatment to Patient and Caregiver navigation.
- [ ] Implement Patient switch Escape/outside dismissal, initial focus, and focus return without introducing a new dependency.
- [ ] Normalize icon/text optical alignment, 48px Patient hit areas, and 44px Caregiver controls.
- [ ] Run focused unit tests, typecheck, and lint.

### Task 3: Amplify Patient Composition

**Files:**
- Modify: `web/src/app/patient/access/page.tsx`
- Modify: `web/src/app/patient/home/page.tsx`
- Modify: `web/src/app/patient/check-in/page.tsx`
- Modify: `web/src/components/patient-chat-content.tsx`
- Modify: `web/src/components/chat-surface.tsx`
- Modify: `web/src/app/patient/sos/page.tsx`
- Modify: `web/src/app/globals.css`

**Interfaces:** Existing routes and state actions remain unchanged; the check-in success state adds a visible recap and the Patient shell accepts a focused SOS mode.

- [ ] Reshape Patient home into a functional `Hari ini` composition with check-in as focal point and reminder as integrated supporting context.
- [ ] Tighten access and check-in rhythm while maintaining one-question focus and 18px body copy.
- [ ] Make check-in success recap the selected condition and optional note.
- [ ] Remove the empty transcript well; place suggestions after the intro and keep the composer clear of the fixed navigation.
- [ ] Hide routine Patient navigation and demo exit in SOS confirmation mode while preserving one back/cancel path.
- [ ] Run Patient unit tests and capture 390×844 Patient screenshots.

### Task 4: Amplify Caregiver Dashboard and Orientation

**Files:**
- Modify: `web/src/app/caregiver/access/page.tsx`
- Modify: `web/src/app/caregiver/page.tsx`
- Modify: `web/src/components/caregiver-shell.tsx`
- Modify: `web/src/components/patient-switcher.tsx`
- Modify: `web/src/app/globals.css`

**Interfaces:** Caregiver routes retain their URLs and active Patient state; duplicate in-page Patient context is removed while the topbar remains authoritative.

- [ ] Tighten the generic split-access composition without adding a hero or illustration.
- [ ] Build a 65/35 desktop dashboard with strong `Terbaru` and `Perlu tindakan` anchors and one-column mobile sequence.
- [ ] Remove duplicate active-Patient band and keep condition/location in the topbar switcher context.
- [ ] Increase action hit areas and distinguish primary task action from secondary navigation links.
- [ ] Refine loading/context masking with functional 180ms state motion and reduced-motion handling.
- [ ] Run Caregiver tests and capture 390×844 and 1440×900 dashboard screenshots.

### Task 5: Rebuild OCR as an Evidence Workspace

**Files:**
- Modify: `web/src/components/document-review.tsx`
- Modify: `web/src/app/caregiver/documents/review/page.tsx`
- Modify: `web/src/app/caregiver/documents/page.tsx`
- Modify: `web/src/app/caregiver/documents/upload/page.tsx`
- Modify: `web/src/app/globals.css`

**Interfaces:** `DocumentReview` continues to read and write `ocrStatus`; local tab/viewer state is confined to the component.

- [ ] Implement mobile tabs with original first and status/provenance outside tab panels.
- [ ] Implement an accessible zoom viewer with close, Escape, and focus return.
- [ ] Create fixed-height independent desktop panes and preserve natural mobile document flow.
- [ ] Restore extraction field focus rings and add restrained field-to-evidence cues.
- [ ] Keep decision actions reachable and make confirmed/rejected/fallback state composition distinct.
- [ ] Run OCR tests and capture both target viewport screenshots.

### Task 6: Complete SOS, Chat, and Faskes Operational Surfaces

**Files:**
- Modify: `web/src/components/sos-alert.tsx`
- Modify: `web/src/app/caregiver/sos/page.tsx`
- Modify: `web/src/app/caregiver/chat/page.tsx`
- Modify: `web/src/app/caregiver/facilities/page.tsx`
- Modify: `web/src/components/chat-surface.tsx`
- Modify: `web/src/app/globals.css`

**Interfaces:** SOS state remains owned by `PrototypeStateProvider`; Faskes filtering remains local and static; chat context continues to use confirmed OCR only.

- [ ] Render neutral Caregiver SOS detail for IDLE and full event facts only for active/handled/conflict states.
- [ ] Add visible event time, connection, audio, and handler truth to the persistent alert; explain handled as coordination claimed.
- [ ] Refine Caregiver chat into a deliberate conversation workspace while preserving the confirmed-context ledger.
- [ ] Move Faskes provenance before filters, expose source/review per result, enlarge filters, and repeat confirmation guidance after results.
- [ ] Verify no medical, live-data, booking, or dispatch overclaim was introduced.
- [ ] Run SOS and Caregiver-tool tests.

### Task 7: Impeccable Polish, Browser QA, and Re-Critique

**Files:**
- Modify: `web/e2e/prototype.spec.ts`
- Modify: `web/src/app/globals.css` only for evidence-backed final adjustments
- Generate: `web/test-results/visual/*.png`
- Generate: `.impeccable/critique/<timestamp>__web-src.md`

**Interfaces:** Playwright preserves the connected flow and produces before/after evidence at exact target sizes.

- [ ] Extend Playwright assertions for active navigation, SOS IDLE/active truth, OCR mobile tabs, and horizontal overflow.
- [ ] Capture Patient, Caregiver, OCR, chatbot, SOS, and Faskes screenshots at 390×844 and 1440×900.
- [ ] Inspect screenshots visually; adjust only identified hierarchy, alignment, focus, contrast, or reflow defects.
- [ ] Run `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run test:e2e`, and `npm.cmd run build`.
- [ ] Run Impeccable detector, contrast/touch/overflow checks, and a fresh `$impeccable critique web/src` snapshot.
- [ ] Report before/after evidence, score trend, changed files, remaining risks, and explicit no-commit/no-backend status.

## Plan Self-Review

- All three P1 critique findings map to Tasks 1, 2, 5, and 6.
- Both P2 findings map to Tasks 2–6.
- Visual-impact work changes composition and hierarchy, not only tokens.
- Safety, synthetic-data, and provider boundaries remain unchanged.
- All behavior changes have failing tests before implementation; CSS-only work uses browser screenshot comparison.
- No placeholder, branch, commit, push, backend, provider, or deployment step is included.
