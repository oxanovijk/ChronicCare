# ChroniCare Visual Browser Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task with review checkpoints. Do not dispatch subagents unless the user explicitly requests delegation.

**Goal:** Build a polished, route-based, visual-only ChroniCare browser prototype in `/web` that covers the connected Patient, Caregiver, OCR, chatbot, SOS, and faskes/BPJS demo flow with deterministic mock state.

**Architecture:** A Next.js App Router application renders thin route pages over shared Patient and Caregiver shells. One client-side `PrototypeStateProvider` owns the small amount of cross-route presentation state; all records and response fixtures are typed synthetic constants. There are no APIs, provider clients, database models, auth integrations, migrations, seed commands, or deployment configuration.

**Tech Stack:** Node.js 24 LTS, npm, Next.js App Router, React, TypeScript, Tailwind CSS, local Plus Jakarta Sans package, Phosphor icons, Vitest, Testing Library, and Playwright Chromium.

## Global Constraints

- Follow `PRODUCT.md`, `DESIGN.md`, `docs/design/00-screen-inventory.md`, `01-user-flow-map.md`, `02-screen-specifications.md`, `03-state-matrix.md`, `04-ux-copy-matrix.md`, and `05-responsive-behavior.md`.
- Use the approved route-based flow with ordinary product controls and no prototype toolbar or screen gallery.
- All Patient, caregiver, OCR, SOS, facility, document, and care data is synthetic.
- Do not add API wiring, Route Handlers, database access, Supabase Auth, Supabase Storage, Realtime, Azure AI Document Intelligence, Azure OpenAI, Prisma, Zod, migrations, seeds, deployment, analytics, or production claims.
- Patient UI is simple, warm, mature, mobile-first, at least 18px body text, and at least 48px touch targets.
- Caregiver UI is calm, scannable, operational, and maintains explicit active-Patient context with at least 44px targets where practical.
- OCR is original-first and evidence-oriented; pending, confirmed, rejected, failed, and `DEMO_FALLBACK` states remain distinct.
- Caregiver chat may show only daily-care and confirmed OCR context; pending/rejected/failed OCR never appears as trusted context.
- SOS remains urgent, persistent, non-playful, visually available without sound, and never claims emergency dispatch or closed-tab delivery.
- Faskes/BPJS data is static demo guidance with visible source/review metadata and direct-confirmation copy; no ranking, realtime availability, or guaranteed BPJS acceptance.
- Use the exact visual tokens and responsive rules in `DESIGN.md`; no gradients, glassmorphism, glow, oversized rounded cards, decorative card grids, SaaS hero, random illustration, or unsupported health metrics.
- Do not commit or push. End each task with a working-tree checkpoint only.

## File Structure

```text
web/
  e2e/
    prototype-flow.spec.ts
    visual-regression.spec.ts
  public/
    demo-document.svg
  src/
    app/
      caregiver/
        access/page.tsx
        chat/page.tsx
        documents/
          page.tsx
          review/page.tsx
          upload/page.tsx
        faskes/page.tsx
        sos/page.tsx
        layout.tsx
        page.tsx
      patient/
        access/page.tsx
        chat/page.tsx
        check-in/page.tsx
        home/page.tsx
        sos/page.tsx
      globals.css
      layout.tsx
      page.tsx
    components/
      caregiver-shell.tsx
      chat-surface.tsx
      document-review.tsx
      patient-shell.tsx
      patient-switcher.tsx
      prototype-state.tsx
      sos-alert.tsx
      ui.tsx
    lib/
      mock-data.ts
      types.ts
    test/
      setup.ts
      render.tsx
      access.test.tsx
      caregiver.test.tsx
      document-review.test.tsx
      facilities.test.tsx
      patient.test.tsx
      prototype-state.test.tsx
      sos.test.tsx
  playwright.config.ts
  vitest.config.ts
```

Route files remain thin and compose focused components. `ui.tsx` contains only the small native primitives used repeatedly; it is not a speculative component library.

---

### Task 1: Scaffold the Minimal App and Test Harness

**DRI:** Bernard for scaffold/tooling; Daniel reviews visual foundation; Ozan reviews prototype wording.

**Files:**

- Create: `web/` using the locked Next.js scaffold command
- Modify: `web/package.json`
- Modify: `web/src/app/layout.tsx`
- Modify: `web/src/app/globals.css`
- Modify: `web/src/app/page.tsx`
- Create: `web/vitest.config.ts`
- Create: `web/src/test/setup.ts`
- Create: `web/playwright.config.ts`
- Create: `web/src/test/access.test.tsx`

**Interfaces:**

- Produces `npm run dev`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, and `build`.
- Produces canonical CSS custom properties and the global Plus Jakarta Sans class.
- Produces the root role-entry route used by later tasks.

- [ ] **Step 1: Recheck the pre-scaffold boundary**

Run from the repository root:

```powershell
git status --short
Test-Path web
node --version
npm.cmd --version
```

Expected: existing untracked product/design/spec/plan files remain visible; `Test-Path web` is `False`; Node output begins with `v24.`. If `/web` exists, stop and inspect rather than scaffolding over it.

- [ ] **Step 2: Scaffold only the locked frontend baseline**

Run:

```powershell
npx create-next-app@latest web --typescript --eslint --tailwind --app --src-dir --turbopack --import-alias "@/*" --use-npm --disable-git --yes
```

Expected: `/web` contains an App Router TypeScript application and no nested `.git` directory.

- [ ] **Step 3: Install the minimum prototype dependencies**

Run from `/web`:

```powershell
npm.cmd install @phosphor-icons/react @fontsource-variable/plus-jakarta-sans
npm.cmd install --save-dev vitest @vitejs/plugin-react jsdom vite-tsconfig-paths @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Do not install the backend/provider packages listed for later production packets.

- [ ] **Step 4: Add exact scripts and test configuration**

Set these scripts in `web/package.json`:

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
    "test:e2e": "playwright test"
  }
}
```

Create `web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
```

Create `web/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `web/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 5: Write the failing role-entry smoke test**

Create `web/src/test/access.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("offers separate Patient and caregiver access paths", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Pilih cara masuk" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /masuk sebagai pasien/i })).toHaveAttribute("href", "/patient/access");
  expect(screen.getByRole("link", { name: /masuk sebagai caregiver/i })).toHaveAttribute("href", "/caregiver/access");
  expect(screen.queryByText("Maya Pratama")).not.toBeInTheDocument();
});
```

