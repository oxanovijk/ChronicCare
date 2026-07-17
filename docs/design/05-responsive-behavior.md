# ChroniCare Responsive Behavior

Status: Proposed  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Daniel  
Product/QA reviewer: Ozan  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-17  
Input UX Copy Matrix: `docs/design/04-ux-copy-matrix.md`  
Input UX Copy Matrix SHA-256: `71CFDA4AC81789BEF87DA91B8D4A2D8DE9996E1BC35B3E9DD0238507AC86D923`

## Authority

This artifact defines responsive structure for existing ChroniCare surfaces,
states, actions, and copy. It does not change product scope, roles,
authorization, screen IDs, state truth, copy meaning, routing, provider
behavior, or implementation.

Canonical product, safety, role, privacy, data, API, provider, execution, demo,
and QA contracts override this artifact. Viewport rules are design contracts,
not evidence that a browser implementation exists or has been tested.

`NEWDESIGN.md` is the active visual and responsive source of truth. This
artifact expands its shells into testable viewport, overflow, focus, and state
behavior without reintroducing the superseded visual system.

## Sources

- `AGENTS.md` and `README.md` for repository, product, role, and verification
  guardrails.
- `PRODUCT.md` for product promise, experience modes, scope, and safety limits.
- `NEWDESIGN.md` for tokens, type, density, motion, accessibility, and responsive
  direction.
- `docs/design/00-screen-inventory.md` for 30 surface IDs and priorities.
- `docs/design/01-user-flow-map.md` for flow, transition, recovery, and
  cross-actor handoffs.
- `docs/design/02-screen-specifications.md` for information hierarchy, action,
  accessibility, and responsive implications.
- `docs/design/03-state-matrix.md` for state persistence, trust, and recovery.
- `docs/design/04-ux-copy-matrix.md` for final copy, runtime tokens, and wrapping
  risks.
- `docs/product/product-context.md`, `docs/product/feature-scope.md`,
  `docs/product/user-journeys.md`, and
  `docs/product/hackathon-mvp-scope-demo.md` for product and demo coverage.
- `docs/technical/architecture.md`, `docs/technical/data-model.md`,
  `docs/technical/api.md`, and `docs/technical/ai-guardrails.md` for session,
  authorization, provider, OCR, AI, SOS, and data boundaries.
- `docs/security-privacy.md` for isolation and disclosure rules.
- `docs/execution/workflow.md`, `docs/execution/packets.md`, and Packet 01
  through Packet 13 for execution and QA boundaries.
- `docs/pitch/demo-script.md`, `docs/qa/demo-readiness-checklist.md`, and
  `docs/team/ownership.md` for demo order, verification, and reviewers.

## Scope

In scope:

- Structural behavior at 390x844, 768x1024, and 1440x900.
- Content order, density, persistent context, action placement, overflow,
  copy wrapping, keyboard order, zoom, and state exceptions.
- P0, MVP lifecycle, system recovery, and documented P1 boundaries.
- Testable rules for Patient, Caregiver, OCR Review, and SOS modes.

Out of scope:

- Pixel-perfect wireframes, visual mockups, and prototype interactions.
- URLs, route groups, navigation implementation, components, CSS, and source
  code.
- New copy variants, screens, states, flows, transitions, or capabilities.
- Browser/device test evidence, deployment, or implementation claims.

## Target Viewports

| Viewport | Validation Size | Primary Use |
|---|---:|---|
| Mobile | 390x844 | Patient-first and compact Caregiver access |
| Tablet | 768x1024 | Stacked or controlled split work |
| Desktop | 1440x900 | Caregiver scanability and OCR comparison |

These sizes are validation anchors. Structural changes must respond to content
and input method, not device-name detection. Portrait, landscape, pointer, touch,
keyboard, browser zoom, and safe-area behavior still require verification.

## Global Responsive Principles

1. Mobile starts as one vertical reading and focus order. Additional columns
   appear only when every column keeps its required minimum width.
2. Patient task content uses a readable measure of 40ch to 65ch. Caregiver
   prose and forms use 45ch to 75ch; tables may be wider within their own
   non-critical scroll region.
3. At desktop, the application content region stops expanding after 1200px.
   Extra viewport width becomes outer space, not stretched lines or controls.
4. Primary actions stay after the information needed to decide. A sticky copy
   may supplement the in-flow action, but it cannot be the only instance.
5. Sticky headers, alerts, and action bars must account for safe-area insets and
   may occupy no more than 30 percent of a 390x844 viewport when combined.
6. Vertical page scrolling is standard. Horizontal page scrolling is forbidden.
   A non-critical data table may have its own labeled horizontal region on
   desktop or tablet, but critical identity, status, and actions stay outside it.
7. Mobile dialogs for sensitive tasks use a near-full-height sheet only when the
   title, consequence, action, and cancel control remain visible and keyboard
   safe. Tablet and desktop use a centered dialog with a maximum readable width
   of 560px.
8. At 200 percent zoom, the layout follows the mobile or single-column contract.
   No two-dimensional task is preserved if it causes overlap or hidden controls.
9. Long critical copy wraps without line clamp, ellipsis, tooltip, hover, or
   collapsed disclosure.
10. Loading and Patient switching clear stale content before a new Patient
    identity is presented. Skeleton geometry must not show old values.
11. Persistent SOS, session, connection, provider, and fallback states remain in
    the reading order and cannot be covered by navigation or action bars.
12. Focus follows the visual order. After structural recovery, focus moves to
    the new status heading or the first invalid field, never to the page top by
    default.
13. In viewport tables, `Same` means preserve the complete rule from the
    immediately preceding viewport column without structural change. It is an
    explicit inheritance, not an undecided behavior.

## Global Element Matrix

