# Data Model

Produk: ChroniCare

Status: Locked for MVP v1, refined for chronic illness Patient positioning

DRI: Bernard

Contributors: Al, Daniel

Reviewer: Ozan

## 1. Database Contract

ChroniCare memakai PostgreSQL dari Supabase. Prisma ORM 7 menjadi schema dan migration source of truth setelah scaffold tersedia. Nama model TypeScript memakai `PascalCase`; nama tabel dan kolom PostgreSQL memakai `snake_case` melalui mapping Prisma.

Aturan global:

- Primary key memakai UUID.
- Waktu memakai `timestamptz` dalam UTC.
- Semua data patient-bound wajib memiliki `patient_profile_id` langsung. Relasi tidak boleh hanya mengandalkan `care_circle_id`.
- Satu Care Circle memiliki tepat satu Owner aktif dan maksimal dua Patient Profile yang belum dihapus.
- Caregiver memakai Supabase Auth. Patient memakai access code dan session khusus aplikasi.
- Demo utama memakai Patient Profile dengan kondisi diabetes tipe 2.
- File kesehatan berada di private Supabase Storage bucket `health-documents`.
- OCR yang belum dikonfirmasi tidak boleh masuk konteks chatbot atau memperbarui medication, reminder, check-in, dan health note.
- Hard delete hanya boleh dipakai untuk session kedaluwarsa dan data demo yang belum pernah dipakai. Data caregiving memakai status atau `deleted_at`.
- Semua seed dan fixture memakai data sintetis.

## 2. Enum

| Enum | Nilai |
|---|---|
| `member_role` | `OWNER`, `FAMILY_MEMBER` |
| `member_status` | `INVITED`, `ACTIVE`, `REMOVED` |
| `patient_status` | `ACTIVE`, `INACTIVE`, `END_OF_CARE`, `DECEASED` |
| `patient_deactivation_reason` | `NO_LONGER_CARED`, `PATIENT_DECEASED`, `OTHER` |
| `profile_fact_status` | `UNKNOWN`, `NONE_REPORTED`, `REPORTED` |
| `bpjs_membership_status` | `UNKNOWN`, `NOT_REGISTERED`, `REGISTERED` |
| `access_code_status` | `ACTIVE`, `REVOKED`, `EXPIRED` |
| `check_in_mood` | `GOOD`, `OKAY`, `UNWELL` |
| `medication_status` | `ACTIVE`, `PAUSED`, `ENDED` |
| `medication_log_status` | `TAKEN`, `MISSED`, `SKIPPED` |
| `reminder_type` | `MEDICATION`, `CHECK_IN`, `DOCTOR_VISIT`, `BPJS`, `OTHER` |
| `reminder_status` | `UPCOMING`, `DONE`, `MISSED`, `SKIPPED` |
| `document_category` | `BPJS_CARD`, `REFERRAL_LETTER`, `PRESCRIPTION`, `LAB_RESULT`, `MEDICAL_RESUME`, `CONTROL_CARD`, `OTHER` |
| `document_status` | `UPLOADING`, `UPLOADED`, `PROCESSING`, `REVIEW_REQUIRED`, `CONFIRMED`, `REJECTED`, `FAILED` |
| `extraction_status` | `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, `FAILED` |
| `sos_status` | `NEW`, `HANDLED`, `CANCELLED` |
| `chat_persona` | `PATIENT`, `CAREGIVER` |
| `chat_role` | `USER`, `ASSISTANT` |
| `actor_type` | `CAREGIVER`, `PATIENT`, `SYSTEM` |

Enum database tidak boleh diganti menjadi free text tanpa change control.

## 3. Identity and Care Circle

### 3.1 `users`

Profil aplikasi untuk caregiver. `id` sama dengan `auth.users.id`.

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK, FK ke `auth.users.id`, `ON DELETE RESTRICT` |
| `display_name` | `varchar(120)` | required |
| `phone_number` | `varchar(32)` | nullable |
| `avatar_path` | `text` | nullable, bukan public URL |
| `created_at` | `timestamptz` | required, default `now()` |
| `updated_at` | `timestamptz` | required |

Index: primary key saja untuk MVP.

### 3.2 `care_circles`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `varchar(120)` | required |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

MVP hanya mendukung satu Care Circle per caregiver. API menolak pembuatan circle kedua.

### 3.3 `care_circle_members`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `care_circle_id` | `uuid` | FK `care_circles.id`, required |
| `user_id` | `uuid` | FK `users.id`, required |
| `role` | `member_role` | required |
| `status` | `member_status` | required |
| `invited_by_user_id` | `uuid` | FK `users.id`, nullable |
| `joined_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Constraints and indexes:

