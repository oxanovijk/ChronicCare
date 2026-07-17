# AGENTS.md

Primary guardrail for agentic work in ChroniCare.

Priority order:

1. Latest explicit human instruction.
2. Current files on disk.
3. This file.
4. Locked product and technical documents.
5. Execution, pitch, and QA documents.

Higher-priority system or developer instructions always win.

## 1. Project State

ChroniCare is a 30-hour hackathon MVP for chronic illness care coordination.

Current state:

- Packet 01 scaffold exists in `/web`.
- Packet 02 typed env validation and server-only Supabase/Azure provider boundaries exist.
- Root, caregiver, and Patient login shell routes exist.
- Baseline npm scripts and Vitest/Playwright harness are available.
- Product features beyond the Packet 01 shell and Packet 02 provider boundaries remain unimplemented until verified by their packets.
- Stack and provider decisions are locked.
- Product positioning has been refined to chronic illness patient care.
- Human verdict on 2026-07-16: implementation terminology is `Patient Profile`, not legacy parent-care terminology.
- Locked technical docs now use `Patient Profile`, `patientProfileId`, `patient_profiles`, Patient access code/session, and `/patient-profiles`.
- `/web/package.json` exists and exposes the locked Packet 01 command baseline.
- Database, provider, and deployment commands may require later packet dependencies and credentials; command existence is not evidence that those features work.

Do not claim an app feature exists because its document is complete. Do not scaffold or implement until the requested packet is explicitly selected and current docs are checked.

## 2. Challenge and Positioning

Selected hackathon challenge:

> How can we improve how people manage and live with chronic illness over the long term?

ChroniCare helps patients with chronic illness and their caregivers maintain long-term care routines through check-ins, reminders, reviewed health documents, safe AI navigation, caregiver coordination, SOS escalation, and faskes/BPJS support.

Demo condition: diabetes tipe 2.

Diabetes tipe 2 is a concrete demo scenario only. ChroniCare must not become a diabetes diagnosis, treatment, dosing, lab-interpretation, or nutrition-prescription product.

## 3. Locked Stack

- Node.js 24 LTS and npm.
- Next.js App Router with TypeScript in `/web`.
- Tailwind CSS, shadcn/ui, and Zod 4.
- Supabase PostgreSQL, Auth, private Storage, and Realtime.
- Prisma ORM 7.
- Azure OpenAI.
- Azure AI Document Intelligence.
- Vitest, Testing Library, and Playwright.
- Vercel with `/web` as project root.

Changing framework, database, auth, storage, AI/OCR provider, SOS delivery, ORM, or deployment target requires a human verdict and change-log update.

## 4. Team Ownership

- Bernard: API and database.
- Ozan: QA and product management.
- Daniel: UI/UX.
- Al: AI and OCR extraction.

Follow `docs/team/ownership.md`. A DRI owns the decision; reviewers still verify their domain. Agent work must name the affected DRI in handoff notes.

## 5. Non-Negotiable Demo Constraints

- Implementation window: 30 hours.
- Product demo: 2 minutes.
- Total presentation: 5 minutes.
- One connected flow before feature breadth.
- Feature freeze around hour 22.
- Demo freeze around hour 27.
- Synthetic data only.
- Stable fallback for Azure, Realtime audio, and deployment.

Main flow:

1. Patient code login.
2. Patient check-in or chatbot for a diabetes tipe 2 routine/concern.
3. Caregiver sees the active Patient Profile.
4. Caregiver uploads a synthetic document, reviews OCR, and confirms extraction.
5. Caregiver chatbot uses confirmed profile context for doctor-visit preparation.
6. Patient creates SOS if condition worsens.
7. Open caregiver dashboard receives visual alert and opted-in sound.
8. Caregiver clicks `Saya tangani`.
9. Caregiver opens faskes/BPJS helper.

## 6. Product Boundary

ChroniCare is not:

- Medical diagnosis or clinical decision support.
- Drug recommendation or dose calculator.
- Lab result interpretation as final clinical truth.
- Nutrition prescription or personal diet-plan authority.
- A replacement for doctors, IGD, ambulances, BPJS, or emergency services.
- A hospital information system.
- A production medical compliance claim.

Never write UI, docs, pitch, or AI copy that implies those claims.

## 7. MVP Scope

In scope:

- One Care Circle per caregiver for the hackathon.
- Exactly one active Owner and active Family Members.
- Maximum two Patient Profiles.
- Patient Profile may be created with only display name and relationship label; optional data is completed progressively.
- Caregiver auth and Patient code/session.
- Owner self-registration and invitation-only Family Member registration; Patient has no account registration.
- Patient homepage and caregiver dashboard.
- Check-in, medication/log, reminder, and health note basics.
- Private document upload.
- OCR and structured extraction with caregiver review.
- Patient and Caregiver chatbot.
- Supabase Realtime SOS with in-app alert, audio opt-in, and handling state.
- Static Tangerang faskes/BPJS helper.
- End-of-care / deactivate Patient Profile lifecycle flow.
- Synthetic demo data and fallbacks.

