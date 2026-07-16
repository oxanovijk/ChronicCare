# ChroniCare

Care Circle berbasis web untuk membantu pasien chronic illness dan caregiver menjaga rutinitas perawatan jangka panjang. Patient mendapat antarmuka yang cheerful, sederhana, dan suportif untuk check-in, reminder, chatbot, dan SOS. Caregiver mendapat dashboard yang lebih informatif untuk melihat konteks Patient aktif, meninjau dokumen hasil OCR, menangani SOS, serta mencari faskes/BPJS di Tangerang.

Status repo: documentation-first, pre-scaffold. Stack dan kontrak sudah dikunci, tetapi aplikasi dan command belum tersedia sampai Packet 01 membuat `/web`.

Refinement status: positioning sudah berubah menjadi chronic illness care. Istilah internal untuk MVP memakai `Patient Profile`, `patientProfileId`, dan route `patient-profiles` pada technical docs dan execution packets.

## Product Boundary

ChroniCare membantu navigasi, rutinitas, dan koordinasi perawatan jangka panjang untuk pasien chronic illness. Produk ini bukan alat diagnosis, pengganti dokter/IGD/ambulans/BPJS, hospital information system, nutrition prescription system, atau klaim compliance produksi.

## Challenge

Hackathon challenge yang dipilih:

> How can we improve how people manage and live with chronic illness over the long term?

ChroniCare menjawab challenge ini dengan menjaga konteks perawatan harian, dokumen kesehatan, dukungan caregiver, dan eskalasi bantuan berada dalam satu Care Circle yang aman dan mudah dipakai.

Demo condition: diabetes tipe 2.

Diabetes tipe 2 dipakai sebagai skenario demo agar cerita chronic illness terasa konkret. ChroniCare tetap diposisikan sebagai care coordination platform, bukan aplikasi klinis khusus diabetes.

## Actors

- Owner: caregiver utama atau pengelola Care Circle yang memegang tindakan administratif sensitif.
- Family Member: caregiver aktif yang dapat memperbarui daily care, meninjau dokumen, dan menangani SOS.
- Patient: pasien chronic illness dengan session yang terikat pada satu Patient Profile melalui access code.

Satu Care Circle memiliki tepat satu Owner aktif dan maksimal dua Patient Profile untuk MVP hackathon.

## Two-Minute Demo

1. Patient masuk dengan kode dan membuka homepage cheerful yang sederhana.
2. Patient mengisi check-in atau memakai chatbot untuk keluhan/rutinitas terkait diabetes tipe 2.
3. Caregiver membuka dashboard Patient aktif.
4. Caregiver mengunggah dokumen sintetis, meninjau OCR, lalu mengonfirmasi extraction.
5. Caregiver memakai chatbot dengan konteks yang sudah dikonfirmasi untuk persiapan kontrol dokter.
6. Patient menekan SOS jika kondisi memburuk.
7. Dashboard caregiver yang terbuka menampilkan alert dan bunyi, lalu caregiver menekan `Saya tangani`.
8. Caregiver membuka helper faskes/BPJS Tangerang.

## MVP Features

- Care Circle dengan Owner dan Family Member.
- Caregiver auth melalui Supabase Auth.
- Patient login memakai hashed access code dan session `httpOnly`.
- Patient Profile switching dengan authorization server-side.
- Patient homepage yang cheerful, sederhana, dan suportif.
- Caregiver dashboard yang informatif dan context-heavy.
- Check-in, medication log, reminder, dan health note dasar.
- Private document upload ke Supabase Storage.
- OCR melalui Azure AI Document Intelligence dan structured extraction melalui Azure OpenAI.
- Caregiver review gate sebelum extraction dipakai chatbot.
- Patient dan Caregiver chatbot dengan guardrail medis.
- Supabase Realtime SOS untuk dashboard yang sedang terbuka, visual alert, audio opt-in, dan atomic handling.
- Static Tangerang faskes/BPJS helper.
- End-of-care / deactivate Patient Profile flow sebagai MVP lifecycle action yang sensitif dan non-destructive.

## Explicit Non-MVP / Parking Lot

- Food/menu and pantangan guidance tidak masuk MVP implementation packet.
- Jika nanti dibuat, fitur makanan harus berbasis catatan dari dokter/nutrisionis/caregiver dan tidak boleh menjadi rekomendasi klinis otomatis dari AI.
- Subscription/payment sungguhan tidak masuk MVP. Any cancel-subscription screen is dummy/contextual only.

## Locked Stack

