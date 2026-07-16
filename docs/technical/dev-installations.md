# Development Installations

Produk: ChroniCare

Status: Locked for MVP v1, commands become executable after Packet 01 creates `/web`

DRI: Bernard

Contributors: Daniel, Al, Ozan

Reviewer: Ozan

## 1. Baseline Development Stack

| Area | Keputusan |
|---|---|
| Runtime | Node.js 24 LTS |
| Package manager | npm yang dibundel bersama Node.js |
| App | Next.js App Router, TypeScript, `src/` directory |
| UI | Tailwind CSS dan shadcn/ui |
| Validation | Zod 4 |
| Database | Supabase PostgreSQL |
| ORM | Prisma ORM 7 dengan PostgreSQL driver adapter |
| Caregiver auth | Supabase Auth melalui `@supabase/ssr` |
| Patient auth | Access code dan cookie session `httpOnly` yang dikelola aplikasi |
| Storage | Private Supabase Storage bucket |
| Realtime | Supabase Realtime untuk `sos_events` |
| Chatbot | Azure OpenAI melalui package `openai` |
| OCR | Azure AI Document Intelligence melalui `@azure/ai-form-recognizer` |
| Unit/integration test | Vitest dan Testing Library |
| End-to-end test | Playwright, Chromium |
| Deploy | Vercel dengan project root `/web` |

