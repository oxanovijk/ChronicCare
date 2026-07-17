# Security and Privacy

Produk: ChroniCare

Status: Locked for MVP v1

DRI: Bernard

Contributors: Al, Ozan

Reviewer: Daniel

## 1. Boundary

ChroniCare mengelola data keluarga dan kesehatan untuk demo hackathon. Dokumen ini menetapkan batas minimum yang harus ada sebelum fitur disebut selesai. Ini bukan klaim HIPAA, rekam medis elektronik, keamanan produksi, atau kepatuhan hukum.

## 2. Sensitive Data

Data sensitif mencakup:

- Identitas caregiver dan Patient.
- Kontak, alamat, lokasi tersimpan, dan kontak darurat.
- Kondisi, alergi, obat, reminder, check-in, keluhan, dan health note.
- Nomor BPJS.
- File kesehatan, OCR text, structured extraction, dan review result.
- Chat messages dan context.
- SOS event dan handler.
- Access code, session, audit event, provider credential, dan database connection.

Private by default. UI, API, log, screenshot, dan demo hanya menampilkan data minimum untuk tugas aktif.

## 2.1 Data Minimization During Setup

- Patient Profile dapat dibuat hanya dengan nama tampilan dan label hubungan.
- Tanggal lahir, lokasi umum, kondisi, alergi, obat, BPJS, fasilitas biasa, kontak darurat, dan dokumen tidak wajib untuk menyelesaikan onboarding.
- UI harus menyediakan `Belum tahu, isi nanti`; caregiver tidak boleh didorong menebak data kesehatan.
- `UNKNOWN` berbeda dari `NONE_REPORTED`. Sistem tidak boleh mengubah field yang dilewati menjadi klaim bahwa data tersebut tidak ada.
- `NONE_REPORTED` berarti caregiver melaporkan tidak ada yang diketahui saat itu, bukan verifikasi klinis.
- KTP atau identitas resmi lengkap tidak dikumpulkan untuk MVP karena tidak ada identity-verification, Dukcapil, hospital-registration, atau claim-processing flow.
- KTP bukan kategori dokumen yang didukung atau diminta oleh UI. Upload content-classification untuk mendeteksi KTP di file `OTHER` berada di luar MVP, sehingga copy upload harus meminta pengguna tidak mengunggah identitas resmi.
- Patient Profile MVP tidak menyimpan gender, nomor telepon pribadi, alamat lengkap, atau provinsi; lokasi umum memakai kota/label area dan kontak yang dapat dihubungi memakai emergency-contact fields.
- Setup checklist bersifat advisory dan tidak boleh menjadi medical risk score.

## 3. Actor and Authorization

### Owner

Owner adalah caregiver aktif dan admin Care Circle. Owner dapat melakukan daily care, upload/review OCR, memakai chatbot, menangani SOS, mengundang atau menghapus Family Member, membuat Patient access code, dan menambah Patient Profile kedua.

### Family Member

Family Member dapat membaca dan memperbarui daily care, upload/review dokumen, memakai chatbot, serta menangani SOS dalam Care Circle miliknya. Family Member tidak boleh mengubah Owner, membership sensitif, Patient access code, profile deactivation, atau status meninggal.

### Patient

Patient session terikat pada satu Patient Profile. Patient dapat melihat homepage sendiri, check-in, reminder, medication text, chat, help request, dan SOS. Patient tidak boleh membuka caregiver dashboard, dokumen admin, profile lain, membership, atau Owner action.

## 4. Profile Isolation

- Every patient-bound API path includes explicit `patientProfileId`.
- Server validates membership and Patient Profile relation before querying data.
- Active profile in React state is never authorization.
- Cache key includes actor and `patientProfileId`; personalized dashboard routes use `no-store`.
- Upload path includes Care Circle, Patient Profile, document ID, and sanitized file name.
- OCR extraction stores `patient_profile_id` directly and must match its document.
- Chat context, SOS event, audit event, check-in, medication, reminder, and document are tested for Maya/Raka isolation.

Cross-profile leakage is a P0 blocker. Do not ship a demo workaround that hides the issue only in UI.

## 5. Authentication and Session

Caregiver:

- Supabase Auth email/password.
- Owner may self-register; public User, Care Circle, and Owner membership are created server-side in one idempotent transaction after Auth verification.
- Family Member registration requires an unexpired, unrevoked, unused Owner invitation. Role and Care Circle are derived by the server, never supplied by the browser.
- Invitation tokens use cryptographically secure randomness, are stored only as SHA-256 hashes, expire after 24 hours by default, and are single-use.
- Invalid, expired, revoked, and used invitation responses are generic and do not reveal Care Circle membership.
- A removed caregiver cannot use Owner onboarding to regain access or create a new Care Circle.
- SSR cookie managed through `@supabase/ssr`.
- Server resolves application membership on every protected request.

