# API Contract

Produk: ChroniCare

Status: Locked for MVP v1, refined for chronic illness Patient positioning

Base path: `/api/v1`

DRI: Bernard

Contributors: Al, Daniel

Reviewer: Ozan

## 1. Contract Rules

- API memakai REST JSON melalui Next.js Route Handlers di Node.js runtime.
- Semua request body, route parameter, query parameter, dan provider response divalidasi dengan Zod 4.
- Nama field pada wire format memakai `camelCase`. Database memakai `snake_case`.
- Client tidak boleh mengirim role sebagai sumber otorisasi. Server memperoleh role dari caregiver session atau Patient session.
- Semua route patient-bound memakai `patientProfileId` pada path dan memvalidasi actor terhadap Patient Profile tersebut.
- API tidak menerima `careCircleId` dari client jika nilainya bisa diperoleh dari session dan Patient Profile.
- Tanggal dan waktu memakai ISO 8601 UTC.
- Endpoint mutasi memakai transaksi database bila mengubah lebih dari satu tabel.
- Secret, code hash, session hash, storage path internal, raw system prompt, dan service-role detail tidak pernah dikirim ke client.

## 2. Authentication

### 2.1 Caregiver

Caregiver sign-in memakai Supabase Auth email/password. Browser menyimpan Supabase session dalam cookie melalui `@supabase/ssr`. Route Handler membaca user ID dari session, lalu mengambil membership aplikasi dari `care_circle_members`.

### 2.2 Patient

Patient mengirim access code ke endpoint login. Server membandingkan hash, membuat opaque session token, menyimpan hash token di `patient_sessions`, dan mengirim cookie:

```text
chronicare_patient_session
```

Cookie attributes:

```text
HttpOnly; Secure in production; SameSite=Lax; Path=/; Max-Age=28800
```

Session Patient berlaku delapan jam. Patient tidak memilih Patient Profile setelah login.

### 2.3 CSRF and Origin

Mutasi berbasis cookie menerima request same-origin saja. Route Handler memeriksa `Origin` untuk method selain `GET` dan `HEAD`. Supabase session dan Patient session tidak boleh dipakai melalui endpoint cross-origin.

## 3. Response Format

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01JZ8K8Q2J5M0D7F2ZP6N3A4BC"
  }
}
```

List success:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_01JZ8K8Q2J5M0D7F2ZP6N3A4BC",
    "nextCursor": null
  }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim belum lengkap.",
    "fieldErrors": {
      "title": ["Judul wajib diisi."]
    },
    "requestId": "req_01JZ8K8Q2J5M0D7F2ZP6N3A4BC"
  }
}
```

Public error codes:

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body, query, path, or provider data invalid |
| 401 | `UNAUTHENTICATED` | Session absent or invalid |
| 403 | `FORBIDDEN` | Actor lacks membership or role |
| 404 | `NOT_FOUND` | Resource absent inside authorized scope |
| 409 | `CONFLICT` | State changed, duplicate, profile limit, or SOS already handled |
| 413 | `FILE_TOO_LARGE` | Document exceeds 5 MB |
| 415 | `UNSUPPORTED_FILE_TYPE` | File is not PDF, JPEG, or PNG |
| 422 | `OCR_REVIEW_REQUIRED` | Extraction cannot become confirmed without review |
| 429 | `RATE_LIMITED` | Login, chat, OCR, or SOS rate limit reached |
| 502 | `PROVIDER_UNAVAILABLE` | Azure or Supabase integration failed safely |
| 504 | `PROVIDER_TIMEOUT` | Provider exceeded request budget |
| 500 | `INTERNAL_ERROR` | Unexpected server failure without internal detail |

## 4. Common Types

