# Execution Workflow

Produk: ChroniCare

Durasi: 30 jam

Demo produk: 2 menit

Presentasi: 5 menit

Status: Locked for MVP v1 execution structure

DRI: Ozan

Contributors: Bernard, Daniel, Al

Reviewer: Bernard

## 1. Operating Rules

- Bangun satu alur demo utuh sebelum menambah breadth.
- Maksimal satu packet P0 kritis berada pada implementasi berisiko tinggi pada satu waktu.
- Dua packet boleh aktif bersamaan jika file, migration, provider, dan dependency-nya tidak bertabrakan.
- Data Maya/Raka, role, API, OCR review gate, dan SOS state tidak boleh dikompromikan untuk mengejar visual polish.
- Demo condition adalah diabetes tipe 2, tetapi produk tidak boleh berubah menjadi diagnosis/treatment/diet app.
- Food/menu/pantangan tetap parking lot sampai main demo path stabil dan human memberi verdict baru.
- Packet hanya `Done` setelah check otomatis dan manual QA memiliki evidence.
- `Not Run` bukan `Pass`.
- Setelah jam ke-22 berlaku feature freeze.
- Setelah jam ke-27 berlaku demo freeze.

## 2. Main Demo Path

```text
Patient login code
  -> Patient homepage and diabetes routine check-in/chat
  -> Caregiver dashboard for active Patient Profile
  -> Upload synthetic health document
  -> OCR extraction and caregiver confirmation
  -> Caregiver chatbot uses confirmed context
  -> Patient triggers SOS
  -> Open caregiver dashboard receives visual alert and sound
  -> Caregiver clicks Saya tangani
  -> Caregiver opens Tangerang faskes/BPJS helper
```

The two-minute demo may use a pre-uploaded document or pre-confirmed extraction if live OCR timing threatens the run. The presenter must state when fallback data is shown.

## 3. Packet Philosophy

ChroniCare uses execution packets only. There is no separate phase or canonical milestone layer for this hackathon.

Each packet must be small enough for one focused implementation session:

- One primary goal.
- One visible outcome.
- Limited file areas.
- Five to ten acceptance criteria.
- Clear dependencies.
- Simple verification.
- Isolated failure impact.

Product, architecture, database, API, AI, security, and deployment contracts stay in their locked docs. Packets reference those contracts instead of copying them.

## 4. Team Cadence

### Kickoff, 15 minutes

Ozan confirms scope, demo order, packet status, and cut line. Bernard confirms env/provider access. Daniel confirms target mobile and laptop viewports. Al confirms Azure resources, safe prompts, and OCR fixture.

### Checkpoint every 90 minutes, 10 minutes

Each person reports:

- Packet and file area.
- Evidence completed since last checkpoint.
- Current blocker and fallback.
- Next integration point.
- Risk to the two-minute demo.

No status meeting extends beyond 10 minutes unless it resolves a P0 blocker.

### Handoff before review

Use this format:

```text
Packet:
Driver / DRI:
Commit or working tree state:
Changed paths:
Contract touched:
Checks and result:
Manual QA evidence:
Known issue:
Fallback:
Reviewer needed:
```

## 5. Packet Lifecycle

| Status | Meaning | Owner action |
| --- | --- | --- |
| `Draft` | A dependency or real path is missing | DRI lists blocker and fallback |
| `Ready` | Entry criteria and paths exist | Ozan authorizes start |
| `In Progress` | DRI is implementing | Keep packet checklist current |
| `Review` | Deliverable exists and checks ran | Assigned reviewers inspect evidence |
| `Done` | Exit gate passed | Ozan records evidence and timestamp |
| `Blocked` | Work cannot continue safely | DRI names blocker, impact, owner, and deadline |

Promotion to `Ready` requires:

- Previous dependency packet has the required artifact.
- Relevant env values or an explicit fallback exist.
- API and data model references are known.
- Test command exists or is explicitly unavailable.
- Synthetic data exists or belongs to the packet task.
- Security, privacy, and AI rules have been reviewed when applicable.

## 6. Thirty-Hour Schedule

### Hours 0 to 2: Decision and workstation check

Active work:

- Ozan confirms scope, packet order, demo prompts, and cut line.
- Bernard verifies Node 24 LTS, Supabase, Azure, and Vercel access without exposing credentials.
- Daniel freezes target mobile and laptop viewports.
- Al validates one safe chatbot call and one synthetic OCR document outside the app if credentials exist.

Gate:

- Required accounts are reachable or fallback mode is documented.
- No one starts a second stack or provider evaluation.

### Hours 2 to 4: Packet 01 - Scaffold and Tooling Baseline