Patient:

- Access code stored as Argon2id or bcrypt hash.
- Error message does not reveal whether a code/profile exists.
- Five failed attempts in 15 minutes trigger a 15-minute lock.
- Successful login creates opaque eight-hour session.
- Cookie is `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production.
- Database stores only session token hash.

Changing a Patient access code revokes the old code and active Patient sessions.

## 6. API Security

- Zod validates all input and provider output.
- Non-GET same-origin mutations validate `Origin`.
- Owner-only services repeat role checks; hiding a button is insufficient.
- API returns generic public error codes and request IDs, not stack traces.
- SOS creation uses idempotency key.
- SOS handling uses conditional atomic update.
- OCR rejects unsupported MIME, files above 5 MB, documents above three pages, and mismatched storage paths.
- Rate limits apply to Patient login, chatbot, OCR retry, and SOS creation.

## 7. Database and RLS

- Prisma handles server-side application queries after authorization.
- Supabase RLS protects browser-facing Realtime and Storage operations.
- Service-role key stays in server-only modules and bypasses RLS only after app authorization.
- `users.id` maps to `auth.users.id`.
- Partial unique constraints protect one active Owner and one active Patient code.
- Database trigger protects the two-Patient limit.
- Database checks protect profile fact status/value consistency; service transactions protect Medication cross-table consistency.
- Foreign keys use restrictive delete behavior for sensitive records.

Browser code must not mutate application tables directly.

Supabase Auth stores caregiver email and password identity. Application tables store only the minimum display identity and authorization membership; passwords, raw Auth tokens, and raw invitation tokens are never copied into Prisma-managed tables or audit metadata.

## 8. Health Document Storage

Bucket `health-documents` is private.

Allowed files:

- PDF.
- JPEG.
- PNG.
- Maximum 5 MB.
- Maximum three pages.

Rules:

- Client obtains a signed upload intent from an authorized API.
- Server confirms object path, MIME, size, and document ownership.
- Download uses short-lived signed URL after access check.
- Public URL is forbidden.
- File name is sanitized and never trusted for authorization.
- `sha256` supports duplicate and integrity checks.
- Soft delete hides metadata; object cleanup must be explicit and audited.

## 9. OCR and Extraction Privacy

Processing path:

```text
Private Supabase Storage
  -> Azure AI Document Intelligence
  -> minimum OCR text
  -> Azure OpenAI structured extraction
  -> PostgreSQL pending review
  -> caregiver confirmation
