# Technical Architecture

Produk: ChroniCare

Status: Locked for MVP v1, refined for chronic illness Patient positioning

DRI: Bernard

Contributors: Daniel, Al

Reviewer: Ozan

## 1. Runtime Shape

ChroniCare memakai satu Next.js full-stack application di `/web`.

```text
Browser
  -> Next.js App Router UI
  -> Next.js Route Handlers under /api/v1
  -> Application services and authorization
  -> Prisma ORM 7
  -> Supabase PostgreSQL

Browser caregiver session
  -> Supabase Auth through @supabase/ssr
  -> Supabase Realtime subscription for SOS

Document upload
  -> Signed upload URL
  -> Private Supabase Storage
  -> Azure AI Document Intelligence OCR
  -> Azure OpenAI structured extraction
  -> Caregiver review
  -> Confirmed extraction in PostgreSQL

Chat
  -> Context builder
  -> Azure OpenAI server-side
  -> Safe response or explicit fallback

Deploy
  -> Vercel with project root /web
```

The architecture is a modular monolith. It keeps one deployable app while separating domain modules and provider adapters.

ChroniCare is now positioned for people managing chronic illness over the long term. The demo condition is type 2 diabetes. `Patient` means the person receiving care, not only an elderly parent.

## 2. Locked Technology Decisions

| Area | Decision |
|---|---|
| Frontend and backend | Next.js App Router with TypeScript |
| UI | Tailwind CSS and shadcn/ui |
| Validation | Zod 4 |
| Database | Supabase PostgreSQL |
| ORM and migrations | Prisma ORM 7 |
| Caregiver auth | Supabase Auth with SSR cookies |
| Patient auth | Hashed access code and opaque `httpOnly` session |
| Document storage | Private Supabase Storage bucket |
| Realtime SOS | Supabase Realtime database changes |
| AI | Azure OpenAI through official `openai` package |
| OCR | Azure AI Document Intelligence `prebuilt-layout` |
| Unit and integration testing | Vitest and Testing Library |
| End-to-end testing | Playwright Chromium |
| Deploy | Vercel |

## 3. Repository Shape After Scaffold

```text
/
|-- README.md
|-- AGENTS.md
|-- docs/
|-- web/
|   |-- src/
|   |   |-- app/
|   |   |   |-- (caregiver)/
|   |   |   |-- patient/
|   |   |   `-- api/v1/
|   |   |-- components/
|   |   |   |-- caregiver/
|   |   |   |-- patient/
|   |   |   `-- ui/
|   |   |-- features/
|   |   |   |-- auth/
|   |   |   |-- care-circle/
|   |   |   |-- daily-care/
|   |   |   |-- documents/
|   |   |   |-- facilities/
|   |   |   |-- chat/
|   |   |   `-- sos/
|   |   |-- lib/
|   |   |   |-- auth/
|   |   |   |-- db/
|   |   |   |-- supabase/
|   |   |   |-- azure/
|   |   |   `-- observability/
|   |   `-- generated/prisma/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- public/audio/sos-alert.mp3
|   |-- tests/
|   `-- package.json
```

Route Handlers stay thin. They parse input, resolve actor, call a domain service, and map the result to the locked API envelope.

## 4. Domain Boundaries

### 4.1 Identity and Access

Responsibilities:

- Read Supabase caregiver session.
- Resolve Owner or Family Member membership.
- Validate Patient access code and Patient session.
- Authorize `patientProfileId` before data access.
- Enforce Owner-only actions.

Forbidden:

- Trusting role, `careCircleId`, or active profile from client state.
- Returning different wrong-code messages for existing and non-existing profiles.
- Sharing caregiver JWT or service-role key with Patient sessions.

### 4.2 Care Circle and Patient Profiles

Responsibilities:

- One active Owner.
- Up to two Patient Profiles.
- Minimum profile creation with display name and relationship label only.
- Explicit `UNKNOWN`, `NONE_REPORTED`, and `REPORTED` states for safety-relevant fact groups.
- Derived setup checklist without a stored completion percentage.
- Profile list and active-profile summaries.
- Explicit profile isolation for every downstream service.
- Owner-only end-of-care/deactivation flow for a Patient Profile.

Profile switching is a UI selection followed by a new authorized request. It is not authorization.

Optional profile information is progressive. Missing demographic fields remain `null`; safety-relevant health groups use explicit status columns. The profile service validates status/value consistency and never turns an empty array into `NONE_REPORTED` automatically.