- [ ] **Step 6: Run the test and verify the expected failure**

Run:

```powershell
npm.cmd test -- access
```

Expected: FAIL because the generated starter page does not contain the ChroniCare role entry.

- [ ] **Step 7: Implement the root shell, token foundation, and role entry**

In `layout.tsx`, import the local font package and use Indonesian metadata:

```tsx
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChroniCare — Prototype visual",
  description: "Prototype visual koordinasi perawatan penyakit kronis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

Define every canonical token from `DESIGN.md` in `globals.css`, plus these global rules:

```css
@import "tailwindcss";

:root {
  --color-canvas: #f9f4f2;
  --color-surface: #ffffff;
  --color-surface-subtle: #f4f6f8;
  --color-text-strong: #2d2c2b;
  --color-text: #4a4744;
  --color-text-muted: #68635e;
  --color-border: #d8d2ce;
  --color-border-strong: #aaa29c;
  --color-primary: #356fd6;
  --color-primary-hover: #2859b6;
  --color-primary-pressed: #204a9c;
  --color-brand-orange: #e87932;
  --color-focus: #2859b6;
  --color-info-text: #2859b6;
  --color-info-surface: #eaf1ff;
  --color-info-border: #afc5ec;
  --color-pending-text: #5b3f8c;
  --color-pending-surface: #f0ebf8;
  --color-pending-border: #c7b9df;
  --color-confirmed-text: #2f6b52;
  --color-confirmed-surface: #e8f4ee;
  --color-confirmed-border: #a8cdbd;
  --color-attention-text: #8a5b00;
  --color-attention-surface: #fff4d6;
  --color-attention-border: #e6c76a;
  --color-error-text: #b42318;
  --color-error-surface: #fdecea;
  --color-error-border: #e5aaa5;
  --color-sos: #b42318;
  --color-sos-surface: #fdecea;
  --color-sos-border: #d66a63;
  --radius-control: 10px;
  --radius-panel: 12px;
  --radius-patient-panel: 16px;
  --shadow-base: 0 1px 2px rgb(45 44 43 / 8%);
  --shadow-dialog: 0 12px 32px rgb(45 44 43 / 16%);
}