```

Rules:

- Use synthetic documents for demo.
- Do not log file bytes, raw OCR text, structured health data, or Azure request body.
- Do not send original file to Azure OpenAI.
- Store provider and model identifiers for audit without storing provider keys.
- Extraction starts as `PENDING_REVIEW`.
- Only `CONFIRMED` extraction may enter chatbot context.
- No automatic medication, diagnosis, reminder, check-in, or health-note update.
- Display `DEMO_FALLBACK` when fixture mode is used.
- Mask BPJS number except the last four characters in extraction output.

## 10. AI and Chat Privacy

Allowed context is the minimum needed from the authorized Patient Profile:

- Patient display name.
- Broad location.
- Latest check-in.
- Active medication text.
- Upcoming reminders.
- Confirmed OCR summary.
- Relevant health note and facility result.

Excluded by default:

- Raw document and raw OCR text.
- Pending/rejected/failed extraction.
- Full address, full BPJS number, and phone numbers.
- Patient access code and session.
- Full chat history.
- Other Patient Profile.
- Hidden system prompt.
- Patient Profile facts with status `UNKNOWN`.

System prompts are not stored in `chat_messages`. Logs use request ID and provider status only.

`NONE_REPORTED` may enter context only with wording that preserves its source, such as `caregiver melaporkan belum ada alergi yang diketahui`. It must not become an absolute statement.

## 11. SOS Privacy and Delivery

SOS contains minimum coordination data:

- Patient display name.
- Patient Profile ID.
- Created time.
- Optional short message.
- Broad stored location.
- Contact needed for family response.
- Status and handler.

SOS does not include full medical history, document, OCR, chat history, or live location.

Delivery is browser-based:

- Supabase Realtime sends insert/update to an open authorized caregiver dashboard.
- UI always shows a visual alert.
- Audio plays only after caregiver enables notification sound.
- No WhatsApp, SMS, OS notification, Push API, or background service worker.
- Closed or disconnected tabs are not promised to receive alerts.
- Dashboard fetches active SOS through REST after reconnect or focus.

Do not describe ChroniCare SOS as ambulance dispatch or official emergency service.

## 12. Secrets

Never commit or expose:

- `.env`, `.env.local`, or `.env.production`.
- Supabase service-role key.
- PostgreSQL pooled/direct connection strings.
- Patient session secret.
- Azure OpenAI key.
- Azure Document Intelligence key.
- Signed upload token, signed download URL, access code, or session token.

The profile API does not accept or store a full BPJS number for MVP. It may store an optional four-digit suffix for recognition when membership status is `REGISTERED`. Health documents and OCR text may still contain sensitive BPJS content and remain private/masked under the document rules.

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is a client publishable value, not a server secret. RLS remains mandatory.

## 13. Logging and Observability

Allowed log fields:

- Request ID.
- Route template.
- HTTP status.
- Latency.
- Actor type.
- Synthetic resource ID.
- Provider error category.
- Packet/build version.

Forbidden log fields:

- Prompt content.
- AI response containing private data.
- OCR text or structured extraction.
- File name when it contains personal detail.
- Phone, address, BPJS number, access code, or session.
- Authorization header, cookies, keys, database URL, or signed URL.

Production debug level remains off. Provider SDK debug logging is forbidden during demo.

## 14. Synthetic Demo Data

Use Dimas Pratama, Rina Pratama, Maya Pratama, and Raka Pratama only as fictional demo identities. Maya is the synthetic diabetes tipe 2 demo Patient. Phone, address, BPJS number, medication, document, and medical state must be invented and clearly separated from real patient/family data.

Screenshots, video, terminal, browser Network panel, Supabase dashboard, and Azure portal must be checked before presentation.

## 15. Audit Events

Record actor, role, Care Circle, Patient Profile when relevant, action, target, timestamp, and request ID for:

- Patient login failure aggregate and success.
- Patient code generation/revocation.
- Membership change.
- Check-in creation.
- Medication and reminder change.
- Document upload and delete.
- OCR start, failure, confirmation, and rejection.
- Chat fallback category without prompt text.
- SOS creation and handling.
- Changes between `UNKNOWN`, `NONE_REPORTED`, and `REPORTED` for safety-relevant Patient Profile fact groups, without copying the sensitive values into the audit summary.

Audit summary must not duplicate sensitive content.

## 16. Redaction Checklist

Before sharing any artifact:

- Data is synthetic.
- Active Patient Profile is visible and correct.
- No Maya/Raka cross-profile data appears.
- No credential, cookie, token, signed URL, or connection string appears.
- No real document, phone, address, BPJS number, or family chat appears.
- OCR screen shows review status and fallback label when applicable.
- SOS screen avoids full health history and live location.
- Console and Network panels are closed unless intentionally sanitized.
- Provider dashboards are not visible during the demo.

## 17. MVP Limitations

Not covered by this hackathon posture:

- Formal threat model and penetration test.
- Production incident response.
- Retention, consent, legal hold, and right-to-erasure workflow.
- Enterprise key management and secret rotation automation.
- Clinical validation, medical device classification, and compliance certification.
- Background SOS delivery guarantee.

## 18. Required Security Tests

- Owner, Family Member, and Patient allow/deny matrix.
- Wrong Care Circle and wrong Patient Profile access.
- Patient code rate limit and session revocation.
- Private bucket denial without authorization.
- Signed URL expiry path.
- OCR pending extraction excluded from chat.
- Service-role key absent from browser bundle.
- Realtime subscriber from another Care Circle denied.
- Visual SOS alert appears if audio is blocked.
- Logs and error responses contain no secret or private body.
- Minimum profile creation works without optional sensitive data.
- Skipped values remain `UNKNOWN`; no API or UI path converts them to `NONE_REPORTED`.
- Contradictory fact statuses and values are rejected.
- Full BPJS number is rejected by the profile API and absent from database profile fields, response bodies, logs, and browser storage.

## 19. Change Log

| Tanggal | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|
| 2026-07-16 | Menambahkan progressive setup data minimization, explicit unknown semantics, dan last-four-only BPJS handling | Mengurangi forced disclosure dan mencegah caregiver mengarang data yang tidak diketahui | Ozan | Bernard, Daniel |
| 2026-07-15 | Mengunci Supabase security boundary, OCR privacy, Patient session, dan browser-only SOS | Human stack and scope verdict | Bernard | Daniel |