Referensi resmi:

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [shadcn/ui for Next.js](https://ui.shadcn.com/docs/installation/next)
- [Supabase Auth for Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma)
- [Supabase private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Realtime database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- [Prisma ORM with Next.js](https://www.prisma.io/docs/guides/frameworks/nextjs)
- [Azure OpenAI JavaScript library](https://github.com/openai/openai-node#readme)
- [Azure AI Document Intelligence JavaScript library](https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-form-recognizer-readme?view=azure-node-latest)
- [Next.js testing guide](https://nextjs.org/docs/app/guides/testing)
- [Playwright installation](https://playwright.dev/docs/intro)

## 2. Prerequisites

Install these tools before Packet 01:

- Git.
- Node.js 24 LTS. Do not use Node.js Current for the hackathon.
- A Supabase project for development.
- An Azure OpenAI resource and deployment.
- An Azure AI Document Intelligence resource.
- A Vercel account for deployment.
- Visual Studio Code or another editor with TypeScript support.

Verify the local runtime in PowerShell:

```powershell
node --version
npm --version
git --version
```

Expected Node output starts with `v24.`. npm and Git only need to return valid version numbers.

## 3. Scaffold the Application

Run from the repository root. The application is placed in `/web` because the root already contains project documentation.

```powershell
npx create-next-app@latest web --typescript --eslint --tailwind --app --src-dir --turbopack --import-alias "@/*" --use-npm --disable-git --yes
Set-Location web
```

The command must create TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, and `src/`. If `web` already exists, stop and inspect it. Do not scaffold over an existing application.

## 4. Install Runtime Dependencies

Run from `/web`:

```powershell
npm install @supabase/supabase-js @supabase/ssr @prisma/client @prisma/adapter-pg pg dotenv zod openai @azure/identity @azure/ai-form-recognizer
```

Package responsibilities:

| Package | Used for |
|---|---|
| `@supabase/supabase-js` | Auth client, private Storage, and Realtime subscription |
| `@supabase/ssr` | Cookie-based caregiver session in Next.js App Router |
| `@prisma/client` | Generated type-safe database client |
| `@prisma/adapter-pg` and `pg` | PostgreSQL driver used by Prisma in Node.js runtime |
| `dotenv` | Loading local configuration for Prisma scripts |
| `zod` | API request, response, env, and OCR extraction validation |
| `openai` | `AzureOpenAI` client for server-side chatbot and structured extraction |
| `@azure/identity` | Optional Microsoft Entra ID authentication for Azure services |
| `@azure/ai-form-recognizer` | Azure AI Document Intelligence OCR client |

Do not install browser-only OpenAI clients. Azure credentials must remain server-side.

## 5. Install Development Dependencies

Run from `/web`:

```powershell
npm install --save-dev prisma tsx @types/pg vitest @vitejs/plugin-react jsdom vite-tsconfig-paths @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test supabase
npx playwright install chromium
```

`supabase` CLI is installed locally so the version is locked in `package-lock.json`. Docker is only required if the team chooses to run the full Supabase stack locally. The hackathon default uses a managed development project, so `npx supabase start` is optional.

## 6. Initialize shadcn/ui

Run from `/web` after Next.js exists:

```powershell
npx shadcn@latest init -t next -d
npx shadcn@latest add button card dialog form input label select table tabs textarea badge alert separator sheet skeleton sonner
```

Daniel owns the visual tokens and component composition. Do not import every registry component. Add another component only when a packet needs it.

## 7. Initialize Prisma

Run from `/web`:

```powershell
npx prisma init --output ../src/generated/prisma
```

The command creates `web/prisma/schema.prisma`, `web/prisma.config.ts`, and a local environment file. Keep scaffold placeholders minimal during Packet 01, then replace the generated sample schema with the locked model in `docs/technical/data-model.md` during Packet 03.

Use two Supabase connection strings:

- `DATABASE_URL`: Supavisor transaction pooler for Next.js runtime.
- `DIRECT_URL`: direct or session-mode connection for Prisma migration, introspection, seed, and Studio.

Never put either value in Git.

## 8. Required Package Scripts

Packet 01 must add these scripts to `web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

These scripts are planned, not currently available. They become implementation truth only after `web/package.json` exists.

## 9. Environment File

Create `web/.env.example` with variable names and non-secret defaults only. Developers copy it to `web/.env.local` and insert credentials outside Git.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

Generate a local session secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output manually into `web/.env.local`. Do not paste it into chat, issues, screenshots, or committed files.

## 10. Supabase Setup

In the Supabase dashboard:

1. Create a development project.
2. Enable email/password caregiver authentication.
3. Create private bucket `health-documents`.
4. Restrict the bucket to `application/pdf`, `image/jpeg`, and `image/png`.
5. Set the file limit to 5 MB.
6. Enable Realtime for `sos_events` after the migration creates the table.
7. Apply RLS policies described in `docs/technical/data-model.md`.
8. Copy the publishable key, service role key, transaction pooler URL, and direct URL into `web/.env.local`.

The service role key bypasses RLS. It may only be used by server-only modules after application authorization succeeds.

Optional local Supabase commands:

```powershell
npx supabase init
npx supabase start
npx supabase status
npx supabase stop
```

Do not run this optional flow during the hackathon unless Docker Desktop already works on every developer machine.

## 11. Azure Setup

Azure OpenAI requires an endpoint, deployment name, supported API version, and either API key or Entra credential. Azure AI Document Intelligence requires its own endpoint and credential.

The MVP uses:

- Azure OpenAI for Patient/Caregiver chatbot and structured extraction from OCR text.
- Azure AI Document Intelligence model `prebuilt-layout` for OCR text, selection marks, and tables.
- API keys for the hackathon unless Entra ID is already configured.

Do not combine the two Azure keys under one env name. Do not send the original document to Azure OpenAI. Send only the minimum OCR text needed for structured extraction.

## 12. First Installation Verification

After Packet 01 creates the app, run from `/web`:

```powershell
npm install
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Open `http://localhost:3000` and verify the caregiver and Patient shells. Stop the dev server with `Ctrl+C`.

Database commands only run after `DATABASE_URL` and `DIRECT_URL` are valid:

```powershell
npm run db:migrate -- --name init
npm run db:seed
npm run db:studio
```

Do not run migrations against a production database during development.

## 13. Common Installation Failures

| Failure | Check |
|---|---|
| `create-next-app` refuses to run | Confirm the target is the new `/web` directory |
| Node version rejected | Install Node.js 24 LTS and reopen the terminal |
| Prisma cannot connect | Confirm pooled URL for runtime and direct/session URL for CLI |
| `P1001` or timeout | Check Supabase project status, password encoding, IPv4/pooler choice, and firewall |
| Supabase upload denied | Confirm bucket is private and the upload policy or signed upload route exists |
| Realtime event absent | Enable the `sos_events` table in the Realtime publication and verify RLS |
| Azure OpenAI returns 401/404 | Confirm endpoint, deployment name, API version, and key belong to the same resource |
| OCR fails | Confirm Document Intelligence endpoint/key, supported MIME type, 5 MB limit, and three-page limit |
| SOS sound is silent | Click `Aktifkan suara notifikasi`; browsers may block script-initiated audio before user interaction |
| Playwright browser missing | Run `npx playwright install chromium` |

## 14. Update Rule

Do not edit a command based on memory. Check the current official documentation and the installed package version first. Any changed dependency, command, env name, or provider must also update `README.md`, `AGENTS.md`, `docs/technical/env-and-deploy.md`, and the relevant packet.