- Unique `(care_circle_id, user_id)`.
- Partial unique index on `care_circle_id` where `role = 'OWNER'` and `status = 'ACTIVE'`.
- Index `(user_id, status)` for session authorization.

### 3.4 `care_circle_invitations`

P1 support. Boleh tidak memiliki UI penuh dalam demo.

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `care_circle_id` | `uuid` | FK, required |
| `code_hash` | `varchar(255)` | unique, required |
| `expires_at` | `timestamptz` | required |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `accepted_by_user_id` | `uuid` | FK `users.id`, nullable |
| `accepted_at` | `timestamptz` | nullable |
| `revoked_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | default `now()` |

## 4. Patient Identity

### 4.1 `patient_profiles`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `care_circle_id` | `uuid` | FK `care_circles.id`, required |
| `display_name` | `varchar(120)` | required |
| `relationship_label` | `varchar(32)` | required, display label seperti `Maya`, `Raka`, atau relasi caregiver bila relevan |
| `date_of_birth` | `date` | nullable |
| `city` | `varchar(80)` | nullable |
| `location_label` | `varchar(160)` | nullable |
| `primary_conditions` | `text[]` | default empty array |
| `primary_conditions_status` | `profile_fact_status` | default `UNKNOWN` |
| `allergies` | `text[]` | default empty array |
| `allergies_status` | `profile_fact_status` | default `UNKNOWN` |
| `current_medications_status` | `profile_fact_status` | default `UNKNOWN` |
| `bpjs_number_last4` | `varchar(4)` | nullable, exactly four digits; full BPJS number is not stored |
| `bpjs_membership_status` | `bpjs_membership_status` | default `UNKNOWN` |
| `usual_facility_name` | `varchar(160)` | nullable |
| `emergency_contact_name` | `varchar(120)` | nullable |
| `emergency_contact_phone` | `varchar(32)` | nullable |
| `emergency_contact_status` | `profile_fact_status` | default `UNKNOWN` |
| `status` | `patient_status` | default `ACTIVE` |
| `deactivation_reason` | `patient_deactivation_reason` | nullable |
| `deactivation_note` | `varchar(500)` | nullable, no raw medical detail |
| `deactivated_by_user_id` | `uuid` | FK `users.id`, nullable |
| `deactivated_at` | `timestamptz` | nullable |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `updated_by_user_id` | `uuid` | FK `users.id`, nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |
| `deleted_at` | `timestamptz` | nullable |

Constraints and indexes:

- Unique `(care_circle_id, relationship_label)` for non-deleted rows.
- Index `(care_circle_id, status)`.
- Database trigger rejects a third row with `deleted_at IS NULL` for the same Care Circle.
- `age` is never stored. UI derives age from `date_of_birth`.
- Latitude and longitude are not modeled because live or precise location is out of scope.
- Patient gender, personal phone number, full address, and province are not modeled because no locked MVP workflow consumes them.
- A profile can be created with only `display_name`, `relationship_label`, ownership fields, and default statuses.
- `DECEASED` is an internal status only. UI must use careful wording such as `Akhiri perawatan profil` or `Profil tidak aktif`.
- Deactivated Patient Profiles are excluded from default dashboard, reminder, chat, document upload, and SOS creation flows.

Progressive setup semantics:

- `UNKNOWN` means the caregiver does not know or has not reviewed the fact.
- `NONE_REPORTED` means the caregiver explicitly reports that none is currently known; it is not clinical proof.
- `REPORTED` means one or more related values are stored.
- Nullable demographic fields such as `date_of_birth`, `city`, and `usual_facility_name` use `null` for unknown/not recorded. They do not need a `NONE_REPORTED` state.
- Profile completeness is derived by the API. It is not stored as a percentage or status column.

Same-row checks:

- `primary_conditions_status = REPORTED` requires `cardinality(primary_conditions) > 0`; other statuses require an empty array.
- `allergies_status = REPORTED` requires `cardinality(allergies) > 0`; other statuses require an empty array.
- `emergency_contact_status = REPORTED` requires at least one of `emergency_contact_name` or `emergency_contact_phone`; other statuses require both fields to be null.
- `bpjs_membership_status = NOT_REGISTERED` or `UNKNOWN` requires `bpjs_number_last4` to be null.
- `bpjs_membership_status = REGISTERED` allows `bpjs_number_last4` to remain null when membership is known but the card is unavailable.
- When present, `bpjs_number_last4` must match `^[0-9]{4}$`.
- `NOT_REGISTERED` is caregiver-reported administrative information, not verification from BPJS.

Medication status is a cross-table rule:

- Patient Profile PATCH cannot set `current_medications_status = REPORTED` directly.
- Creating or reactivating an active Medication sets `patient_profiles.current_medications_status = REPORTED` in the same transaction.
- `current_medications_status = REPORTED` requires at least one active Medication.
- `current_medications_status = NONE_REPORTED` or `UNKNOWN` is rejected while an active Medication exists.
- Pausing or ending the last active Medication sets `current_medications_status = UNKNOWN`; the system never silently chooses `NONE_REPORTED`.

### 4.2 `patient_access_codes`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `code_hash` | `varchar(255)` | unique, required |
| `status` | `access_code_status` | default `ACTIVE` |
| `failed_attempt_count` | `smallint` | default `0` |
| `locked_until` | `timestamptz` | nullable |
| `last_used_at` | `timestamptz` | nullable |
| `expires_at` | `timestamptz` | nullable |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Store Argon2id or bcrypt hash, never raw codes. Only one active code is allowed per Patient Profile through a partial unique index. New raw codes are checked against all active hashes under a serialized issuance transaction so a code resolves to exactly one active profile.

When a Patient Profile is deactivated, all active access codes for that profile are revoked in the same transaction.

### 4.3 `patient_sessions`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `token_hash` | `varchar(255)` | unique, required |
| `expires_at` | `timestamptz` | required |
| `last_seen_at` | `timestamptz` | required |
| `revoked_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | default `now()` |

