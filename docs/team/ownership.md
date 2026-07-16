# Team Ownership

Produk: ChroniCare

Status: Locked for MVP v1

DRI dokumen: Ozan

Reviewer: Bernard, Daniel, Al

## 1. Tujuan

Dokumen ini mengunci pembagian kerja tim selama hackathon 30 jam. Satu orang menjadi DRI untuk setiap packet dan dokumen. Contributor tetap bertanggung jawab atas bagian sesuai bidangnya, sedangkan reviewer memeriksa hasil sebelum status berubah menjadi `Done`.

## 2. Peran Tim

| Nama | Peran utama | Keputusan yang dimiliki |
|---|---|---|
| Bernard | API dan database | Kontrak API, Prisma schema, migration, Supabase, auth server-side, storage, Realtime, deployment integration |
| Ozan | QA dan product management | Scope, prioritas, packet status, acceptance criteria, QA evidence, demo freeze, pitch readiness |
| Daniel | UI/UX | Information architecture, user flow, component behavior, responsive layout, accessibility, UX copy |
| Al | AI | Azure OpenAI, Azure Document Intelligence, prompt, extraction schema, AI safety, fallback AI |

## 3. Aturan Ownership

- DRI mengambil keputusan harian selama tidak mengubah scope, role, safety, privacy, provider, data model terkunci, API terkunci, atau demo flow.
- Perubahan lintas bidang perlu persetujuan DRI terkait dan Ozan.
- Bernard wajib mereview perubahan yang menyentuh API, database, auth, storage, Realtime, atau deploy.
- Daniel wajib mereview perubahan user-facing, termasuk empty, loading, error, dan accessibility state.
- Al wajib mereview perubahan chatbot, OCR, structured extraction, emergency response, atau AI fallback.
- Ozan menutup packet hanya setelah acceptance criteria dan bukti QA tercatat.

## 4. Document Ownership

| Dokumen | DRI | Contributor | Reviewer |
|---|---|---|---|
| `README.md` | Ozan | Semua | Bernard |
| `AGENTS.md` | Ozan | Bernard, Al | Daniel |
| `docs/product/product-context.md` | Ozan | Daniel | Bernard, Al |
| `docs/product/hackathon-mvp-scope-demo.md` | Ozan | Daniel, Al | Bernard |
| `docs/product/feature-scope.md` | Ozan | Semua | Bernard |
| `docs/product/user-journeys.md` | Daniel | Ozan | Bernard, Al |
| `docs/technical/architecture.md` | Bernard | Daniel, Al | Ozan |
| `docs/technical/data-model.md` | Bernard | Al | Ozan |
| `docs/technical/api.md` | Bernard | Al, Daniel | Ozan |
| `docs/technical/ai-guardrails.md` | Al | Bernard | Ozan, Daniel |
| `docs/technical/env-and-deploy.md` | Bernard | Al | Ozan |
| `docs/technical/dev-installations.md` | Bernard | Semua | Ozan |
| `docs/security-privacy.md` | Bernard | Al, Ozan | Daniel |
| `docs/execution/workflow.md` | Ozan | Semua | Bernard |
| `docs/execution/packets.md` | Ozan | Semua | Bernard |
| `docs/pitch/demo-script.md` | Ozan | Daniel, Al | Bernard |
| `docs/pitch/pitch-structure.md` | Ozan | Daniel | Bernard |
| `docs/pitch/judging-rubric-mapping.md` | Ozan | Semua | Bernard |
| `docs/qa/demo-readiness-checklist.md` | Ozan | Semua | Bernard |

## 5. Packet Ownership

| Packet | DRI | Lead bidang | Reviewer |
|---|---|---|---|
| 01. Scaffold and Tooling Baseline | Bernard | Daniel untuk shell UI, Al untuk provider boundary | Ozan |
| 02. Env and Provider Boundary | Bernard | Al untuk Azure boundary/fallback, Ozan untuk secret/privacy check | Ozan |
| 03. Data Schema, Prisma, and Seed Base | Bernard | Ozan untuk seed/demo data, Daniel untuk data yang dibutuhkan UI | Ozan |
| 04. Caregiver Auth and Membership Authorization | Bernard | Daniel untuk auth UX assumptions, Ozan untuk role QA | Ozan |
| 05. Patient Access Code and Profile Isolation | Bernard | Daniel untuk profile switching UX, Ozan untuk isolation QA | Ozan |
| 06. Patient Profile Lifecycle Deactivation | Bernard | Daniel untuk careful lifecycle copy, Ozan untuk destructive-action QA | Ozan |
| 07. Patient Homepage and Check-In | Daniel | Bernard untuk check-in API/data, Ozan untuk patient journey QA | Ozan |
| 08. Caregiver Dashboard, Medication, and Reminder | Daniel | Bernard untuk daily-care API/data, Ozan untuk caregiver journey QA | Ozan |
| 09. Document Upload, OCR, and Review | Al | Bernard untuk storage/API, Daniel untuk review UI | Ozan |
| 10. Faskes and BPJS Helper | Daniel | Bernard untuk data/API, Al untuk safe wording review | Ozan |
| 11. Chatbot Safety Gateway and Personas | Al | Bernard untuk gateway/API/context, Daniel untuk chat UI | Ozan |
| 12. SOS Realtime and Handling | Bernard | Daniel untuk alert UI, Al untuk emergency copy | Ozan |
| 13. QA, Deploy, and Demo Rehearsal | Ozan | Semua sesuai bidang | Ozan mencatat evidence, Bernard memberi technical sign-off |

## 6. Change Control

Status `Locked for MVP v1` berarti implementasi boleh menambah detail teknis yang tidak mengubah kontrak. Perubahan berikut wajib dicatat dalam bagian change log dokumen terkait:

- Entity, field, enum, relation, atau constraint database.
- Endpoint, method, request, response, auth, atau error code API.
- Role permission atau profile isolation.
- AI/OCR provider, extraction flow, safety rule, atau fallback.
- Supabase, Vercel, Azure, atau dependency utama.
- Urutan demo, fitur P0, dan batas 30 jam.

Format change log:

| Tanggal | Dokumen | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|---|
| YYYY-MM-DD | path | Ringkasan konkret | Dampak atau blocker | Nama | Nama |

## 7. Status Saat Ini

- Repo masih documentation-first dan belum memiliki scaffold aplikasi.
- Stack, provider, model data, kontrak API, OCR flow, serta SOS web sudah dikunci dalam dokumen teknis.
- Status packet tetap `Draft` sampai file aplikasi, command, credential demo, dan dependency packet benar-benar tersedia.
- QA checklist tetap `Not Run` sampai ada implementasi yang diuji.

## 8. Change Log

| Tanggal | Dokumen | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|---|
| 2026-07-16 | `docs/team/ownership.md` | Memecah ownership packet dari 9 menjadi 13 packet dan memakai hybrid role ownership per bidang | Menyesuaikan execution packet agar setiap packet layak dikerjakan dalam satu prompt implementasi | Ozan | Bernard |
| 2026-07-16 | `docs/team/ownership.md` | Memecah ownership packet dari 7 menjadi 9 packet | Menyesuaikan execution packet agar OCR, daily care, SOS, dan QA lebih implementable dalam satu sesi | Ozan | Bernard |
| 2026-07-16 | `docs/team/ownership.md` | Mengubah packet ownership ke Patient terminology | Menyelaraskan execution docs dengan chronic illness Patient positioning | Ozan | Bernard |