Build `/web`, dependency baseline, shell routes, baseline test harness, and package scripts.

Exit target:

- App starts locally.
- Root, caregiver shell, and Patient login shell open.
- Lint, typecheck, unit test, E2E test, and build scripts exist.

### Hours 4 to 5: Packet 02 - Env and Provider Boundary

Add typed env validation, public/private env split, server-only Supabase/Azure provider modules, and labeled fallback flags.

Exit target:

- Provider clients cannot leak into Client Components.
- `.env.example` contains placeholder names only.
- Missing credentials fail safely or enter documented demo fallback.

### Hours 5 to 7: Packet 03 - Data Schema, Prisma, and Seed Base

Implement minimum identity/profile schema, explicit progressive fact states, audit foundation, and synthetic Owner/Family/Patient Profile seed base.

Exit target:

- Prisma generation works.
- Minimum profile defaults optional facts to `UNKNOWN`, and contradictory states are rejected.
- Synthetic Owner, Family Member, Maya, and Raka fixtures exist.
- No real data or credential is committed.

### Hours 7 to 9: Packet 04 - Caregiver Auth and Membership Authorization

Implement caregiver session resolution, Owner/Family Member membership helpers, and server-side authorization tests.

Exit target:

- Owner and Family Member can be distinguished server-side.
- Client-supplied role and `careCircleId` are ignored.
- Owner-only helper rejects Family Member.

### Hours 9 to 10.5: Packet 05 - Patient Access Code and Profile Isolation

Implement minimum profile create/update API, Patient code login/session, caregiver active Patient Profile switching, and Maya/Raka isolation.

Exit target:

- Patient code opens exactly one bound Patient Profile.
- Owner can create a minimum profile and leave optional facts unknown without blocking use.
- Caregiver profile switch clears stale state.
- Wrong role/profile access is denied.

### Hours 10.5 to 12: Packet 06 - Patient Profile Lifecycle Deactivation

Implement Owner-only, non-destructive end-of-care/deactivate profile flow with Patient access revocation.

Exit target:

- Deactivated profile is hidden from active flows.
- Patient access code/session is revoked.
- Family Member and Patient cannot trigger lifecycle action.

### Hours 12 to 14: Packet 07 - Patient Homepage and Check-In

Build cheerful Patient homepage, simple chronic-care check-in, and Patient-side loading/empty/error states.

Exit target:

- Patient can submit check-in for the bound profile.
- Patient copy is warm but not clinical advice.
- Check-in data is ready for caregiver dashboard.

### Hours 14 to 16: Packet 08 - Caregiver Dashboard, Medication, and Reminder

Build caregiver dashboard summary, derived setup checklist, medication/reminder basics, active profile state, and daily-care update surfaces.

Exit target:

- Caregiver sees latest check-in, medication text, reminder state, and empty states for active profile.
- Dashboard distinguishes unknown, none reported, and recorded fact states.
- Maya/Raka switching has no stale data.
- Dashboard hosts entry points for document, chatbot, SOS, and faskes packets.

### Hours 16 to 19: Packet 09 - Document Upload, OCR, and Review

Implement private upload, document state, OCR or labeled fixture fallback, structured extraction, review UI, edit, reject, and confirm.

OCR cut line at hour 18:

- Keep private upload, review UI, confirmation, and database state.
- If live provider remains unstable, switch demo to labeled `DEMO_FALLBACK`.
- Do not remove review confirmation or private storage rules.

Exit target:

- Confirmed extraction is stored.
- Pending/rejected/failed extraction is excluded from chatbot context.

### Hours 17 to 19: Packet 10 - Faskes and BPJS Helper

Implement static Tangerang facility data, filters, safe BPJS guidance, result source labels, and empty states.

Parallel rule:

- Packet 10 may overlap late Packet 09 if it does not touch document/OCR files or migrations.

Exit target:

- One stable faskes/BPJS demo sequence exists.

### Hours 19 to 22: Packet 11 - Chatbot Safety Gateway and Personas

Implement Patient and Caregiver chat personas, safety pre-routing, context builder, confirmed-OCR-only rule, Azure OpenAI call, and fallback.

Exit target:

- Patient answer is short and safe.
- Caregiver answer uses active profile context.
- Diagnosis, dose, emergency, hidden-context, fallback, profile-switch, diabetes target, lab, and diet/pantangan cases are tested.

### Hours 21 to 24: Packet 12 - SOS Realtime and Handling

Implement SOS creation, Supabase Realtime subscription, persistent visual alert, audio opt-in/test, atomic `Saya tangani`, reconnect fetch, and wrong-Care-Circle denial.