Session cookie carries an opaque token. Database stores its hash. Patient session never grants caregiver access.

When a Patient Profile is deactivated, all active Patient sessions for that profile are revoked in the same transaction.

## 5. Daily Care

### 5.1 `check_ins`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `submitted_by_user_id` | `uuid` | FK `users.id`, nullable |
| `submitted_by_patient` | `boolean` | default `false` |
| `mood` | `check_in_mood` | required |
| `condition_text` | `text` | nullable, max 1000 chars at API |
| `pain_level` | `smallint` | nullable, check `0..10` |
| `medication_taken` | `boolean` | nullable |
| `complaint_text` | `text` | nullable, max 1000 chars |
| `needs_family_help` | `boolean` | default `false` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Exactly one submitter mode is required: caregiver user or Patient. Index `(patient_profile_id, created_at desc)`.

### 5.2 `medications`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `name` | `varchar(160)` | required |
| `dose_text` | `varchar(160)` | required, displayed as recorded |
| `schedule_text` | `varchar(240)` | required |
| `instructions` | `text` | nullable |
| `start_date` | `date` | nullable |
| `end_date` | `date` | nullable |
| `status` | `medication_status` | default `ACTIVE` |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `updated_by_user_id` | `uuid` | FK `users.id`, required |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Index `(patient_profile_id, status)`. AI may quote recorded text but may not interpret or change it.