| Element | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Accessibility Constraint |
|---|---|---|---|---|
| Caregiver navigation access | Five labeled destinations: Ringkasan, Perawatan, Dokumen, Asisten, and Lainnya; Faskes is inside Lainnya and SOS stays outside normal navigation | Collapsible rail, minimum 64px collapsed | Persistent 240px labeled sidebar with Ringkasan, Perawatan, Dokumen, Asisten, and Faskes | All destinations keyboard reachable; no hover-only submenu; Patient Context Bar remains near the page header |
| Patient navigation access | Bottom navigation with Beranda, Check-in, Asisten, and SOS; reserve safe-area and content space | Compact top access with the same four labels | Centered compact top access; no caregiver sidebar and no dense dashboard expansion | Targets at least 48x48px; filled icons only identify the active destination |
| Active Patient context | Sticky compact block below global alerts; name and context label on separate lines if needed | Sticky header with name and switch action | Persistent full header aligned to content | Visible state is context only, never authorization proof |
| Page title and state | Title first, state/provenance immediately below | Title and status may share a row if both remain readable | Title, status, and contextual actions may share one row | Status has text/icon, not color alone |
| Primary action | Full content width when one dominant action; in-flow plus optional bottom sticky duplicate | Content-width; sticky only for long tasks | Intrinsic width aligned to task edge | Sticky copy cannot hide focused fields or status |
| Secondary actions | Stack below primary with at least 12px separation | Inline wrap after primary when labels fit | Inline group aligned by importance | Order remains consistent with keyboard sequence |
| Forms | One field per row; labels always above controls | Two columns only for independent short fields | Two columns when reading order stays row-major | Error summary precedes form; focus moves to first error |
| Dialogs | Near-full sheet with safe-area padding | Centered dialog, max 560px | Centered dialog, max 560px | Escape/cancel available unless unsafe; no focus escape |
| Sheets | Full-width bottom or side sheet; one scroll container | Side sheet up to 420px | Side panel only for secondary tasks | Trigger and close labels explicit |
| Banners | Full content width and multi-line | Full width inside owning context | Full width above owning content | Critical text never truncates |
| Persistent alerts | SOS above navigation; connection/provider below SOS | SOS spans content; lower alerts stack below | SOS spans main content, not sidebar | Visual alert remains without audio or motion |
| Tables and lists | Convert critical rows to labeled vertical lists | Use list or reduced-column table at minimum 680px content width | Full table when every critical column fits | Row identity repeated; action never only in horizontal overflow |
| Document comparison | Explicit tabs or sequential original then extraction | Stacked portrait; 40/60 split in landscape when each pane is at least 320px | 45/55 split with original first | Tab order follows original, draft, decision |
| Chat | Single column; composer after latest message, may stick above safe area | Single conversation column, max 720px | Conversation max 760px with optional context rail | Composer never covers refusal/emergency block |
| Filters | Full-width fields in a collapsible sheet; active-filter summary always visible | Two-column wrap above results | Inline wrap above results | Clear-all control labeled and keyboard reachable |
| Empty/error states | In owning content position with one recovery action | Same owning position; no detached card required | Same owning position | Status announced; focus reaches heading/action |
| Audio controls | Secondary control below visual SOS status | Inline beside audio status when space allows | Inline utility action | Audio state has text and visual equivalent |

## Patient Surface Behavior

| Screen ID | Content Priority | Mobile | Tablet | Desktop | Persistent Elements | Overflow Rule | State Exceptions |
|---|---|---|---|---|---|---|---|
| PAT-01 | Product identity, access-code field, validation, primary action | Centered single column, full-width field/action, max 24px side padding | Single column, max 480px | Single column, max 480px | Validation next to field; session/system alert above form | No horizontal scroll; code error wraps fully | Locked/offline state replaces action helper, not the field label |
| PAT-02 | Patient identity, check-in, next reminder, chatbot, SOS | One dominant check-in action; reminder/chat follow; SOS stays reachable after routine actions | Same order; reminder/chat may form two equal rows below check-in | Content max 760px; supporting tasks may use two columns | Patient identity and active SOS | Cards/lists wrap; no dense dashboard grid | Active SOS moves above routine content; partial/offline state stays below identity |
| PAT-03 | Patient identity, check-in question, options, submit | One question group at a time; submit full width after options | Form max 600px; options may use two columns only if labels remain whole | Form max 640px | Patient identity, validation, pending submit state | Option labels wrap; no horizontal choice row | Validation focuses question; submitting disables duplicates; error keeps answers |
| PAT-04 | Patient identity, reminder/medication status, timing, return | Single vertical detail; status before text; return after content | Detail max 640px | Detail max 680px | Item status and freshness | Long medication text wraps; no truncation | Stale/offline notice precedes content; inactive state removes mutation affordance |
| PAT-05 | Patient identity, safety scope, conversation, composer, emergency/SOS | One column; emergency/refusal occupies full width above composer; long copy wraps | Conversation max 700px; composer follows same column | Conversation max 760px; no multi-panel Patient layout | Patient identity, provider/fallback state, emergency block | Messages max 100% on mobile; no line clamp | CP-052 and all refusal/fallback copy stay expanded; context invalidation clears messages |

## Caregiver Surface Behavior