```ts
type MemberRole = "OWNER" | "FAMILY_MEMBER"
type PatientStatus = "ACTIVE" | "INACTIVE" | "END_OF_CARE" | "DECEASED"
type PatientDeactivationReason = "NO_LONGER_CARED" | "PATIENT_DECEASED" | "OTHER"
type ProfileFactStatus = "UNKNOWN" | "NONE_REPORTED" | "REPORTED"
type BpjsMembershipStatus = "UNKNOWN" | "NOT_REGISTERED" | "REGISTERED"
type PatientProfileSetupAction =
  | "ADD_DATE_OF_BIRTH"
  | "ADD_LOCATION"
  | "REVIEW_PRIMARY_CONDITIONS"
  | "REVIEW_ALLERGIES"
  | "REVIEW_CURRENT_MEDICATIONS"
  | "REVIEW_EMERGENCY_CONTACT"
  | "REVIEW_BPJS_STATUS"
  | "ADD_USUAL_FACILITY"
type PatientProfileSetupChecklist = {
  minimumIdentityComplete: true
  primaryConditionsStatus: ProfileFactStatus
  allergiesStatus: ProfileFactStatus
  currentMedicationsStatus: ProfileFactStatus
  emergencyContactStatus: ProfileFactStatus
  bpjsMembershipStatus: BpjsMembershipStatus
  dateOfBirthRecorded: boolean
  broadLocationRecorded: boolean
  usualFacilityRecorded: boolean
  recommendedActions: PatientProfileSetupAction[]
}
type DocumentCategory =
  | "BPJS_CARD"
  | "REFERRAL_LETTER"
  | "PRESCRIPTION"
  | "LAB_RESULT"
  | "MEDICAL_RESUME"
  | "CONTROL_CARD"
  | "OTHER"
type DocumentStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "PROCESSING"
  | "REVIEW_REQUIRED"
  | "CONFIRMED"
  | "REJECTED"
  | "FAILED"
type SosStatus = "NEW" | "HANDLED" | "CANCELLED"
```

## 5. Auth Endpoints

### `GET /auth/me`

Returns either caregiver identity or Patient identity. It never returns both.

Caregiver response:

```json
{
  "data": {
    "actorType": "CAREGIVER",
    "user": {
      "id": "7df4772a-4286-4c70-b5e8-d6ae2ee72448",
      "displayName": "Dimas Pratama"
    },
    "membership": {
      "careCircleId": "a438c2c3-900c-4ffc-a503-ec034b072aa3",
      "role": "OWNER"
    }
  }
}
```

Patient response:

```json
{
  "data": {
    "actorType": "PATIENT",
    "patientProfile": {
      "id": "9040f77d-dabf-4149-8a5f-38b11046bac2",
      "displayName": "Maya Pratama",
      "relationshipLabel": "Maya"
    }
  }
}
```

### `POST /auth/patient/login`

Request:

```json
{
  "code": "482913"
}
```

Rules:

- Code is normalized without spaces.
- Failed response always uses the same message so it does not reveal a valid profile.
- Five failed attempts within 15 minutes lock that code entry path for 15 minutes.
- Successful login sets Patient session cookie and returns the bound Patient Profile summary.

### `POST /auth/patient/logout`

Revokes the current Patient session and clears the cookie. Response status is `204`.

## 6. Care Circle and Patient Profiles

| Method | Path | Actor | Purpose |
|---|---|---|---|
| GET | `/care-circle` | Caregiver | Current Care Circle and membership summary |
| GET | `/care-circle/members` | Caregiver | Active members and roles |
| POST | `/care-circle/invitations` | Owner | Create P1 invitation code |
| DELETE | `/care-circle/members/{userId}` | Owner | Mark Family Member removed |
| GET | `/patient-profiles` | Caregiver | List up to two profiles |
| POST | `/patient-profiles` | Owner | Add first or second profile |
| GET | `/patient-profiles/{patientProfileId}` | Authorized actor | Profile summary scoped to actor |
| PATCH | `/patient-profiles/{patientProfileId}` | Owner or Family Member | Update allowed caregiving fields |
| POST | `/patient-profiles/{patientProfileId}/access-code` | Owner | Regenerate Patient access code |
| POST | `/patient-profiles/{patientProfileId}/deactivate` | Owner | End active care for a profile without hard delete |

Create Patient Profile request:

```json
{
  "displayName": "Maya Pratama",
  "relationshipLabel": "Maya"
}
```

Only `displayName` and `relationshipLabel` are required. The server initializes:

```json
{
  "primaryConditionsStatus": "UNKNOWN",
  "allergiesStatus": "UNKNOWN",
  "currentMedicationsStatus": "UNKNOWN",
  "emergencyContactStatus": "UNKNOWN",
  "bpjsMembershipStatus": "UNKNOWN"
}
```

Optional information is added after profile creation through `PATCH /patient-profiles/{patientProfileId}`. Document upload starts only after the profile ID exists.

The third profile returns `409 PATIENT_PROFILE_LIMIT_REACHED`.

### `PATCH /patient-profiles/{patientProfileId}`

Owner or Family Member. All fields are optional, but the merged resulting state must satisfy the status/value rules.

Example progressive detail request:

```json
{
  "dateOfBirth": "1982-08-12",
  "city": "Tangerang",
  "locationLabel": "Karawaci, Tangerang",
  "primaryConditionsStatus": "REPORTED",
  "primaryConditions": ["Diabetes tipe 2"],
  "allergiesStatus": "UNKNOWN",
  "currentMedicationsStatus": "UNKNOWN",
  "emergencyContactStatus": "REPORTED",
  "emergencyContactName": "Dimas Pratama",
  "emergencyContactPhone": "081200000001",
  "bpjsMembershipStatus": "REGISTERED",
  "bpjsNumberLast4": "1234",
  "usualFacilityName": null
}
```

Rules:

- `UNKNOWN` means not known/not reviewed and must not be displayed as `none`.
- `NONE_REPORTED` means the caregiver explicitly reports that none is currently known; UI and AI must preserve that qualification.
- `REPORTED` requires the related value after applying the patch.
- Changing conditions or allergies to a non-`REPORTED` status requires an explicit empty array; the server does not silently discard recorded values.
- `emergencyContactStatus = REPORTED` requires at least a name or phone.
- `bpjsMembershipStatus = REGISTERED` does not require `bpjsNumberLast4`.
- `NOT_REGISTERED` is caregiver-reported administrative information and must not be presented as live BPJS verification.
- `bpjsNumberLast4`, when provided, must contain exactly four digits.
- The API does not accept a full BPJS number.
- Setting BPJS status to `UNKNOWN` or `NOT_REGISTERED` clears any stored suffix atomically.
- Profile PATCH may set `currentMedicationsStatus` only to `UNKNOWN` or `NONE_REPORTED`; `REPORTED` is rejected as a client-supplied value.
- `currentMedicationsStatus = UNKNOWN` or `NONE_REPORTED` is rejected while an active Medication exists.
- Medication create/reactivate sets `REPORTED`; pausing/ending the last active Medication sets `UNKNOWN`.
- OCR confirmation never calls this endpoint automatically.

Patient Profile responses include the fact statuses, masked BPJS metadata when available, and `setupChecklist`. There is no stored completion percentage.

`broadLocationRecorded` is true when either `locationLabel` or `city` is present. `recommendedActions` is ordered deterministically: allergies, current medications, emergency contact, primary conditions, BPJS, date of birth, broad location, then usual facility. Actions for already reviewed/recorded items are omitted.

### `POST /patient-profiles/{patientProfileId}/deactivate`

Owner only. This is the MVP place for end-of-care, including the sensitive "patient has passed away" case. UI copy must not use blunt internal wording.

Request:

```json
{
  "reason": "PATIENT_DECEASED",
  "note": "Care ended; keep records archived for the Care Circle."
}
```

Rules:

- The server sets Patient Profile status to `END_OF_CARE` or `DECEASED` based on reason.
- Active Patient access codes and Patient sessions for the profile are revoked.
- The profile is excluded from active dashboard, reminder, chat, document upload, and SOS creation flows.
- Existing history remains readable to authorized caregivers unless later hidden by a separate human-approved policy.
- This is not a real subscription or payment cancellation feature.
- The action is audited with reason category only, not detailed medical/private text.