Medication creation and status changes update `patient_profiles.current_medications_status` according to the progressive setup rules in section 4.1. Profile PATCH cannot manufacture `REPORTED`, and OCR confirmation never creates or updates a Medication automatically.

### 5.3 `medication_logs`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `medication_id` | `uuid` | FK `medications.id`, required |
| `status` | `medication_log_status` | required |
| `scheduled_for` | `timestamptz` | nullable |
| `recorded_by_user_id` | `uuid` | nullable |
| `recorded_by_patient` | `boolean` | default `false` |
| `recorded_at` | `timestamptz` | default `now()` |

The API verifies that `medication_id.patient_profile_id` equals the explicit `patient_profile_id`.

### 5.4 `reminders`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `type` | `reminder_type` | required |
| `title` | `varchar(160)` | required |
| `description` | `text` | nullable |
| `scheduled_at` | `timestamptz` | nullable |
| `schedule_text` | `varchar(240)` | nullable |
| `status` | `reminder_status` | default `UPCOMING` |
| `related_medication_id` | `uuid` | FK `medications.id`, nullable |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Index `(patient_profile_id, status, scheduled_at)`.

### 5.5 `health_notes`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `title` | `varchar(160)` | required |
| `note_text` | `text` | required, max 4000 chars at API |
| `category` | `varchar(48)` | required |
| `created_by_user_id` | `uuid` | FK `users.id`, required |
| `updated_by_user_id` | `uuid` | FK `users.id`, required |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

## 6. Health Documents and OCR

### 6.1 `health_documents`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `category` | `document_category` | required |
| `title` | `varchar(180)` | required |
| `bucket_name` | `varchar(80)` | fixed `health-documents` |
| `storage_path` | `text` | unique, required |
| `original_file_name` | `varchar(255)` | required |
| `mime_type` | `varchar(80)` | PDF, JPEG, or PNG only |
| `file_size_bytes` | `integer` | required, check `1..5242880` |
| `page_count` | `smallint` | nullable, max `3` |
| `sha256` | `char(64)` | required |
| `status` | `document_status` | required |
| `uploaded_by_user_id` | `uuid` | FK `users.id`, required |
| `confirmed_extraction_id` | `uuid` | nullable, FK added after extraction table |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |
| `deleted_at` | `timestamptz` | nullable |

Storage path format:

```text
{careCircleId}/{patientProfileId}/{documentId}/{sanitizedFileName}
```

The original object is private. Download uses a short-lived signed URL after API authorization.

### 6.2 `document_extractions`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `health_document_id` | `uuid` | FK, required |
| `ocr_provider` | `varchar(80)` | fixed `AZURE_DOCUMENT_INTELLIGENCE` or `DEMO_FALLBACK` |
| `ocr_model` | `varchar(80)` | required |
| `extractor_provider` | `varchar(80)` | fixed `AZURE_OPENAI` or `DEMO_FALLBACK` |
| `extractor_model` | `varchar(120)` | required |
| `schema_version` | `varchar(24)` | fixed `document-extraction.v1` |
| `raw_text` | `text` | required, sensitive |
| `structured_data` | `jsonb` | required, validated by Zod before insert |
| `confidence` | `numeric(5,4)` | nullable, check `0..1` |
| `status` | `extraction_status` | required |
| `failure_code` | `varchar(80)` | nullable |
| `reviewed_by_user_id` | `uuid` | nullable, FK `users.id` |
| `reviewed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Constraints and indexes:

- Unique `(health_document_id, schema_version, created_at)` is not required; retries create new immutable extraction rows.
- Index `(health_document_id, created_at desc)`.
- Index `(patient_profile_id, status)`.
- `health_document_id` and `patient_profile_id` must refer to the same Patient Profile, enforced by transaction and test.
- Confirmation updates extraction status and `health_documents.confirmed_extraction_id` atomically.

`structured_data` follows the locked wire schema in `docs/technical/api.md`. It stores text as written in the source. It must not infer diagnosis, normality, urgency, or dose changes.

## 7. SOS and Realtime

### 7.1 `sos_events`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `created_by_patient` | `boolean` | default `true` |
| `created_by_user_id` | `uuid` | nullable |
| `status` | `sos_status` | default `NEW` |
| `message` | `varchar(500)` | nullable |
| `location_label` | `varchar(160)` | nullable, stored broad location only |
| `contact_phone` | `varchar(32)` | nullable |
| `handled_by_user_id` | `uuid` | nullable, FK `users.id` |
| `handled_at` | `timestamptz` | nullable |
| `cancelled_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