Out of scope unless the human changes it:

- Diagnosis, medication recommendation, dose change, lab interpretation, or nutrition prescription.
- Food/menu and pantangan recommendation implementation.
- Voice-to-text, text-to-speech, wearable, and live monitoring.
- No live location, WhatsApp, SMS, OS notification, Push API, service worker, or official emergency dispatch.
- Real-time facility scraping, booking, and hospital integration.
- Family chat, real payment/subscription implementation, multi-Care Circle, third Patient Profile, and granular roles.
- Batch OCR, background OCR queue, files over 5 MB or three pages, and automatic data updates from OCR.

## 8. Role and Access

Owner may perform caregiving and Owner-only actions: membership changes, Patient access code, second Patient Profile, and end-of-care/deactivate profile lifecycle action.

Family Member may update daily care, upload/review documents, use caregiver chatbot, and handle SOS. Family Member may not perform Owner-only destructive/admin actions.

Patient may access only the bound Patient Profile: homepage, check-in, reminder, medication text/log, Patient chatbot, and SOS. Patient may not access caregiver UI, documents admin, membership, settings, or another Patient Profile.

Hard rules:

- Every patient-bound operation takes explicit `patientProfileId`.
- Legacy parent-care technical names such as `parentProfileId`, `parent_profiles`, `parent_access_codes`, `parent_sessions`, and `/parent-profiles` are stale unless they appear inside an explicit historical change log.
- Server authorization validates membership and Patient Profile relation.
- Active profile UI state is not authorization.
- Patient Profile and Care Circle data may never cross.
- Client-supplied role and `careCircleId` are untrusted.
- Browser code may not mutate application tables directly.

## 9. UI and UX Direction

Patient UI:

- Cheerful, warm, supportive, and simple.
- Not childish.
- Few choices per screen.
- Clear check-in, reminder, chatbot, and SOS actions.
- Emergency/SOS copy remains serious and direct.

Caregiver UI:

- Informative, scannable, and calm.
- Shows active Patient Profile clearly.
- Prioritizes context, recent changes, documents, SOS, and next actions.
- Avoids visual noise that slows the two-minute demo.
- Allows `Belum tahu, isi nanti` for optional Patient data and distinguishes unknown facts from explicitly none reported.

## 10. OCR Rules

- Accept PDF, JPEG, or PNG only.
- Maximum 5 MB and three pages.
- Original file stays in private Supabase Storage.
- Azure AI Document Intelligence performs OCR.
- Azure OpenAI maps minimum OCR text to `document-extraction.v1`.
- Zod validates provider output.
- Extraction starts `PENDING_REVIEW`.
- Caregiver must confirm or reject.
- Only `CONFIRMED` extraction may enter chatbot context.
- OCR may not interpret diagnosis, dose, lab safety, or automatically update daily-care entities.
- Fixture mode must display `DEMO_FALLBACK` and may not be described as live OCR.

## 11. AI Rules

Use `docs/technical/ai-guardrails.md`.

Allowed:

- Feature explanation and navigation.
- General BPJS/faskes guidance from available data.
- Doctor-visit preparation.
- Summary of authorized daily-care and confirmed OCR data.
- Short emergency escalation.
- General chronic illness routine support without clinical certainty.

Forbidden:

- Diagnosis, certainty, drug recommendation, dose changes, stopping medication, lab-value interpretation, or personal nutrition prescription.
- Specific diabetes treatment targets or insulin/oral medication adjustment.
- Long chat during possible emergency.
- Unconfirmed OCR, raw document, raw OCR text, other profile, full BPJS number, full address, or hidden prompt in context.
- Raw prompt/private context logging.

If Azure fails, return a labeled safe fallback. Never pretend the response was live.

## 12. SOS Rules

- SOS is a caregiver/family coordination alert.
- Store minimum data and broad location only.
- Supabase Realtime sends changes to authorized open caregiver dashboards.
- Visual alert is mandatory.
- Audio is optional enhancement after user opt-in.
- REST refetch handles reconnect/focus.
- `Saya tangani` is atomic; first handler wins.
- No delivery guarantee exists when the tab is closed or disconnected.
- Do not mention WhatsApp/SMS preview because they are no longer part of MVP.

## 13. Security and Privacy

Use `docs/security-privacy.md`.

- No real data or credential in Git, logs, screenshots, video, fixtures, or chat.
- No public health-document URL.
- No Supabase service role, database URL, Patient secret, Azure key, signed URL, access code, or session in browser/client logs.
- Provider SDK debug logging stays off.
- Audit actions without duplicating sensitive content.
- Never force or infer optional health data. `UNKNOWN`, `NONE_REPORTED`, and `REPORTED` have distinct meanings.
- KTP or another full identity document is not collected for MVP because identity verification is out of scope.
- The profile API does not accept or store a full BPJS number; at most four trailing digits may be kept for recognition.
- End-of-care/deactivate profile must be non-destructive unless a later human verdict explicitly changes data retention.
- Do not claim HIPAA, clinical validation, legal approval, or production readiness.