* { box-sizing: border-box; }
html { background: var(--color-canvas); }
body { margin: 0; color: var(--color-text); background: var(--color-canvas); font-family: "Plus Jakarta Sans Variable", "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif; }
a, button, input, textarea, select { font: inherit; }
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
```

Implement `/` as a restrained role entry with one title, one explanation, and two full labeled links. Do not show a dashboard preview, medical illustration, or Patient identity.

- [ ] **Step 8: Verify the scaffold checkpoint**

Run:

```powershell
npm.cmd test -- access
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
git diff --check
git status --short
```

Expected: all available checks pass; `/web` is untracked/modified; no commit exists.

---

### Task 2: Typed Mock Data, Native UI Primitives, and Prototype State

**DRI:** Daniel; Ozan reviews copy and synthetic-data truth.

**Files:**

- Create: `web/src/lib/types.ts`
- Create: `web/src/lib/mock-data.ts`
- Create: `web/src/components/ui.tsx`
- Create: `web/src/components/prototype-state.tsx`
- Modify: `web/src/app/layout.tsx`
- Create: `web/src/test/render.tsx`
- Create: `web/src/test/prototype-state.test.tsx`

**Interfaces:**

- Produces `PatientId = "maya" | "raka"`.
- Produces `OcrStatus = "PENDING_REVIEW" | "CONFIRMED" | "REJECTED" | "FAILED" | "DEMO_FALLBACK"`.
- Produces `SosStatus = "IDLE" | "ACTIVE" | "HANDLING" | "HANDLED" | "CONFLICT"`.
- Produces `usePrototypeState()` with selected Patient, context switching, check-in summary, OCR trust state, and SOS state.
- Produces `renderWithPrototype()` so tests can start from an explicit visual-state snapshot without provider or network mocks.
- Produces reusable `ButtonLink`, `Button`, `StatusBadge`, `Notice`, `Field`, and `PageBackLink` primitives.

- [ ] **Step 1: Write the failing provider behavior test**

Create `prototype-state.test.tsx` with a small test consumer:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrototypeStateProvider, usePrototypeState } from "@/components/prototype-state";

function Consumer() {
  const state = usePrototypeState();
  return (
    <>
      <span>{state.activePatient.displayName}</span>
      <span>{state.isSwitching ? "Memuat konteks" : state.activePatient.latestCheckIn}</span>
      <button onClick={() => state.switchPatient("raka")}>Pilih Raka</button>
    </>
  );
}

test("masks old care data while switching Patient context", async () => {
  const user = userEvent.setup();
  render(<PrototypeStateProvider><Consumer /></PrototypeStateProvider>);
  expect(screen.getByText("Maya Pratama")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Pilih Raka" }));
  expect(screen.getByText("Memuat konteks")).toBeInTheDocument();
  expect(screen.queryByText(/cukup baik/i)).not.toBeInTheDocument();
  expect(await screen.findByText("Raka Pratama")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run `npm.cmd test -- prototype-state`.

Expected: FAIL because the state provider does not exist.

- [ ] **Step 3: Define exact domain types and synthetic records**

Create `types.ts` with these public shapes:

```ts
export type PatientId = "maya" | "raka";
export type OcrStatus = "PENDING_REVIEW" | "CONFIRMED" | "REJECTED" | "FAILED" | "DEMO_FALLBACK";
export type SosStatus = "IDLE" | "ACTIVE" | "HANDLING" | "HANDLED" | "CONFLICT";

export type PatientProfile = {
  id: PatientId;
  displayName: string;
  initials: string;
  broadLocation: string;
  conditionContext: string;
  latestCheckIn: string;
  latestCheckInTime: string;
  medicationText: string;
  reminder: string;
  documentStatus: OcrStatus | "NONE";
};

export type Facility = {
  id: string;
  name: string;
  area: "Tangerang" | "Cipondoh" | "Karawaci";
  type: "Klinik" | "Rumah sakit" | "Puskesmas";
  bpjsNote: string;
  serviceNote: string;
  contactNote: string;
  source: string;
  reviewedAt: string;
};
```

Create `mock-data.ts` with four synthetic identities and two Patient profiles. Use these safe visible values consistently:

```ts
import type { Facility, PatientProfile } from "./types";

export const caregivers = {
  owner: { displayName: "Dimas Pratama", role: "Owner" },
  family: { displayName: "Rina Pratama", role: "Family Member" },
} as const;

export const patients: Record<"maya" | "raka", PatientProfile> = {
  maya: {
    id: "maya",
    displayName: "Maya Pratama",
    initials: "MP",
    broadLocation: "Tangerang",
    conditionContext: "Rutinitas penyakit kronis · demo diabetes tipe 2",
    latestCheckIn: "Cukup baik, sedikit lelah setelah aktivitas pagi.",
    latestCheckInTime: "Hari ini, 08.10",
    medicationText: "Metformin — sesuai catatan caregiver",
    reminder: "Catat rutinitas sore · 17.30",
    documentStatus: "PENDING_REVIEW",
  },
  raka: {
    id: "raka",
    displayName: "Raka Pratama",
    initials: "RP",
    broadLocation: "Tangerang",
    conditionContext: "Rutinitas penyakit kronis",
    latestCheckIn: "Belum ada check-in hari ini.",
    latestCheckInTime: "Terakhir kemarin, 19.20",
    medicationText: "Belum ada catatan aktif.",
    reminder: "Kontrol rutin · Jumat, 09.00",
    documentStatus: "NONE",
  },
};

export const facilities: Facility[] = [
  {
    id: "demo-klinik-cipondoh",
    name: "Klinik Keluarga Cipondoh — data demo",
    area: "Cipondoh",
    type: "Klinik",
    bpjsNote: "Dukungan BPJS tercatat pada dataset demo; konfirmasi langsung diperlukan.",
    serviceNote: "Layanan umum dan administrasi kontrol.",
    contactNote: "Kontak tidak ditampilkan pada prototype sintetis.",
    source: "Dataset demo internal ChroniCare (sintetis)",
    reviewedAt: "16 Juli 2026",
  },
  {
    id: "demo-puskesmas-tangerang",
    name: "Puskesmas Tangerang — data demo",
    area: "Tangerang",
    type: "Puskesmas",
    bpjsNote: "Informasi administratif bersifat contoh; konfirmasi ke fasilitas atau BPJS.",
    serviceNote: "Pelayanan primer pada dataset demo.",
    contactNote: "Kontak tidak ditampilkan pada prototype sintetis.",
    source: "Dataset demo internal ChroniCare (sintetis)",
    reviewedAt: "16 Juli 2026",
  },
];
```

- [ ] **Step 4: Implement the smallest cross-route provider**

The provider state must expose this exact contract:

```ts
type PrototypeState = {
  activePatient: PatientProfile;
  selectedPatientId: PatientId;
  isSwitching: boolean;
  checkInSaved: boolean;
  ocrStatus: OcrStatus;
  confirmedContextAvailable: boolean;
  sosStatus: SosStatus;
  sosHandler: string | null;
  audioEnabled: boolean;
  switchPatient: (id: PatientId) => void;
  saveCheckIn: () => void;
  setOcrStatus: (status: OcrStatus) => void;
  activateSos: () => void;
  handleSos: () => void;
  setSosConflict: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetPrototype: () => void;
};
```

Export this initial-state shape for tests:

```ts
export type PrototypeInitialState = Partial<{
  selectedPatientId: PatientId;
  checkInSaved: boolean;
  ocrStatus: OcrStatus;
  sosStatus: SosStatus;
  sosHandler: string | null;
  audioEnabled: boolean;
}>;
```

`PrototypeStateProvider` accepts `{ children, initialState?: PrototypeInitialState }`. Use `useState` and a 350ms `setTimeout` only for discrete Patient-switch feedback. Clear the timer in the effect cleanup. While `isSwitching` is true, consumers render a skeleton/progress label and no old Patient care content. Derive `confirmedContextAvailable` only from `ocrStatus === "CONFIRMED"`.

Create `web/src/test/render.tsx`:

```tsx
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { PrototypeStateProvider, type PrototypeInitialState } from "@/components/prototype-state";

export function renderWithPrototype(ui: ReactElement, initialState: PrototypeInitialState = {}) {
  return render(
    <PrototypeStateProvider initialState={initialState}>
      {ui}
    </PrototypeStateProvider>,
  );
}
```

- [ ] **Step 5: Implement native UI primitives**

Use semantic HTML and `@phosphor-icons/react`; do not add Radix/shadcn packages. The primitives accept ordinary React props and enforce the visual rules:

```ts
export type ButtonVariant = "primary" | "secondary" | "danger" | "quiet";
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; busy?: boolean }): React.ReactNode;
export function ButtonLink(props: React.ComponentProps<typeof Link> & { variant?: ButtonVariant }): React.ReactNode;
export function StatusBadge(props: { status: "info" | "pending" | "confirmed" | "attention" | "error" | "fallback" | "sos"; children: React.ReactNode }): React.ReactNode;
export function Notice(props: { tone: "info" | "attention" | "error" | "fallback" | "sos"; title: string; children: React.ReactNode }): React.ReactNode;
export function Field(props: { label: string; hint?: string; error?: string; children: React.ReactNode }): React.ReactNode;
export function PageBackLink(props: { href: string; children: React.ReactNode }): React.ReactNode;
```

Buttons use 10px radius, no pills, at least 44px height, and only one solid primary per task region. Status badges include a semantic icon plus text.

- [ ] **Step 6: Wrap the app and verify the provider**

Wrap `{children}` with `PrototypeStateProvider` in the root layout. Run:

```powershell
npm.cmd test -- prototype-state
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: PASS, no stale-data assertion failure, and no unrequested provider packages.

---

### Task 3: Public Entry and Separate Access Placeholders

**DRI:** Daniel; Ozan reviews role separation and no-auth overclaim.

**Files:**

- Modify: `web/src/app/page.tsx`
- Create: `web/src/app/patient/access/page.tsx`
- Create: `web/src/app/caregiver/access/page.tsx`
- Modify: `web/src/test/access.test.tsx`

**Interfaces:**

- Patient access accepts only the synthetic demo code `204682` in local UI state and routes to `/patient/home`.
- Caregiver access accepts any non-empty email/password pair in local UI state and routes to `/caregiver`.
- Both surfaces state that access is a visual placeholder; neither claims real authentication.

- [ ] **Step 1: Extend the access tests before implementation**

Mock `next/navigation` and assert these behaviors:

```tsx
test("keeps Patient access separate and validates the synthetic code", async () => {
  const user = userEvent.setup();
  render(<PatientAccessPage />);
  await user.type(screen.getByLabelText("Kode akses pasien"), "111111");
  await user.click(screen.getByRole("button", { name: "Masuk ke halaman saya" }));
  expect(screen.getByText("Kode demo belum cocok. Periksa enam digitnya.")) .toBeInTheDocument();
  expect(screen.queryByText("Maya Pratama")).not.toBeInTheDocument();
});

test("labels caregiver authentication as a prototype placeholder", () => {
  render(<CaregiverAccessPage />);
  expect(screen.getByText("Prototype visual — belum terhubung ke autentikasi")) .toBeInTheDocument();
  expect(screen.getByLabelText("Email caregiver")).toBeInTheDocument();
  expect(screen.queryByLabelText("Kode akses pasien")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests and verify the expected route-module failures**

Run `npm.cmd test -- access`.

Expected: FAIL because the access route components do not exist.

- [ ] **Step 3: Implement the Patient access surface**

Use one centered Patient panel with:

- ChroniCare wordmark and `Akses pasien` context.
- Heading `Masuk ke halaman perawatan Anda`.
- Explanation that the code is supplied by family/caregiver.
- Persistent six-digit numeric label and hint `Kode demo: 204682`.
- Primary `Masuk ke halaman saya` button.
- Generic inline error; no Patient name before successful navigation.
- Secondary link back to `/`.

Use `router.push("/patient/home")` only after the local code equals `204682`. Add 250ms submitting feedback so the state is visible and duplicate submit is disabled.

- [ ] **Step 4: Implement the caregiver placeholder surface**

Use a restrained desktop-bounded sign-in form with:

- `Akses caregiver` context and heading `Masuk untuk mengoordinasikan perawatan`.
- Visible info notice `Prototype visual — belum terhubung ke autentikasi`.
- Persistent labels for email and password.
- Primary `Masuk` and secondary back link.
- Generic inline validation for empty values.
- No Patient name, Care Circle details, dashboard preview, Supabase claim, or role selector.

- [ ] **Step 5: Verify access behavior**

Run:

```powershell
npm.cmd test -- access
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: PASS; the two access domains remain visually and semantically distinct.

---

### Task 4: Patient Shell, Home, Check-In, Chat, and SOS Confirmation

**DRI:** Daniel; Ozan reviews Patient copy; Al reviews AI/safety boundary copy.

**Files:**

- Create: `web/src/components/patient-shell.tsx`
- Create: `web/src/components/chat-surface.tsx`
- Create: `web/src/app/patient/home/page.tsx`
- Create: `web/src/app/patient/check-in/page.tsx`
- Create: `web/src/app/patient/chat/page.tsx`
- Create: `web/src/app/patient/sos/page.tsx`
- Create: `web/src/test/patient.test.tsx`

**Interfaces:**

- `PatientShell` exposes only Maya-bound identity and Patient-safe navigation.
- `ChatSurface` renders typed messages, visible source/fallback state, and a labeled composer.
- Patient chat suggestion buttons deterministically produce allowed, refusal, and emergency responses.
- SOS confirmation calls `activateSos()` and preserves an acknowledgement state.

- [ ] **Step 1: Write failing Patient-flow tests**

Cover the three critical Patient states:

```tsx
test("saves a simple check-in without clinical interpretation", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<PatientCheckInPage />);
  await user.click(screen.getByRole("radio", { name: "Cukup baik" }));
  await user.type(screen.getByLabelText("Catatan tambahan (opsional)"), "Sedikit lelah setelah jalan pagi.");
  await user.click(screen.getByRole("button", { name: "Simpan check-in" }));
  expect(screen.getByText("Check-in hari ini sudah dicatat.")) .toBeInTheDocument();
  expect(screen.queryByText(/diagnosis|terkontrol|target gula/i)).not.toBeInTheDocument();
});

test("refuses a dose-change request and offers allowed help", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<PatientChatPage />);
  await user.click(screen.getByRole("button", { name: "Boleh saya mengubah dosis obat?" }));
  expect(screen.getByText(/saya tidak dapat menyarankan perubahan dosis/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /lihat catatan caregiver/i })).toBeInTheDocument();
});

test("uses a short emergency response with a visible SOS entry", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<PatientChatPage />);
  await user.click(screen.getByRole("button", { name: "Saya sangat lemas dan butuh bantuan" }));
  expect(screen.getByText(/segera hubungi keluarga atau tenaga medis/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Buka SOS keluarga" })).toHaveAttribute("href", "/patient/sos");
});
```

- [ ] **Step 2: Run tests and verify missing component/route failures**

Run `npm.cmd test -- patient`.

Expected: FAIL because Patient surfaces do not exist.

- [ ] **Step 3: Implement the mobile-first Patient shell and home**

`PatientShell` uses a maximum readable width around 620px, 18px body copy, 48px targets, and a simple header containing ChroniCare, Maya's identity, and a `Keluar dari demo` link to `/`. It must not expose profile switching or caregiver navigation.

Patient home reading order:

1. `Selamat pagi, Maya` and a short orientation sentence.
2. Today's check-in as the single dominant task with `Isi check-in hari ini`.
3. Next reminder as a flat divided row with recorded-care wording.
4. Patient assistant link with bounded-help copy.
5. A visually separated SOS region with `Saya butuh bantuan keluarga` and no dispatch promise.

Do not use a KPI grid, completion score, streak, confetti, chart, or mascot.

- [ ] **Step 4: Implement check-in states**

Use a `<fieldset>` and radio controls for `Baik`, `Cukup baik`, and `Kurang baik`. Include an optional textarea and the limitation `Check-in membantu keluarga memahami keadaan Anda; ChroniCare tidak menentukan diagnosis.`

On valid submit, call `saveCheckIn()` and replace the form actions with a persistent success notice plus `Kembali ke beranda`. On empty submit, focus the fieldset summary and show `Pilih kondisi yang paling mendekati hari ini.`

- [ ] **Step 5: Implement Patient chat fixtures as normal suggestion controls**

Render three suggestion buttons:

- `Apa yang perlu saya siapkan untuk rutinitas hari ini?` → short allowed response that repeats the caregiver-recorded reminder without prescribing.
- `Boleh saya mengubah dosis obat?` → calm refusal and allowed next action.
- `Saya sangat lemas dan butuh bantuan` → short escalation plus `/patient/sos` link.

The composer remains labeled and may submit an allowed generic response. Add a provider-unavailable notice only when the route has `?state=fallback`; label it `DEMO_FALLBACK` and do not style it like a live response.