## 7. Dashboard and Daily Care

### `GET /patient-profiles/{patientProfileId}/dashboard`

Caregiver response aggregates only demo-critical data:

```json
{
  "data": {
    "patientProfile": {
      "id": "9040f77d-dabf-4149-8a5f-38b11046bac2",
      "displayName": "Maya Pratama",
      "relationshipLabel": "Maya",
      "primaryConditionsStatus": "REPORTED",
      "allergiesStatus": "UNKNOWN",
      "currentMedicationsStatus": "REPORTED",
      "emergencyContactStatus": "REPORTED",
      "bpjsMembershipStatus": "REGISTERED"
    },
    "setupChecklist": {
      "minimumIdentityComplete": true,
      "primaryConditionsStatus": "REPORTED",
      "allergiesStatus": "UNKNOWN",
      "currentMedicationsStatus": "REPORTED",
      "emergencyContactStatus": "REPORTED",
      "bpjsMembershipStatus": "REGISTERED",
      "dateOfBirthRecorded": true,
      "broadLocationRecorded": true,
      "usualFacilityRecorded": false,
      "recommendedActions": [
        "REVIEW_ALLERGIES",
        "ADD_USUAL_FACILITY"
      ]
    },
    "latestCheckIn": null,
    "activeMedications": [
      {
        "id": "d5e30c62-12fe-4f61-9bb6-1fd7d4b4349e",
        "name": "Metformin",
        "doseText": "500 mg sesuai resep",
        "scheduleText": "Dua kali sehari sesuai catatan caregiver",
        "status": "ACTIVE"
      }
    ],
    "upcomingReminders": [],
    "recentDocuments": [],
    "activeSos": null
  }
}
```

No cache entry may be reused across different `patientProfileId` values.

`setupChecklist` is advisory. Unknown optional information does not block dashboard, Patient access code, check-in, document upload, chatbot, or SOS.

### Check-in

| Method | Path | Actor |
|---|---|---|
| GET | `/patient-profiles/{patientProfileId}/check-ins?limit=10` | Authorized caregiver or bound Patient |
| POST | `/patient-profiles/{patientProfileId}/check-ins` | Authorized caregiver or bound Patient |

Request:

```json
{
  "mood": "OKAY",
  "conditionText": "Sedikit lemas setelah bangun tidur.",
  "painLevel": 2,
  "medicationTaken": true,
  "complaintText": null,
  "needsFamilyHelp": false
}
```

### Medication

| Method | Path | Actor |
|---|---|---|
| GET | `/patient-profiles/{patientProfileId}/medications` | Authorized caregiver or bound Patient |
| POST | `/patient-profiles/{patientProfileId}/medications` | Caregiver |
| PATCH | `/patient-profiles/{patientProfileId}/medications/{medicationId}` | Caregiver |
| POST | `/patient-profiles/{patientProfileId}/medications/{medicationId}/logs` | Caregiver or bound Patient |

Medication creation request stores instructions as provided by a caregiver:

```json
{
  "name": "Amlodipine",
  "doseText": "5 mg sesuai resep",
  "scheduleText": "Satu kali setelah sarapan",
  "instructions": "Ikuti resep dokter. Jangan mengubah dosis tanpa arahan tenaga medis.",
  "startDate": "2026-07-01",
  "endDate": null
}
```

Creating or reactivating an active Medication sets `currentMedicationsStatus` to `REPORTED` in the same transaction. Pausing or ending the last active Medication sets it to `UNKNOWN`. A caregiver cannot set the status to `UNKNOWN` or `NONE_REPORTED` while an active Medication exists, and cannot set `REPORTED` through Patient Profile PATCH.

### Reminder and health note

| Method | Path | Actor |
|---|---|---|
| GET | `/patient-profiles/{patientProfileId}/reminders` | Authorized caregiver or bound Patient |
| POST | `/patient-profiles/{patientProfileId}/reminders` | Caregiver |
| PATCH | `/patient-profiles/{patientProfileId}/reminders/{reminderId}` | Caregiver |
| GET | `/patient-profiles/{patientProfileId}/health-notes` | Caregiver |
| POST | `/patient-profiles/{patientProfileId}/health-notes` | Caregiver |