| Area | Choice |
|---|---|
| App | Next.js App Router, TypeScript, Node.js 24 LTS, npm |
| UI | Tailwind CSS, shadcn/ui, Zod 4 |
| Database | Supabase PostgreSQL, Prisma ORM 7 |
| Auth/Storage/Realtime | Supabase |
| AI | Azure OpenAI |
| OCR | Azure AI Document Intelligence |
| Tests | Vitest, Testing Library, Playwright |
| Deploy | Vercel with root `/web` |

## Local Development

Commands are unavailable today because `/web/package.json` does not exist. Packet 01 will scaffold the app using the verified steps in [Development Installations](docs/technical/dev-installations.md).

Planned workflow after scaffold:

```powershell
Set-Location web
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Do not report these commands as passing until the files exist and each command runs successfully.

## Environment Names

Secret values belong in `web/.env.local` and Vercel settings, never in Git.

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
PATIENT_SESSION_SECRET=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=
AZURE_OPENAI_DEPLOYMENT=
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=
AZURE_DOCUMENT_INTELLIGENCE_MODEL=prebuilt-layout
OCR_FALLBACK_MODE=disabled
```

Note: env docs now use `PATIENT_SESSION_SECRET`. Do not reintroduce legacy `PARENT_*` names unless a human explicitly requests a backward-compatibility note.

## Team

- Bernard: API dan database.
- Ozan: QA dan product management.
- Daniel: UI/UX.
- Al: AI dan OCR extraction.

Ownership per dokumen dan packet ada di [Team Ownership](docs/team/ownership.md).

## Documentation Map

Product:

- [Product Context](docs/product/product-context.md)
- [Hackathon Scope and Demo](docs/product/hackathon-mvp-scope-demo.md)
- [Feature Scope](docs/product/feature-scope.md)
- [User Journeys](docs/product/user-journeys.md)

Technical:

- [Architecture](docs/technical/architecture.md)
- [Data Model](docs/technical/data-model.md)
- [API Contract](docs/technical/api.md)
- [AI Guardrails](docs/technical/ai-guardrails.md)
- [Environment and Deploy](docs/technical/env-and-deploy.md)
- [Development Installations](docs/technical/dev-installations.md)
- [Security and Privacy](docs/security-privacy.md)

Execution and demo:

- [Workflow](docs/execution/workflow.md)
- [Packet Index](docs/execution/packets.md)
- [Demo Script](docs/pitch/demo-script.md)
- [Pitch Structure](docs/pitch/pitch-structure.md)
- [Judging Rubric Mapping](docs/pitch/judging-rubric-mapping.md)
- [Demo Readiness Checklist](docs/qa/demo-readiness-checklist.md)
- [Agent Rules](AGENTS.md)

## Implementation Entry Point

Saat mulai coding, baca berurutan:

1. [AGENTS.md](AGENTS.md)
2. [Packet Index](docs/execution/packets.md)
3. Packet yang diminta, misalnya `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
4. Technical docs yang dirujuk packet tersebut

Implementation truth saat ini:

- Gunakan Patient terminology: `Patient Profile`, `patientProfileId`, `patient_profiles`, dan route `patient-profiles`.
- Demo utama memakai Maya Pratama dengan diabetes tipe 2 dan Raka Pratama untuk isolation.
- End-of-care/deactivate Patient Profile masuk MVP sebagai flow non-destructive dan Owner-only.
- Food/menu/pantangan serta real subscription/payment tetap out of scope.
- Jangan mengklaim fitur berjalan sampai ada implementasi dan checks.

## Demo Data

Use fictional data only. Demo story uses a synthetic diabetes tipe 2 scenario, synthetic health documents, dummy contacts/BPJS numbers, and versioned facility data. Do not copy real patient records, family messages, lab files, or medication data.

## Known MVP Limitations

- The application is not scaffolded yet.
- Documentation has been refined to Patient terminology, but the application is still pre-scaffold.
- Demo condition is diabetes tipe 2, but ChroniCare is not a diabetes diagnosis or treatment app.
- OCR accepts one PDF/JPEG/PNG up to 5 MB and three pages; a labeled synthetic fallback may be used.
- OCR output needs caregiver confirmation and is not medical truth.
- SOS alert and sound require an open, connected caregiver dashboard. Browser audio needs user opt-in.
- No WhatsApp, SMS, OS notification, Push API, service worker, live location, or official emergency dispatch.
- Faskes data is static and must be confirmed directly with the facility/BPJS.
- Chatbot is non-diagnostic and may return a safe fallback.
- Food/menu guidance is out of MVP and must not be framed as personal clinical advice.
- QA checklist remains `Not Run` until implementation exists and tests run.
- Commit and push are not part of documentation preparation unless explicitly requested.