| Screen ID | Content Priority | Mobile | Tablet | Desktop | Persistent Elements | Overflow Rule | State Exceptions |
|---|---|---|---|---|---|---|---|
| CG-01 | Sign-in, validation, provider state | Single column, max 100% minus 24px side padding | Single column, max 480px | Single column, max 480px | Auth/provider status | No horizontal scroll | Authenticated-but-forbidden replaces protected destination, not sign-in labels |
| CG-02 | SOS, active Patient, changes, next actions, daily care | SOS first; sticky Patient context; task sections become labeled lists | Patient context header; two-column summary only above 680px content width | Sidebar plus main summary and optional 320px context panel | SOS, Patient identity, connection/freshness | Tables become lists; secondary metadata moves below primary value | Switching clears data; stale/offline gates mutations; deactivated context removes active actions |
| CG-03 | Authorized profile choices, current selection, switch status | Full-width sheet or page list; each option at least 48px high | Centered sheet/dialog or inline selector, max 520px | Compact popover/dialog anchored to context, max 520px | Current profile and loading boundary | Names wrap to two lines; no hidden selected state | Zero/one/two variants keep exact count; old data stays hidden until switch succeeds |
| CG-04 | Patient identity, current record, edit fields, save/cancel | Single-column form; save in-flow plus optional safe bottom bar | Two columns only for independent short fields | Main form max 760px with optional read-only context rail | Patient identity, unsaved/conflict status | Long values wrap; no field action in horizontal overflow | Conflict block precedes form; profile interruption keeps unsaved warning visible |
| CG-05 | Patient identity, provenance, conversation, composer | Single conversation column; provenance above first response; emergency full width | Max 720px conversation with context summary above | Max 760px conversation plus optional 280px read-only provenance rail | Patient identity, confirmed-context label, fallback state | Long copy wraps; context rail drops above conversation at 200% zoom | CP-091 and CP-093 never truncate; profile switch clears old conversation |
| CG-06 | Source/review date, filters, results, limitation | Source and limitation above filter trigger; results as labeled lists | Two-column filters and list/reduced table | Inline filters; full table only if critical fields fit | Source, review date, direct-confirmation limitation | Mobile never uses table; optional metadata stacks below | Empty/stale/unavailable/fallback remain in results position, not detached toast |

## Owner Lifecycle Behavior

| State | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Persistent Requirement | Action Rule |
|---|---|---|---|---|---|
| Consequence | Near-full sheet; Patient identity, consequence, retained-record statement, then continue/cancel | Centered dialog max 560px | Centered dialog max 560px | CP-106 fully visible | Continue remains disabled until consequence block is read in normal flow; no forced timer |
| Reason / validation | One field per row with label above; error adjacent and in summary | Same dialog, field max 480px | Same dialog, field max 480px | Patient identity and Owner-only context | Primary action follows valid reason; first error receives focus |
| Confirmation | Consequence repeated above final action; action and cancel stack | Actions may share row after copy | Actions share row, destructive action last in reading order | CP-108 never truncates | No sticky action without the in-flow consequence |
| Submitting | Controls remain in place and become pending/disabled | Same | Same | Patient identity and progress text | Prevent duplicate submit; do not dismiss dialog before server truth |
| Success | Replace form with result, access-revocation summary, and return action | Centered result panel | Centered result panel | CP-110 and CP-111 fully visible | Focus result heading, then return action |
| Conflict / forbidden / expired / offline | Replace mutation region with current truth and safe recovery | Same dialog or full-page system state according to session | Same | No protected data for denied actor | Refresh truth, return, or actor-specific sign-in; never retain enabled destructive action |

## OCR Review Behavior