Indexes:

- `(patient_profile_id, status, created_at desc)`.
- `(status, created_at desc)` for caregiver alerts.

Supabase Realtime publishes insert and update events for this table. The browser filters by Care Circle membership. No WhatsApp, SMS, Push API, or service worker is part of MVP.

## 8. Facility and Chat

### 8.1 `facilities`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `varchar(180)` | required |
| `facility_type` | `varchar(48)` | required |
| `address_text` | `text` | required |
| `area` | `varchar(100)` | required |
| `city` | `varchar(100)` | required |
| `phone_number` | `varchar(32)` | nullable |
| `supports_bpjs` | `boolean` | nullable |
| `has_emergency_unit` | `boolean` | nullable |
| `services` | `text[]` | default empty array |
| `specialties` | `text[]` | default empty array |
| `source_label` | `varchar(180)` | required |
| `source_url` | `text` | nullable |
| `last_reviewed_at` | `timestamptz` | required |

Index `(city, supports_bpjs, has_emergency_unit)` and GIN indexes on `services` and `specialties` if needed.

### 8.2 `chat_sessions`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `patient_profile_id` | `uuid` | FK, required |
| `care_circle_id` | `uuid` | FK, required |
| `persona` | `chat_persona` | required |
| `started_by_user_id` | `uuid` | nullable |
| `started_by_patient` | `boolean` | default `false` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | required |

### 8.3 `chat_messages`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `chat_session_id` | `uuid` | FK, required |
| `patient_profile_id` | `uuid` | FK, required |
| `role` | `chat_role` | required |
| `content` | `text` | required, max 4000 chars |
| `is_fallback` | `boolean` | default `false` |
| `created_at` | `timestamptz` | default `now()` |

System prompts and hidden context are never persisted. Chat retention for demo is session-scoped and may be cleared during seed reset.

## 9. Audit

### 9.1 `audit_events`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `uuid` | PK |
| `care_circle_id` | `uuid` | FK, required |
| `patient_profile_id` | `uuid` | FK, nullable for circle-level actions |
| `actor_type` | `actor_type` | required |
| `actor_user_id` | `uuid` | nullable |
| `actor_patient_profile_id` | `uuid` | nullable |
| `actor_role` | `varchar(32)` | nullable |
| `action` | `varchar(80)` | required |
| `target_type` | `varchar(80)` | required |
| `target_id` | `uuid` | nullable |
| `summary` | `varchar(500)` | required, no raw secret or document text |
| `request_id` | `varchar(80)` | nullable |
| `created_at` | `timestamptz` | default `now()` |

Index `(care_circle_id, created_at desc)` and `(patient_profile_id, created_at desc)`.

Required audit actions include patient login success/failure aggregate, code regeneration, check-in creation, medication change, document upload, OCR confirmation/rejection, SOS creation/handling, and Owner-only changes.
Patient Profile deactivation and reactivation, if later allowed, must be audited without duplicating sensitive medical details.

## 10. Authorization and RLS