- [ ] **Step 6: Implement Patient SOS confirmation and acknowledgement**

Before confirmation show:

- Heading `Minta bantuan keluarga sekarang?`.
- Maya identity and broad location only.
- Direct explanation that ChroniCare records a family coordination alert.
- Primary danger action `Ya, kirim SOS ke keluarga`.
- Neutral `Batal` back to Patient home.
- Limitation: no ambulance/IGD dispatch and no guarantee when caregiver dashboard is closed or disconnected.

After confirmation, call `activateSos()` and show a persistent acknowledgement: `Permintaan bantuan sudah dicatat di prototype ini.` The next action returns to home; no fake delivery receipt appears.

- [ ] **Step 7: Verify Patient surfaces**

Run:

```powershell
npm.cmd test -- patient
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: PASS; tests find no diagnosis, dose-change instruction, target, or dispatch overclaim.

---

### Task 5: Caregiver Shell, Active Patient Dashboard, and Safe Patient Switching

**DRI:** Daniel; Ozan reviews operational hierarchy; Bernard reviews that visual selection is not described as authorization.

**Files:**

- Create: `web/src/components/caregiver-shell.tsx`
- Create: `web/src/components/patient-switcher.tsx`
- Create: `web/src/components/sos-alert.tsx`
- Create: `web/src/app/caregiver/layout.tsx`
- Create: `web/src/app/caregiver/page.tsx`
- Create: `web/src/test/caregiver.test.tsx`

**Interfaces:**

- `CaregiverShell` renders a 216px desktop sidebar, compact mobile navigation, persistent active-Patient context, and persistent active SOS.
- `PatientSwitcher` renders a native `<dialog>` or accessible inline disclosure with at most Maya and Raka.
- Dashboard content reads only `activePatient` after switch completion.

- [ ] **Step 1: Write failing dashboard and isolation tests**

```tsx
test("prioritizes active Patient context and operational next actions", () => {
  renderWithPrototype(<CaregiverDashboard />);
  expect(screen.getByText("Patient aktif")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Maya Pratama" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Tinjau dokumen" })).toHaveAttribute("href", "/caregiver/documents");
  expect(screen.queryByText(/risk score|gula terkontrol|kpi/i)).not.toBeInTheDocument();
});

test("does not show Maya care data under Raka identity during switching", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<CaregiverDashboard />);
  await user.click(screen.getByRole("button", { name: "Ganti Patient" }));
  await user.click(screen.getByRole("button", { name: /pilih Raka Pratama/i }));
  expect(screen.getByText("Memuat konteks Patient…")).toBeInTheDocument();
  expect(screen.queryByText("Cukup baik, sedikit lelah setelah aktivitas pagi.")).not.toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Raka Pratama" })).toBeInTheDocument();
  expect(screen.getByText("Belum ada check-in hari ini.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify missing-shell failures**

Run `npm.cmd test -- caregiver`.

Expected: FAIL because caregiver shell/dashboard do not exist.

- [ ] **Step 3: Implement the caregiver shell**

Desktop layout:

- 216px flat sidebar with ChroniCare, signed-in `Dimas Pratama · Owner`, and labeled links for `Ringkasan`, `Dokumen`, `Asisten`, and `Faskes & BPJS`.
- A quiet `Keluar dari demo` link to `/` so actor switching uses normal client navigation and preserves same-tab mock state.
- Main content width is bounded; no decorative full-width card fill.
- Sticky active-Patient context bar contains initials, display name, broad location, last refreshed time, and `Ganti Patient`.
- On mobile, the sidebar becomes a compact top/bottom labeled navigation without icon-only critical actions.
- If SOS is active, `SosAlert` sits below the context bar and above routine content at every viewport.

- [ ] **Step 4: Implement the Patient switcher**

The selector shows only two 44px-minimum rows:

- Maya Pratama — current marker when selected.
- Raka Pratama — second synthetic profile.

Each row includes identity only, not clinical summary. Selection closes the dialog, calls `switchPatient(id)`, and leaves the shell in `Memuat konteks Patient…` state until the new Patient is ready. Cancel retains the current profile. No third-profile action or subscription wording appears.

- [ ] **Step 5: Implement the dashboard hierarchy**

Render:

1. Active SOS alert when present.
2. Latest check-in and timestamp as a plain primary section.
3. `Rutinitas hari ini` with caregiver-recorded medication text and reminder wording.
4. `Dokumen perlu ditinjau` only when Maya is active and status is pending.
5. Divided task links for caregiver assistant and faskes/BPJS.

For Raka, use the mock empty/low-data state rather than keeping Maya's document or routine content.

- [ ] **Step 6: Verify caregiver hierarchy and isolation**

Run:

```powershell
npm.cmd test -- caregiver
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: PASS; switching masks old data and no equal-card dashboard or unsupported metric exists.

---

### Task 6: Document List, Upload Visual, and Original-First OCR Review

**DRI:** Daniel for review UI; Al reviews extraction/fallback wording; Ozan reviews demo truth.

**Files:**

- Create: `web/public/demo-document.svg`
- Create: `web/src/components/document-review.tsx`
- Create: `web/src/app/caregiver/documents/page.tsx`
- Create: `web/src/app/caregiver/documents/upload/page.tsx`
- Create: `web/src/app/caregiver/documents/review/page.tsx`
- Create: `web/src/test/document-review.test.tsx`

**Interfaces:**

- `DocumentReview` receives `initialStatus: OcrStatus` and updates global OCR status only on explicit confirm/reject.
- `demo-document.svg` is visibly labeled `DOKUMEN DEMO SINTETIS` and contains no real identity, signature, identifier, or institution mark.
- Upload validation accepts visual selections for PDF/JPEG/PNG, max 5 MB, max three pages; no file is uploaded anywhere.

- [ ] **Step 1: Write failing OCR trust-boundary tests**

```tsx
test("keeps machine extraction pending until explicit confirmation", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<DocumentReview initialStatus="PENDING_REVIEW" />);
  expect(screen.getByText("Menunggu tinjauan")).toBeInTheDocument();
  expect(screen.getByText("Draft hasil mesin — belum menjadi konteks terkonfirmasi")) .toBeInTheDocument();
  expect(screen.queryByText("Dikonfirmasi untuk asisten caregiver")).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText("Tanggal dokumen"));
  await user.type(screen.getByLabelText("Tanggal dokumen"), "12 Juli 2026");
  await user.click(screen.getByRole("button", { name: "Konfirmasi hasil tinjauan" }));
  expect(screen.getByText("Dikonfirmasi untuk asisten caregiver")).toBeInTheDocument();
});

