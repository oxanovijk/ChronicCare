# Progressive Patient Profile Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow an Owner to create a Patient Profile from minimum identity, preserve unknown optional facts explicitly, and carry those semantics safely through profile APIs, caregiver UI, Medication state, and AI context.

**Architecture:** Store safety-relevant fact knowledge states directly on `patient_profiles`, enforce same-row consistency in PostgreSQL and the service layer, and derive the setup checklist from Patient Profile fields only. Packet 08 synchronizes active Medication creation with the profile medication status, while Packet 11 filters sparse facts before building AI context.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod 4, Prisma ORM 7, Supabase PostgreSQL, Vitest, Testing Library, Playwright.

## Global Constraints

- Only `displayName` and `relationshipLabel` are required to create a Patient Profile.
- `ProfileFactStatus` is exactly `UNKNOWN | NONE_REPORTED | REPORTED`.
- `BpjsMembershipStatus` is exactly `UNKNOWN | NOT_REGISTERED | REGISTERED`.
- A full BPJS number is never accepted or stored; `bpjsNumberLast4` is optional and exactly four digits.
- Empty arrays never imply `NONE_REPORTED`.
- Patient Profile PATCH accepts only `UNKNOWN` or `NONE_REPORTED` for current medications; `REPORTED` is server-managed by Medication transactions.
- Unknown optional data never blocks Patient access code, check-in, document upload, chatbot, or SOS.
- OCR never changes profile facts, fact statuses, Medication, or Reminder automatically.
- `NONE_REPORTED` remains caregiver-reported information, not clinical truth.
- All Patient-bound reads and writes require an explicit authorized `patientProfileId`.
- All fixtures and tests use synthetic data only.

---

## File Map

- `web/prisma/schema.prisma`: Prisma enums and Patient Profile columns.
- `web/prisma/migrations/20260716220000_progressive_patient_profile/migration.sql`: PostgreSQL enum, column, and check-constraint migration.
- `web/prisma/seed.ts`: Maya/Raka fact-state fixtures.
- `web/src/lib/patient-profile/profile-facts.ts`: Zod schemas, normalization, and merged-state consistency validation.
- `web/src/lib/patient-profile/setup-checklist.ts`: deterministic derived checklist.
- `web/src/lib/patient-profile/service.ts`: authorized minimum create and progressive update transactions.
- `web/src/app/api/v1/patient-profiles/route.ts`: list/create route.
- `web/src/app/api/v1/patient-profiles/[patientProfileId]/route.ts`: get/update route.
- `web/src/components/profile/patient-profile-setup.tsx`: progressive optional setup flow.
- `web/src/components/profile/profile-setup-checklist.tsx`: sparse-state checklist.
- `web/src/lib/daily-care/medication-service.ts`: atomic Medication/profile status synchronization.
- `web/src/lib/ai/context/patient-profile-context.ts`: sparse fact filtering and qualification.
- `web/tests/unit/profile-facts.test.ts`: pure fact validation tests.
- `web/tests/unit/profile-setup-checklist.test.ts`: deterministic checklist tests.
- `web/tests/integration/patient-profile-service.test.ts`: create/update/authorization tests.
- `web/tests/integration/medication-profile-status.test.ts`: Medication synchronization tests.
- `web/tests/unit/ai-patient-profile-context.test.ts`: AI context tests.
- `web/tests/e2e/progressive-profile-setup.spec.ts`: user journey tests.

### Task 1: Add Database Enums, Columns, and Constraints

**Files:**

- Modify: `web/prisma/schema.prisma`
- Create: `web/prisma/migrations/20260716220000_progressive_patient_profile/migration.sql`
- Test: `web/tests/integration/profile-fact-constraints.test.ts`

**Interfaces:**

- Produces: Prisma enums `ProfileFactStatus`, `BpjsMembershipStatus`.
- Produces: Patient Profile status fields and optional `bpjsNumberLast4`.
- Consumed by: Tasks 2 through 7.

- [ ] **Step 1: Write failing database constraint tests**

Create tests for:

```ts
it("defaults optional facts to UNKNOWN on minimum profile create", async () => {
  const profile = await createMinimumProfile()

  expect(profile.primaryConditionsStatus).toBe("UNKNOWN")
  expect(profile.allergiesStatus).toBe("UNKNOWN")
  expect(profile.currentMedicationsStatus).toBe("UNKNOWN")
  expect(profile.emergencyContactStatus).toBe("UNKNOWN")
  expect(profile.bpjsMembershipStatus).toBe("UNKNOWN")
})

it("rejects REPORTED conditions without values", async () => {
  await expect(
    updateProfileDirectly({
      primaryConditionsStatus: "REPORTED",
      primaryConditions: [],
    }),
  ).rejects.toThrow()
})

it("rejects a BPJS suffix outside REGISTERED", async () => {
  await expect(
    updateProfileDirectly({
      bpjsMembershipStatus: "UNKNOWN",
      bpjsNumberLast4: "1234",
    }),
  ).rejects.toThrow()
})
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```powershell
Set-Location web
npm test -- profile-fact-constraints
```

Expected: FAIL because the enums, columns, and constraints do not exist.

- [ ] **Step 3: Add Prisma enums and Patient Profile fields**

Add:

```prisma
enum ProfileFactStatus {
  UNKNOWN
  NONE_REPORTED
  REPORTED

  @@map("profile_fact_status")
}

enum BpjsMembershipStatus {
  UNKNOWN
  NOT_REGISTERED
  REGISTERED

  @@map("bpjs_membership_status")
}
```

Add these mapped fields to `PatientProfile`:

```prisma
primaryConditions          String[]             @default([]) @map("primary_conditions")
primaryConditionsStatus    ProfileFactStatus    @default(UNKNOWN) @map("primary_conditions_status")
allergies                  String[]             @default([])
allergiesStatus            ProfileFactStatus    @default(UNKNOWN) @map("allergies_status")
currentMedicationsStatus   ProfileFactStatus    @default(UNKNOWN) @map("current_medications_status")
bpjsMembershipStatus       BpjsMembershipStatus @default(UNKNOWN) @map("bpjs_membership_status")
bpjsNumberLast4            String?              @db.VarChar(4) @map("bpjs_number_last4")
emergencyContactName       String?              @db.VarChar(120) @map("emergency_contact_name")
emergencyContactPhone      String?              @db.VarChar(32) @map("emergency_contact_phone")
emergencyContactStatus     ProfileFactStatus    @default(UNKNOWN) @map("emergency_contact_status")
updatedByUserId            String?              @db.Uuid @map("updated_by_user_id")
```

- [ ] **Step 4: Add PostgreSQL check constraints**

Add migration SQL:

```sql
ALTER TABLE patient_profiles
  ADD CONSTRAINT patient_profiles_primary_conditions_fact_check
  CHECK (
    (primary_conditions_status = 'REPORTED' AND cardinality(primary_conditions) > 0)
    OR
    (primary_conditions_status IN ('UNKNOWN', 'NONE_REPORTED') AND cardinality(primary_conditions) = 0)
  ),
  ADD CONSTRAINT patient_profiles_allergies_fact_check
  CHECK (
    (allergies_status = 'REPORTED' AND cardinality(allergies) > 0)
    OR
    (allergies_status IN ('UNKNOWN', 'NONE_REPORTED') AND cardinality(allergies) = 0)
  ),
  ADD CONSTRAINT patient_profiles_emergency_contact_fact_check
  CHECK (
    (
      emergency_contact_status = 'REPORTED'
      AND (
        NULLIF(BTRIM(emergency_contact_name), '') IS NOT NULL
        OR NULLIF(BTRIM(emergency_contact_phone), '') IS NOT NULL
      )
    )
    OR
    (
      emergency_contact_status IN ('UNKNOWN', 'NONE_REPORTED')
      AND emergency_contact_name IS NULL
      AND emergency_contact_phone IS NULL
    )
  ),
  ADD CONSTRAINT patient_profiles_bpjs_fact_check
  CHECK (
    (
      bpjs_membership_status = 'REGISTERED'
      AND (
        bpjs_number_last4 IS NULL
        OR bpjs_number_last4 ~ '^[0-9]{4}$'
      )
    )
    OR
    (
      bpjs_membership_status IN ('UNKNOWN', 'NOT_REGISTERED')
      AND bpjs_number_last4 IS NULL
    )
  );