| Actor | Read | Write |
|---|---|---|
| Owner | All data in own Care Circle | Daily care, documents, SOS handling, members, access codes, second Patient Profile |
| Family Member | All caregiving data in own Care Circle | Daily care, documents, SOS handling; no Owner-only action |
| Patient | Own homepage, reminders, medication text, own check-in, own chat, own SOS | Own check-in, medication log, chat, SOS |

Locked enforcement:

- Next.js Route Handlers perform authorization before every Prisma query.
- Browser code never mutates application tables directly.
- Supabase RLS protects browser-side Realtime subscription and private Storage access.
- Service role key is server-only and used after application authorization.
- Patient sessions do not receive Supabase service credentials or caregiver JWTs.
- Every API function that loads patient-bound data accepts an explicit `patientProfileId` and validates membership.

## 11. Transaction Rules

- Creating a Care Circle, Owner membership, and first Patient Profile uses one transaction.
- Creating a minimum Patient Profile initializes fact and BPJS statuses to `UNKNOWN`; optional detail updates occur separately and do not create another profile.
- Creating or regenerating a Patient access code revokes the previous active code and active Patient sessions in one transaction.
- Deactivating a Patient Profile sets status, stores reason metadata, revokes active Patient access codes and sessions, and writes audit in one transaction.
- Confirming OCR updates extraction and document status atomically.
- Handling SOS uses conditional update `status = NEW`; a second handler receives conflict instead of overwriting the first.
- Medication log creation verifies the Medication and log share the same Patient Profile.
- Creating/reactivating an active Medication sets `current_medications_status = REPORTED` atomically; pausing/ending the last active Medication sets it to `UNKNOWN`; profile updates cannot set `REPORTED` directly.
- Profile creation locks the Care Circle row before checking the two-profile limit.

## 12. Demo Seed

Minimum seed:

- Care Circle `Keluarga Pratama`.
- Owner `Dimas Pratama`.
- Family Member `Rina Pratama`.
- Patient Profile `Maya Pratama` with type 2 diabetes as the main demo condition.
- Patient Profile `Raka Pratama` with different chronic-care data for isolation checks.
- Maya uses a `REPORTED` primary-condition status and keeps `current_medications_status = UNKNOWN` until Packet 08 creates an active Medication row; at least one optional fact on Raka remains `UNKNOWN` to test sparse-profile behavior.
- One active access code per Patient Profile, stored only as a hash after seeding.
- Distinct check-in, medication, reminder, health note, and document states per Patient Profile.
- One synthetic confirmed OCR result and one document ready for live OCR.
- Tangerang facility rows with source and review dates.
- No active SOS at initial seed unless the demo script requires a reset fixture.

## 13. Explicitly Not Modeled

- Medical diagnosis and clinical decision support.
- Drug recommendation or dose calculation.
- Personalized diabetes target, insulin adjustment, lab interpretation, and diet/pantangan prescription.
- Live location, wearable, ambulance dispatch, family chat, payment, subscription, hospital booking, and real-time faskes scraping.
- More than one Care Circle per caregiver or more than two Patient Profiles.
- Patient gender, personal phone number, full address, province, KTP, and other identity-verification fields.
- Real subscription or payment lifecycle. Any "cancel subscription" copy is only a dummy entry point for the end-of-care flow.
- Background push notification delivery.
- Production retention, consent, compliance, and legal hold workflows.

## 14. Change Log

| Tanggal | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|
| 2026-07-16 | Menambahkan progressive profile fact statuses, BPJS membership status, minimum profile creation, dan derived setup checklist contract | Mencegah data yang belum diketahui dianggap sebagai `tidak ada` atau dipaksa untuk ditebak | Ozan | Bernard |
| 2026-07-16 | Mengubah schema kontrak ke Patient Profile, demo diabetes tipe 2, dan deactivation non-destruktif | Challenge pivot ke chronic illness | Bernard | Ozan |
| 2026-07-15 | Mengunci PostgreSQL, Prisma 7, Supabase Auth/Storage/Realtime, Patient session, OCR tables, dan SOS web | Human verdict untuk memulai scaffold | Bernard | Ozan |