test("keeps fallback visibly labeled", () => {
  renderWithPrototype(<DocumentReview initialStatus="DEMO_FALLBACK" />);
  expect(screen.getByText("DEMO_FALLBACK")).toBeInTheDocument();
  expect(screen.getByText(/data fixture sintetis, bukan OCR live/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify missing review-component failure**

Run `npm.cmd test -- document-review`.

Expected: FAIL because `DocumentReview` does not exist.

- [ ] **Step 3: Create the unmistakably synthetic original document asset**

The SVG uses a plain white A4-like page, ChroniCare demo watermark, black text, and these fields only:

- `DOKUMEN DEMO SINTETIS — BUKAN REKAM MEDIS`.
- Patient: Maya Pratama.
- Date: 12 July 2026.
- Note as written: `Kontrol rutin; bawa catatan harian.`
- BPJS: `************4821`.

Do not include logos, signatures, stamps, facility names, phone numbers, full addresses, lab values, or treatment conclusions.

- [ ] **Step 4: Implement document list and upload visual**

Document list reading order:

- Active Patient context inherited from caregiver shell.
- Primary `Unggah dokumen` action.
- `Catatan kontrol — 12 Jul 2026` with status from state and `Tinjau dokumen`.
- `Contoh provider gagal` with `DEMO_FALLBACK` and a link to `/caregiver/documents/review?state=fallback`.

Upload surface uses a visible file label and accepts `.pdf,.jpg,.jpeg,.png`. Show constraints before selection: one file, max 5 MB, max three pages, private in the intended product. Because this is visual-only, include a secondary ordinary action `Gunakan dokumen demo sintetis`; it selects the bundled fixture in UI state and enables `Lanjutkan ke tinjauan`. State explicitly: `Tidak ada file yang diunggah dari prototype ini.`

- [ ] **Step 5: Implement the desktop split and mobile evidence tabs**

Desktop uses `grid-template-columns: minmax(0, 45fr) minmax(0, 55fr)` with the original on the left and editable draft on the right. Mobile provides two labeled tabs or a stacked layout; the original remains directly reachable, and confirm/reject actions remain after the extraction fields in logical focus order.

Required review fields:

- Document type: `Catatan kontrol`.
- Date: `12 Juli 2026`.
- Note as written: `Kontrol rutin; bawa catatan harian.`
- Masked BPJS: `************4821`.
- Provenance: `Fixture sintetis ChroniCare` or `DEMO_FALLBACK`.

Actions:

- `Konfirmasi hasil tinjauan` calls `setOcrStatus("CONFIRMED")` and shows persistent confirmed notice.
- `Tolak draft` calls `setOcrStatus("REJECTED")` and preserves original access.
- Leaving without action keeps pending.
- Empty required date shows adjacent validation without medical interpretation.

- [ ] **Step 6: Verify OCR states and responsive structure**

Run:

```powershell
npm.cmd test -- document-review
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: PASS; pending never receives confirmed styling/copy; fallback remains labeled.

---

### Task 7: Caregiver Assistant with Confirmed Context and Faskes/BPJS Helper

**DRI:** Daniel for surfaces; Al reviews AI/context wording; Ozan reviews product and facility limitations.

**Files:**

- Create: `web/src/app/caregiver/chat/page.tsx`
- Create: `web/src/app/caregiver/faskes/page.tsx`
- Create: `web/src/test/facilities.test.tsx`
- Modify: `web/src/components/chat-surface.tsx`

**Interfaces:**

- Caregiver chat reads `confirmedContextAvailable`; it never reads pending extraction fields.
- Facility filtering is a pure local function over `facilities` and preserves source/review metadata.

- [ ] **Step 1: Write failing context and facility tests**

```tsx
test("omits OCR context until the caregiver confirms it", () => {
  renderWithPrototype(<CaregiverChatPage />);
  expect(screen.getByText("Belum ada hasil OCR terkonfirmasi yang digunakan.")) .toBeInTheDocument();
  expect(screen.queryByText(/bawa catatan harian/i)).not.toBeInTheDocument();
});

test("shows provenance when confirmed OCR contributes", () => {
  renderWithPrototype(<CaregiverChatPage />, { ocrStatus: "CONFIRMED" });
  expect(screen.getByText("Menggunakan 1 hasil OCR yang sudah Anda konfirmasi")) .toBeInTheDocument();
  expect(screen.getByText(/pertanyaan untuk kunjungan dokter/i)).toBeInTheDocument();
});

test("filters static demo facilities without ranking or guarantees", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<FaskesPage />);
  await user.selectOptions(screen.getByLabelText("Area"), "Cipondoh");
  await user.click(screen.getByRole("button", { name: "Terapkan filter" }));
  expect(screen.getByText("Klinik Keluarga Cipondoh — data demo")).toBeInTheDocument();
  expect(screen.getByText("Dataset demo internal ChroniCare (sintetis)")) .toBeInTheDocument();
  expect(screen.getByText("16 Juli 2026")).toBeInTheDocument();
  expect(screen.queryByText(/terbaik|pasti menerima|tersedia sekarang/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify route failures**

Run `npm.cmd test -- facilities caregiver`.

Expected: FAIL because the assistant/facility routes are incomplete.

- [ ] **Step 3: Implement the caregiver assistant**

Header must show active Patient identity and a `Ganti Patient` action through the existing selector. Add a provenance band above the transcript:

- Pending/no confirmed extraction: `Belum ada hasil OCR terkonfirmasi yang digunakan.`
- Confirmed: `Menggunakan 1 hasil OCR yang sudah Anda konfirmasi` with confirmed icon.
- Fallback route query: `DEMO_FALLBACK — respons aman tersimpan, bukan jawaban Azure live.`

Normal suggestion `Bantu siapkan pertanyaan untuk kunjungan dokter` returns a short structured list such as:

1. `Catatan apa yang perlu saya bawa saat kontrol?`
2. `Perubahan rutinitas apa yang perlu saya ceritakan?`
3. `Hal apa yang perlu saya konfirmasi dari catatan kontrol ini?`

Do not include a diagnosis, dose adjustment, lab meaning, treatment target, or nutrition prescription.

- [ ] **Step 4: Implement the static faskes/BPJS helper**

Render:

- Persistent notice: `Panduan administratif dari dataset demo statis — konfirmasi langsung ke fasilitas atau BPJS.`
- Labeled Area and Facility type selects.
- `Terapkan filter` primary and `Hapus filter` secondary actions.
- Result count, then a divided list rather than equal cards.
- Each result includes name, type, area, BPJS note, service note, contact limitation, source, review date, and direct-confirmation instruction.
- Empty state preserves filters and offers `Hapus filter`; it does not claim no facility exists.

- [ ] **Step 5: Verify assistant boundary and facility copy**

Run:

```powershell
npm.cmd test -- facilities caregiver
npm.cmd run typecheck
npm.cmd run lint
rg -n "terbaik|pasti menerima|tersedia sekarang|diagnosis|ubah dosis|target gula" src
git diff --check
```

Expected: tests pass. Any `rg` matches appear only in explicit limitation/refusal copy or tests, never as a capability claim.

---

### Task 8: Persistent Caregiver SOS Alert and Handling States

**DRI:** Daniel for alert/handling UI; Bernard reviews truthful Realtime representation; Ozan reviews emergency overclaim.

**Files:**

- Modify: `web/src/components/sos-alert.tsx`
- Create: `web/src/app/caregiver/sos/page.tsx`
- Create: `web/src/test/sos.test.tsx`
- Modify: `web/src/app/patient/sos/page.tsx`

**Interfaces:**

- `SosAlert` renders whenever `sosStatus` is not `IDLE` and stays visually available without audio.
- `handleSos()` transitions `ACTIVE → HANDLING → HANDLED`, attributing Dimas.
- `setSosConflict()` renders the current handler as Rina and removes the handling action.
- Query `?state=conflict` and `?state=reconnecting` provide direct state review without adding an on-screen prototype toolbar.

- [ ] **Step 1: Write failing SOS behavior tests**

```tsx
test("keeps an active SOS visually persistent without sound", () => {
  renderWithPrototype(<CaregiverDashboard />, { sosStatus: "ACTIVE", audioEnabled: false });
  expect(screen.getByRole("alert", { name: "SOS aktif untuk Maya Pratama" })).toBeInTheDocument();
  expect(screen.getByText("Suara belum diaktifkan — alert visual tetap aktif.")) .toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Buka dan tangani" })).toHaveAttribute("href", "/caregiver/sos");
});

test("handles SOS with one dominant action and persistent result", async () => {
  const user = userEvent.setup();
  renderWithPrototype(<CaregiverSosPage />, { sosStatus: "ACTIVE" });
  await user.click(screen.getByRole("button", { name: "Saya tangani" }));
  expect(await screen.findByText("Ditangani oleh Dimas Pratama")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Saya tangani" })).not.toBeInTheDocument();
});

test("explains first-handler conflict without retrying the claim", () => {
  renderWithPrototype(<CaregiverSosPage />, { sosStatus: "CONFLICT", sosHandler: "Rina Pratama" });
  expect(screen.getByText("Rina Pratama sudah menangani lebih dahulu.")) .toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Saya tangani" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify failing SOS states**

Run `npm.cmd test -- sos`.

Expected: FAIL until the persistent alert/detail behavior is complete.

- [ ] **Step 3: Implement the persistent caregiver alert**

Use a semantic `role="alert"` region with:

- `SOS aktif untuk Maya Pratama`.
- Broad location `Tangerang` and event time `Hari ini, 10.42`.
- Status text `Menunggu caregiver` or current handler.
- Connection text `Dashboard terbuka · data prototype lokal`.
- Secondary audio text and `Aktifkan suara` toggle; no audio file or autoplay claim is needed for this visual prototype.
- Dominant `Buka dan tangani` link.

The alert uses the canonical SOS surface/border/text colors, 12px radius, no flashing, no continuous pulse, and no siren/ambulance icon.

- [ ] **Step 4: Implement SOS detail states**

The detail page prioritizes identity, time, current status, connection/last-refreshed state, and one action. Handling displays `Menyimpan penanggung jawab…`, then the persistent handled state. Conflict displays Rina as current handler and a `Kembali ke ringkasan` action.

For `?state=reconnecting`, show `Menyambungkan kembali…` followed by `Status diperbarui dari data prototype lokal` and keep the alert visible. Include the limitation copy: `ChroniCare membantu koordinasi keluarga; bukan layanan dispatch dan tidak menjamin alert diterima saat dashboard tertutup atau terputus.`

- [ ] **Step 5: Verify SOS states and overclaim scan**

Run:

```powershell
npm.cmd test -- sos
npm.cmd run typecheck
npm.cmd run lint
rg -n "ambulans dikirim|IGD dihubungi|WhatsApp|SMS terkirim|notifikasi sistem" src
git diff --check
```

Expected: tests pass; prohibited delivery/dispatch claims return no matches.

---

### Task 9: Connected E2E Flow, Responsive Screenshots, and Visual Polish

**DRI:** Ozan owns QA evidence; Daniel reviews visual results; Bernard and Al review only relevant boundary copy.

**Files:**

- Create: `web/e2e/prototype-flow.spec.ts`
- Create: `web/e2e/visual-regression.spec.ts`
- Modify: any `/web` prototype file only when a failing check or visual inspection identifies a concrete issue

**Interfaces:**

- Produces a normal connected-flow browser check with no debug toolbar.
- Produces screenshots at exactly 390×844 and 1440×900.
- Produces fresh lint, typecheck, unit, E2E, and build evidence.

- [ ] **Step 1: Install the Playwright Chromium runtime**

Run from `/web`:

```powershell
npx playwright install chromium
```

If network or sandbox restrictions block the command, request approval for this exact installation; do not claim visual QA passed without the browser.

- [ ] **Step 2: Write the failing connected-flow E2E test**

Create `prototype-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("normal controls connect Patient and caregiver demo-critical surfaces", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /masuk sebagai pasien/i }).click();
  await page.getByLabel("Kode akses pasien").fill("204682");
  await page.getByRole("button", { name: "Masuk ke halaman saya" }).click();
  await expect(page.getByRole("heading", { name: /selamat pagi, Maya/i })).toBeVisible();

  await page.getByRole("link", { name: "Isi check-in hari ini" }).click();
  await page.getByRole("radio", { name: "Cukup baik" }).check();
  await page.getByRole("button", { name: "Simpan check-in" }).click();
  await expect(page.getByText("Check-in hari ini sudah dicatat.")).toBeVisible();

  await page.getByRole("link", { name: "Kembali ke beranda" }).click();
  await page.getByRole("link", { name: "Keluar dari demo" }).click();
  await page.getByRole("link", { name: /masuk sebagai caregiver/i }).click();
  await page.getByLabel("Email caregiver").fill("dimas@example.test");
  await page.getByLabel("Kata sandi").fill("prototype-only");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Maya Pratama" })).toBeVisible();

  await page.getByRole("button", { name: "Ganti Patient" }).click();
  await page.getByRole("button", { name: /pilih Raka Pratama/i }).click();
  await expect(page.getByRole("heading", { name: "Raka Pratama" })).toBeVisible();
  await expect(page.getByText("Belum ada check-in hari ini.")).toBeVisible();

  await page.getByRole("button", { name: "Ganti Patient" }).click();
  await page.getByRole("button", { name: /pilih Maya Pratama/i }).click();
  await page.getByRole("link", { name: "Dokumen" }).click();
  await page.getByRole("link", { name: "Tinjau dokumen" }).first().click();
  await page.getByRole("button", { name: "Konfirmasi hasil tinjauan" }).click();
  await expect(page.getByText("Dikonfirmasi untuk asisten caregiver")).toBeVisible();

  await page.getByRole("link", { name: "Asisten" }).click();
  await expect(page.getByText("Menggunakan 1 hasil OCR yang sudah Anda konfirmasi")).toBeVisible();
  await page.getByRole("link", { name: "Keluar dari demo" }).click();
  await page.getByRole("link", { name: /masuk sebagai pasien/i }).click();
  await page.getByLabel("Kode akses pasien").fill("204682");
  await page.getByRole("button", { name: "Masuk ke halaman saya" }).click();
  await page.getByRole("link", { name: "Saya butuh bantuan keluarga" }).click();
  await page.getByRole("button", { name: "Ya, kirim SOS ke keluarga" }).click();
  await page.getByRole("link", { name: "Keluar dari demo" }).click();
  await page.getByRole("link", { name: /masuk sebagai caregiver/i }).click();
  await page.getByLabel("Email caregiver").fill("dimas@example.test");
  await page.getByLabel("Kata sandi").fill("prototype-only");
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.getByRole("link", { name: "Buka dan tangani" }).click();
  await page.getByRole("button", { name: "Saya tangani" }).click();
  await expect(page.getByText("Ditangani oleh Dimas Pratama")).toBeVisible();

  await page.getByRole("link", { name: "Faskes & BPJS" }).click();
  await expect(page.getByText("Dataset demo internal ChroniCare (sintetis)").first()).toBeVisible();
});
```

- [ ] **Step 3: Run E2E and fix only observed failures**

Run:

```powershell
npm.cmd run test:e2e -- --grep "normal controls"
```

Expected before final fixes: any selector/navigation mismatch fails with a concrete trace. Adjust accessible names or normal navigation, not the test intent.

- [ ] **Step 4: Add exact viewport screenshot checks**

Create `visual-regression.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("Patient home at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/patient/home");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/visual/patient-home-390x844.png", fullPage: true });
});

test("caregiver dashboard and OCR at 1440x900", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/caregiver");
  await page.screenshot({ path: "test-results/visual/caregiver-dashboard-1440x900.png", fullPage: true });
  await page.goto("/caregiver/documents/review");
  await page.screenshot({ path: "test-results/visual/ocr-review-1440x900.png", fullPage: true });
});