The setup checklist is a read model derived only from Patient Profile fields. It is advisory and does not authorize or block downstream features. Packet 08 medication services keep `currentMedicationsStatus` synchronized when active Medication rows are created; document upload remains optional and is not a profile-completion requirement.

Deactivation is non-destructive for MVP. It removes the Patient Profile from active daily-care flows, revokes patient access, preserves audit/history, and uses sensitive UI copy such as `Akhiri perawatan profil` rather than blunt internal wording.

### 4.3 Daily Care

Responsibilities:

- Check-ins.
- Medication records and taken logs.
- Reminders.
- Health notes.
- Dashboard aggregation.

Every query starts with authorized `patientProfileId`. Dashboard caching is disabled for personalized health data.

Creating/reactivating an active Medication and setting `currentMedicationsStatus = REPORTED` happen in one transaction. Pausing/ending the last active Medication sets the status to `UNKNOWN`. Profile PATCH cannot set `REPORTED` directly, and a non-reported status is rejected while an active Medication exists.

### 4.4 Documents and OCR

Responsibilities:

- Create signed upload intent.
- Keep files in private Storage.
- Validate MIME, size, hash, page count, and object path.
- Run OCR and structured extraction server-side.
- Require caregiver review.
- Expose only confirmed extraction to AI context.

OCR state machine:

```text
UPLOADING
  -> UPLOADED
  -> PROCESSING
  -> REVIEW_REQUIRED
  -> CONFIRMED

PROCESSING -> FAILED -> PROCESSING on explicit retry
REVIEW_REQUIRED -> REJECTED
```

No OCR result directly updates medication, diagnosis, check-in, reminder, or health note. A caregiver must copy and confirm any future normalized change through the corresponding feature.

### 4.5 AI Gateway

Responsibilities:

- Choose Patient or Caregiver persona from session.
- Build the minimum profile-bound context.
- Detect emergency and medication/dose requests before provider call.
- Call Azure OpenAI server-side.
- Validate structured OCR extraction.
- Return a labeled fallback on timeout, quota, or provider error.

The browser never calls Azure directly.

Sparse profile context rules:

- `UNKNOWN` facts are omitted from model context and never converted to negative statements.
- `NONE_REPORTED` is qualified as caregiver-reported information.
- Missing profile facts do not trigger speculative completion by AI.
- The chatbot may state that relevant information has not been recorded and suggest a safe next step.

### 4.6 SOS

Responsibilities:

- Create profile-bound SOS event.
- Publish insert/update through Supabase Realtime.
- Show persistent in-app alert to authorized caregivers.
- Play local sound after caregiver enables audio.
- Handle `Saya tangani` atomically.

MVP does not use WhatsApp, SMS, OS notification, Push API, service worker, ambulance dispatch, or live location. Delivery only works while an authorized caregiver dashboard is open and connected.

### 4.7 Facility and BPJS

Responsibilities:

- Serve versioned static Tangerang facility data.
- Filter by BPJS, emergency unit, area, service, and specialty.
- Show source and review date.
- Keep BPJS guidance administrative and non-diagnostic.

No live scraping, booking, ranking, or availability claim.

### 4.8 Food Guidance Parking Lot

Food/menu and pantangan ideas are explicitly outside MVP implementation. If revisited after the main demo path is stable, the AI may only summarize caregiver-entered or clinician-provided notes and may not prescribe a diabetes diet, carb target, insulin adjustment, or personalized food restriction.

## 5. Authorization Path

Caregiver request:

```text
Supabase SSR session
  -> auth user id
  -> active Care Circle membership
  -> requested Patient Profile belongs to Care Circle
  -> role permits action
  -> service query with explicit patientProfileId
```

Patient request:

```text
Patient session cookie
  -> session token hash lookup
  -> one bound Patient Profile
  -> route patientProfileId must match
  -> Patient action allowlist
  -> service query with explicit patientProfileId
```

Missing resources inside an unauthorized profile return `404` or `403` without leaking whether the profile exists.

## 6. Data Access and RLS

- Prisma handles server-side database reads and writes.
- Application authorization runs before Prisma.
- Supabase RLS protects browser-side Realtime and Storage flows.
- Service-role operations stay in server-only files.
- Signed Storage URLs are short-lived and created after membership validation.
- Realtime subscription is limited to events inside the caregiver's Care Circle.
- Patient browser does not subscribe to caregiver channels.

## 7. OCR Data Flow

```text
Caregiver selects file
  -> UI validates PDF/JPEG/PNG and 5 MB
  -> API creates document and signed upload intent
  -> browser uploads to private Storage
  -> API confirms object metadata
  -> caregiver starts extraction
  -> server downloads private object
  -> Document Intelligence returns OCR/layout
  -> minimum text goes to Azure OpenAI
  -> Zod validates document-extraction.v1
  -> database stores immutable pending extraction
  -> caregiver reviews and edits
  -> API atomically confirms extraction
```