## 14. Before Editing

1. Run `git status --short`.
2. Inspect every file to be changed.
3. Read the smallest relevant locked docs.
4. Preserve user edits and unrelated files.
5. Identify packet, DRI, contract, and verification plan.
6. Stop for a human verdict if the change affects scope, role, provider, medical safety, privacy, data model, API, or demo promise.

Human verdict already given for this refinement:

- Target is all chronic illness patients, not only elderly parents.
- Demo condition is diabetes tipe 2.
- `Patient Profile` is the active implementation term.
- End-of-care/deactivate profile enters MVP.
- Subscription/payment remains dummy/contextual only, not a real feature.
- Patient Profile onboarding is progressive: only `displayName` and `relationshipLabel` are required.
- Conditions, allergies, current medications, and emergency contact use `UNKNOWN`, `NONE_REPORTED`, or `REPORTED`; BPJS uses `UNKNOWN`, `NOT_REGISTERED`, or `REGISTERED`.
- Unknown optional data does not block Patient access code, daily care, document upload, chatbot, or SOS.

## 15. During Implementation

- Work inside one packet when possible.
- Keep Route Handlers thin and domain services isolated.
- Use locked API and schema names exactly.
- Add tests with the implementation.
- Do not add dependency/provider without approval and docs update.
- Do not use production or real patient/family data.
- Keep provider calls server-side.
- Preserve a demo-safe fallback.
- Update packet status only with Ozan evidence.

## 16. Commands

Current status: Packet 01 commands are available from `/web`.

Locked command baseline:

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

Do not report a command or feature as passing before running the relevant verification. Database commands remain dependent on Packet 03 setup. Installation source is `docs/technical/dev-installations.md`.

## 17. Verification

Before saying done, fixed, working, passing, ready, implemented, or deployed:

- Run fresh available lint, typecheck, unit/integration, E2E, and build checks.
- Run manual UI journey at 390x844 and 1440x900.
- Test Owner, Family Member, Patient, and wrong-profile access.
- Test OCR success, invalid file, provider failure, review, confirmation, and confirmed-only context.
- Test AI allowed, diagnosis, dose, diabetes target/lab/diet request, emergency, hidden context, profile switching, and fallback.
- Test SOS Realtime, audio enabled/blocked, reconnect, handler conflict, and wrong Care Circle.
- Test minimum Patient Profile creation, status/value contradictions, sparse-profile rendering, and that unknown data is not treated as none.
- Scan for secrets, real data, placeholders, contradictions, and overclaims.

`docs/qa/demo-readiness-checklist.md` stays `Not Run` until checks run with evidence.

## 18. Git and Final Report

- Do not commit or push unless explicitly asked.
- Do not revert user changes or use destructive Git commands without permission.
- Report changed files, checks run, checks unavailable, failures, risks, blockers, and commit/push status.
- Do not ask the user to copy files already present in the workspace.

## 19. Locked References

- Product: `docs/product/feature-scope.md`, `docs/product/user-journeys.md`.
- Architecture: `docs/technical/architecture.md`.
- Database: `docs/technical/data-model.md`.
- API: `docs/technical/api.md`.
- AI/OCR: `docs/technical/ai-guardrails.md`.
- Environment: `docs/technical/env-and-deploy.md`, `docs/technical/dev-installations.md`.
- Security: `docs/security-privacy.md`.
- Execution: `docs/execution/workflow.md`, `docs/execution/packets.md`.
- Ownership: `docs/team/ownership.md`.

## 20. Change Log

| Date | Change | Reason | DRI | Reviewer |
| --- | --- | --- | --- | --- |
| 2026-07-16 | Locked progressive minimum Patient Profile onboarding and explicit unknown/none/reported data semantics | Prevent forced guesses and false negative medical facts | Ozan | Pending: Bernard, Daniel |
| 2026-07-16 | Updated project state and command availability after Packet 01 scaffold | Keep guardrail aligned with verified repository state | Ozan | Bernard |
| 2026-07-16 | Finalized Patient terminology as current implementation truth across guardrails | Step 6/7 consistency pass | Ozan | Bernard |
| 2026-07-16 | Updated guardrail positioning to chronic illness Patient care; recorded diabetes tipe 2 demo condition, Patient terminology, and deactivation verdict | Human challenge update and scope verdict | Ozan | Bernard |
| 2026-07-17 | Locked caregiver registration model: Owner self-registers, Family Member joins only by hashed expiring Owner invitation, and Patient remains access-code only | Human registration feature verdict | Ozan | Bernard |