## 8. Document Upload and OCR

Supported input:

- `application/pdf`
- `image/jpeg`
- `image/png`
- Maximum 5 MB.
- Maximum three pages.
- One file per request.

### `POST /patient-profiles/{patientProfileId}/documents/upload-intent`

Caregiver only. Creates document row in `UPLOADING` status and a signed Supabase upload URL.

Request:

```json
{
  "title": "Hasil Lab Juli 2026",
  "category": "LAB_RESULT",
  "fileName": "hasil-lab-juli-2026.pdf",
  "mimeType": "application/pdf",
  "fileSizeBytes": 418220,
  "sha256": "7df3ba14e908f52c7d6f5f5a5be97b35dc92ed58ef47193f6f73f7d8c3d87221"
}
```

Response:

```json
{
  "data": {
    "documentId": "58a50912-d0ef-44a2-a1fd-034ea1086d32",
    "upload": {
      "token": "signed-upload-token-returned-by-supabase",
      "path": "a438c2c3-900c-4ffc-a503-ec034b072aa3/9040f77d-dabf-4149-8a5f-38b11046bac2/58a50912-d0ef-44a2-a1fd-034ea1086d32/hasil-lab-juli-2026.pdf",
      "expiresAt": "2026-07-15T10:00:00.000Z"
    }
  }
}
```

The upload token is temporary. It is not stored in the database or logs.

### `POST /patient-profiles/{patientProfileId}/documents/{documentId}/complete`

Confirms the object exists, checks MIME and size, sets `UPLOADED`, and returns the document summary. It rejects mismatched storage paths.

### `POST /patient-profiles/{patientProfileId}/documents/{documentId}/extract`

Caregiver only. This synchronous MVP endpoint:

1. Sets document status to `PROCESSING`.
2. Downloads the object server-side from the private bucket.
3. Sends it to Azure AI Document Intelligence `prebuilt-layout`.
4. Sends minimum OCR text to Azure OpenAI for `document-extraction.v1` JSON.
5. Validates the JSON with Zod.
6. Inserts immutable extraction row as `PENDING_REVIEW`.
7. Sets document status to `REVIEW_REQUIRED`.

Success returns the extraction for review. Timeout or provider failure sets `FAILED` and returns a safe error. `OCR_FALLBACK_MODE=synthetic-demo` may return a seeded extraction with `providerMode: DEMO_FALLBACK`; UI must label it.

### Locked `document-extraction.v1` schema

```ts
type DocumentExtractionV1 = {
  schemaVersion: "document-extraction.v1"
  documentType: DocumentCategory
  sourceLanguage: "id" | "en" | "mixed" | "unknown"
  patientNameAsWritten: string | null
  documentDateAsWritten: string | null
  facilityNameAsWritten: string | null
  clinicianNameAsWritten: string | null
  documentNumberAsWritten: string | null
  summaryAsWritten: string[]
  medications: Array<{
    nameAsWritten: string
    doseAsWritten: string | null
    frequencyAsWritten: string | null
    instructionAsWritten: string | null
  }>
  labResults: Array<{
    testNameAsWritten: string
    valueAsWritten: string | null
    unitAsWritten: string | null
    referenceRangeAsWritten: string | null
    flagAsWritten: string | null
  }>
  referral: {
    originFacilityAsWritten: string | null
    destinationFacilityAsWritten: string | null
    validUntilAsWritten: string | null
    reasonAsWritten: string | null
  } | null
  bpjs: {
    memberNumberMasked: string | null
    participantNameAsWritten: string | null
  } | null
  warnings: string[]
}
```

Extraction rules:

- Preserve source wording.
- Use `null` or an empty array when unreadable or absent.
- Never calculate dose, diagnose, classify a lab value as safe/dangerous, or add medical meaning.
- Mask BPJS number except the last four characters.
- `summaryAsWritten` may condense headings but cannot add facts.