Limits:

- One file per extraction.
- Maximum 5 MB and three pages.
- No batch OCR.
- No background queue for MVP.
- Live call may fall back to a clearly labeled synthetic result during demo.

## 8. SOS Data Flow

```text
Patient confirms SOS
  -> POST /api/v1/patient-profiles/{id}/sos
  -> database inserts NEW event
  -> Supabase Realtime emits INSERT
  -> caregiver dashboard shows alert
  -> sound plays if previously enabled
  -> caregiver clicks Saya tangani
  -> conditional update NEW to HANDLED
  -> Realtime emits UPDATE
  -> all open caregiver dashboards show handler
```

The visual alert must appear even if audio is blocked. UI exposes sound status and a manual test action.

## 9. Error and Fallback

| Failure | User-facing behavior | Stored state |
|---|---|---|
| Supabase Auth unavailable | Login error and local demo fallback only if preconfigured | No fake login claim |
| Database unavailable | Safe error; demo may switch to read-only synthetic mode | No partial write |
| Storage upload fails | Retry without document record confirmation | Document stays `UPLOADING` or becomes `FAILED` |
| OCR fails | Explain extraction unavailable; allow explicit retry or labeled demo fallback | Extraction/document `FAILED` |
| Azure OpenAI fails | Show persona-safe fallback | Chat message marked fallback |
| Realtime disconnects | Show disconnected badge and poll SOS list on focus | SOS database remains source of truth |
| Audio blocked | Keep visual alert and show `Aktifkan suara notifikasi` | No failure claim |
| No facility result | Empty state and source confirmation guidance | No invented result |
| Optional profile data unknown | Show `Belum diketahui` and setup action; continue available workflows | Stored status remains `UNKNOWN` |

## 10. Security Boundaries

- No secret in `NEXT_PUBLIC_*` except Supabase publishable values designed for clients.
- Raw OCR text, prompt, document, BPJS number, phone, and address never enter logs.
- Original documents stay private.
- Confirmed OCR is still untrusted user data, not medical truth.
- Unknown profile data remains unknown; the system never substitutes a default medical fact.
- Full BPJS numbers are not accepted or stored for MVP; only an optional four-digit suffix may be retained for recognition.
- AI response and OCR extraction display safety labels.
- The product makes no HIPAA, medical, legal, or production compliance claim.

## 11. Verification Strategy

Unit and integration tests cover authorization, profile isolation, data constraints, filters, prompt routing, OCR validation, and SOS state transitions. Playwright covers the two-minute demo path and negative paths.

Required cross-profile tests:

- Maya session cannot request Raka.
- Switching caregiver Maya to Raka reloads dashboard, chat, documents, and SOS.
- Confirmed OCR for Maya never enters Raka chat context.
- SOS Maya never renders as Raka alert.
- Realtime membership prevents another Care Circle from receiving events.

Required progressive-profile tests:

- Minimum profile creation succeeds with only display name and relationship label.
- Skipped facts remain `UNKNOWN`.
- Contradictory fact status/value combinations fail validation.
- Empty arrays do not become `NONE_REPORTED` implicitly.
- Active Medication creation updates the profile medication status atomically.
- Setup checklist reflects database state and does not block check-in, document upload, chatbot, or SOS.

## 12. Deployment

Vercel builds `/web` with `npm run build`. Supabase hosts Auth, PostgreSQL, private Storage, and Realtime. Azure hosts OpenAI and Document Intelligence. Environment values live in Vercel project settings and local `.env.local`, never in Git.

Provider calls use Node.js runtime. Do not move Prisma, Azure, or secret-bearing handlers to Edge runtime without an approved architecture change.

## 13. Change Log

| Tanggal | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|
| 2026-07-16 | Menambahkan progressive minimum profile architecture, explicit fact states, derived setup checklist, dan sparse-context behavior | Menjaga data tidak lengkap tetap jujur dan implementable dalam Packet 03 | Ozan | Pending: Bernard |
| 2026-07-16 | Mengubah kontrak teknis ke Patient Profile, demo diabetes tipe 2, dan lifecycle deactivation | Challenge pivot ke chronic illness | Bernard | Ozan |
| 2026-07-15 | Mengunci Next.js modular monolith, Supabase, Prisma, Azure OCR/AI, Vercel, dan SOS Realtime | Human stack and scope verdict | Bernard | Ozan |