Feature freeze:

- Starts at hour 22.
- Unfinished non-P0 work is cut.

Exit target:

- Two open browser sessions show the Patient-to-caregiver SOS flow.
- Visual alert works even when audio is blocked.

### Hours 24 to 27: Packet 13 - QA, deploy, and first rehearsal gate

Ozan runs the complete checklist. Bernard fixes only P0/API/data/deploy blockers. Daniel fixes layout, accessibility, loading, empty, and error defects. Al fixes only safety, context, provider, and fallback defects.

Deploy Preview after local build and smoke checks pass. Seed the demo database once, then freeze its content.

### Hours 27 to 30: Demo freeze, rehearsal, and submission

- Demo freeze at hour 27 unless Ozan declares a P0 exception.
- Rehearse the two-minute demo at least three times.
- Rehearse the five-minute presentation at least twice.
- Record fallback video/screenshots.
- Close provider dashboards, terminals with env output, Network panel, and private tabs.
- Record final verdict as `Ready`, `Needs Fix`, or `Blocked` with evidence.

## 7. Packet Dependency Graph

```text
01 Scaffold and Tooling Baseline
  -> 02 Env and Provider Boundary
      -> 03 Data Schema, Prisma, and Seed Base
          -> 04 Caregiver Auth and Membership Authorization
              -> 05 Patient Access Code and Profile Isolation
                  -> 06 Patient Profile Lifecycle Deactivation
                  -> 07 Patient Homepage and Check-In
                      -> 08 Caregiver Dashboard, Medication, and Reminder
                          -> 09 Document Upload, OCR, and Review
                              -> 11 Chatbot Safety Gateway and Personas
                          -> 12 SOS Realtime and Handling
                  -> 10 Faskes and BPJS Helper

13 QA, Deploy, and Demo Rehearsal observes all packets from the start
and becomes the final gate after 01 through 12 reach Review.
```

Packet 10 may start after Packet 05. Packet 11 needs daily-care context from Packets 07 and 08 plus confirmed OCR context from Packet 09. Packet 12 needs Patient and caregiver shells from Packets 07 and 08.

## 8. Cross-Role Workflow

### Product to implementation

1. Ozan identifies the acceptance criterion and demo moment.
2. Daniel defines the user state and copy.
3. Bernard maps the state to API, authorization, and database contract.
4. Al reviews AI/OCR/emergency impact when applicable.
5. Ozan approves `Ready`.

### API to UI

1. Bernard links endpoint and response type from `docs/technical/api.md`.
2. Daniel builds loading, success, empty, error, and forbidden states.
3. Bernard verifies no UI assumption bypasses authorization.
4. Ozan runs the user journey.

### OCR

1. Daniel starts upload from the selected Patient Profile.
2. Bernard creates private object and document record.
3. Al runs OCR and structured extraction.
4. Bernard validates and stores `PENDING_REVIEW`.
5. Daniel presents source-versus-extraction review UI.
6. Caregiver edits and confirms.
7. Ozan verifies confirmed-only chatbot use and cross-profile isolation.

### SOS

1. Patient creates SOS from the bound Patient Profile.
2. Bernard stores the event and emits Supabase Realtime update.
3. Daniel shows persistent visual alert and audio opt-in.
4. Caregiver clicks `Saya tangani`.
5. Bernard commits one atomic handler.
6. Ozan verifies two-tab behavior and reconnect fallback.

## 9. Blocked Protocol

If blocked:

- Name the packet.
- Name the blocker.
- State demo impact.
- State owner.
- State deadline.
- Choose one fallback or cut line.

Do not continue by inventing a new provider, changing role rules, skipping OCR review, claiming Realtime delivery when the dashboard is closed, or sending unconfirmed OCR to chatbot context.
Do not rescue scope by adding food/menu recommendation, real subscription, push notification, WhatsApp/SMS, or clinical decision support.

## 10. Change Log

| Date | Change | Reason | DRI | Reviewer |
| --- | --- | --- | --- | --- |
| 2026-07-16 | Added progressive Patient Profile work across schema, profile API, dashboard, and chatbot packets | Preserve unknown data honestly through the implementation sequence | Ozan | Pending: Bernard |
| 2026-07-16 | Refined execution workflow from 9 broad packets to 13 one-prompt-sized execution packets | Align packet scope with human request for single-prompt implementability while preserving 30-hour delivery | Ozan | Bernard |
| 2026-07-16 | Refined execution flow for chronic illness Patient positioning, diabetes tipe 2 demo, deactivation, and food/menu cut line | Challenge update and human scope verdict | Ozan | Bernard |