| Screen ID | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Status and Provenance | Decision Actions | Overflow and Focus |
|---|---|---|---|---|---|---|
| OCR-01 | Status-filtered document list; each item shows document name, status, source mode, time, and one next action | Reduced-column table or list; status and action always visible | Full list/table inside max 1200px content region | Status text and icon stay beside each item; `DEMO_FALLBACK` is not shortened | Upload remains outside list overflow | Mobile list wraps metadata; profile switch clears list before new identity |
| OCR-02 | One-column file selection, constraint summary, file metadata, upload action | Form max 640px; constraints beside or below file metadata | Form max 720px | Private-storage boundary and fallback state stay above action | Upload full width on mobile; intrinsic on larger sizes | File name wraps anywhere-safe; size/page/type errors remain adjacent; focus first invalid rule |
| OCR-03 | Two explicit tabs: `Dokumen asli` first, then `Hasil ekstraksi`; status and decision bar outside tab panels | Portrait stacks original then extraction; landscape may use 40/60 split only if each pane is at least 320px | Fixed 45/55 original/extraction split; each pane has independent vertical scroll | `PROCESSING`, `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, `FAILED`, and `DEMO_FALLBACK` remain visible above comparison | Confirm and reject stay in one in-flow decision region; optional sticky duplicate may not cover document/status | Keyboard order: status, original, draft fields, validation, reject, confirm; switching Patient clears both panes |

OCR-specific rules:

1. Original document is always the first tab, first stacked region, or left pane.
2. A tab switch never hides status, provenance, Patient identity, or decision
   eligibility.
3. The mobile decision region follows the current draft fields. It is not fixed
   while the on-screen keyboard is open.
4. At tablet portrait and 200 percent zoom, the comparison returns to the mobile
   sequential contract.
5. Long document content may scroll inside the document pane. Page-level
   horizontal scroll remains forbidden.
6. `PENDING_REVIEW` and `DEMO_FALLBACK` use persistent text labels. A badge alone
   is insufficient.
7. `CONFIRMED` removes edit/confirm actions and presents the stored result.
   `REJECTED` removes chatbot eligibility and keeps the rejection state visible.

## SOS Behavior

| Screen ID | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Persistent Truth | Action and Recovery |
|---|---|---|---|---|---|
| SOS-01 | Full-width serious confirmation within Patient column; limitation copy above actions; confirm then cancel | Centered confirmation max 600px | Centered confirmation max 600px | Patient identity and stored-versus-received limitation | Confirm full width on mobile; creating disables duplicate; not-sent state keeps retry and emergency instruction |
| SOS-02 | Alert occupies full content width above navigation and Patient context; Patient, time, handler, connection, audio status stack | Alert spans main region; identity/time left, state/actions right when both fit | Alert spans main content; never confined to sidebar | Visual alert, Patient identity, event time, handler, and connection remain visible | Open SOS is dominant; audio is secondary; disconnect exposes REST refresh |
| SOS-03 | One vertical event summary; handler truth before action; claim full width | Summary and action may use 60/40 split | Summary and action use two columns only while handler/conflict copy remains whole | Current server handler and freshness | Claiming disables action; conflict replaces action with current handler and refresh |

SOS-specific rules:

1. Visual SOS persists without audio. Audio enabled, blocked, and muted never
   change alert position or visual urgency.
2. No continuous pulse. One entry transition of at most 200ms is allowed; reduced
   motion uses an immediate persistent state.
3. The combined sticky SOS alert and action region cannot cover focused content
   or exceed 30 percent of mobile viewport height. When copy grows, it returns to
   normal flow and only a compact status/action strip may remain sticky.
4. Realtime disconnect is a connection state. REST refresh is an explicit
   recovery action. They never share one success message.
5. CP-158, CP-161, CP-163, and CP-182 wrap in full. No tooltip, accordion, or
   ellipsis may hide delivery limitations.
6. Closed-tab limitation appears in confirmation and help/context copy, not as a
   false delivered or failed event state.

## Faskes and BPJS Behavior

| Concern | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Non-negotiable Limit |
|---|---|---|---|---|
| Source and review date | Full-width block before filters; source and date on separate lines | One row when both labels fit | One compact row above filters | Never hidden in result details |
| Filters | Trigger opens full-width sheet; active-filter chips and clear action remain on page | Two-column wrap above results | Inline wrap above results | No ranking control |
| Results | Labeled vertical list: name, broad location, recorded BPJS support, source, action | List or reduced table | Table only when all critical columns fit without page scroll | Direct-confirmation copy stays before first result and after result list |
| Empty | Replaces result region with no-match copy and clear-filter action | Same | Same | Does not imply no real-world facility |
| Stale/unavailable/offline | State block remains where results would appear; source boundary remains visible | Same | Same | Does not imply current availability |
| DEMO_FALLBACK | Persistent label above data and on result group | Same | Same | Never presented as live facility lookup |

## Chat Behavior

| Concern | PAT-05 | CG-05 | Responsive Rule |
|---|---|---|---|
| Conversation width | Full mobile width within Patient padding; max 760px on desktop | Max 760px; optional provenance rail on desktop | Long prose measure remains 45ch to 75ch; messages may use full width for safety blocks |
| Composer | In normal flow after latest message; optional sticky region above safe area | Same; sticky only while it does not cover provenance or errors | On-screen keyboard must not cover input, send action, or latest status |
| Refusal | Full-width semantic block before allowed alternative action | Same | Never collapsed or rendered as a transient toast |
| Emergency | CP-052 full width, fully wrapped | CP-093 full width, fully wrapped | Emergency title, instruction, and action stay together; no truncation |
| Provider fallback | Provider state and `DEMO_FALLBACK` remain above fallback content | Same | Label stays visible while fallback response remains visible |
| Context change | Clear old conversation before new Patient identity appears | Clear old conversation and provenance on switch | Focus moves to context-change heading, then selection/re-entry action |
| History | Current P0 session only | Current P0 session only | Responsive layout cannot imply durable or cross-profile history |

## System and Recovery Behavior

| System ID | Mobile 390x844 | Tablet 768x1024 | Desktop 1440x900 | Focus and Recovery | Must Not Reveal |
|---|---|---|---|---|---|
| SYS-01 | Full-page single-column role entry | Centered max 560px | Centered max 560px | Focus page heading, then Patient entry, then Caregiver entry | Patient/Profile data |
| SYS-02 | Full-page or owning-region forbidden state; one safe return action | Same | Same | Focus denial heading; return to last authorized context | Denied resource identity/existence |
| SYS-03 | Blocking full-page session state after protected content is cleared | Same | Same | Patient action returns to PAT-01; Caregiver action returns to CG-01 | Prior protected content |
| SYS-04 | Owning-region or full-page concealed state, matching absence behavior | Same | Same | Focus unavailable heading, then return | Whether another actor owns the resource |
| SYS-05 | Persistent connection banner above owning content; stale data marked | Same; banner may share row with last refresh | Compact full-width banner | Focus banner only when action becomes blocked; REST refresh remains explicit | Uninterrupted connection or delivery |
| SYS-06 | Persistent provider/fallback banner before fallback content | Same | Same | Retry follows provider status; label remains in reading order | Live provider result or secret |
| SYS-07 | Owning-region error where possible; full-page only when shell cannot render | Same | Same | Focus error heading; guarded retry follows | Stack, SQL, storage, prompt, or key |

## State Responsive Matrix

| State | Mobile Behavior | Tablet Behavior | Desktop Behavior | Persistent Information | Action Rule | Must Not Happen |
|---|---|---|---|---|---|---|
| Default | One-column task order | Add columns only when independent | Use available width within max container | Actor and Patient context | One dominant action | Competing equal actions |
| Loading | Context skeleton; old Patient values absent | Same, matching final structure | Same | Identity boundary and loading label | Disable dependent action | Old data under new identity |
| Empty | In owning region with explanation/action | Same | Same | Scope of emptiness | One create/clear/return action | Error styling |
| Partial | Available sections render; missing section labeled | May preserve two columns with missing panel labeled | Same | Missing section and freshness | Retry missing section | Complete-data claim |
| Validation | Field error below control plus summary | Same | Same | Field label and rule | Focus first invalid field | Color-only error |
| Submitting | Action remains in place with pending label | Same | Same | Task identity | Prevent duplicate | Success before response |
| Saving | Form stays visible; risky navigation gated | Same | Same | Patient identity and unsaved state | Wait or verified retry | Cross-profile save |
| Claiming | SOS action pending; handler truth visible | Same | Same | Event and current handler | Disable repeat | Premature ownership |
| Success | Result replaces pending region; next action follows | Same | May share row with contextual next action | Resulting server truth | Continue/return | Toast-only critical success |
| Error | Owning-region safe error | Same | Same | Failure category | Retry/return/sign in | Technical internals |
| Retry | Adjacent to failed task | Same | Same | What will be rechecked | Guarded retry | Preserved authorization claim |
| Disabled | Control remains perceivable with reason | Same | Same | Missing prerequisite | No activation | Permission claim without server check |
| Forbidden | Protected content removed | Same | Same | Generic denial | Safe return | Resource identity/existence |
| Session expired | Full-page actor-specific re-entry | Same | Same | Actor type | PAT-01 or CG-01 path | Session mixing |
| Not found | Owning/full-page concealed state | Same | Same | Generic unavailability | Return | Cross-profile existence |
| Offline | Persistent connection state; mutations gated | Same | Compact banner plus owning state | Last-known/freshness | Retry after connection | Accepted mutation |
| Reconnecting | Banner and stale marker | Same | Same | Connection and refresh status | Wait/REST refresh | Realtime continuity claim |
| Stale | Freshness appears before affected data | Same | May align with section title | Last refresh/review | Refresh | Current-data claim |
| Provider unavailable | Provider state before owning fallback/action | Same | Same | Unavailability category | Retry/fallback | Live provider result |
| DEMO_FALLBACK | Label remains above and within fallback result group | Same | Same | Exact label and provenance | Continue within limits | Hidden fallback |
| Conflict | Current server truth replaces stale action region | Same | Same | Changed value/handler | Refresh/acknowledge | Silent overwrite |
| Processing | Progress and source identity in owning region | Same | Same | Processed item and provenance | Wait/return | Reviewable result |
| Pending review | Status and original-first comparison | Same | Same | Untrusted status | Review/confirm/reject | Chatbot eligibility |
| Confirmed | Stored status replaces edit action | Same | Same | Human confirmation/provenance | Continue | Clinical validation |
| Rejected | Rejected status persists | Same | Same | Rejection and no-context rule | Return/restart if allowed | Confirmed styling |
| Cancelled | Origin return and no-write truth where needed | Same | Same | No accepted change | Return/restart | Mutation success |
| Deactivated | Active actions removed; result wraps fully | Same | Same | Access revoked and records retained | Return | Hard deletion |
| Audio enabled | Text state below/next to visual SOS | Inline when space permits | Inline utility | Visual SOS | Mute/open | Audio-only alert |
| Audio blocked | Text state and enable instruction | Same | Same | Visual SOS | Enable/open | Missing-event implication |
| Audio muted | Text state and re-enable action | Same | Same | Visual SOS | Enable/open | Handled-event implication |
| Already handled | Handler replaces claim action | Same | Same | Current server handler | Acknowledge/refresh | Claim overwrite |

## Copy Wrapping Matrix

| Copy IDs | Risk | Mobile Rule | Tablet Rule | Desktop Rule | Truncation Allowed | Copy Gap |
|---|---|---|---|---|---|---|
| CP-052 | 164-character Patient emergency instruction | Full-width block; title, instruction, and SOS action stack; 18px Patient body | Full-width within max 700px chat column | Full-width within max 760px chat column | No | None |
| CP-093 | 150-character Caregiver emergency instruction | Full-width block before composer; family-coordination limit stays in same block | Full-width within conversation | Full-width within conversation | No | None |
| CP-158 | 103-character SOS confirmation limitation | Supporting copy wraps above confirm/cancel; no sticky-only copy | Centered dialog; copy max 65ch | Centered dialog; copy max 65ch | No | None |
| CP-161 | 105-character stored-versus-received truth | Result block wraps before completion action | Same; max 65ch | Same; max 65ch | No | None |
| CP-163 | 105-character not-sent and emergency recovery | Failure and emergency sentences remain together above retry | Same | Same | No | None |
| CP-108 | 102-character lifecycle consequence | Consequence wraps before final action; sheet may scroll, action remains in flow | Dialog max 560px | Dialog max 560px | No | None |
| CP-120, CP-140 | Confirmed OCR chatbot eligibility | Place below confirmed status as block text; do not compress into badge | May align beside status only above 680px content width | May align with provenance in extraction pane | No | None |
| CP-145 | 98-character OCR profile-switch conflict | Full-width conflict block above review controls | Same | Same | No | None |
| CP-147 | 103-character Patient AI scope | Wrap below chat heading before first message; one readable block | Same | Same | No | None |
| CP-091 | 96-character Caregiver AI provenance/medical limitation | Block below response, before action | May occupy provenance summary above conversation | May occupy provenance rail only if it stays in reading order | No | None |
| CP-004 sampai CP-016 | Authorization and recovery | Full-width system/owning-state block | Same | Max 75ch | No | None |
| CP-098 sampai CP-105 | Faskes/BPJS source and limitation | Source, review date, and confirmation limit use separate lines above results | May share rows only when every label remains whole | Inline metadata allowed; limitation remains block text | No | None |
| CP-106 sampai CP-115 | Lifecycle group | Consequence/result text stays above actions | Centered max 560px | Centered max 560px | No | None |
| CP-116 sampai CP-146 | OCR provenance group | Status/provenance outside tab panels and fully wrapped | Status/provenance above split/stack | Status/provenance above comparison panes | No for trust copy | None |
| CP-158 sampai CP-182 | SOS group | Identity, time, handler, connection, and limits stack without line clamp | May use two columns when labels stay whole | May use summary/action columns | No for critical truth | None |

## Data Density Rules

| Domain | Mobile Limit | Tablet Rule | Desktop Rule | Required Visible Metadata | May Move Below Fold |
|---|---|---|---|---|---|
| Patient home | One dominant action plus at most three clearly separated secondary task entries in the first viewport | Supporting tasks may pair in two rows | Supporting tasks may use two columns | Patient identity, check-in status, nearest reminder, SOS access | Additional helper detail |
| Patient form | One question/field group per row | Two columns only for independent short choices | Same constraint; no density increase for its own sake | Label, current answer, validation, primary action | Non-critical explanation after field group |
| Caregiver dashboard | One summary value per labeled list row | Two-column summaries above 680px content width | Main plus optional context panel | Patient identity, freshness, recent change, SOS, next action | Secondary history/provenance detail |
| Caregiver table | Convert to list when name, status, time, and action cannot fit | Reduced columns; details expand below row | Full table within max container | Row identity, status, time/source, primary row action | Optional secondary metadata |
| OCR document list | Vertical item with status and one action | Reduced table/list | Full table when critical columns fit | Document identity, status, source mode, time, action | File metadata detail |
| OCR review | Sequential tabs | Stack or split | 45/55 split | Patient, document, status, provenance, original, draft, decisions | Non-critical extraction metadata |
| Faskes result | Labeled list | Reduced table/list | Table | Facility name, broad location, recorded BPJS support, source, review date | Secondary contact/detail |
| SOS alert | One event summary; no competing cards | Summary/action split when copy fits | Summary/action split | Patient, time, connection, handler, primary action | Audio settings after visual state |

Global density limits:

- Patient interfaces never use a dashboard grid with more than two columns.
- Caregiver content may use three regions only at 1440x900: sidebar, main task,
  and one optional context panel. A fourth persistent region is forbidden.
- Compaction may move optional metadata but cannot remove Patient identity,
  status, provenance, freshness, or limitation.
- Mobile result lists repeat field labels per item. They never rely on a table
  header that has scrolled away.

## Accessibility and Inclusion

| Requirement | Responsive Contract | Verification Anchor |
|---|---|---|
| WCAG AA | Text, controls, focus, status, and non-text boundaries use NEWDESIGN.md contrast targets | Check all three target viewports and semantic states |
| Patient targets | Minimum 48x48px including icon-only back/audio/SOS controls | 390x844 touch inspection |
| Caregiver targets | Minimum 44x44px where practical; coarse-pointer mode cannot reduce them | Tablet and desktop with coarse pointer |
| Patient text | Interactive body text stays at least 16/24; primary guidance and urgent instruction use 18/28 | 390x844 and 200 percent zoom |
| Reflow | At 200 percent zoom, multi-column surfaces become single-column without loss | 1440x900 at 200 percent zoom |
| Keyboard order | DOM/focus order matches visual order after every structural change | Tab through Patient, caregiver, OCR, SOS, dialogs |
| Visible focus | 2px focus ring with at least 2px offset remains unobscured | Sticky headers, sheets, action bars |
| Labels | Form labels stay visible; placeholder text is never the sole label | PAT-01, PAT-03, CG-01, CG-04, OCR-02/03 |
| Status | Text and icon accompany semantic color | Pending, confirmed, rejected, fallback, SOS, errors |
| Audio equivalent | Visual SOS alert and audio status remain present without sound | SOS-02 and SOS-03 |
| Reduced motion | Disable or replace entrance/position motion with immediate state | SOS, profile switch, dialogs, loading |
| Hover independence | Every hover detail is also visible/focusable/tappable | Navigation, tables, document rows, tooltips |
| Critical scroll | No horizontal page scroll or horizontally hidden critical action | All P0 surfaces at 390x844 |
| Sensitive confirmation | Consequence, identity, cancel, and final action remain in one focus scope | OWN-04, SOS-01, OCR reject/confirm |
| Error focus | Error summary receives focus, then links or moves to first invalid field | PAT-01/03, CG-01/04, OCR-02/03 |
| Sticky collision | Focused element and announced status receive scroll padding equal to all sticky regions | Mobile keyboard and 200 percent zoom |
| Orientation | Landscape does not remove content; it may enable a split only when minimum pane widths hold | 768x1024 rotated and mobile landscape |

## P1 Responsive Boundaries

| Surface / Expansion | Mobile | Tablet | Desktop | Boundary |
|---|---|---|---|---|
| OWN-01 | Member list as labeled rows; Owner action full width | List/reduced table | Table with Owner controls | Preserve exactly one active Owner; no P0 promotion |
| OWN-02 | Code status and sensitive action in one column; generated secret never truncates or persists beyond contract | Centered secure panel | Centered secure panel | Owner only; explicit Patient context |
| OWN-03 | One-column profile form and max-two explanation | Form max 640px | Form max 720px | No third Patient Profile |
| CG-07 | Activity history as labeled list | Reduced table | Full table if critical columns fit | Same-profile only |
| SOS-04 | SOS history as list with status/time/handler | Reduced table/list | Full table | Does not imply background notification history |
| PAT-04 medication-taken | One confirmation/action region below item detail | Same | Same | Mutation remains P1; 48x48px target |
| OCR-01 search/filter | Filter sheet and active summary | Inline wrap | Inline wrap | No batch OCR |
| CG-05 same-session history | Single conversation column; clear on Patient switch | Same | Optional session index only if context stays explicit | No durable/cross-profile history |
| CG-06 richer filters | Filter sheet and labeled results | Two-column filters | Inline filters | No ranking, booking, or live availability |

## Requirement Coverage

| Requirement | Source | Screen IDs | Responsive Sections | Coverage | Gap |
|---|---|---|---|---|---|
| Patient mobile-first simplicity | PRODUCT.md; NEWDESIGN.md; Packet 07 | PAT-01 sampai PAT-05 | Patient Surface Behavior; Density | Complete | None |
| Caregiver scanability | PRODUCT.md; NEWDESIGN.md; Packet 08 | CG-01 sampai CG-06 | Caregiver Surface Behavior; Density | Complete | None |
| Active Patient context | API; Screen Specifications | CG-02 sampai CG-06, OCR-01 sampai OCR-03, SOS-02, SOS-03 | Global Element Matrix and domain sections | Complete | None |
| Profile-switch stale clearing | Architecture; FLOW-06 | CG-02, CG-03, CG-04, CG-05, OCR surfaces | Caregiver, OCR, Chat, State Matrix | Complete | None |
| OCR original-first review | AI guardrails; Packet 09 | OCR-01 sampai OCR-03 | OCR Review Behavior | Complete | None |
| Confirmed-only chatbot context | API; State Matrix | OCR-03, CG-05 | OCR and Chat Behavior | Complete | None |
| AI refusal/emergency/fallback | AI guardrails; Packet 11 | PAT-05, CG-05 | Chat Behavior; Copy Wrapping | Complete | None |
| SOS visual/audio/Realtime/REST | API; Packet 12 | SOS-01 sampai SOS-03, SYS-05 | SOS and System Behavior | Complete | None |
| Static faskes/BPJS limits | API; Packet 10 | CG-06 | Faskes and BPJS Behavior | Complete | None |
| Non-destructive lifecycle | API; Packet 06 | OWN-04 | Owner Lifecycle Behavior | Complete | None |
| Global recovery | Architecture; State Matrix | SYS-01 sampai SYS-07 | System and State Responsive Matrices | Complete | None |
| Critical copy wrapping | UX Copy Matrix | All active domains | Copy Wrapping Matrix | Complete | None |
| Accessibility | NEWDESIGN.md; Packet 13; QA checklist | All surfaces | Accessibility and Inclusion | Complete | None |
| P1 boundaries | Feature scope | OWN-01 sampai OWN-03, CG-07, SOS-04 plus expansions | P1 Responsive Boundaries | Complete at P1 level | None |

## Screen Coverage

| Screen ID | Mobile | Tablet | Desktop | State Exceptions | Coverage |
|---|---|---|---|---|---|
| PAT-01 | Single-column sign-in | Max 480px | Max 480px | Validation, locked, offline | Complete |
| PAT-02 | Single-column home | One/two columns | Max 760px, two-column support | Active SOS, partial, deactivated | Complete |
| PAT-03 | One-column check-in | Max 600px | Max 640px | Validation, submitting, duplicate | Complete |
| PAT-04 | One-column detail | Max 640px | Max 680px | Empty, inactive, stale, not found | Complete |
| PAT-05 | One-column chat | Max 700px | Max 760px | Refusal, emergency, fallback, invalidation | Complete |
| CG-01 | Single-column sign-in | Max 480px | Max 480px | Forbidden, provider, offline | Complete |
| CG-02 | Lists and sticky Patient context | Two-column summaries | Sidebar/main/context maximum | SOS, switch, stale, deactivated | Complete |
| CG-03 | Sheet/page list | Dialog/inline max 520px | Popover/dialog max 520px | Zero/one/two, switching, forbidden | Complete |
| CG-04 | Single-column form | Conditional two columns | Main plus read-only context | Validation, conflict, profile interruption | Complete |
| CG-05 | One-column chat | Max 720px | Chat plus optional provenance rail | Emergency, fallback, profile conflict | Complete |
| CG-06 | Filter sheet and result lists | Filters plus reduced table/list | Inline filters and conditional table | Empty, stale, fallback | Complete |
| CG-07 | P1 history list | Reduced table | Conditional table | Empty, stale, forbidden | Complete at P1 level |
| OWN-01 | P1 member rows | Reduced table | Conditional table | Owner guard, conflict | Complete at P1 level |
| OWN-02 | P1 secure one-column panel | Centered panel | Centered panel | Secret display, revoke, forbidden | Complete at P1 level |
| OWN-03 | P1 one-column form | Max 640px | Max 720px | Max-two disabled, conflict | Complete at P1 level |
| OWN-04 | Near-full sensitive sheet | Centered max 560px | Centered max 560px | Submit, success, conflict, forbidden | Complete |
| OCR-01 | Document status lists | Reduced table/list | Conditional full table | Processing, pending, fallback, switch | Complete |
| OCR-02 | One-column upload | Max 640px | Max 720px | Validation, uploading, fallback | Complete |
| OCR-03 | Original/draft tabs | Stack or 40/60 split | 45/55 split | Pending, confirmed, rejected, conflict | Complete |
| SOS-01 | Full-width confirmation | Centered max 600px | Centered max 600px | Creating, stored, not sent | Complete |
| SOS-02 | Persistent stacked alert | Spanning summary/action | Spanning main content | Audio, disconnect, refresh, handled | Complete |
| SOS-03 | Vertical event/action | Conditional 60/40 | Conditional two-column | Claiming, conflict, stale, forbidden | Complete |
| SOS-04 | P1 event list | Reduced table/list | Conditional table | Empty, stale, forbidden | Complete at P1 level |
| SYS-01 | Single-column public entry | Centered max 560px | Centered max 560px | Path unavailable | Complete |
| SYS-02 | Full/owning forbidden state | Same | Same | Actor-specific return | Complete |
| SYS-03 | Full-page re-entry | Same | Same | Patient/Caregiver split | Complete |
| SYS-04 | Concealed owning/full state | Same | Same | Missing/deactivated | Complete |
| SYS-05 | Persistent connection banner | Same | Compact banner | Offline/reconnect/REST | Complete |
| SYS-06 | Persistent provider/fallback banner | Same | Same | Provider unavailable/fallback | Complete |
| SYS-07 | Owning/full error | Same | Same | Retry/reauth | Complete |

## Flow and Transition Coverage

| Flow ID | Transition IDs | Responsive Impact | Recovery Impact | Coverage |
|---|---|---|---|---|
| FLOW-01 | TRN-01 sampai TRN-02 | Single-column role entry at all viewports | Path failure remains in SYS-01 | Complete |
| FLOW-02 | TRN-03 sampai TRN-06, TRN-11 | Patient sign-in/home reflow | PAT-01 re-entry and forbidden clear content | Complete |
| FLOW-03 | TRN-07 sampai TRN-12 | Caregiver sign-in/dashboard reflow | CG-01, SYS-02 sampai SYS-04 | Complete |
| FLOW-04 | TRN-13 sampai TRN-15, TRN-54 sampai TRN-55 | Check-in form widths/actions | In-place retry and Patient re-entry | Complete |
| FLOW-05 | TRN-16 sampai TRN-17, TRN-54 sampai TRN-55 | Reminder detail reflow | Empty/stale/not-found owning states | Complete |
| FLOW-06 | TRN-18 sampai TRN-20, TRN-54 sampai TRN-55 | Selector sheet/dialog; stale clearing | Last authorized profile remains visible | Complete |
| FLOW-07 | TRN-21 sampai TRN-23, TRN-54 sampai TRN-55 | Daily-care form adaptation | Conflict and unsaved state remain visible | Complete |
| FLOW-08 | TRN-24 sampai TRN-28, TRN-54 sampai TRN-55 | Document list/upload/review structure | Validation, retry, fallback | Complete |
| FLOW-09 | TRN-28 sampai TRN-32, TRN-54 sampai TRN-55 | Original-first comparison | Conflict, reject, pending exit | Complete |
| FLOW-10 | TRN-33 sampai TRN-36, TRN-54 sampai TRN-55 | Patient chat and emergency copy | Refusal/fallback/SOS remain full width | Complete |
| FLOW-11 | TRN-32, TRN-37 sampai TRN-39, TRN-54 sampai TRN-55 | Caregiver chat/provenance | Profile change clears context | Complete |
| FLOW-12 | TRN-40 sampai TRN-42, TRN-54 sampai TRN-55 | SOS confirmation/result | Not-sent and session recovery | Complete |
| FLOW-13 | TRN-42 sampai TRN-47, TRN-54 sampai TRN-55 | Persistent alert and handler layout | Realtime state plus REST refresh | Complete |
| FLOW-14 | TRN-48 sampai TRN-50, TRN-54 sampai TRN-55 | Filter/result table-to-list | Empty/stale/fallback in results region | Complete |
| FLOW-15 | TRN-51 sampai TRN-55 | Sensitive sheet/dialog | Conflict, forbidden, session recovery | Complete |
| FLOW-16 | TRN-05 sampai TRN-12, TRN-47, TRN-54 sampai TRN-55 | System states reflow with owning content | Actor-specific and authorization-safe | Complete |
| FLOW-17 | TRN-56 | P1 member list/table | Owner guard and conflict | Complete at P1 level |
| FLOW-18 | TRN-57 | P1 secure code panel | Revoke/secret recovery | Complete at P1 level |
| FLOW-19 | TRN-58 | P1 profile form | Max-two validation | Complete at P1 level |
| FLOW-20 | TRN-59 | P1 history table-to-list | Empty/stale/forbidden | Complete at P1 level |
| FLOW-21 | TRN-60 | P1 SOS history table-to-list | Empty/stale/forbidden | Complete at P1 level |

## Packet Coverage

| Packet | Responsive Domain | Screen/State Coverage | Technical-Only Boundary | Coverage |
|---|---|---|---|---|
| 01 | Shell and global structure | SYS-01, SYS-07, global elements | `/web`, CSS, scripts, and components remain absent | Complete as design contract |
| 02 | Provider/fallback presentation | SYS-06, OCR, AI, faskes | Environment and adapter implementation | Complete |
| 03 | Synthetic data density | Profile/state/result layouts | Schema, seed, and persistence | Complete |
| 04 | Caregiver auth/membership | CG-01, CG-02, system states, OWN-01 P1 | Supabase Auth/membership implementation | Complete |
| 05 | Patient access/isolation | PAT-01, CG-03, system states, OWN-02 P1 | Code/session implementation | Complete |
| 06 | Lifecycle | OWN-04 and deactivated context | Transaction and revocation implementation | Complete |
| 07 | Patient routine | PAT-02 sampai PAT-04 | Daily-care implementation | Complete |
| 08 | Caregiver daily care | CG-02 sampai CG-04, CG-07 P1 | Patient-bound services | Complete |
| 09 | OCR review | OCR-01 sampai OCR-03 | Storage/provider/extraction implementation | Complete |
| 10 | Faskes/BPJS | CG-06 | Static dataset implementation | Complete |
| 11 | AI/chat | PAT-05, CG-05 | Safety gateway/provider implementation | Complete |
| 12 | SOS | SOS-01 sampai SOS-04, SYS-05 | Realtime and atomic update implementation | Complete |
| 13 | QA/deploy/rehearsal | All viewport/state/accessibility rules | Browser/device evidence, deploy, and rehearsal remain absent | Complete as verification contract; QA Not Run |

## Deferred Decisions

- Pixel-perfect wireframes and component dimensions beyond existing NEWDESIGN.md
  tokens and minimum accessibility sizes.
- Final prototype interactions and animation timing validation.
- URLs, route groups, layout files, and navigation implementation.
- CSS breakpoints, container-query syntax, component code, and state-machine
  implementation.
- Browser/device testing evidence, deployment, and implementation plan.

## Responsive Gaps

None.

## Open Decisions

None.

## Canonical References

- `AGENTS.md`
- `PRODUCT.md`
- `NEWDESIGN.md`
- `docs/design/00-screen-inventory.md`
- `docs/design/01-user-flow-map.md`
- `docs/design/02-screen-specifications.md`
- `docs/design/03-state-matrix.md`
- `docs/design/04-ux-copy-matrix.md`
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

- Daniel owns responsive hierarchy, density, action placement, copy reflow,
  keyboard order, and accessibility behavior.
- Ozan reviews scope, demo timing, BPJS/faskes limitations, lifecycle
  perception, and overclaim.
- Bernard reviews session, authorization, isolation, stale-data clearing,
  Realtime/REST recovery, and technical feasibility boundaries.
- Al reviews OCR trust, AI safety, emergency presentation, and provider/fallback
  behavior.
- Changes to product scope, roles, providers, safety, privacy, data model, API,
  execution structure, state truth, or copy meaning require a human verdict in
  the owning canonical source.
- This artifact stays `Proposed` until the named reviewers approve it. Its
  completeness does not prove implementation, browser QA, deployment, or
  production readiness.