```

- [ ] **Step 5: Generate Prisma client and rerun tests**

Run:

```powershell
npm run db:generate
npm test -- profile-fact-constraints
```

Expected: Prisma generation succeeds and all constraint tests pass.

- [ ] **Step 6: Commit**

```powershell
git add web/prisma/schema.prisma web/prisma/migrations/20260716220000_progressive_patient_profile/migration.sql web/tests/integration/profile-fact-constraints.test.ts
git commit -m "feat: add progressive patient profile fact states"
```

### Task 2: Add Synthetic Sparse-Profile Seed Data

**Files:**

- Modify: `web/prisma/seed.ts`
- Test: `web/tests/unit/seed-progressive-profile.test.ts`

**Interfaces:**

- Consumes: Task 1 Prisma fields.
- Produces: Maya with reported demo context and Raka with at least one unknown fact.

- [ ] **Step 1: Write failing seed assertions**

```ts
it("seeds distinct reported and unknown profile facts", async () => {
  const { maya, raka } = await loadSeededProfiles()

  expect(maya.primaryConditionsStatus).toBe("REPORTED")
  expect(maya.primaryConditions).toEqual(["Diabetes tipe 2"])
  expect(maya.currentMedicationsStatus).toBe("UNKNOWN")

  expect(raka.allergiesStatus).toBe("UNKNOWN")
  expect(raka.allergies).toEqual([])
})
```

- [ ] **Step 2: Run and confirm failure**

```powershell
npm test -- seed-progressive-profile
```

Expected: FAIL because the seed does not populate the new fields.

- [ ] **Step 3: Update synthetic seed records**

Use these semantic states:

```ts
const mayaFacts = {
  primaryConditions: ["Diabetes tipe 2"],
  primaryConditionsStatus: "REPORTED" as const,
  allergies: [],
  allergiesStatus: "NONE_REPORTED" as const,
  currentMedicationsStatus: "UNKNOWN" as const,
  emergencyContactStatus: "REPORTED" as const,
  emergencyContactName: "Dimas Pratama",
  emergencyContactPhone: "081200000001",
  bpjsMembershipStatus: "REGISTERED" as const,
  bpjsNumberLast4: "1234",
}

const rakaFacts = {
  primaryConditions: ["Hipertensi"],
  primaryConditionsStatus: "REPORTED" as const,
  allergies: [],
  allergiesStatus: "UNKNOWN" as const,
  currentMedicationsStatus: "UNKNOWN" as const,
  emergencyContactStatus: "REPORTED" as const,
  emergencyContactName: "Rina Pratama",
  emergencyContactPhone: "081200000002",
  bpjsMembershipStatus: "UNKNOWN" as const,
  bpjsNumberLast4: null,
}
```

- [ ] **Step 4: Run seed tests**

```powershell
npm test -- seed-progressive-profile
```

Expected: PASS with no real identity or health data.

- [ ] **Step 5: Commit**

```powershell
git add web/prisma/seed.ts web/tests/unit/seed-progressive-profile.test.ts
git commit -m "test: seed sparse patient profile states"
```

### Task 3: Implement Fact Validation and Setup Checklist

**Files:**

- Create: `web/src/lib/patient-profile/profile-facts.ts`
- Create: `web/src/lib/patient-profile/setup-checklist.ts`
- Test: `web/tests/unit/profile-facts.test.ts`
- Test: `web/tests/unit/profile-setup-checklist.test.ts`

**Interfaces:**

- Produces: `patientProfilePatchSchema`.
- Produces: `assertProfileFactConsistency(nextState)`.
- Produces: `buildPatientProfileSetupChecklist(profile)`.
- Consumed by: Task 4 API/service and Task 5 UI.

- [ ] **Step 1: Write failing unit tests**

Cover:

```ts
expect(() =>
  assertProfileFactConsistency({
    primaryConditionsStatus: "UNKNOWN",
    primaryConditions: ["Diabetes tipe 2"],
  }),
).toThrow("PRIMARY_CONDITIONS_STATUS_MISMATCH")

expect(
  buildPatientProfileSetupChecklist({
    allergiesStatus: "UNKNOWN",
    currentMedicationsStatus: "REPORTED",
    emergencyContactStatus: "UNKNOWN",
    primaryConditionsStatus: "REPORTED",
    bpjsMembershipStatus: "UNKNOWN",
    dateOfBirth: null,
    locationLabel: null,
    city: "Tangerang",
    usualFacilityName: null,
  }).recommendedActions,
).toEqual([
  "REVIEW_ALLERGIES",
  "REVIEW_EMERGENCY_CONTACT",
  "REVIEW_BPJS_STATUS",
  "ADD_DATE_OF_BIRTH",
  "ADD_USUAL_FACILITY",
])
```

- [ ] **Step 2: Run and confirm failure**

```powershell
npm test -- profile-facts profile-setup-checklist
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement strict patch schemas and merged-state validation**

