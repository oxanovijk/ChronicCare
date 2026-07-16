# Packet 01 and 02 Pre-Packet-03 Polish Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the verified Packet 01 scaffold, finish Packet 02 provider boundaries, and confirm that the progressive Patient Profile data model introduces no backward dependency before Packet 03 starts.

**Architecture:** Keep the existing Next.js scaffold and provider factories unchanged except for test-harness compatibility. Vitest maps Next.js's framework-provided `server-only` marker to an empty test stub, while production builds continue using Next.js's real client-import guard.

**Tech Stack:** Next.js 16, TypeScript, Zod 4, Vitest, Playwright, Supabase JavaScript client, Azure OpenAI SDK, Azure AI Document Intelligence SDK.

## Global Constraints

- Do not add or change providers, packages, database schema, migrations, or real credentials.
- Keep all provider calls server-side.
- `.env.example` contains names and documented non-secret defaults only.
- The progressive Patient Profile model remains Packet 03 scope.
- Packet status changes require fresh automated and manual evidence.
- Do not commit or push without explicit human instruction.

---

### Task 1: Lock Env Example and Server-Module Testability

**Files:**
- Modify: `web/tests/unit/env-validation.test.ts`
- Modify: `web/tests/unit/provider-boundary.test.ts`
- Modify: `web/vitest.config.ts`
- Create: `web/tests/mocks/server-only.ts`
- Modify: `web/.env.example`

**Interfaces:**
- Consumes: existing `parseProviderFlags`, provider factories, and Next.js `server-only` markers.
- Produces: a parseable `.env.example` with `NEXT_PUBLIC_APP_URL=http://localhost:3000` and a Vitest-only alias for importing server modules.

- [x] **Step 1: Add failing `.env.example` regression**

Assert the parsed example contains:

```ts
expect(example.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
```

- [x] **Step 2: Run the regression and verify RED**

Run:

```powershell
npm test -- env-validation
```

Expected: failure because `NEXT_PUBLIC_APP_URL` is currently empty.

- [x] **Step 3: Add failing real provider-import regression**

Import `createSupabaseAdminClient`, `createAzureOpenAIClient`, and `createDocumentIntelligenceProvider` in the provider-boundary test and assert missing credentials produce sanitized errors or `DEMO_FALLBACK`.

- [x] **Step 4: Run the provider regression and verify RED**

Run:

```powershell
npm test -- provider-boundary
```

Expected: import failure for unresolved `server-only`.

- [x] **Step 5: Apply minimal implementation**

Restore the local app URL default, create an empty test stub, and map `server-only` to that stub only in `vitest.config.ts`.

- [x] **Step 6: Run targeted tests and verify GREEN**

Run:

```powershell
npm test -- env-validation
npm test -- provider-boundary
```

Expected: all targeted tests pass without credentials or provider calls.

### Task 2: Align Documentation and Status Evidence

**Files:**
- Modify: `docs/technical/dev-installations.md`
- Modify: `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
- Modify: `docs/execution/packets/02-env-and-provider-boundary.md`
- Modify: `docs/execution/packets.md`

**Interfaces:**
- Consumes: verified runtime commands and manual QA evidence.
- Produces: aligned env names and evidence-based Packet 01/02 completion records.

- [x] **Step 1: Align env documentation**

Add the locked non-secret defaults:

```text
OCR_MAX_FILE_BYTES=5242880
OCR_MAX_PAGES=3
SOS_AUDIO_ENABLED_BY_DEFAULT=false
```

- [x] **Step 2: Run complete automated verification**

Run from `/web`:

```powershell
npm install
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Expected: every command exits zero; shell routes remain statically prerendered.

- [x] **Step 3: Verify the client boundary**

Temporarily import a server env module from a disposable Client Component and verify `npm run build` fails with the `server-only` boundary error. Remove the disposable file and verify the normal build passes again.

- [x] **Step 4: Run manual QA**

At 390x844 and 1440x900, verify `/`, `/caregiver`, and `/patient/login` render, remain keyboard accessible, have no horizontal scroll or fresh console errors, make no provider request, and do not overclaim feature readiness.

- [x] **Step 5: Scan for secrets and env drift**

Verify only `.env.example` is tracked, no credential-like values appear, and env names match the locked docs.

- [x] **Step 6: Update packet evidence**

Keep Packet 01 `Done`, mark Packet 02 `Done` only after all prior steps pass, and add dated evidence to both packet files and the status record.

- [x] **Step 7: Verify final documentation**

Run `git diff --check`, Markdown table/link checks, and confirm Packet 03 remains `Draft`.