### `PATCH /patient-profiles/{patientProfileId}/documents/{documentId}/extractions/{extractionId}`

Caregiver edits fields during review. Request must include the full `document-extraction.v1` object and remains `PENDING_REVIEW`.

### `POST /patient-profiles/{patientProfileId}/documents/{documentId}/extractions/{extractionId}/confirm`

Sets extraction `CONFIRMED` and document `CONFIRMED` atomically. Only confirmed extraction can appear in caregiver chatbot context.

### `POST /patient-profiles/{patientProfileId}/documents/{documentId}/extractions/{extractionId}/reject`

Sets extraction `REJECTED` and document `REJECTED`. Rejection reason is required and audited.

### Other document endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/patient-profiles/{patientProfileId}/documents` | List profile documents without raw OCR text |
| GET | `/patient-profiles/{patientProfileId}/documents/{documentId}` | Document and confirmed/review extraction summary |
| POST | `/patient-profiles/{patientProfileId}/documents/{documentId}/download-url` | Server-authorized short-lived signed download URL |
| DELETE | `/patient-profiles/{patientProfileId}/documents/{documentId}` | Owner soft delete and private object cleanup |

## 9. Chatbot

### `POST /patient-profiles/{patientProfileId}/chat`

Persona is derived from session:

- Patient session produces `PATIENT` persona and only accepts its bound `patientProfileId`.
- Caregiver session produces `CAREGIVER` persona after membership validation.

Request:

```json
{
  "sessionId": null,
  "message": "Apa yang perlu disiapkan sebelum kontrol diabetes tipe 2 Maya?"
}
```

Response:

```json
{
  "data": {
    "sessionId": "b5fc8568-a3ac-47e5-8506-41c4035aa90c",
    "message": {
      "role": "ASSISTANT",
      "content": "Siapkan daftar obat yang sedang dicatat, hasil pemeriksaan yang sudah dikonfirmasi, kartu identitas, kartu BPJS, dan catatan check-in terakhir. Untuk keluhan berat atau mendadak, hubungi tenaga medis atau IGD.",
      "isFallback": false
    }
  }
}
```

Only latest check-in, active medication text, upcoming reminders, confirmed OCR summaries, and relevant Patient Profile fields with usable status may enter context. Facts with status `UNKNOWN` are omitted and must not be converted into negative facts. `NONE_REPORTED` may be described only as caregiver-reported information. Raw files, raw OCR text, unrelated profile data, BPJS number, full address, and hidden notes are excluded.

Rate limit: 20 requests per actor per 10 minutes. Emergency prompts return short escalation copy and may skip the provider call.

## 10. SOS

### `POST /patient-profiles/{patientProfileId}/sos`

Bound Patient or caregiver. Request accepts optional short message:

```json
{
  "message": "Saya merasa sangat lemas dan butuh bantuan."
}
```

Headers:

```text
Idempotency-Key: 7dbf065d-1312-4f91-b742-4a9893536f4e
```

The server creates one `NEW` SOS event, returns `201`, and Supabase Realtime publishes the database insert to authorized caregiver subscribers.

Response:

```json
{
  "data": {
    "id": "70219e32-7e45-4bb4-b7de-a19f65714580",
    "patientProfileId": "9040f77d-dabf-4149-8a5f-38b11046bac2",
    "patientDisplayName": "Maya Pratama",
    "status": "NEW",
    "message": "Saya merasa sangat lemas dan butuh bantuan.",
    "locationLabel": "Karawaci, Tangerang",
    "createdAt": "2026-07-15T09:30:00.000Z"
  }
}
```

### `GET /sos-events?status=NEW`

Caregiver only. Returns events for Patient Profiles inside the caregiver's Care Circle.

### `POST /sos-events/{sosEventId}/handle`

Caregiver only. Atomic update from `NEW` to `HANDLED`:

```json
{
  "data": {
    "id": "70219e32-7e45-4bb4-b7de-a19f65714580",
    "status": "HANDLED",
    "handledBy": {
      "id": "7df4772a-4286-4c70-b5e8-d6ae2ee72448",
      "displayName": "Dimas Pratama"
    },
    "handledAt": "2026-07-15T09:31:00.000Z"
  }
}
```

If another caregiver handled it first, return `409 SOS_ALREADY_HANDLED` with the current handler summary.

### Realtime browser behavior

Realtime is not a REST endpoint. Caregiver client subscribes to insert and update events for `sos_events`. On an authorized new event, UI:

1. Shows a persistent in-app alert.
2. Adds the event to the SOS list.
3. Plays a short sound only after the caregiver has clicked `Aktifkan suara notifikasi`.
4. Provides `Saya tangani`.

No delivery is promised when the dashboard tab is closed or disconnected.

## 11. Facilities and BPJS

### `GET /facilities`

Query parameters:

| Parameter | Type | Example |
|---|---|---|
| `city` | string | `Tangerang` |
| `supportsBpjs` | boolean | `true` |
| `hasEmergencyUnit` | boolean | `true` |
| `service` | string | `penyakit dalam` |
| `specialty` | string | `geriatri` |

Response includes source label and `lastReviewedAt`. It never labels a facility as the best choice.

### `GET /bpjs-guides`

Returns versioned static administrative guidance. Copy must tell users to confirm current rules with BPJS or the facility.

## 12. Caching, Idempotency, and Logging

- Auth, dashboard, documents, chat, and SOS responses use `Cache-Control: no-store`.
- Static facility data may use short server cache keyed by all filters.
- SOS creation requires `Idempotency-Key`. Repeated key for the same actor returns the first result.
- OCR extraction rejects a second in-progress request and allows explicit retry after `FAILED`.
- Logs may contain request ID, route template, status, latency, actor type, and provider error category.
- Logs must not contain access code, session token, prompt body, OCR text, document content, phone number, BPJS number, address, or provider key.

## 13. API Test Contract

Minimum automated scenarios:

- Patient code resolves exactly one Patient Profile and wrong code returns generic error.
- Patient cannot request another `patientProfileId`.
- Family Member cannot call Owner-only endpoints.
- Third Patient Profile returns conflict.
- A minimum profile can be created with only display name and relationship label.
- Optional skipped data remains `UNKNOWN`; empty arrays are not interpreted as `NONE_REPORTED`.
- Conditions, allergies, emergency contact, and BPJS status/value consistency rules reject contradictory requests.
- Full BPJS numbers are rejected and are never stored; an optional four-digit suffix is accepted only for `REGISTERED`.
- Medication create/reactivate and pause/end keep `currentMedicationsStatus` synchronized atomically; Patient Profile PATCH cannot manufacture `REPORTED`.
- Setup checklist is derived from stored state and does not block daily-care features.
- Deactivated Patient Profile cannot create check-in, chat, document upload, or SOS; active Patient sessions are revoked.
- Dashboard, check-in, medication, documents, chat, and SOS reject cross-profile access.
- Upload rejects MIME, size, page count, or path mismatch.
- OCR provider failure stores `FAILED` without leaking raw error.
- OCR confirmation is required before chatbot context can use the extraction.
- SOS handle is atomic under two simultaneous caregiver requests.
- Realtime policy prevents members of another Care Circle from subscribing.
- Error envelope never exposes stack trace or secret.

## 14. Change Log

| Tanggal | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|
| 2026-07-16 | Mengunci minimum Patient Profile create, progressive PATCH fields, explicit fact/BPJS statuses, dan derived setup checklist | Mendukung caregiver yang belum mengetahui semua data tanpa menghasilkan fakta palsu | Ozan | Bernard |
| 2026-07-16 | Mengubah API ke Patient Profile, demo diabetes tipe 2, dan endpoint deactivation | Challenge pivot ke chronic illness | Bernard | Ozan |
| 2026-07-15 | Mengunci REST `/api/v1`, auth, daily care, OCR review, chatbot, SOS Realtime, dan facility endpoints | Human verdict untuk Next.js full-stack MVP | Bernard | Ozan |