Use:

```ts
export const profileFactStatusSchema = z.enum([
  "UNKNOWN",
  "NONE_REPORTED",
  "REPORTED",
])

export const clientMedicationFactStatusSchema = z.enum([
  "UNKNOWN",
  "NONE_REPORTED",
])

export const bpjsMembershipStatusSchema = z.enum([
  "UNKNOWN",
  "NOT_REGISTERED",
  "REGISTERED",
])

export const patientProfilePatchSchema = z
  .object({
    dateOfBirth: z.iso.date().nullable().optional(),
    city: z.string().trim().max(80).nullable().optional(),
    locationLabel: z.string().trim().max(160).nullable().optional(),
    primaryConditionsStatus: profileFactStatusSchema.optional(),
    primaryConditions: z.array(z.string().trim().min(1).max(160)).optional(),
    allergiesStatus: profileFactStatusSchema.optional(),
    allergies: z.array(z.string().trim().min(1).max(160)).optional(),
    currentMedicationsStatus: clientMedicationFactStatusSchema.optional(),
    emergencyContactStatus: profileFactStatusSchema.optional(),
    emergencyContactName: z.string().trim().max(120).nullable().optional(),
    emergencyContactPhone: z.string().trim().max(32).nullable().optional(),
    bpjsMembershipStatus: bpjsMembershipStatusSchema.optional(),
    bpjsNumberLast4: z.string().regex(/^\d{4}$/).nullable().optional(),
    usualFacilityName: z.string().trim().max(160).nullable().optional(),
  })
  .strict()
```

`assertProfileFactConsistency` validates the fully merged next state, not the partial request alone. It must reject contradictory arrays/statuses, empty emergency-contact strings, and BPJS suffixes outside `REGISTERED`.

- [ ] **Step 4: Implement deterministic checklist order**

Use this exact order:

```ts
const actions: PatientProfileSetupAction[] = []

if (profile.allergiesStatus === "UNKNOWN") actions.push("REVIEW_ALLERGIES")
if (profile.currentMedicationsStatus === "UNKNOWN") actions.push("REVIEW_CURRENT_MEDICATIONS")
if (profile.emergencyContactStatus === "UNKNOWN") actions.push("REVIEW_EMERGENCY_CONTACT")
if (profile.primaryConditionsStatus === "UNKNOWN") actions.push("REVIEW_PRIMARY_CONDITIONS")
if (profile.bpjsMembershipStatus === "UNKNOWN") actions.push("REVIEW_BPJS_STATUS")
if (!profile.dateOfBirth) actions.push("ADD_DATE_OF_BIRTH")
if (!profile.locationLabel && !profile.city) actions.push("ADD_LOCATION")
if (!profile.usualFacilityName) actions.push("ADD_USUAL_FACILITY")
```

- [ ] **Step 5: Run unit tests**

```powershell
npm test -- profile-facts profile-setup-checklist
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add web/src/lib/patient-profile web/tests/unit/profile-facts.test.ts web/tests/unit/profile-setup-checklist.test.ts
git commit -m "feat: validate progressive patient profile facts"
```

### Task 4: Implement Minimum Create and Progressive Update API

**Files:**

- Create: `web/src/lib/patient-profile/service.ts`
- Create: `web/src/app/api/v1/patient-profiles/route.ts`
- Create: `web/src/app/api/v1/patient-profiles/[patientProfileId]/route.ts`
- Test: `web/tests/integration/patient-profile-service.test.ts`

**Interfaces:**

- Consumes: Packet 04 caregiver authorization helpers.
- Consumes: Task 3 validation/checklist functions.
- Produces: authorized minimum create, get, and progressive update behavior.

- [ ] **Step 1: Write failing service tests**

Cover minimum create, Family Member update, third-profile conflict, cross-Care-Circle denial, contradiction rejection, full BPJS rejection, and checklist response:

```ts
it("creates a minimum profile without optional guesses", async () => {
  const result = await createPatientProfile(ownerActor, {
    displayName: "Maya Pratama",
    relationshipLabel: "Maya",
  })

  expect(result.setupChecklist.minimumIdentityComplete).toBe(true)
  expect(result.patientProfile.allergiesStatus).toBe("UNKNOWN")
})
```