test("OCR review reflows at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/caregiver/documents/review");
  await page.screenshot({ path: "test-results/visual/ocr-review-390x844.png", fullPage: true });
});
```

- [ ] **Step 5: Run the full automated verification set**

Run from `/web`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

Expected: all commands exit 0. Do not report any check as passing if it was skipped or failed.

- [ ] **Step 6: Inspect screenshots at both required viewports**

Open and inspect these generated files with the available image-viewing tool:

- `web/test-results/visual/patient-home-390x844.png`
- `web/test-results/visual/ocr-review-390x844.png`
- `web/test-results/visual/caregiver-dashboard-1440x900.png`
- `web/test-results/visual/ocr-review-1440x900.png`

Verify:

- No critical horizontal scroll or clipped Indonesian copy.
- Patient body text and touch targets remain large enough.
- Caregiver hierarchy reads as operational lists/sections, not a decorative card grid.
- Active Patient identity remains obvious.
- OCR original is visually primary and the draft/status relationship is clear.
- SOS is persistent, urgent, and non-playful.
- No gradient, glass, glow, oversized radius, generic hero, random illustration, or unsupported health metric appears.

Apply focused CSS/markup fixes, regenerate the affected screenshot, and inspect again until the defects are gone.

- [ ] **Step 7: Perform accessibility and prohibited-copy checks**

Run:

```powershell
rg -n "gradient|backdrop-blur|glass|drop-shadow.*blue|rounded-\[([2-9][0-9]|[1-9][0-9]{2})px\]|risk score|confidence score|pasti menerima|tersedia realtime|ambulans dikirim|IGD dihubungi" src
git diff --check
git status --short
```

Manually keyboard through role entry, both access forms, Patient check-in, Patient chat suggestions, Patient switcher, OCR tabs/form/actions, SOS handling, and facility filters. Verify visible focus and logical order. At 200% browser zoom, confirm no critical action is lost or horizontally clipped.

- [ ] **Step 8: Final uncommitted handoff checkpoint**

Report:

- Every created/changed `/web` file.
- Commands run and exact pass/fail results.
- Screenshot paths and viewports inspected.
- Any unavailable checks or remaining visual risks.
- DRI handoff: Daniel for UI, Ozan for QA/product, Al for AI/OCR safety copy, Bernard for future wiring boundaries.
- Explicitly state that API/database/provider/auth/Realtime/deploy work was not performed.
- Explicitly state that no commit or push was created.

## Plan Self-Review

- Spec coverage: all approved routes, normal-flow navigation, Patient/Caregiver differentiation, Patient switching, OCR trust states, confirmed-only chat context, SOS handling, faskes/BPJS guidance, and target viewports map to Tasks 3–9.
- Scope: all backend/provider/auth/persistence/deploy work is excluded from dependencies and file structure.
- Type consistency: `PatientId`, `OcrStatus`, `SosStatus`, `PrototypeState`, and shared record names are defined once and consumed consistently.
- Placeholder scan: the plan contains no deferred implementation markers; every task names exact files, tests, commands, copy, state, and completion evidence.
- Git rule: commit steps are intentionally replaced by `git diff --check` and `git status --short` checkpoints because the user explicitly requested no commit.
