# ChroniCare UX Copy Matrix

Status: Proposed  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Daniel  
Product/QA reviewer: Ozan  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-17  
Input State Matrix: `docs/design/03-state-matrix.md`  
Input State Matrix SHA-256: `CE07C619D6373E6A325DA4E92BF0BABE6641B237EEF2B3938B1A5E2A8531BDA5`

## Authority

This artifact defines user-facing Indonesian copy for existing ChroniCare
surfaces and states. It does not change product scope, roles, authorization,
state truth, routing, visual layout, provider behavior, or implementation.

Locked product, safety, role, privacy, data, API, provider, execution, demo,
and QA contracts override this matrix. Copy IDs are content references, not
routes, component IDs, or implementation evidence.

`NEWDESIGN.md` controls visual hierarchy and presentation. This matrix remains
authoritative for copy meaning, disclosure boundaries, recovery language, and
runtime token rules.

## Sources

- `AGENTS.md` and `README.md` for project guardrails and repository status.
- `PRODUCT.md` for product promise, roles, boundaries, and demo truth.
- `NEWDESIGN.md` for Care in Motion Patient, Caregiver, OCR, SOS, accessibility, and status tone.
- `docs/design/00-screen-inventory.md` for surface IDs and priorities.
- `docs/design/01-user-flow-map.md` for flows, transitions, and recovery exits.
- `docs/design/02-screen-specifications.md` for surface purpose and action rules.
- `docs/design/03-state-matrix.md` for state truth, triggers, recovery, and trust.
- `docs/product/product-context.md`, `docs/product/feature-scope.md`,
  `docs/product/user-journeys.md`, and
  `docs/product/hackathon-mvp-scope-demo.md` for product and demo coverage.
- `docs/technical/architecture.md`, `docs/technical/data-model.md`,
  `docs/technical/api.md`, and `docs/technical/ai-guardrails.md` for session,
  authorization, OCR, AI, SOS, provider, and data behavior.
- `docs/security-privacy.md` for disclosure, logging, and private-data rules.
- `docs/execution/workflow.md`, `docs/execution/packets.md`, and Packet 01
  through Packet 13 for execution and acceptance boundaries.
- `docs/pitch/demo-script.md`, `docs/qa/demo-readiness-checklist.md`, and
  `docs/team/ownership.md` for demo, verification, and review ownership.

## Scope

In scope:

- Final Indonesian UI messages and action labels for P0, lifecycle, system,
  and documented P1 state boundaries.
- Recovery, limitation, provenance, refusal, emergency, and sensitive-action
  language.
- Disclosure-safe variants for Patient and Caregiver sessions.
- Traceability to screen, flow, transition, state, and packet evidence.

Out of scope:

- Responsive layout, truncation mechanics, wireframes, and prototypes.
- New screens, states, flows, routes, components, or capabilities.
- URL and implementation routing.
- Source code, provider adapters, database logic, and implementation evidence.

## Voice Principles

1. Use everyday Indonesian. Keep sentences short and name the next action.
2. Patient copy uses one instruction at a time. It avoids childish praise and
   unexplained technical terms.
3. Caregiver copy may carry more context, but the Patient identity, status,
   time, source, and next action stay easy to scan.
4. OCR copy calls machine output a draft until a person confirms it.
5. SOS copy is direct and serious. It never turns urgency into playful language.
6. Error copy says what the app knows, what it does not know, and what the user
   can do next.
7. Provider and demo fallback copy stays visible while fallback output is used.
8. Copy never promises diagnosis, treatment, external delivery, BPJS acceptance,
   live facility availability, compliance, or production readiness.

## Terminology

Required terms:

- Patient
- Caregiver
- Owner
- Family Member
- Patient Profile
- Patient access code
- Patient session
- Care Circle
- `patientProfileId` when a technical contract must be cited
- `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, and `DEMO_FALLBACK` for exact status

Do not use `Parent Profile`, `parentProfileId`, `parent_profiles`,
`parent_access_codes`, `parent_sessions`, or `/parent-profiles` as current truth.

### Runtime Copy Tokens

The following tokens are deliberate runtime variables, not unresolved
placeholders:

| Token | Value rule | Disclosure rule |
|---|---|---|
| `{patientName}` | Name from the currently authorized Patient Profile | Render only after session, membership, Care Circle, and Patient relation checks |
| `{eventTime}` | Stored SOS event time in the user's local display format | Never infer delivery time from this value |
| `{handlerName}` | Current server-confirmed SOS handler display name | Render only to an authorized caregiver in the matching Care Circle |

If a token cannot be resolved safely, omit the dependent sentence or use its
generic variant. Never show the token text to users.

## Copy Patterns

| State | Copy rule | Action rule | Avoid |
|---|---|---|---|
| Default | Name the task, not the system | Use a verb that matches the established action | Generic welcome text that competes with the task |
| Loading | Name the content being loaded | No action unless cancel or return is safe | “Mohon tunggu” without context |
| Empty | State what is absent and what can be done | Offer create, clear, or return when allowed | Treating empty as an error |
| Partial | Name the unavailable section | Offer retry for that section | Claiming all data is current |
| Validation | State the rule beside the affected field | Correct and resubmit | Blaming the user |
| Submitting, saving, or claiming | Use a progressive action label | Disable duplicate submission | Claiming success before the server responds |
| Success | Name the accepted server result | Continue or return | “Berhasil” without the resulting truth |
| Error | Give a safe failure category | Retry, refresh, return, or sign in | Stack, SQL, provider, or secret details |
| Retry | State what will be checked again | Use `Coba lagi` or a task-specific retry | Guaranteed success |
| Disabled | Explain the unmet prerequisite | Point to the prerequisite when allowed | Presenting it as a permission denial |
| Forbidden | Give a generic access denial | Return or use the correct account | Revealing resource identity or existence |
| Session expired | Name the actor-specific re-entry | Patient uses access code; Caregiver signs in | Mixing Patient and caregiver sessions |
| Not found | Say the item cannot be opened | Return to an authorized context | Saying whether another profile owns it |
| Offline | State that the action needs a connection | Retry after connection returns | Claiming a write was accepted |
| Reconnecting | State that current data is being checked | Refresh when available | Claiming uninterrupted Realtime delivery |
| Stale | Show the last review or refresh boundary | Refresh | Calling data current |
| Provider unavailable | State that automatic processing is unavailable | Retry or use an allowed fallback | Naming a fake live result |
| DEMO_FALLBACK | Keep the exact label and explain fixture status | Continue within stated limits or retry | Hiding the fallback label |
| Conflict | State that server truth changed | Refresh or accept current truth | Silent overwrite |
| Processing | Say what is being processed | Wait or return safely | Review or confirmation language |
| Pending review | Call the result a draft | Review, confirm, or reject | Clinical truth or chatbot eligibility |
| Confirmed | State that a person confirmed the extraction | Continue to allowed use | Clinical validation |
| Rejected | State that the draft was rejected | Return or restart when allowed | Confirmed styling or context use |
| Cancelled | State that no change was saved when needed | Return | Accepted mutation |
| Deactivated | State that active care access ended and records remain | Return to active context | Hard deletion or subscription cancellation |
| Audio enabled, blocked, or muted | Keep audio status secondary to the visual alert | Change audio setting or open alert | Audio as the only SOS signal |
| Already handled | Name the current handler state | Acknowledge or refresh | Letting another user overwrite it |

## Global System Copy

| Copy ID | State | Context | Title/Message | Supporting Copy | Action Label | Recovery Destination | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| CP-001 | Default | SYS-01 public entry | Pilih cara masuk | Patient memakai kode akses. Caregiver masuk dengan akun caregiver. | Masuk sebagai Patient / Masuk sebagai Caregiver | PAT-01 / CG-01 | Product data before authentication | Daniel | FLOW-01; TRN-01, TRN-02 |
| CP-002 | Path unavailable | SYS-01 Patient path unavailable | Akses Patient belum tersedia | Coba lagi. Tidak ada Patient Profile yang dibuka. | Coba lagi | SYS-01 | Patient identity or implementation detail | Bernard | FLOW-01; TRN-01, TRN-54, TRN-55 |
| CP-003 | Path unavailable | SYS-01 caregiver path unavailable | Akses Caregiver belum tersedia | Coba lagi atau gunakan jalur Patient bila itu akses Anda. | Coba lagi | SYS-01 | Membership detail | Bernard | FLOW-01; TRN-02, TRN-54, TRN-55 |
| CP-004 | Forbidden | SYS-02 Patient actor | Anda tidak dapat membuka bagian ini | Kembali ke halaman Patient atau masuk lagi dengan kode akses yang berlaku. | Kembali | Last authorized Patient surface / PAT-01 | Denied resource identity | Bernard | FLOW-02, FLOW-16; TRN-11 |
| CP-005 | Forbidden | SYS-02 caregiver actor | Akses tidak tersedia | Akun ini tidak memiliki akses ke data atau tindakan tersebut. | Kembali | Last authorized caregiver surface / CG-01 | Care Circle or Patient identity | Bernard | FLOW-03, FLOW-16; TRN-11 |
| CP-006 | Session expired | SYS-03 Patient session | Sesi Patient berakhir | Masukkan kembali Patient access code untuk membuka Patient Profile yang terikat. | Masuk lagi | PAT-01 | Prior protected Patient data | Bernard | FLOW-02, FLOW-16; TRN-05, TRN-06 |
| CP-007 | Session expired | SYS-03 caregiver session | Sesi Caregiver berakhir | Masuk kembali untuk memeriksa keanggotaan dan akses Patient Profile. | Masuk lagi | CG-01 | Patient session path | Bernard | FLOW-03, FLOW-16; TRN-09, TRN-10 |
| CP-008 | Not found | SYS-04 protected resource | Data tidak dapat dibuka | Data mungkin sudah tidak aktif atau tidak tersedia untuk akun ini. | Kembali | Last authorized context | Resource existence or ownership | Bernard | FLOW-03, FLOW-16; TRN-12 |
| CP-009 | Offline | SYS-05 general | Tidak ada koneksi | Data terbaru dan perubahan belum dapat diperiksa. | Coba lagi | Owning surface | Accepted mutation or current data | Bernard | FLOW-16; TRN-54, TRN-55 |
| CP-010 | Reconnecting | SYS-05 Realtime | Menyambungkan kembali | ChroniCare sedang memeriksa data terbaru. | Perbarui data | Owning surface through authorized refetch | Uninterrupted Realtime | Bernard | FLOW-13, FLOW-16; TRN-47 |
| CP-011 | Provider unavailable | SYS-06 | Pemrosesan otomatis tidak tersedia | Coba lagi atau gunakan fallback yang diberi label bila tersedia. | Coba lagi | Owning surface | Live provider result | Al | FLOW-08 sampai FLOW-11, FLOW-14, FLOW-16 |
| CP-012 | DEMO_FALLBACK | SYS-06 | DEMO_FALLBACK | Hasil ini memakai data demo, bukan pemrosesan otomatis secara langsung. | Lanjutkan dengan batasan ini | Owning surface | Live Azure result | Al | FLOW-08 sampai FLOW-11, FLOW-14 |
| CP-013 | Error | SYS-07 | Bagian ini belum dapat dimuat | Coba lagi. Jika sesi sudah berakhir, ChroniCare akan meminta Anda masuk kembali. | Coba lagi | Owning surface / SYS-03 | Stack or provider detail | Bernard | FLOW-16; TRN-54, TRN-55 |
| CP-014 | Retry | Generic guarded retry | Periksa kembali | ChroniCare akan memeriksa sesi, akses, dan data terbaru sebelum melanjutkan. | Coba lagi | Owning surface | Preserved authorization | Bernard | FLOW-16; TRN-54, TRN-55 |
| CP-015 | Conflict | Shared server truth changed | Data sudah berubah | Muat data terbaru sebelum melanjutkan. | Muat ulang | Owning surface | Permission to overwrite | Bernard | FLOW-07, FLOW-09, FLOW-13, FLOW-15 |
| CP-016 | Stale | Authorized last-known data | Data mungkin belum terbaru | Perbarui data sebelum membuat perubahan penting. | Perbarui | Owning surface | Current-data claim | Bernard | NEWDESIGN.md; State Matrix |
| CP-017 | Disabled | Missing prerequisite | Tindakan belum tersedia | Selesaikan langkah yang diminta terlebih dahulu. | None | Owning surface | Authorization denial | Daniel | NEWDESIGN.md; State Matrix |

## Patient Copy Matrix

| Copy ID | Screen ID | State | Situation | Primary Copy | Supporting Copy | Action Label | Recovery | Avoid | Reviewer | Flow/Transition Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-018 | PAT-01 | Default | Patient code sign-in | Selamat datang | Satu langkah sederhana untuk melihat pengingat, memberi kabar, dan tetap terhubung dengan caregiver. | Masuk dengan kode | PAT-01 | Patient name before validation | Daniel | FLOW-01, FLOW-02; TRN-01, TRN-03 |
| CP-019 | PAT-01 | Submitting | Code validation pending | Memeriksa kode | ChroniCare sedang memeriksa kode dan Patient Profile yang terikat. | Memeriksa kode… | PAT-01 / PAT-02 | Session-created claim | Bernard | FLOW-02; TRN-03 |
| CP-020 | PAT-01 | Validation | Invalid or expired code | Kode tidak valid atau sudah tidak berlaku | Periksa kembali atau minta kode baru kepada caregiver. | Coba lagi | PAT-01 | Patient identity or exact code status | Bernard | FLOW-02; TRN-04 |
| CP-021 | PAT-01 | Locked | Rate limit active | Terlalu banyak percobaan | Tunggu sebelum mencoba kode lagi. | Coba nanti | PAT-01 | Account existence | Bernard | Packet 05; PAT-01 specification |
| CP-022 | PAT-01 | Success | Session created | Kode diterima | Patient Profile Anda siap dibuka. | Lanjut | PAT-02 | Caregiver access | Daniel | FLOW-02; TRN-03 |
| CP-023 | PAT-01 | Offline | Login cannot reach server | Kode belum dapat diperiksa | Sambungkan perangkat ke internet lalu coba lagi. | Coba lagi | PAT-01 | Login success | Bernard | FLOW-02, FLOW-16 |
| CP-024 | PAT-02 | Loading | Patient home loading | Memuat rutinitas hari ini | ChroniCare sedang mengambil data Patient Profile Anda. | None | PAT-02 | Another Patient Profile | Daniel | FLOW-02, FLOW-04, FLOW-05 |
| CP-025 | PAT-02 | Empty | No routine | Belum ada rutinitas untuk hari ini | Anda tetap dapat melakukan check-in atau meminta bantuan. | Isi check-in hari ini | PAT-03 | Error implication | Daniel | FLOW-04, FLOW-05 |
| CP-026 | PAT-02 | Partial | Some sections unavailable | Sebagian data belum dapat dimuat | Anda dapat memakai bagian yang tersedia atau mencoba lagi. | Coba lagi | PAT-02 | Complete-data claim | Bernard | FLOW-04, FLOW-05, FLOW-16 |
| CP-027 | PAT-02 | Fresh | Current home data | Halo, {patientName}. | Bagaimana harimu? Kita mulai dari satu kabar singkat. | Isi check-in hari ini | PAT-03 | Health score | Daniel | FLOW-04, FLOW-05; TRN-13, TRN-16 |
| CP-028 | PAT-02 | Success acknowledgement | Check-in accepted | Check-in sudah disimpan | Caregiver yang berhak dapat melihat pembaruan ini. | Selesai | PAT-02 | Medical assessment | Ozan | FLOW-04; TRN-14 |
| CP-029 | PAT-02 | Active SOS | Stored active event | Permintaan bantuan masih aktif | Permintaan sudah disimpan. Penerimaan oleh Caregiver belum dapat dijamin. | Lihat status | PAT-02 / SOS-01 | Delivery guarantee | Al / Ozan | FLOW-12, FLOW-13; TRN-42, TRN-43 |
| CP-030 | PAT-02 | Deactivated | Active access ended | Patient Profile tidak lagi aktif | Kode dan sesi aktif untuk profil ini sudah dicabut. | Kembali ke akses Patient | PAT-01 | Hard deletion | Bernard | FLOW-15; TRN-53 |
| CP-031 | PAT-02 | Offline / error | Home unavailable | Rutinitas belum dapat diperbarui | Data yang terlihat mungkin bukan data terbaru. | Coba lagi | PAT-02 / SYS-05 | Current-data claim | Bernard | FLOW-04, FLOW-05, FLOW-16 |
| CP-032 | PAT-03 | Default | Check-in opened | Bagaimana kondisi Anda hari ini? | Pilih jawaban yang paling sesuai. | Kirim check-in | PAT-03 | Diagnosis language | Daniel / Al | FLOW-04; TRN-13 |
| CP-033 | PAT-03 | Validation | Required answer absent | Pilih jawaban sebelum mengirim | Check-in belum disimpan. | Pilih jawaban | PAT-03 | Blame | Daniel | FLOW-04; TRN-14 |
| CP-034 | PAT-03 | Submitting | Check-in pending | Menyimpan check-in | Jangan kirim ulang sampai pemeriksaan selesai. | Menyimpan | PAT-03 / PAT-02 | Duplicate success | Bernard | FLOW-04; TRN-14 |
| CP-035 | PAT-03 | Duplicate prevention | Prior result may exist | Memeriksa check-in terakhir | ChroniCare memastikan check-in tidak tersimpan dua kali. | Periksa lagi | PAT-03 | New duplicate record | Bernard | FLOW-04, FLOW-16; TRN-14, TRN-55 |
| CP-036 | PAT-03 | Success | Check-in stored | Check-in sudah disimpan | Jawaban terikat pada Patient Profile Anda. | Selesai | PAT-02 | Clinical conclusion | Ozan | FLOW-04; TRN-14 |
| CP-037 | PAT-03 | Cancelled | Patient exits | Check-in belum disimpan | Anda dapat kembali dan mengisinya nanti. | Kembali | PAT-02 | Accepted write | Daniel | FLOW-04; TRN-15 |
| CP-038 | PAT-03 | Forbidden / expired | Access invalid | Check-in tidak dapat dilanjutkan | Masuk lagi dengan Patient access code yang berlaku. | Masuk lagi | PAT-01 / SYS-03 | Other profile detail | Bernard | FLOW-04, FLOW-16 |
| CP-039 | PAT-03 | Offline / retry | Submit failed | Check-in belum dapat disimpan | Periksa koneksi. ChroniCare akan memeriksa hasil terakhir sebelum mencoba lagi. | Coba lagi | PAT-03 | Stored-success claim | Bernard | FLOW-04, FLOW-16; TRN-54, TRN-55 |
| CP-040 | PAT-04 | Loading | Routine detail loading | Memuat pengingat | ChroniCare sedang mengambil pengingat terbaru. | None | PAT-04 | Current item before load | Daniel | FLOW-05; TRN-16 |
| CP-041 | PAT-04 | Current | Active reminder available | Pengingat berikutnya | Ikuti catatan yang sudah dibuat Caregiver atau tenaga kesehatan Anda. | Kembali | PAT-02 | New medical instruction | Al / Ozan | FLOW-05; TRN-16, TRN-17 |
| CP-042 | PAT-04 | Empty | No reminder | Belum ada pengingat | Kembali ke halaman utama untuk melihat rutinitas lain. | Kembali | PAT-02 | Error implication | Daniel | FLOW-05; TRN-16, TRN-17 |
| CP-043 | PAT-04 | Inactive | Item no longer active | Pengingat ini tidak aktif | Jangan gunakan catatan ini sebagai instruksi terbaru. | Kembali | PAT-02 | Medication-stopping instruction | Al | FLOW-05; TRN-16, TRN-17 |
| CP-044 | PAT-04 | Stale / offline | Freshness unknown | Pengingat mungkin belum terbaru | Perbarui data saat koneksi tersedia. | Coba lagi | PAT-04 / SYS-05 | Current schedule | Bernard | FLOW-05, FLOW-16 |
| CP-045 | PAT-04 | Not found / forbidden | Detail concealed | Pengingat tidak dapat dibuka | Kembali ke Patient Profile Anda. | Kembali | PAT-02 / SYS-04 | Resource existence | Bernard | FLOW-05, FLOW-16 |
| CP-046 | PAT-05 | Empty conversation | Patient chatbot opens | Apa yang ingin Anda tanyakan? | Saya dapat membantu menjelaskan fitur dan menyiapkan pertanyaan untuk dokter. | Kirim pertanyaan | PAT-05 | Clinical authority | Al | FLOW-10; TRN-33 |
| CP-047 | PAT-05 | Sending | Request pending | Menyiapkan jawaban | ChroniCare sedang memeriksa batas keamanan dan konteks yang diizinkan. | Menyiapkan | PAT-05 | Hidden prompt detail | Al | FLOW-10; TRN-34 |
| CP-048 | PAT-05 | Allowed response | Safe answer returned | Jawaban untuk membantu langkah berikutnya | Informasi ini bersifat umum dan bukan diagnosis atau perubahan pengobatan. | Tanya lagi | PAT-05 | Clinical certainty | Al | FLOW-10; TRN-34 |
| CP-049 | PAT-05 | Refusal | Diagnosis request | Saya tidak dapat menentukan diagnosis | Saya dapat membantu mencatat gejala dan menyiapkan pertanyaan untuk dokter. | Siapkan pertanyaan | PAT-05 | Diagnostic answer | Al | FLOW-10; TRN-35 |
| CP-050 | PAT-05 | Refusal | Dose or medication change request | Saya tidak dapat menyarankan perubahan obat atau dosis | Hubungi dokter atau apoteker yang menangani Anda. | Siapkan pertanyaan | PAT-05 | Dose recommendation | Al | FLOW-10; TRN-35 |
| CP-051 | PAT-05 | Refusal | Lab, target, or diet request | Saya tidak dapat menetapkan target, menafsirkan hasil lab, atau membuat diet pribadi | Saya dapat membantu menyusun hal yang perlu ditanyakan kepada dokter. | Siapkan pertanyaan | PAT-05 | Lab interpretation or prescription | Al | FLOW-10; TRN-35 |
| CP-052 | PAT-05 | Emergency | Possible emergency | Cari bantuan segera | Jika keluhan terasa berat, mendadak, atau memburuk, hubungi layanan darurat setempat atau pergi ke IGD. Anda juga dapat meminta bantuan keluarga melalui ChroniCare. | Minta bantuan keluarga | SOS-01 | Ambulance or dispatch claim | Al / Ozan | FLOW-10, FLOW-12; TRN-36, TRN-40 |
| CP-053 | PAT-05 | Provider unavailable | AI provider failed | Jawaban otomatis tidak tersedia | Coba lagi atau gunakan bantuan aman yang diberi label fallback. | Coba lagi | PAT-05 / SYS-06 | Live AI response | Al | FLOW-10; TRN-34 |
| CP-054 | PAT-05 | DEMO_FALLBACK | Scripted safe response | DEMO_FALLBACK | Jawaban ini memakai fallback demo, bukan respons otomatis secara langsung. | Lanjut | PAT-05 | Provider-generated answer | Al | FLOW-10; TRN-34 |
| CP-055 | PAT-05 | Context invalid / expired / offline | Patient context unsafe | Percakapan tidak dapat dilanjutkan | Masuk lagi atau sambungkan perangkat sebelum bertanya kembali. | Masuk lagi | PAT-01 / SYS-05 | Prior context | Bernard / Al | FLOW-10, FLOW-16 |

## Caregiver Copy Matrix

| Copy ID | Screen ID | State | Situation | Primary Copy | Supporting Copy | Action Label | Recovery | Avoid | Reviewer | Flow/Transition Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-056 | CG-01 | Default | Caregiver sign-in | Masuk sebagai Caregiver | Gunakan akun yang terdaftar pada Care Circle. | Masuk | CG-01 | Patient access code path | Daniel | FLOW-01, FLOW-03; TRN-02, TRN-07 |
| CP-057 | CG-01 | Submitting | Credentials pending | Memeriksa akun | ChroniCare sedang memeriksa sesi dan keanggotaan Care Circle. | Memeriksa | CG-01 / CG-02 | Authorized success before membership check | Bernard | FLOW-03; TRN-07 |
| CP-058 | CG-01 | Validation | Invalid credentials | Email atau kata sandi tidak cocok | Periksa data masuk lalu coba lagi. | Coba lagi | CG-01 | Account existence | Bernard | FLOW-03; TRN-08 |
| CP-059 | CG-01 | Authenticated but forbidden | Membership invalid | Akun tidak memiliki akses ke Care Circle | Gunakan akun caregiver yang masih aktif. | Kembali | CG-01 / SYS-02 | Care Circle or Patient identity | Bernard | FLOW-03, FLOW-16; TRN-11 |
| CP-060 | CG-01 | Provider unavailable | Auth service unavailable | Layanan masuk belum tersedia | Coba lagi setelah layanan pulih. | Coba lagi | CG-01 / SYS-06 | Successful authentication | Bernard | FLOW-03, FLOW-16 |
| CP-061 | CG-01 | Offline | No connection | Tidak dapat memeriksa akun | Sambungkan perangkat ke internet lalu coba lagi. | Coba lagi | CG-01 | Login success | Bernard | FLOW-03, FLOW-16 |
| CP-062 | CG-02 | Loading | Dashboard loading | Memuat data Patient | Data dari Patient Profile sebelumnya tidak ditampilkan selama pemeriksaan. | None | CG-02 | Old Patient data | Bernard | FLOW-03, FLOW-06; TRN-07, TRN-19 |
| CP-063 | CG-02 | Profile switching | New Patient selected | Mengganti Patient Profile | ChroniCare sedang memeriksa akses dan memuat data baru. | Memuat | CG-02 / CG-03 | Old data under new identity | Bernard | FLOW-06; TRN-18, TRN-19 |
| CP-064 | CG-02 | Empty | No daily-care records | Belum ada catatan perawatan | Tambahkan catatan untuk Patient Profile yang aktif. | Tambah catatan | CG-04 | Error implication | Daniel | FLOW-07; TRN-21 |
| CP-065 | CG-02 | Partial | Some dashboard sections unavailable | Sebagian data belum dapat dimuat | Bagian yang tersedia tetap dapat dibaca. Muat ulang sebelum membuat keputusan penting. | Muat ulang | CG-02 | Complete-data claim | Ozan / Bernard | FLOW-06, FLOW-07, FLOW-16 |
| CP-066 | CG-02 | Fresh | Dashboard current | Data Patient sudah diperbarui | Patient Profile aktif: {patientName}. | Lihat tindakan berikutnya | CG-02 | Authorization from UI selection | Bernard | FLOW-06; TRN-19 |
| CP-067 | CG-02 | Active SOS | Matching event active | Ada permintaan bantuan dari {patientName} | Buka permintaan untuk melihat waktu dan status penanganan. | Buka SOS | SOS-02 / SOS-03 | Dispatch or closed-tab guarantee | Al / Ozan | FLOW-13; TRN-43, TRN-44 |
| CP-068 | CG-02 | Stale / offline | Dashboard may be old | Data Patient mungkin belum terbaru | Perbarui data sebelum menyimpan perubahan atau menangani SOS. | Perbarui data | CG-02 / SYS-05 | Current-data claim | Bernard | FLOW-06, FLOW-07, FLOW-13, FLOW-16 |
| CP-069 | CG-02 | Forbidden / expired | Access lost | Dashboard tidak dapat dibuka | Masuk kembali atau gunakan akun dengan keanggotaan yang aktif. | Masuk lagi | CG-01 / SYS-02 / SYS-03 | Patient identity | Bernard | FLOW-03, FLOW-16 |
| CP-070 | CG-02 | Deactivated profile | Active context ended | Patient Profile sudah dinonaktifkan | Profil tidak lagi tersedia untuk perawatan aktif. Pilih Patient Profile lain bila tersedia. | Pilih Patient lain | CG-03 / CG-02 | Hard deletion | Bernard / Ozan | FLOW-15; TRN-53 |
| CP-071 | CG-03 | Loading | Profile list loading | Memuat Patient Profile | Hanya profil aktif yang dapat dipilih. | None | CG-03 | Deactivated profile data | Bernard | FLOW-06; TRN-18 |
| CP-072 | CG-03 | Zero profiles | No active profile | Tidak ada Patient Profile aktif | Tidak ada data Patient yang dapat dibuka dari akun ini. | Kembali | CG-02 | Third profile or hidden membership | Ozan | FLOW-06; TRN-18, TRN-20 |
| CP-073 | CG-03 | One profile | One authorized profile | Satu Patient Profile tersedia | {patientName} tetap menjadi konteks aktif. | Lanjut | CG-02 | Extra profile | Daniel | FLOW-06; TRN-18 sampai TRN-20 |
| CP-074 | CG-03 | Two profiles | Two authorized profiles | Pilih Patient Profile | Data akan dimuat ulang setelah akses diperiksa. | Gunakan profil ini | CG-02 | UI selection as authorization | Bernard | FLOW-06; TRN-19 |
| CP-075 | CG-03 | Switching | Selection pending | Memeriksa akses Patient Profile | Data lama sudah disembunyikan. | Memeriksa | CG-03 / CG-02 | Old profile data | Bernard | FLOW-06; TRN-19 |
| CP-076 | CG-03 | Success | Switch accepted | Patient Profile aktif sudah diganti | Data {patientName} sudah dimuat dari konteks yang baru. | Lanjut | CG-02 | Authorization guarantee from selection alone | Bernard | FLOW-06; TRN-19 |
| CP-077 | CG-03 | Cancelled | Selector dismissed | Patient Profile tidak berubah | ChroniCare tetap memakai konteks terakhir yang berhak Anda akses. | Kembali | CG-02 | New selection | Daniel | FLOW-06; TRN-20 |
| CP-078 | CG-03 | Forbidden / offline / error | Switch cannot complete | Patient Profile tidak dapat dibuka | Kembali ke profil terakhir yang berhak Anda akses atau coba lagi. | Kembali | CG-02 / SYS-02 / SYS-05 | Denied Patient identity | Bernard | FLOW-06, FLOW-16 |
| CP-079 | CG-04 | Loading / empty | Daily care opens | Memuat catatan perawatan | Jika belum ada catatan, Anda dapat membuat catatan untuk Patient Profile aktif. | None | CG-04 | Other Patient data | Daniel | FLOW-07; TRN-21 |
| CP-080 | CG-04 | Editing | Care record being changed | Perbarui catatan perawatan | Perubahan hanya berlaku untuk {patientName}. | Simpan perubahan | CG-04 | Cross-profile mutation | Bernard | FLOW-07; TRN-22 |
| CP-081 | CG-04 | Validation | Input invalid | Periksa bagian yang ditandai | Catatan belum disimpan. | Perbaiki data | CG-04 | Accepted write | Daniel | FLOW-07; TRN-22 |
| CP-082 | CG-04 | Saving | Mutation pending | Menyimpan catatan | Jangan menutup atau mengganti Patient Profile sampai pemeriksaan selesai. | Menyimpan | CG-04 | Stored success | Bernard | FLOW-07; TRN-22 |
| CP-083 | CG-04 | Success | Save accepted | Catatan perawatan sudah disimpan | Pembaruan terikat pada Patient Profile {patientName}. | Selesai | CG-04 / CG-02 | Clinical validation | Ozan | FLOW-07; TRN-22 |
| CP-084 | CG-04 | Cancelled | Exit without save | Perubahan belum disimpan | Kembali tanpa mengubah catatan terakhir. | Kembali tanpa menyimpan | CG-02 | Accepted write | Daniel | FLOW-07; TRN-23 |
| CP-085 | CG-04 | Conflict | Record changed elsewhere | Catatan sudah berubah | Muat versi terbaru lalu periksa perubahan Anda kembali. | Muat versi terbaru | CG-04 | Silent overwrite | Bernard | FLOW-07; TRN-22 |
| CP-086 | CG-04 | Profile interruption | Profile switch requested with edits | Ada perubahan yang belum disimpan | Simpan untuk Patient Profile ini atau batalkan perubahan sebelum berganti profil. | Tetap di halaman ini | CG-04 / CG-03 | Cross-profile save | Bernard / Daniel | FLOW-06, FLOW-07 |
| CP-087 | CG-04 | Forbidden / expired / offline / error | Save unsafe | Perubahan belum dapat disimpan | Periksa sesi, akses Patient Profile, dan koneksi sebelum mencoba lagi. | Coba lagi | CG-04 / SYS-02 / SYS-03 / SYS-05 | Stored-success claim | Bernard | FLOW-07, FLOW-16 |
| CP-088 | CG-05 | Context loading | Caregiver chat opens | Memuat konteks yang diizinkan | ChroniCare hanya memakai data perawatan minimum dan hasil OCR berstatus CONFIRMED. | None | CG-05 | Raw or pending OCR | Al / Bernard | FLOW-09, FLOW-11; TRN-32, TRN-37 |
| CP-089 | CG-05 | Empty context | No trusted context | Belum ada konteks terkonfirmasi | Anda tetap dapat menanyakan cara memakai fitur atau menyiapkan pertanyaan untuk dokter. | Kirim pertanyaan | CG-05 | Fabricated context | Al | FLOW-11; TRN-38 |
| CP-090 | CG-05 | Sending | AI request pending | Menyiapkan jawaban | ChroniCare sedang memeriksa persona, akses Patient, dan batas medis. | Menyiapkan | CG-05 | Hidden prompt detail | Al | FLOW-11; TRN-38 |
| CP-091 | CG-05 | Allowed response | Safe answer available | Ringkasan untuk langkah berikutnya | Ringkasan memakai data minimum yang berhak Anda akses. Konfirmasi keputusan medis dengan dokter. | Siapkan pertanyaan dokter | CG-05 | Medical decision | Al / Ozan | FLOW-11; TRN-38 |
| CP-092 | CG-05 | Refusal | Clinical request | Saya tidak dapat memberi diagnosis atau mengubah pengobatan | Saya dapat membantu menyusun ringkasan dan daftar pertanyaan untuk dokter. | Siapkan pertanyaan | CG-05 | Forbidden clinical answer | Al | FLOW-11; TRN-38 |
| CP-093 | CG-05 | Emergency | Possible emergency | Utamakan bantuan langsung | Jika kondisi Patient berat, mendadak, atau memburuk, hubungi layanan darurat setempat atau bawa ke IGD. ChroniCare hanya membantu koordinasi keluarga. | Lihat SOS aktif | SOS-02 / SOS-03 | Dispatch connection | Al / Ozan | FLOW-11, FLOW-13 |
| CP-094 | CG-05 | Confirmed provenance | OCR context included | Menggunakan hasil yang sudah dikonfirmasi | Hanya data terstruktur berstatus CONFIRMED yang dipakai. | Lanjut | CG-05 | Raw OCR or clinical truth | Al | FLOW-09, FLOW-11; TRN-32, TRN-38 |
| CP-095 | CG-05 | Provider unavailable / fallback | AI unavailable | Jawaban otomatis tidak tersedia | Coba lagi atau gunakan DEMO_FALLBACK yang diberi label. | Coba lagi | CG-05 / SYS-06 | Live provider response | Al | FLOW-11; TRN-38 |
| CP-096 | CG-05 | Profile switch / conflict | Active Patient changes | Percakapan lama sudah ditutup | Pilih Patient Profile yang berhak Anda akses, lalu mulai percakapan baru. | Pilih Patient Profile | CG-03 | Old Patient context | Bernard / Al | FLOW-06, FLOW-11; TRN-39 |
| CP-097 | CG-05 | Expired / offline / error | Chat unsafe | Percakapan belum dapat dilanjutkan | Masuk lagi atau periksa koneksi. Konteks lama tidak akan dipakai untuk Patient lain. | Coba lagi | CG-01 / SYS-03 / SYS-05 | Cached protected context | Bernard / Al | FLOW-11, FLOW-16 |
| CP-098 | CG-06 | Initial | Helper opens | Cari faskes di Tangerang | Data ini bersifat statis. Periksa sumber dan tanggal tinjau sebelum memilih fasilitas. | Terapkan filter | CG-06 | Live availability | Ozan | FLOW-14; TRN-48 |
| CP-099 | CG-06 | Filtering | Filters applied | Mencari dalam data yang tersedia | Hasil tidak diurutkan sebagai rekomendasi medis. | Terapkan filter | CG-06 | Ranking | Ozan | FLOW-14; TRN-49 |
| CP-100 | CG-06 | Results | Static matches found | Faskes yang sesuai dengan filter | Hubungi fasilitas atau BPJS untuk memeriksa layanan, jadwal, dan penerimaan saat ini. | Lihat detail | CG-06 | Guaranteed acceptance or availability | Ozan | FLOW-14; TRN-49 |
| CP-101 | CG-06 | Empty | No static matches | Tidak ada hasil dalam data ini | Ubah filter. Hasil kosong tidak berarti tidak ada fasilitas di luar dataset. | Hapus filter | CG-06 | Real-world absence | Ozan | FLOW-14; TRN-49 |
| CP-102 | CG-06 | Stale source | Review date old | Sumber mungkin sudah berubah | Konfirmasi informasi langsung kepada fasilitas atau BPJS. | Lihat sumber | CG-06 | Current policy | Ozan | FLOW-14; TRN-49 |
| CP-103 | CG-06 | Unavailable / offline | Dataset unavailable | Data faskes belum dapat dimuat | Coba lagi saat koneksi tersedia. | Coba lagi | CG-06 / SYS-05 | No facilities exist | Bernard / Ozan | FLOW-14, FLOW-16 |
| CP-104 | CG-06 | DEMO_FALLBACK | Fixture active | DEMO_FALLBACK | Daftar ini memakai data demo statis, bukan pencarian fasilitas secara langsung. | Lanjut dengan data demo | CG-06 | Live scrape | Ozan | FLOW-14; TRN-49 |
| CP-105 | CG-06 | Session expired | Caregiver session invalid | Sesi Caregiver berakhir | Masuk kembali sebelum membuka data faskes. | Masuk lagi | CG-01 | Patient session path | Bernard | FLOW-14, FLOW-16; TRN-50 |

## Owner Lifecycle Copy Matrix

| Copy ID | Screen ID | State | Situation | Primary Copy | Supporting Copy | Action Label | Recovery | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-106 | OWN-04 | Consequence | Lifecycle action opens | Akhiri perawatan aktif untuk Patient Profile ini? | Kode akses dan sesi Patient akan dicabut. Catatan lama tetap tersimpan. | Lanjutkan | OWN-04 | Hard deletion or subscription cancellation | Ozan / Bernard | FLOW-15; TRN-51 |
| CP-107 | OWN-04 | Reason required | No reason selected | Pilih alasan deactivation | Alasan diperlukan untuk catatan audit. | Pilih alasan | OWN-04 | Accepted mutation | Bernard | FLOW-15; TRN-52 |
| CP-108 | OWN-04 | Confirmation | Reason valid | Konfirmasi deactivation Patient Profile | Setelah dikonfirmasi, profil keluar dari perawatan aktif dan Patient harus berhenti memakai kode lama. | Nonaktifkan Patient Profile | OWN-04 | Erased records | Ozan / Bernard | FLOW-15; TRN-52, TRN-53 |
| CP-109 | OWN-04 | Submitting | Deactivation pending | Menonaktifkan Patient Profile | Jangan kirim ulang sampai status terbaru diperiksa. | Menonaktifkan | OWN-04 | Completed deactivation | Bernard | FLOW-15; TRN-53 |
| CP-110 | OWN-04 | Deactivated success | Mutation committed | Patient Profile sudah dinonaktifkan | Akses aktif sudah dicabut. Catatan lama tidak dihapus. | Kembali ke dashboard | CG-02 | Hard delete or legal retention completeness | Ozan / Bernard | FLOW-15; TRN-53 |
| CP-111 | OWN-04 | Access revoked | Patient session affected | Akses Patient sudah dicabut | Patient access code dan Patient session yang aktif tidak dapat dipakai lagi. | Selesai | CG-02 / PAT-01 / SYS-03 | Account deletion | Bernard | FLOW-15; TRN-53 |
| CP-112 | OWN-04 | Active-list removal | Caregiver context refreshes | Profil tidak lagi tampil dalam daftar aktif | Pilih Patient Profile aktif lain bila tersedia. | Pilih Patient lain | CG-03 / CG-02 | Historical deletion | Bernard | FLOW-15; TRN-53 |
| CP-113 | OWN-04 | Conflict / already deactivated | Current state changed | Patient Profile sudah tidak aktif | Muat data terbaru. Tidak ada deactivation kedua yang dibuat. | Muat ulang | CG-02 / OWN-04 | Second success | Bernard | FLOW-15, FLOW-16 |
| CP-114 | OWN-04 | Forbidden | Non-Owner attempts action | Hanya Owner yang dapat menonaktifkan Patient Profile | Kembali ke dashboard caregiver. | Kembali | CG-02 / SYS-02 | Owner-only sensitive details | Bernard / Ozan | FLOW-15; TRN-51 |
| CP-115 | OWN-04 | Session expired / offline / error | Outcome unsafe | Deactivation belum dapat dipastikan | Masuk lagi atau periksa koneksi, lalu muat status terbaru sebelum mencoba kembali. | Periksa status | OWN-04 / CG-01 / SYS-05 | Deactivated-success claim | Bernard | FLOW-15, FLOW-16 |

## OCR Copy Matrix

| Copy ID | Screen ID | State | Situation | Primary Copy | Supporting Copy | Action Label | Chatbot Context | Recovery | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CP-116 | OCR-01 | Loading | Document list loading | Memuat dokumen {patientName} | Hanya metadata dokumen privat dari Patient Profile aktif yang ditampilkan. | None | No | OCR-01 | Public document URL | Bernard / Al | FLOW-08, FLOW-09; TRN-24 |
| CP-117 | OCR-01 | Empty | No documents | Belum ada dokumen | Unggah PDF, JPEG, atau PNG untuk memulai review. | Unggah dokumen | No | OCR-02 | Error implication | Daniel | FLOW-08; TRN-25 |
| CP-118 | OCR-01 | Processing | Document processing | Dokumen sedang diproses | Hasil belum siap untuk ditinjau atau dipakai sebagai konteks. | Lihat status | No | OCR-03 | Reviewable or confirmed claim | Al | FLOW-08; TRN-26 sampai TRN-28 |
| CP-119 | OCR-01 | Pending review | Draft available | Menunggu review Caregiver | Hasil otomatis masih berupa draft. | Tinjau hasil | No | OCR-03 | Confirmed truth | Al | FLOW-09; TRN-28, TRN-31 |
| CP-120 | OCR-01 | Confirmed | Human decision stored | Hasil sudah dikonfirmasi | Data terstruktur minimum dapat dipakai dalam konteks Caregiver chatbot untuk Patient yang sama. | Lihat hasil | Yes | OCR-03 / CG-05 | Clinical validation | Al | FLOW-09, FLOW-11; TRN-29, TRN-32 |
| CP-121 | OCR-01 | Rejected | Human rejection stored | Hasil ditolak | Data ini tidak dipakai sebagai konteks chatbot. | Lihat status | No | OCR-03 / OCR-01 | Confirmed styling | Al | FLOW-09; TRN-30, TRN-31 |
| CP-122 | OCR-01 | Failed / fallback | Processing failed or fixture exists | Pemrosesan belum menghasilkan draft yang dapat dipercaya | Coba lagi atau buka hasil DEMO_FALLBACK yang diberi label. | Coba lagi | No | OCR-03 / SYS-06 | Live OCR success | Al | FLOW-08, FLOW-09 |
| CP-123 | OCR-01 | Profile switch / forbidden / expired | Context changes | Daftar dokumen sudah ditutup | Pilih Patient Profile yang berhak Anda akses atau masuk kembali. | Kembali | No | CG-03 / CG-01 | Old document list under new Patient | Bernard | FLOW-06, FLOW-08, FLOW-09 |
| CP-124 | OCR-02 | No file | Upload opens | Pilih dokumen kesehatan | Format: PDF, JPEG, atau PNG. Maksimum 5 MB dan tiga halaman. | Pilih file | No | OCR-02 | Unstated limits | Daniel / Al | FLOW-08; TRN-25, TRN-26 |
| CP-125 | OCR-02 | File selected | Valid candidate selected | Dokumen siap diunggah | File akan disimpan secara privat untuk Patient Profile {patientName}. | Unggah dan proses | No | OCR-02 / OCR-03 | Public storage | Bernard | FLOW-08; TRN-26 |
| CP-126 | OCR-02 | Unsupported type | File type invalid | Format file tidak didukung | Pilih PDF, JPEG, atau PNG. | Ganti file | No | OCR-02 | Provider failure | Al | FLOW-08; TRN-26 |
| CP-127 | OCR-02 | Over 5 MB | Size invalid | File lebih besar dari 5 MB | Kecilkan file lalu unggah kembali. | Ganti file | No | OCR-02 | Accepted upload | Al | FLOW-08; TRN-26 |
| CP-128 | OCR-02 | Over three pages | Page count invalid | Dokumen lebih dari tiga halaman | Pilih paling banyak tiga halaman untuk satu unggahan. | Ganti file | No | OCR-02 | Batch OCR | Al | FLOW-08; TRN-26 |
| CP-129 | OCR-02 | Uploading | Private upload pending | Mengunggah dokumen | Jangan mengganti Patient Profile sampai unggahan selesai. | Mengunggah | No | OCR-02 / OCR-03 | Stored or processed success | Bernard | FLOW-08; TRN-26 |
| CP-130 | OCR-02 | Accepted | Private upload accepted | Dokumen sudah diterima | Pemrosesan otomatis dimulai. Hasilnya tetap harus ditinjau Caregiver. | Tinjau proses | No | OCR-03 | Confirmed extraction | Al | FLOW-08; TRN-26 |
| CP-131 | OCR-02 | Upload error / offline | Upload failed | Dokumen belum dapat diunggah | Periksa koneksi dan hasil unggahan terakhir sebelum mencoba lagi. | Coba lagi | No | OCR-02 / SYS-05 | Accepted upload or duplicate | Bernard | FLOW-08, FLOW-16 |
| CP-132 | OCR-02 | Duplicate / integrity warning | Possible duplicate or damaged file | Dokumen perlu diperiksa | File mungkin sudah pernah diunggah atau tidak dapat dibaca dengan utuh. | Pilih file lain | No | OCR-02 | Accepted processing | Bernard / Al | FLOW-08; TRN-26 |
| CP-133 | OCR-02 | Provider unavailable | Upload accepted but OCR unavailable | Pemrosesan otomatis tidak tersedia | Dokumen tetap privat. Coba lagi atau gunakan DEMO_FALLBACK bila tersedia. | Coba lagi | No | OCR-03 / SYS-06 | Live provider result | Al / Bernard | FLOW-08; TRN-26 sampai TRN-28 |
| CP-134 | OCR-03 | PROCESSING | Provider work pending | Memproses dokumen | Belum ada hasil yang dapat ditinjau. | None | No | OCR-03 | Reviewable or confirmed truth | Al | FLOW-08; TRN-26 sampai TRN-28 |
| CP-135 | OCR-03 | REVIEW_REQUIRED | Valid machine draft ready | Draft siap ditinjau | Bandingkan draft dengan dokumen asli sebelum membuat keputusan. | Mulai review | No | OCR-03 | Human-confirmed status | Al | FLOW-09; TRN-28 |
| CP-136 | OCR-03 | PENDING_REVIEW | Undecided stored draft | Menunggu keputusan Caregiver | Draft ini belum dipercaya sebagai fakta dan belum dapat dipakai oleh chatbot. | Tinjau draft | No | OCR-03 | Confirmed truth | Al | FLOW-09; TRN-28, TRN-31 |
| CP-137 | OCR-03 | Editable draft | Caregiver editing | Periksa setiap bidang | Perubahan masih berupa draft sampai Anda mengonfirmasinya. | Simpan draft | No | OCR-03 | Automatic daily-care update | Al | FLOW-09; TRN-28, TRN-29 |
| CP-138 | OCR-03 | Validation issue | Structured data invalid | Periksa bidang yang ditandai | Draft belum dapat dikonfirmasi. | Perbaiki data | No | OCR-03 | Accepted confirmation | Al | FLOW-09; TRN-29 |
| CP-139 | OCR-03 | Confirm pending | Confirmation unresolved | Mengonfirmasi hasil review | Jangan kirim ulang sampai status terbaru diterima. | Mengonfirmasi | No | OCR-03 | CONFIRMED before server acceptance | Bernard / Al | FLOW-09; TRN-29 |
| CP-140 | OCR-03 | CONFIRMED | Human confirmation stored | Hasil review sudah dikonfirmasi | Data terstruktur minimum kini dapat dipakai dalam Caregiver chatbot untuk Patient Profile yang sama. | Selesai | Yes | OCR-01 / CG-05 | Diagnosis or lab interpretation | Al | FLOW-09, FLOW-11; TRN-29, TRN-32 |
| CP-141 | OCR-03 | Reject confirmation | Rejection needs explicit decision | Tolak draft ini? | Draft yang ditolak tidak akan dipakai sebagai konteks chatbot. | Tolak hasil | No | OCR-03 | Rejection already stored | Al | FLOW-09; TRN-30 |
| CP-142 | OCR-03 | REJECTED | Rejection stored | Draft sudah ditolak | Status tetap tersimpan untuk audit. | Kembali ke dokumen | No | OCR-01 | Confirmed eligibility | Al | FLOW-09; TRN-30, TRN-31 |
| CP-143 | OCR-03 | FAILED | Processing failed | Dokumen belum menghasilkan draft | Coba proses ulang atau gunakan fallback yang diberi label. | Coba lagi | No | OCR-03 / SYS-06 | Reviewable result | Al | FLOW-08, FLOW-09 |
| CP-144 | OCR-03 | DEMO_FALLBACK | Fixture draft active | DEMO_FALLBACK | Draft ini memakai data demo, bukan pemrosesan otomatis langsung. Tinjau sebelum mengonfirmasi. | Tinjau hasil demo | No until human confirmation | OCR-03 | Live Azure processing | Al | FLOW-08, FLOW-09 |
| CP-145 | OCR-03 | Conflict / profile switch | Version or Patient changes | Review dihentikan | Muat data terbaru atau pilih kembali Patient Profile. Draft lama tidak dipindahkan ke profil baru. | Muat ulang | No | OCR-03 / CG-03 | Silent overwrite or cross-profile data | Bernard / Al | FLOW-06, FLOW-09 |
| CP-146 | OCR-03 | Forbidden / expired / offline | Review unsafe | Dokumen tidak dapat ditinjau | Masuk lagi atau periksa koneksi. Isi dokumen tidak ditampilkan. | Kembali | No | CG-01 / SYS-02 / SYS-03 / SYS-05 | Protected document content | Bernard | FLOW-08, FLOW-09, FLOW-16 |

## AI Copy Matrix

| Copy ID | Persona | State | Trigger | Primary Copy | Supporting Copy | Action Label | Recovery | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-147 | Patient | Allowed scope | Navigation or routine support | Saya dapat membantu menjelaskan fitur, merangkum rutinitas umum, dan menyiapkan pertanyaan untuk dokter | Jawaban tidak menggantikan penilaian tenaga kesehatan. | Kirim pertanyaan | PAT-05 | Clinical certainty | Al | FLOW-10; TRN-34 |
| CP-148 | Caregiver | Allowed scope | Summary or doctor preparation | Saya dapat membantu merangkum data yang diizinkan dan menyiapkan pertanyaan untuk dokter | Hanya data minimum dan hasil OCR berstatus CONFIRMED yang digunakan. | Kirim pertanyaan | CG-05 | Hidden or unconfirmed context | Al | FLOW-11; TRN-32, TRN-38 |
| CP-149 | Either | Refusal | Diagnosis request | Saya tidak dapat menentukan diagnosis | Saya dapat membantu menyusun gejala dan pertanyaan untuk dokter. | Siapkan pertanyaan | Owning chatbot | Diagnostic answer | Al | FLOW-10, FLOW-11 |
| CP-150 | Either | Refusal | Dose-change request | Saya tidak dapat menyarankan perubahan dosis | Hubungi dokter atau apoteker yang menangani Patient. | Siapkan pertanyaan | Owning chatbot | Dose amount or adjustment | Al | FLOW-10, FLOW-11 |
| CP-151 | Either | Refusal | Stop-medication request | Saya tidak dapat menyarankan penghentian obat | Konfirmasi rencana pengobatan dengan dokter atau apoteker. | Siapkan pertanyaan | Owning chatbot | Stopping instruction | Al | FLOW-10, FLOW-11 |
| CP-152 | Either | Refusal | Diabetes-target request | Saya tidak dapat menetapkan target diabetes pribadi | Saya dapat membantu menyiapkan pertanyaan tentang target yang dokter berikan. | Siapkan pertanyaan | Owning chatbot | Numeric treatment target | Al | FLOW-10, FLOW-11 |
| CP-153 | Either | Refusal | Lab interpretation request | Saya tidak dapat menilai apakah hasil lab aman atau berbahaya | Bawa hasil tersebut kepada dokter yang memahami riwayat Patient. | Siapkan pertanyaan | Owning chatbot | Lab interpretation | Al | FLOW-10, FLOW-11 |
| CP-154 | Either | Refusal | Nutrition prescription request | Saya tidak dapat membuat diet pribadi atau daftar pantangan medis | Saya dapat membantu mencatat pertanyaan untuk dokter atau ahli gizi. | Siapkan pertanyaan | Owning chatbot | Personal diet plan | Al | FLOW-10, FLOW-11 |
| CP-155 | Either | Possible emergency | Urgent language detected | Keluhan ini mungkin memerlukan bantuan segera | Hubungi layanan darurat setempat atau pergi ke IGD. ChroniCare tidak mengirim ambulans. | Minta bantuan keluarga | SOS-01 or active SOS context | Long chat or dispatch | Al / Ozan | FLOW-10, FLOW-11, FLOW-12 |
| CP-156 | Either | Provider unavailable / fallback | Azure unavailable | Respons otomatis tidak tersedia | Coba lagi atau gunakan DEMO_FALLBACK yang diberi label. | Coba lagi | SYS-06 / owning chatbot | Live response | Al | FLOW-10, FLOW-11 |
| CP-157 | Either | Profile/context invalidation | Context changed | Konteks percakapan sudah dihapus | Mulai percakapan baru setelah Patient Profile dan akses diperiksa. | Mulai percakapan baru | PAT-01 or CG-03 | Old profile context | Bernard / Al | FLOW-10, FLOW-11; TRN-39 |

## SOS Copy Matrix

| Copy ID | Screen ID | State | Situation | Primary Copy | Supporting Copy | Action Label | Recovery | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-158 | SOS-01 | Confirmation | Patient starts SOS | Minta bantuan keluarga sekarang? | ChroniCare akan menyimpan permintaan untuk Caregiver. Penerimaan saat dashboard tertutup tidak dijamin. | Kirim permintaan bantuan | SOS-01 | Emergency dispatch | Al / Ozan | FLOW-12; TRN-40 |
| CP-159 | SOS-01 | Cancelled | Patient cancels | Permintaan tidak dikirim | Tidak ada event SOS yang dibuat. | Kembali | Origin Patient surface | Stored event | Bernard | FLOW-12; TRN-41 |
| CP-160 | SOS-01 | Creating | Create pending | Menyimpan permintaan bantuan | Tunggu sampai ChroniCare memberi status penyimpanan. | Menyimpan | SOS-01 | Caregiver receipt | Bernard | FLOW-12; TRN-42 |
| CP-161 | SOS-01 | Stored | Server accepted event | Permintaan bantuan sudah disimpan | Dashboard Caregiver yang terbuka dan berhak dapat menerima peringatan. Penerimaan belum dapat dipastikan. | Selesai | PAT-02 | Delivered alert | Al / Ozan | FLOW-12, FLOW-13; TRN-42, TRN-43 |
| CP-162 | SOS-01 | Duplicate | Existing event found | Permintaan bantuan yang sama sudah tersimpan | ChroniCare tidak membuat event kedua. | Lihat status | PAT-02 / SOS-01 | Duplicate creation | Bernard | FLOW-12; TRN-42 |
| CP-163 | SOS-01 | Not sent / offline | Create not accepted | Permintaan belum tersimpan | Periksa koneksi lalu coba lagi. Jika kondisi darurat, hubungi layanan darurat setempat atau pergi ke IGD. | Coba lagi | SOS-01 / SYS-05 | Stored or delivered success | Al / Bernard | FLOW-12, FLOW-16 |
| CP-164 | SOS-01 | Expired / deactivated | Patient access invalid | Permintaan tidak dapat dibuat dari profil ini | Masuk lagi dengan akses Patient yang aktif. | Masuk lagi | PAT-01 / SYS-03 | Active-profile claim | Bernard | FLOW-12, FLOW-15, FLOW-16 |
| CP-165 | SOS-02 | Realtime received | Open dashboard gets event | SOS baru dari {patientName} | Waktu: {eventTime}. Buka untuk melihat status penanganan. | Buka SOS | SOS-03 | Closed-tab delivery | Ozan / Bernard | FLOW-13; TRN-43, TRN-44 |
| CP-166 | SOS-02 | Visual-only | Audio unavailable or off | Peringatan SOS tetap aktif | Suara tidak aktif. Peringatan visual tetap terlihat sampai status diperbarui. | Buka SOS | SOS-03 | Audio dependency | Daniel / Al | FLOW-13; TRN-43, TRN-44 |
| CP-167 | SOS-02 | Audio enabled | Opt-in active | Suara SOS aktif | Peringatan visual tetap menjadi penanda utama. | Matikan suara | SOS-02 | Guaranteed playback | Daniel | FLOW-13; Packet 12 |
| CP-168 | SOS-02 | Audio blocked | Browser blocks sound | Browser memblokir suara SOS | Aktifkan suara melalui tindakan pengguna atau lanjutkan dengan peringatan visual. | Aktifkan suara | SOS-02 | Missing event | Daniel / Bernard | FLOW-13; Packet 12 |
| CP-169 | SOS-02 | Audio muted | User muted sound | Suara SOS dimatikan | Peringatan visual tetap aktif. | Aktifkan suara | SOS-02 | Handled event | Daniel | FLOW-13; Packet 12 |
| CP-170 | SOS-02 | Disconnected | Realtime unavailable | Pembaruan langsung terputus | Peringatan terakhir tetap terlihat. Perbarui status dari server untuk memeriksa data terbaru. | Perbarui status | SYS-05 | Continued Realtime delivery | Bernard | FLOW-13, FLOW-16; TRN-47 |
| CP-171 | SOS-02 | Reconnecting / refreshing | REST recovery pending | Memeriksa status SOS terbaru | ChroniCare sedang memvalidasi sesi, Care Circle, dan event. | Memeriksa | SOS-02 / SOS-03 | Realtime receipt | Bernard | FLOW-13, FLOW-16; TRN-47 |
| CP-172 | SOS-02 | Refreshed | Latest event loaded | Status SOS sudah diperbarui | Informasi ini berasal dari pemeriksaan server terbaru. | Buka status | SOS-03 | No missed events ever | Bernard | FLOW-13; TRN-47 |
| CP-173 | SOS-02 | Already handled | Event has handler | SOS sedang ditangani oleh {handlerName} | Muat ulang bila status berubah. | Lihat detail | SOS-03 | Current actor won | Bernard / Ozan | FLOW-13; TRN-45, TRN-46 |
| CP-174 | SOS-02 | Stale | Alert may lag | Status SOS mungkin belum terbaru | Perbarui sebelum mengambil tindakan. | Perbarui status | SYS-05 | Current truth | Bernard | FLOW-13, FLOW-16 |
| CP-175 | SOS-03 | Available | Unhandled event | Belum ada Caregiver yang menangani | Tindakan pertama yang diterima server akan menjadi handler. | Saya tangani | SOS-03 | Guaranteed claim | Ozan / Bernard | FLOW-13; TRN-44, TRN-45 |
| CP-176 | SOS-03 | Claiming | Atomic update pending | Mencatat penanganan | Jangan menekan ulang. ChroniCare sedang memeriksa handler terbaru. | Mencatat | SOS-03 | Handler ownership | Bernard | FLOW-13; TRN-45 |
| CP-177 | SOS-03 | Handled | Current actor won | Anda menangani SOS ini | Caregiver lain akan melihat status handler terbaru. | Selesai | SOS-03 / CG-02 | Emergency resolved | Ozan / Bernard | FLOW-13; TRN-45 |
| CP-178 | SOS-03 | First-handler conflict | Another caregiver won | SOS sudah diambil Caregiver lain | Handler saat ini: {handlerName}. | Lihat status terbaru | SOS-03 | Retry to overwrite | Bernard | FLOW-13; TRN-45, TRN-46 |
| CP-179 | SOS-03 | Stale / REST refresh | Current truth uncertain | Periksa status sebelum menangani | Koneksi atau data lokal mungkin sudah tertinggal. | Perbarui status | SYS-05 / SOS-03 | Available-to-claim claim | Bernard | FLOW-13, FLOW-16; TRN-47 |
| CP-180 | SOS-03 | Forbidden / wrong Care Circle | Relation denied | SOS tidak dapat dibuka | Kembali ke Patient Profile yang berhak Anda akses. | Kembali | CG-02 / SYS-02 | Patient, event, or handler identity | Bernard | FLOW-13, FLOW-16 |
| CP-181 | SOS-03 | Session expired / error | Access unsafe | Status SOS belum dapat diperiksa | Masuk kembali atau coba lagi setelah koneksi pulih. | Masuk lagi | CG-01 / SYS-03 / SYS-07 | Current handler truth | Bernard | FLOW-13, FLOW-16 |
| CP-182 | Cross-surface | Closed-tab limitation | Dashboard closed | ChroniCare tidak menjamin peringatan saat dashboard tertutup | MVP ini tidak memakai push notification, SMS, WhatsApp, atau layanan pengiriman bantuan resmi. | None | None within MVP | Delivery promise | Ozan / Bernard | Product boundary; Packet 12 |

## Faskes and BPJS Copy Matrix

The final faskes and BPJS copy is defined by `CP-098` through `CP-105`.
Those entries cover initial scope, filtering, static results, empty results,
source age, unavailable data, offline recovery, `DEMO_FALLBACK`, retry, and
Caregiver session expiry. Every result keeps the direct-confirmation requirement.

## P1 Copy Boundaries

These entries define minimum copy obligations only. They do not promote P1
capabilities into the P0 demo.

| Copy ID | Surface / Expansion | Minimum Copy Contract | Required Action Language | Avoid | Reviewer | Evidence |
|---|---|---|---|---|---|---|
| CP-183 | OWN-01 | State who can manage Care Circle members, whether an invite/change is pending, accepted, conflicted, or denied | Invite member / Save role / Muat ulang | Removing the only active Owner or exposing another Care Circle | Ozan / Bernard | FLOW-17; TRN-56 |
| CP-184 | OWN-02 | State whether a Patient access code is absent, active, newly generated, revoked, or hidden after one-time display | Buat kode / Cabut kode / Buat ulang | Logging or redisplaying the full secret without contract | Bernard | FLOW-18; TRN-57 |
| CP-185 | OWN-03 | State one-profile eligibility, creation progress, success, conflict, or maximum-two limit | Tambah Patient Profile / Perbaiki data | Third Patient Profile | Ozan / Bernard | FLOW-19; TRN-58 |
| CP-186 | CG-07 | Distinguish empty history, filtered history, stale history, forbidden, and load error | Terapkan filter / Hapus filter / Muat ulang | Cross-profile history | Daniel / Bernard | FLOW-20; TRN-59 |
| CP-187 | SOS-04 | Distinguish empty history, event results, stale status, forbidden, and expired session | Muat ulang / Kembali | Background notification or dispatch history | Ozan / Bernard | FLOW-21; TRN-60 |
| CP-188 | PAT-04 medication-taken expansion | State confirmation, pending save, accepted log, duplicate result, inactive item, offline, and error | Tandai sudah diminum / Coba lagi | Dose advice or proof medication was actually taken | Al / Bernard | Feature scope; Packet 07 |
| CP-189 | OCR-01 search/filter expansion | State active filters, results, no matches, stale list, and reset action | Cari / Hapus filter | Batch OCR or full-text exposure | Al / Bernard | Feature scope; Packet 09 |
| CP-190 | CG-05 same-session history expansion | State that history belongs only to the current session and Patient context; clear it on switch | Hapus percakapan / Mulai percakapan baru | Durable full history or cross-profile reuse | Al / Bernard | Feature scope; Packet 11 |
| CP-191 | CG-06 richer filter/provenance expansion | State source, review date, applied filters, and stale boundary | Terapkan filter / Lihat sumber | Ranking, booking, live availability, or BPJS certainty | Ozan | Feature scope; Packet 10 |

## Sensitive Data and Disclosure Rules

| Data or condition | Permitted copy | Prohibited copy |
|---|---|---|
| Patient access code | Say that a code is required, invalid, revoked, or created according to the owning state | Echoing the full code in logs, errors, or general confirmation |
| Patient session | Say that the session ended or must be recreated | Token, cookie, hash, or internal revocation detail |
| Denied Patient Profile | Generic access denial or unavailable resource | Patient name, diagnosis, document, event, or proof the profile exists |
| Wrong Care Circle | Generic denial and return path | Care Circle name, member list, Patient identity, or SOS payload |
| Health document | File name or minimum metadata only when authorized | Public URL, signed URL, raw contents in error copy |
| OCR | Status, source mode, reviewed structured fields, and provenance | Raw OCR text, hidden extraction prompt, provider debug detail |
| BPJS | Masked number with only the allowed last four characters when needed | Full BPJS number |
| Address and location | Broad location only when required by SOS/faskes context | Full home address in AI, logs, or alert copy |
| Provider failure | Safe unavailability category and fallback status | Provider key, endpoint, prompt, stack, or fake live response |
| Generic error | Safe failure and recovery | SQL, schema, storage path, internal ID, or stack trace |

## Requirement Coverage

| Requirement | State Matrix Section | Screen IDs | Copy IDs | Coverage | Gap |
|---|---|---|---|---|---|
| Public role entry | Global/System | SYS-01, PAT-01, CG-01 | CP-001 sampai CP-003, CP-018, CP-056 | Complete | None |
| Patient access and session | Patient/System | PAT-01, PAT-02, SYS-03 | CP-006, CP-018 sampai CP-031 | Complete | None |
| Caregiver auth and membership | Caregiver/System | CG-01, CG-02, SYS-02, SYS-03 | CP-005, CP-007, CP-056 sampai CP-070 | Complete | None |
| Patient check-in | Patient | PAT-02, PAT-03 | CP-025, CP-028, CP-032 sampai CP-039 | Complete | None |
| Reminder and medication reading | Patient | PAT-04 | CP-040 sampai CP-045 | Complete | None |
| Patient switch and stale clearing | Caregiver | CG-02, CG-03 | CP-062, CP-063, CP-071 sampai CP-078 | Complete | None |
| Daily-care update | Caregiver | CG-04 | CP-079 sampai CP-087 | Complete | None |
| Document upload | OCR | OCR-01, OCR-02 | CP-116 sampai CP-133 | Complete | None |
| OCR human review | OCR | OCR-03 | CP-134 sampai CP-146 | Complete | None |
| Patient AI safety | Patient/AI | PAT-05 | CP-046 sampai CP-055, CP-147, CP-149 sampai CP-157 | Complete | None |
| Caregiver AI safety | Caregiver/AI | CG-05 | CP-088 sampai CP-097, CP-148 sampai CP-157 | Complete | None |
| Patient SOS create | SOS | SOS-01 | CP-158 sampai CP-164 | Complete | None |
| Caregiver SOS alert and handling | SOS/System | SOS-02, SOS-03, SYS-05 | CP-009, CP-010, CP-165 sampai CP-182 | Complete | None |
| Static faskes/BPJS helper | Caregiver | CG-06 | CP-098 sampai CP-105 | Complete | None |
| Owner-only deactivation | Lifecycle | OWN-04 | CP-106 sampai CP-115 | Complete | None |
| P1 support | P1 boundaries | OWN-01 sampai OWN-03, CG-07, SOS-04 and expansions | CP-183 sampai CP-191 | Complete at P1 boundary | None |
| Privacy and disclosure | Authorization/System | All protected surfaces | CP-004 sampai CP-016 plus sensitive-data rules | Complete | None |

## State Coverage

| Screen ID | State Matrix Rows | Copy Entries | Recovery Copy Covered | Limitation Copy Covered | Coverage |
|---|---:|---:|---|---|---|
| PAT-01 | 5 | CP-018 sampai CP-023 | Yes | Yes | Complete |
| PAT-02 | 6 | CP-024 sampai CP-031 | Yes | Yes | Complete |
| PAT-03 | 5 | CP-032 sampai CP-039 | Yes | Yes | Complete |
| PAT-04 | 4 | CP-040 sampai CP-045, CP-188 P1 | Yes | Yes | Complete |
| PAT-05 | 6 | CP-046 sampai CP-055, CP-147, CP-149 sampai CP-157 | Yes | Yes | Complete |
| CG-01 | 4 | CP-056 sampai CP-061 | Yes | Yes | Complete |
| CG-02 | 6 | CP-062 sampai CP-070 | Yes | Yes | Complete |
| CG-03 | 4 | CP-071 sampai CP-078 | Yes | Yes | Complete |
| CG-04 | 5 | CP-079 sampai CP-087 | Yes | Yes | Complete |
| CG-05 | 6 | CP-088 sampai CP-097, CP-148 sampai CP-157, CP-190 P1 | Yes | Yes | Complete |
| CG-06 | 4 | CP-098 sampai CP-105, CP-191 P1 | Yes | Yes | Complete |
| CG-07 | P1 boundary | CP-186 | Yes | Yes | Complete at P1 boundary |
| OWN-01 | P1 boundary | CP-183 | Yes | Yes | Complete at P1 boundary |
| OWN-02 | P1 boundary | CP-184 | Yes | Yes | Complete at P1 boundary |
| OWN-03 | P1 boundary | CP-185 | Yes | Yes | Complete at P1 boundary |
| OWN-04 | 6 | CP-106 sampai CP-115 | Yes | Yes | Complete |
| OCR-01 | 4 | CP-116 sampai CP-123, CP-189 P1 | Yes | Yes | Complete |
| OCR-02 | 6 | CP-124 sampai CP-133 | Yes | Yes | Complete |
| OCR-03 | 7 | CP-134 sampai CP-146 | Yes | Yes | Complete |
| SOS-01 | 5 | CP-158 sampai CP-164 | Yes | Yes | Complete |
| SOS-02 | 5 | CP-165 sampai CP-174 | Yes | Yes | Complete |
| SOS-03 | 6 | CP-175 sampai CP-181 | Yes | Yes | Complete |
| SOS-04 | P1 boundary | CP-187 | Yes | Yes | Complete at P1 boundary |
| SYS-01 | 2 | CP-001 sampai CP-003 | Yes | Yes | Complete |
| SYS-02 | System contract | CP-004, CP-005 | Yes | Yes | Complete |
| SYS-03 | System contract | CP-006, CP-007 | Yes | Yes | Complete |
| SYS-04 | System contract | CP-008 | Yes | Yes | Complete |
| SYS-05 | System contract | CP-009, CP-010, CP-016 | Yes | Yes | Complete |
| SYS-06 | System contract | CP-011, CP-012 | Yes | Yes | Complete |
| SYS-07 | System contract | CP-013 sampai CP-015 | Yes | Yes | Complete |

## Flow and Transition Coverage

| Flow ID | Transition IDs | Copy Surfaces | Failure Copy | Recovery Copy | Coverage |
|---|---|---|---|---|---|
| FLOW-01 | TRN-01 sampai TRN-02 | SYS-01, PAT-01, CG-01 | CP-002, CP-003 | CP-001 sampai CP-003 | Complete |
| FLOW-02 | TRN-03 sampai TRN-06, TRN-11 | PAT-01, PAT-02, SYS-02, SYS-03 | CP-020, CP-023, CP-030, CP-031 | CP-004, CP-006, CP-023 | Complete |
| FLOW-03 | TRN-07 sampai TRN-12 | CG-01, CG-02, SYS-02 sampai SYS-04 | CP-058 sampai CP-061, CP-069 | CP-005, CP-007, CP-008 | Complete |
| FLOW-04 | TRN-13 sampai TRN-15, TRN-54 sampai TRN-55 | PAT-02, PAT-03 | CP-033, CP-035, CP-038, CP-039 | CP-028, CP-036 sampai CP-039 | Complete |
| FLOW-05 | TRN-16 sampai TRN-17, TRN-54 sampai TRN-55 | PAT-02, PAT-04 | CP-042 sampai CP-045 | CP-044, CP-045 | Complete |
| FLOW-06 | TRN-18 sampai TRN-20, TRN-54 sampai TRN-55 | CG-02, CG-03 | CP-068, CP-069, CP-078 | CP-063, CP-075 sampai CP-078 | Complete |
| FLOW-07 | TRN-21 sampai TRN-23, TRN-54 sampai TRN-55 | CG-02, CG-04 | CP-081, CP-085 sampai CP-087 | CP-083 sampai CP-087 | Complete |
| FLOW-08 | TRN-24 sampai TRN-28, TRN-54 sampai TRN-55 | OCR-01 sampai OCR-03 | CP-122, CP-126 sampai CP-133, CP-143 sampai CP-146 | CP-122, CP-131, CP-133, CP-143 sampai CP-146 | Complete |
| FLOW-09 | TRN-28 sampai TRN-32, TRN-54 sampai TRN-55 | OCR-01, OCR-03, CG-05 | CP-138, CP-139, CP-141 sampai CP-146 | CP-139 sampai CP-146 | Complete |
| FLOW-10 | TRN-33 sampai TRN-36, TRN-54 sampai TRN-55 | PAT-05, SOS-01 | CP-049 sampai CP-055, CP-149 sampai CP-157 | CP-052 sampai CP-055 | Complete |
| FLOW-11 | TRN-32, TRN-37 sampai TRN-39, TRN-54 sampai TRN-55 | CG-05, CG-03, OCR-03 | CP-092 sampai CP-097, CP-148 sampai CP-157 | CP-095 sampai CP-097 | Complete |
| FLOW-12 | TRN-40 sampai TRN-42, TRN-54 sampai TRN-55 | SOS-01 | CP-159, CP-163, CP-164 | CP-158 sampai CP-164 | Complete |
| FLOW-13 | TRN-42 sampai TRN-47, TRN-54 sampai TRN-55 | SOS-01 sampai SOS-03, SYS-05 | CP-163, CP-170, CP-174, CP-178 sampai CP-182 | CP-170 sampai CP-181 | Complete |
| FLOW-14 | TRN-48 sampai TRN-50, TRN-54 sampai TRN-55 | CG-06 | CP-101 sampai CP-105 | CP-101 sampai CP-105 | Complete |
| FLOW-15 | TRN-51 sampai TRN-55 | OWN-04, CG-02, SYS-02, SYS-03 | CP-107, CP-113 sampai CP-115 | CP-110 sampai CP-115 | Complete |
| FLOW-16 | TRN-05 sampai TRN-12, TRN-47, TRN-54 sampai TRN-55 | SYS-02 sampai SYS-07 and owning surfaces | CP-004 sampai CP-016 | CP-004 sampai CP-016 | Complete |
| FLOW-17 | TRN-56 | OWN-01 | CP-183 | CP-183 | Complete at P1 boundary |
| FLOW-18 | TRN-57 | OWN-02 | CP-184 | CP-184 | Complete at P1 boundary |
| FLOW-19 | TRN-58 | OWN-03 | CP-185 | CP-185 | Complete at P1 boundary |
| FLOW-20 | TRN-59 | CG-07 | CP-186 | CP-186 | Complete at P1 boundary |
| FLOW-21 | TRN-60 | SOS-04 | CP-187 | CP-187 | Complete at P1 boundary |

## Packet Coverage

| Packet | Copy Domain | Screen/State Coverage | Technical-Only Boundary | Coverage |
|---|---|---|---|---|
| 01 | Shell and global errors | SYS-01, SYS-07 | Scaffold, scripts, and dependencies remain absent | Complete as copy contract |
| 02 | Provider and fallback | SYS-06, OCR, AI, faskes | Environment and provider adapter implementation | Complete |
| 03 | Synthetic data and status truth | Cross-surface success/conflict | Schema, migration, and seed implementation | Complete |
| 04 | Caregiver auth/membership | CG-01, CG-02, SYS-02 sampai SYS-04, OWN-01 P1 | Supabase Auth and membership services | Complete |
| 05 | Patient access/isolation | PAT-01, SYS-02 sampai SYS-04, CG-03, OWN-02 P1 | Code hashing and session implementation | Complete |
| 06 | Lifecycle | OWN-04, CG-02, PAT-01, SYS-03 | Transaction, audit, and revocation implementation | Complete |
| 07 | Patient routine | PAT-02 sampai PAT-04 | Daily-care persistence | Complete |
| 08 | Caregiver daily care | CG-02 sampai CG-04, CG-07 P1 | Patient-bound services | Complete |
| 09 | OCR review | OCR-01 sampai OCR-03 | Private Storage, Azure, Zod, and persistence | Complete |
| 10 | Faskes/BPJS | CG-06 | Static dataset loading/versioning | Complete |
| 11 | AI safety/personas | PAT-05, CG-05 | Safety gateway and prompt implementation | Complete |
| 12 | SOS | SOS-01 sampai SOS-04, SYS-05 | Realtime policy and atomic update implementation | Complete |
| 13 | QA/deploy/rehearsal | All copy domains | Checks, deployment, and rehearsal evidence remain absent | Complete as verification contract; QA Not Run |

## Deferred Decisions

- Responsive structure and viewport-specific wrapping or truncation.
- URL and technical route implementation.
- Component and state-machine implementation.
- Wireframes, prototype behavior, and implementation plan.
- Runtime localization infrastructure beyond this Indonesian MVP copy.

## Copy Gaps

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

- Daniel owns clarity, action labels, Patient/Caregiver tone, and accessibility
  wording.
- Ozan reviews scope, demo truth, BPJS/faskes language, lifecycle perception,
  and overclaim.
- Bernard reviews session, authorization, isolation, privacy, conflict,
  Realtime/REST recovery, and data effects.
- Al reviews AI refusal, emergency wording, OCR trust, provider failure, and
  `DEMO_FALLBACK`.
- Changes to scope, roles, providers, safety, privacy, data model, API,
  execution structure, or demo promise require a human verdict in the owning
  canonical document.
- This artifact stays `Proposed` until the named reviewers approve it.
  Documentation completeness is not implementation, QA, deployment, or
  production evidence.
