# Care in Motion Visual Authority Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not dispatch subagents, commit, push, or change packet status for this documentation-only migration.

**Goal:** Promote `NEWDESIGN.md` as ChroniCare's active visual source of truth and reconcile the existing design artifacts without changing locked product, technical, security, or execution contracts.

**Architecture:** Separate behavioral authority from visual authority. Locked product and technical documents continue to define scope, flow, trust, and safety; `docs/design` continues to define screen coverage, transitions, state behavior, and copy meaning; `NEWDESIGN.md` becomes authoritative for visual hierarchy, typography, color, components, motion, and responsive composition; `DESIGN.md` remains a legacy historical reference only.

**Tech Stack:** Markdown documentation, PowerShell repository checks, SHA-256 input-ledger verification, and Git read-only status inspection.

## Global Constraints

- Do not change product scope, roles, authorization, providers, API, data model, OCR trust, AI safety, SOS behavior, privacy, packet status, or demo promise.
- Do not edit application source under `web/`.
- Do not delete `DESIGN.md`; mark it superseded and preserve it for traceability.
- Do not delete or apply `stash@{0}`.
- Do not commit, push, stage files, or create a branch.
- `NEWDESIGN.md` controls visual decisions only; locked behavioral contracts always win.
- Screens not yet mocked must extend Care in Motion and may not fall back to the legacy visual system.

---

### Task 1: Promote Care in Motion and retire the old visual authority

**Files:**
- Modify: `NEWDESIGN.md`
- Modify: `DESIGN.md`

**Interfaces:**
- Produces: one unambiguous visual authority order consumed by all `docs/design` artifacts.

- [x] **Step 1: Promote NEWDESIGN status and scope**

Change its status to active canonical visual source of truth. Clarify that detailed mockups currently cover the main demo flow while the foundations govern all new MVP UI work.

- [x] **Step 2: Record the human promotion verdict**

State that the 2026-07-17 human verdict promotes Care in Motion. Preserve the rule that locked product and technical contracts override visual decisions.

- [x] **Step 3: Mark DESIGN as superseded legacy**

Replace both authority claims in `DESIGN.md` with a warning that it must not be used for new implementation decisions. Retain its content for historical traceability only.

### Task 2: Reconcile design coverage, flow, specifications, states, and copy

**Files:**
- Modify: `docs/design/00-screen-inventory.md`
- Modify: `docs/design/01-user-flow-map.md`
- Modify: `docs/design/02-screen-specifications.md`
- Modify: `docs/design/03-state-matrix.md`
- Modify: `docs/design/04-ux-copy-matrix.md`

**Interfaces:**
- Consumes: the authority order produced by Task 1.
- Produces: behavior-oriented artifacts that reference Care in Motion for visual expression.

- [x] **Step 1: Update source ledgers and authority clauses**

Replace active `DESIGN.md` references with `NEWDESIGN.md`, set validation date to 2026-07-17, and explicitly preserve each artifact's behavioral scope.

- [x] **Step 2: Align Patient typography and primary actions**

Use Care in Motion's Patient minimum body size of 16px, reserve 18/28 for primary guidance, and align PAT-01/PAT-02 actions with `Masuk dengan kode` and `Isi check-in hari ini`.

- [x] **Step 3: Align default Patient copy without weakening safe states**

Update default PAT-01/PAT-02 copy to the approved Care in Motion wording. Preserve disclosure-safe validation, expiry, offline, deactivation, and SOS limitations.

### Task 3: Reconcile responsive behavior

**Files:**
- Modify: `docs/design/05-responsive-behavior.md`

**Interfaces:**
- Consumes: Care in Motion Patient and Caregiver shell contracts.
- Produces: responsive rules for 390x844, 768x1024, and 1440x900 that no longer inherit legacy layout decisions.

- [x] **Step 1: Replace the legacy visual source**

Use `NEWDESIGN.md` for tokens, type, density, motion, accessibility, and responsive composition.

- [x] **Step 2: Align navigation shells**

Set Patient mobile navigation to Beranda, Check-in, Asisten, and SOS; set Caregiver desktop sidebar to 240px and mobile navigation to Ringkasan, Perawatan, Dokumen, Asisten, and Lainnya, with Faskes inside Lainnya and SOS outside normal navigation.

- [x] **Step 3: Align Patient text sizing**

Use 16/24 as the minimum interactive Patient body and 18/28 for primary guidance or emergency instruction.

### Task 4: Refresh dependency hashes and verify the migration

**Files:**
- Modify hash headers in: `docs/design/01-user-flow-map.md` through `docs/design/05-responsive-behavior.md`

**Interfaces:**
- Produces: a valid sequential SHA-256 dependency chain and a clean authority audit.

- [x] **Step 1: Recompute hashes in dependency order**

Compute `00`, update `01`; compute `01`, update `02`; compute `02`, update `03`; compute `03`, update `04`; compute `04`, update `05`.

- [x] **Step 2: Run authority and contradiction scans**

Run:

~~~powershell
rg -n "Proposed canonical visual source|not yet a replacement|`DESIGN.md`" NEWDESIGN.md DESIGN.md docs/design
rg -n "TODO|TBD|placeholder" NEWDESIGN.md DESIGN.md docs/design
~~~

Expected: no active authority points to `DESIGN.md`; no unresolved placeholder is introduced.

- [x] **Step 3: Verify scope isolation and Git state**

Confirm no files under `web/` changed during this migration, no files are staged, branch and HEAD remain unchanged, and `stash@{0}` remains intact.
