# Environment and Deploy

Produk: ChroniCare

Status: Locked for MVP v1, deployment not yet executed, refined for chronic illness Patient positioning

DRI: Bernard

Contributors: Al, Daniel

Reviewer: Ozan

## 1. Provider Decisions

| Capability | Provider |
|---|---|
| App hosting | Vercel, root directory `/web` |
| Database | Supabase PostgreSQL |
| Caregiver auth | Supabase Auth |
| File storage | Private Supabase Storage bucket `health-documents` |
| SOS updates | Supabase Realtime |
| Chatbot and structured extraction | Azure OpenAI |
| OCR | Azure AI Document Intelligence |
| Faskes | Versioned static Tangerang dataset in repository or seed |

No WhatsApp, SMS, Push API, service worker, or OS notification provider is part of MVP.

## 2. Current Command Status

The repository is still pre-scaffold. No app command is executable until Packet 01 creates `/web/package.json`.

Planned commands after scaffold:

```powershell
Set-Location web
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

Installation details and official sources are in `docs/technical/dev-installations.md`.

## 3. Environment Files

| Environment | Location | Git status |
|---|---|---|
| Names and fake examples | `web/.env.example` | Committed after scaffold |
| Local secret values | `web/.env.local` | Ignored |
| Test values | `web/.env.test.local` | Ignored |
| Preview/production | Vercel project settings | Never stored in Git |

`.gitignore` must cover `.env`, `.env.*`, and allow `.env.example` explicitly.

## 4. Environment Contract

### Public browser values

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

These values may be bundled into browser code. Do not add another `NEXT_PUBLIC_*` variable without checking whether it contains a secret.

### Server-only Supabase and database values

```bash
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
PATIENT_SESSION_SECRET=
```

- `SUPABASE_SERVICE_ROLE_KEY` is used only by trusted server modules after authorization.
- `DATABASE_URL` uses Supavisor transaction mode for Vercel runtime.
- `DIRECT_URL` uses a direct or session-mode connection for Prisma CLI operations.
- `PATIENT_SESSION_SECRET` contains at least 32 random bytes.

### Azure OpenAI

```bash
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=
AZURE_OPENAI_DEPLOYMENT=
```

### Azure AI Document Intelligence

```bash
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=
AZURE_DOCUMENT_INTELLIGENCE_MODEL=prebuilt-layout
```

### Demo fallback and limits

```bash
OCR_FALLBACK_MODE=disabled
OCR_MAX_FILE_BYTES=5242880
OCR_MAX_PAGES=3
SOS_AUDIO_ENABLED_BY_DEFAULT=false
```

Allowed `OCR_FALLBACK_MODE` values:

- `disabled`: provider failure returns a real error.
- `synthetic-demo`: provider failure may load a fixture and must label it `DEMO_FALLBACK`.

`SOS_AUDIO_ENABLED_BY_DEFAULT` remains `false` because browsers require user interaction before reliable audio playback.

## 5. Environment Validation

At server startup, a Zod schema must validate:

- Valid HTTPS Supabase and Azure URLs outside local development.
- Non-empty server secrets.
- OCR file limit between 1 MB and 5 MB.
- OCR page limit between 1 and 3.
- Allowed fallback mode.
- Public app URL matches the deployment environment.

Missing values for optional provider features must fail only the affected feature. Missing database or session configuration fails application startup.

## 6. Supabase Setup

Development and production use separate Supabase projects if time permits. At minimum, production must not reuse a database containing ad-hoc developer tests.

Required setup:

1. Enable email/password Auth for caregivers.
2. Create private bucket `health-documents`.
3. Restrict bucket MIME types to PDF, JPEG, and PNG.
4. Restrict file size to 5 MB.
5. Apply Prisma migrations.
6. Apply Storage RLS policies.
7. Enable Realtime publication for `sos_events`.
8. Apply Realtime read policies based on active Care Circle membership.
9. Seed synthetic demo data.

Backups cover PostgreSQL. Supabase Storage objects require their own backup consideration outside this hackathon MVP.

## 7. Azure Setup

Required resources:

- One Azure OpenAI resource and deployment accessible from Vercel.
- One Azure AI Document Intelligence resource.
- Quota sufficient for rehearsal and demo.

Smoke checks before feature freeze:

- Azure OpenAI returns one Patient-safe response.
- Azure OpenAI returns one structured extraction that passes Zod.
- Document Intelligence processes the synthetic demo PDF.
- Provider error is converted to a safe app error.
- No request body or credential appears in logs.
- Demo prompts cover type 2 diabetes without diagnosis, dose adjustment, or lab interpretation.

The exact Azure model deployment name remains an environment value. Documentation must not claim a model slug that the Azure resource does not actually expose.

## 8. Seed Strategy

`npm run db:seed` must be idempotent for the demo dataset. Re-running it resets or upserts known demo identifiers without creating duplicate members, Patient Profiles, reminders, or facilities.

Seed includes:

- Dimas Pratama as Owner.
- Rina Pratama as Family Member.
- Maya Pratama as the main Patient Profile with type 2 diabetes.
- Raka Pratama as the second Patient Profile with different chronic-care data for isolation checks.
- Hashed Patient codes supplied to the presenter through a non-committed demo note.
- One confirmed synthetic OCR extraction.
- One private synthetic document ready for live OCR.
- Tangerang facility dataset with source and review dates.
- No real names, phone numbers, BPJS numbers, addresses, documents, or chat content.

## 9. Vercel Configuration

Create one Vercel project with:

```text
Root Directory: web
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: managed by Next.js
Node.js: 24.x
```

Configure all environment variables separately for Preview and Production. Do not expose provider keys to Preview deployments shared with untrusted users.

Prisma client generation runs through `postinstall`. Production migrations run explicitly before or during the controlled deploy process using `npm run db:deploy`; they must not run automatically on every server start.

## 10. Deploy Procedure

1. Ozan confirms feature freeze and records packet status.
2. Bernard checks that migrations are reviewed and backup/fallback is understood.
3. Run local `npm install`, lint, typecheck, test, and build.
4. Run database migration against the selected Supabase target.
5. Run the idempotent seed on the demo target.
6. Configure Vercel environment variables.
7. Deploy Preview.
8. Run the complete smoke checklist on Preview.
9. Promote or deploy Production only after Preview passes.
10. Record URL, commit hash, migration version, seed version, tester, and timestamp.

No deploy is considered successful until the URL has been opened and tested.

## 11. Post-Deploy Smoke Test

Run in this order:

1. Caregiver login.
2. Patient login with Maya code.
3. Maya check-in.
4. Caregiver dashboard shows the new Maya state.
5. Switch Maya to Raka and back without stale data.
6. Upload synthetic document, run OCR, edit, and confirm extraction.
7. Ask Patient chatbot an allowed prompt and an emergency prompt.
8. Ask Caregiver chatbot a preparation prompt and dose-change prompt.
9. Enable notification sound on caregiver dashboard.
10. Trigger Patient SOS from another tab.
11. Confirm visual alert and sound.
12. Click `Saya tangani` and confirm both tabs update.
13. Open faskes/BPJS helper and test one empty filter result.
14. Verify deactivated Patient Profile is excluded from active flows if the demo touches end-of-care.
15. Inspect browser/server logs for secret and private-data leakage.

Any failed P0 item changes the deployment verdict to `Needs Fix` or `Fallback Required`.

## 12. Fallbacks

### Azure OpenAI unavailable

- Patient receives short safety copy with family/SOS/medical escalation.
- Caregiver receives dashboard and facility guidance without fabricated AI output.
- UI labels the response as fallback.

### OCR unavailable

- Keep the uploaded private document.
- Set extraction/document status to `FAILED`.
- Allow explicit retry.
- During the demo, `synthetic-demo` may show a fixture labeled as fallback.
- Never claim live OCR when fixture mode is active.

### Realtime unavailable

- SOS remains committed in PostgreSQL.
- Caregiver dashboard shows disconnected state.
- Refresh or focus triggers a REST fetch of active SOS events.
- Audio may not play; the visual alert remains required.

### Audio blocked

- Show the persistent visual alert.
- Display `Suara belum aktif` with an enable/test control.
- Do not repeatedly attempt autoplay.

### Deploy unavailable

- Use a verified local demo.
- Prepare a recording and screenshots using synthetic data.
- Keep the same demo script and disclose the fallback.

## 13. Rollback

- Vercel: redeploy the last verified build.
- Database: prefer forward-fix migration. Do not run destructive rollback near demo freeze.
- Seed: rerun the idempotent demo reset only against the demo database.
- OCR/AI: disable provider path through environment and use labeled fallback.
- Realtime: keep REST refresh fallback.

## 14. Known MVP Limitations

- Notification and sound require an open, connected caregiver dashboard.
- Browser audio may require a caregiver click before the first SOS.
- OCR accepts one PDF/JPEG/PNG up to 5 MB and three pages.
- OCR extraction requires human confirmation and is not clinical truth.
- Food/menu/pantangan guidance is outside MVP and may not be presented as implemented.
- No background queue, batch OCR, push notification, WhatsApp, SMS, or live location.
- Provider availability depends on Supabase, Azure, Vercel, quota, credentials, and network.
- This setup is a hackathon baseline, not a production compliance posture.

## 15. Change Log

| Tanggal | Perubahan | Alasan | DRI | Reviewer |
|---|---|---|---|---|
| 2026-07-16 | Memperbarui env/deploy untuk Patient Profile, seed diabetes tipe 2, dan smoke test deactivation | Challenge pivot ke chronic illness | Bernard | Ozan |
| 2026-07-15 | Mengunci Supabase, Azure, Vercel, env contract, deploy, OCR, dan SOS web | Human provider and scope verdict | Bernard | Ozan |