- [ ] **Step 2: Run and confirm failure**

```powershell
npm test -- patient-profile-service
```

Expected: FAIL because the service and routes do not exist.

- [ ] **Step 3: Implement create transaction**

The create service must:

1. Resolve Owner membership server-side.
2. Lock the Care Circle row.
3. Reject a third non-deleted profile.
4. Insert only normalized `displayName`, `relationshipLabel`, ownership fields, and default statuses.
5. Write a sanitized audit event.
6. Return the profile and derived checklist.

- [ ] **Step 4: Implement update transaction**

The update service must:

1. Resolve Owner or Family Member authorization.
2. Load the current profile by explicit `patientProfileId`.
3. Parse the strict patch.
4. Merge current and incoming values.
5. Require explicit empty arrays before changing condition/allergy status away from `REPORTED`.
6. Run `assertProfileFactConsistency`.
7. Persist fields and `updatedByUserId`.
8. Audit status transitions without copying values.
9. Return the profile and checklist.

Packet 05 has no Medication model dependency. Task 6 extends this service with the active-Medication cross-table guard when Packet 08 introduces that model.

The strict patch schema rejects client-supplied `currentMedicationsStatus = REPORTED`.

- [ ] **Step 5: Implement thin Route Handlers**

Handlers parse JSON, resolve actor, call service, and map domain errors to the locked API envelope. Do not accept role or `careCircleId` from the client.

- [ ] **Step 6: Run tests**

```powershell
npm test -- patient-profile-service
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add web/src/lib/patient-profile/service.ts web/src/app/api/v1/patient-profiles web/tests/integration/patient-profile-service.test.ts
git commit -m "feat: add progressive patient profile API"
```

### Task 5: Build Progressive Setup and Sparse Dashboard States

**Files:**

- Create: `web/src/components/profile/patient-profile-setup.tsx`
- Create: `web/src/components/profile/profile-setup-checklist.tsx`
- Modify: caregiver Patient Profile creation/dashboard routes under `web/src/app/(caregiver)/`
- Test: `web/tests/e2e/progressive-profile-setup.spec.ts`

**Interfaces:**

- Consumes: Task 4 API responses.
- Produces: `Lengkapi sekarang`, `Isi nanti`, explicit fact choices, and sparse-state display.

- [ ] **Step 1: Write failing Playwright flow**

Test:

1. Owner creates a profile using only name and relationship.
2. Owner chooses `Isi nanti`.
3. Dashboard displays `Belum diketahui` for unknown facts.
4. Owner explicitly selects `Tidak ada yang diketahui` for allergies.
5. Dashboard changes only allergies to qualified none-reported wording.
6. Check-in, documents, chatbot, and SOS entry points remain enabled.

- [ ] **Step 2: Run and confirm failure**

```powershell
npm run test:e2e -- progressive-profile-setup
```

Expected: FAIL because the setup flow does not exist.

- [ ] **Step 3: Implement the setup controls**

Each fact group uses a three-way control:

```ts
type SetupChoice = "ADD_INFORMATION" | "NONE_REPORTED" | "UNKNOWN"
```

Visible Indonesian labels:

- `Tambahkan informasi`
- `Tidak ada yang diketahui`
- `Belum tahu, isi nanti`

Do not use an empty text field as the only representation of unknown.

- [ ] **Step 4: Implement checklist and empty-state copy**

Required copy:

- `UNKNOWN`: `Belum diketahui`
- `NONE_REPORTED`: `Caregiver melaporkan belum ada yang diketahui`
- `REPORTED`: render the recorded value

The checklist is advisory, dismissible for the current UI session, and does not change stored fact statuses when dismissed.

- [ ] **Step 5: Run UI verification**

```powershell
npm run test:e2e -- progressive-profile-setup
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```powershell
git add web/src/components/profile 'web/src/app/(caregiver)' web/tests/e2e/progressive-profile-setup.spec.ts
git commit -m "feat: add progressive patient profile setup"
```

### Task 6: Synchronize Medication State in Packet 08

**Files:**

- Modify or create: `web/src/lib/daily-care/medication-service.ts`
- Modify: `web/src/lib/patient-profile/service.ts`
- Test: `web/tests/integration/medication-profile-status.test.ts`

**Interfaces:**

- Consumes: `PatientProfile.currentMedicationsStatus`.
- Produces: atomic active Medication/profile state synchronization.

- [ ] **Step 1: Write failing transaction tests**

```ts
it("sets REPORTED when the first active medication is created", async () => {
  const medication = await createMedication(caregiver, patientProfileId, validMedication)
  const profile = await loadProfile(patientProfileId)

  expect(medication.status).toBe("ACTIVE")
  expect(profile.currentMedicationsStatus).toBe("REPORTED")
})

