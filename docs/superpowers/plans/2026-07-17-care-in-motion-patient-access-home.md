# Care in Motion Patient Access and Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and execute inline. Do not dispatch subagents, create a branch, commit, or push for this request.

**Goal:** Build only Screen 01 Patient Access and Screen 02 Patient Home from NEWDESIGN.md as a responsive, accessible, synthetic-data UI experiment.

**Architecture:** Keep pages server-rendered by default and isolate access-code state/navigation in one small Client Component. Share a focused Patient shell and brand primitives, use Tailwind only for base/reset loading, and keep the full Care in Motion visual system in one global stylesheet because this is a two-screen experiment.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Plus Jakarta Sans, Phosphor Icons, Vitest, Testing Library, and Playwright.

## Global Constraints

- Visual authority is NEWDESIGN.md Screen 01 and Screen 02, not DESIGN.md or previous visual plans.
- Locked product journeys, Patient terminology, medical boundaries, privacy, and synthetic-data rules still apply.
- Scope is exactly /patient/access and /patient/home plus the root layout and supporting components/tests.
- Use demo code 204682 only as synthetic prototype behavior; do not claim real authentication.
- Patient body text is at least 16 px and interactive targets are at least 48 × 48 px.
- Use #0F766E teal, #F6B73C amber, #B9444F coral, #FFF9F2 canvas, and #B91C1C only for SOS/danger.
- Do not add dependencies, branch, commit, push, apply the old stash, or restore old source files.
- Preserve stash backup ui plain #1 unchanged.

---

### Task 1: Isolate the experiment and create the RED test harness

**Files:**
- Replace: web/e2e/prototype.spec.ts
- Create: web/src/test/setup.ts
- Create: web/src/test/patient-access.test.tsx
- Create: web/src/test/patient-home.test.tsx
- Remove generated only: web/.next, web/tsconfig.tsbuildinfo, web/next-env.d.ts, web/test-results, web/debug.log

**Interfaces:**
- Tests import default exports from the two route page files.
- The access test mocks only next/navigation useRouter because browser navigation is outside jsdom.
- The E2E test owns the real navigation assertion.

- [x] **Step 1: Verify every cleanup target resolves inside web**

Run a PowerShell path check against the exact generated targets and stop if any target resolves outside the workspace web directory.

- [x] **Step 2: Remove only verified generated targets**

Use PowerShell Remove-Item with LiteralPath. Keep node_modules, package files, configs, NEWDESIGN.md, DESIGN.md, and the stash.

- [x] **Step 3: Write focused failing component tests**

The access contract must assert:

~~~tsx
render(<PatientAccessPage />)
expect(screen.getByRole("heading", { name: /selamat datang/i })).toBeVisible()
expect(screen.getByLabelText(/kode akses/i)).toHaveAttribute("inputmode", "numeric")
await user.click(screen.getByRole("button", { name: /masuk dengan kode/i }))
expect(screen.getByRole("alert")).toHaveTextContent("Kode tidak valid atau sudah tidak berlaku")
~~~

The home contract must assert:

~~~tsx
render(<PatientHomePage />)
expect(screen.getByRole("heading", { name: /halo, maya/i })).toBeVisible()
expect(screen.getByRole("link", { name: /isi check-in hari ini/i })).toBeVisible()
expect(screen.getByText(/sesuai catatan caregiver/i)).toBeVisible()
expect(screen.getByRole("link", { name: /buka sos/i })).toBeVisible()
expect(screen.getByRole("navigation", { name: /navigasi pasien/i })).toBeVisible()
~~~

- [x] **Step 4: Run tests and confirm RED**

Run: npm.cmd test -- src/test/patient-access.test.tsx src/test/patient-home.test.tsx  
Expected: FAIL because the route modules do not exist.

### Task 2: Implement Screen 01 Patient Access and turn its tests GREEN

**Files:**
- Create: web/src/app/layout.tsx
- Create: web/src/app/globals.css
- Create: web/src/app/patient/access/page.tsx
- Create: web/src/components/brand-mark.tsx
- Create: web/src/components/patient-access-form.tsx

**Interfaces:**
- PatientAccessForm accepts no props and navigates to /patient/home after the synthetic code passes.
- BrandMark accepts compact?: boolean and renders the shared ChroniCare identity.

- [x] **Step 1: Implement the minimum semantic screen**

Use a single h1, a visible Kode akses label, numeric six-character input, helper text, accessible inline error, disabled loading state reading Memeriksa kode…, and safe error copy from NEWDESIGN.md.

- [x] **Step 2: Implement Care in Motion styling**

Use a warm full-height canvas, flat semantic colors, one moving arc motif, a single dominant teal submit action, strong focus-visible ring, 48 px targets, and reduced-motion handling. Do not use gradients, glassmorphism, emoji icons, or clinical claims.

- [x] **Step 3: Run access tests and confirm GREEN**

Run: npm.cmd test -- src/test/patient-access.test.tsx  
Expected: all access tests PASS without warnings.

### Task 3: Implement Screen 02 Patient Home and turn its tests GREEN

**Files:**
- Create: web/src/app/patient/home/page.tsx
- Create: web/src/components/patient-shell.tsx

**Interfaces:**
- PatientShell accepts children: ReactNode and renders the responsive shared header/navigation.
- PatientHomePage remains a Server Component with synthetic display data only.

- [x] **Step 1: Implement the semantic home hierarchy**

Render the Maya greeting, one dominant check-in Motion Card, the next reminder card, assistant/reminder actions, separated SOS action, and four labeled Patient navigation destinations.

- [x] **Step 2: Implement responsive composition**

At 390 × 844 use one column and bottom navigation with reserved safe-area space. At desktop width keep the content centered and move navigation into the header rather than stretching into a dense dashboard.

- [x] **Step 3: Run both component tests and confirm GREEN**

Run: npm.cmd test -- src/test/patient-access.test.tsx src/test/patient-home.test.tsx  
Expected: all tests PASS without console errors.

### Task 4: Replace legacy E2E and verify the experiment

**Files:**
- Replace: web/e2e/prototype.spec.ts

**Interfaces:**
- E2E visits only /patient/access and /patient/home.
- Screenshots use the test-results/care-in-motion-*.png naming family and do not reuse legacy names.

- [x] **Step 1: Write the focused E2E test**

The test must verify invalid-code feedback, valid-code navigation using 204682, Patient Home hierarchy, no horizontal overflow, and screenshots at 390 × 844 and 1440 × 900.

- [x] **Step 2: Run the full verification set**

Run in web:

~~~text
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
~~~

Expected: every command exits 0. If any command fails, diagnose the actual cause before changing implementation.

- [x] **Step 3: Perform visual and accessibility review**

Inspect both screenshots for hierarchy, clipping, safe-area spacing, focus visibility, touch sizing, teal/amber/coral semantics, and separation of SOS red. Confirm that the UI contains no diagnosis, dosing, lab interpretation, nutrition prescription, real data, or delivery guarantee.

- [x] **Step 4: Report without Git integration**

Report files changed, cleanup performed, test evidence, remaining scope, stash status, and explicitly state that no branch, commit, or push occurred.