it("rejects NONE_REPORTED while an active medication exists", async () => {
  await expect(
    updatePatientProfile(caregiver, patientProfileId, {
      currentMedicationsStatus: "NONE_REPORTED",
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_ERROR" })
})

it("sets UNKNOWN after pausing the final active medication", async () => {
  await pauseMedication(caregiver, patientProfileId, medicationId)
  const profile = await loadProfile(patientProfileId)

  expect(profile.currentMedicationsStatus).toBe("UNKNOWN")
})
```

- [ ] **Step 2: Run and confirm failure**

```powershell
npm test -- medication-profile-status
```

- [ ] **Step 3: Implement transaction rules**

Inside one Prisma transaction:

1. Validate profile authorization.
2. Create or reactivate Medication.
3. Set `currentMedicationsStatus = REPORTED`.
4. Write sanitized audit events.

Pausing or ending the final active Medication sets `currentMedicationsStatus = UNKNOWN`. It must never select `NONE_REPORTED` automatically.

- [ ] **Step 4: Run tests**

```powershell
npm test -- medication-profile-status
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add web/src/lib/daily-care/medication-service.ts web/src/lib/patient-profile/service.ts web/tests/integration/medication-profile-status.test.ts
git commit -m "feat: synchronize medication profile status"
```

### Task 7: Filter Sparse Facts from AI Context in Packet 11

**Files:**

- Create or modify: `web/src/lib/ai/context/patient-profile-context.ts`
- Test: `web/tests/unit/ai-patient-profile-context.test.ts`

**Interfaces:**

- Consumes: authorized Patient Profile and fact statuses.
- Produces: minimum AI context with qualified reported facts.

- [ ] **Step 1: Write failing context tests**

```ts
it("omits UNKNOWN allergies", () => {
  expect(buildPatientProfileContext(profileWithUnknownAllergies))
    .not.toHaveProperty("allergies")
})

it("qualifies NONE_REPORTED allergies", () => {
  expect(buildPatientProfileContext(profileWithNoneReportedAllergies)).toMatchObject({
    allergies: {
      status: "CAREGIVER_REPORTED_NONE_KNOWN",
      values: [],
    },
  })
})
```

- [ ] **Step 2: Run and confirm failure**

```powershell
npm test -- patient-profile-context
```

- [ ] **Step 3: Implement context filtering**

Rules:

- `UNKNOWN`: omit the fact from provider context.
- `NONE_REPORTED`: include only a qualified status marker, not an absolute negative sentence.
- `REPORTED`: include authorized values.
- Never include full BPJS identifiers, raw documents, raw OCR, another profile, or hidden fields.

- [ ] **Step 4: Run tests**

```powershell
npm test -- patient-profile-context
npm test -- ai
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add web/src/lib/ai/context/patient-profile-context.ts web/tests/unit/ai-patient-profile-context.test.ts
git commit -m "feat: preserve sparse facts in ai context"
```

### Task 8: Run Full Verification and Record Packet Evidence

**Files:**

- Update only after real execution: `docs/qa/demo-readiness-checklist.md`
- Update only with Ozan evidence: relevant packet status records.

- [ ] **Step 1: Run automated checks**

```powershell
Set-Location web
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: every command exits 0.

- [ ] **Step 2: Run manual QA at both viewports**

Verify at `390x844` and `1440x900`:

- Minimum profile creation.
- `Isi nanti`.
- Unknown, none-reported, and reported copy.
- Full BPJS input rejection.
- Checklist ordering.
- Medication synchronization.
- Maya/Raka isolation.
- Unknown facts omitted from AI context.
- Check-in, document, chatbot, and SOS entry points remain available.

- [ ] **Step 3: Record evidence without changing unrun checks**

Only checks executed in the current session may move from `Not Run`. Include date, actor, environment, and sanitized evidence.

- [ ] **Step 4: Commit only when explicitly authorized**

```powershell
git add web docs/qa/demo-readiness-checklist.md docs/execution
git commit -m "feat: implement progressive patient profile onboarding"
```
