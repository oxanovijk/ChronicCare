# Two-Minute Demo Video Script

Status: Target English script; final recording must follow the feature claim gate

Target duration: 1 minute 55 seconds, leaving five seconds of upload and editing margin.

## Feature Claim Gate

As of this draft, Packets 01 through 08 are `Done`. Packets 09 through 13 remain evidence-driven and must not be presented as completed merely because this script exists.

| Capability | Current evidence status | Recording rule |
| --- | --- | --- |
| Caregiver authentication, Patient access, profile isolation, and profile lifecycle | Done | May be shown and described as working |
| Patient homepage and profile-bound check-in | Done | May be shown and described as working |
| Caregiver dashboard, medication records, and reminders | Done | May be shown and described as working |
| Private document upload, OCR, and human review | Packet 09 not yet `Done` | Use the target segment only after final verification |
| Tangerang facility/BPJS helper | Packet 10 not yet `Done` in the official index | Use the target segment only after final verification |
| Patient and Caregiver chatbot | Packet 11 not yet `Done` | Use the target segment only after final verification |
| Realtime SOS and handling | Packet 12 not yet `Done` | Use the target segment only after final verification |
| Deployment and full demo readiness | Packet 13 not yet `Done` | Do not claim deployment or full readiness until verified |

## Recommended Target Cut

Use this version only after every capability shown has passed its packet review. Narration and subtitles must be in English. The application UI may remain in Indonesian if the narration clearly explains the visible action.

### 0:00–0:14 — Problem and Track

**Visual:** Title card, then Maya's Patient homepage.

**Narration:**

> Long-term chronic care is often split across patient updates, family messages, reminders, and health documents. ChroniCare brings that coordination into one Care Circle for patients and caregivers.

### 0:14–0:31 — Patient Experience

**Visual:** Show Maya's identity, a reminder, and submit a short check-in.

**Narration:**

> A Patient signs in with a profile-bound access code and sees a simple, supportive view. Maya can record how she feels without turning her check-in into a diagnosis or treatment recommendation.

### 0:31–0:47 — Caregiver Context and Isolation

**Visual:** Open the Caregiver dashboard, briefly switch from Maya to Raka, then return to Maya.

**Narration:**

> Caregivers see the selected Patient Profile, daily-care records, medication notes, and reminders. Server-side authorization keeps Maya's and Raka's information separated, even when the interface switches profiles.

### 0:47–1:05 — Human-Reviewed Documents

**Visual:** Open a synthetic document draft, correct one field, and confirm it.

**Narration:**

> For documents, OCR accelerates data entry but never becomes medical truth automatically. The file stays private, and a Caregiver must review and confirm the extracted draft before it can be used as context.

### 1:05–1:20 — Guarded AI

**Visual:** Ask the Caregiver assistant to prepare questions for Maya's next doctor visit; show the Patient name and a concise safe answer.

**Narration:**

> Guarded AI can help prepare questions for a doctor using only authorized, confirmed context. It does not diagnose, change medication, interpret lab results as final truth, or prescribe a diet.

### 1:20–1:36 — SOS Coordination

**Visual:** Trigger SOS from the Patient view; show the open Caregiver dashboard alert and select the handling action.

**Narration:**

> If Maya needs family help, an open Caregiver dashboard receives a coordination alert. A family member can take responsibility, while the product clearly states that this is not an ambulance or emergency dispatch service.

### 1:36–1:46 — Facility/BPJS Helper

**Visual:** Filter the static Tangerang facility dataset and show its verification disclaimer.

**Narration:**

> A static Tangerang facility and BPJS helper supports the next administrative step, while asking families to confirm current availability directly.

### 1:46–1:55 — Stack, AI Disclosure, and Strength

**Visual:** Architecture end card with the repository URL and team names.

**Narration:**

> We built ChroniCare with Next.js, TypeScript, Supabase, Prisma, Azure AI, and Vercel. OpenAI Codex assisted development, with human review. Our strength is safer continuity: the right Patient context, reviewed information, and a clear next step.

## Safe Cut Available Before Packets 09–12 Are Done

If the deadline arrives before the remaining feature packets pass, do not fake or prerecord them as working. Use the first 47 seconds above, then continue with this evidence-safe ending:

### 0:47–1:19 — Daily Care and Progressive Profiles

**Visual:** Show Maya's dashboard cards, medication/reminder records, then a sparse optional-data state for Raka.

**Narration:**

> Care records are patient-bound and progressive. ChroniCare distinguishes information that is unknown from information explicitly reported as absent, so an incomplete profile does not create a false medical fact or block daily care.

### 1:19–1:38 — Lifecycle and Safety

**Visual:** Show the Owner-only deactivation confirmation without completing a destructive action.

**Narration:**

> Sensitive lifecycle actions are Owner-only and non-destructive. Patient access can be revoked while history is preserved, and every protected request is authorized on the server rather than trusting the active screen.

### 1:38–1:55 — Stack, AI Disclosure, and Roadmap Boundary

**Visual:** Architecture end card, public repository URL, and team names.

**Narration:**

> We built this verified core with Next.js, TypeScript, Supabase, Prisma, Vitest, and Playwright. Our target Azure AI workflow remains human-reviewed and non-diagnostic. OpenAI Codex assisted development, while our team reviewed every decision and result.

## Recording and Editing Rules

- Keep the exported video at or below 2:00; aim for 1:55.
- Explain the problem, solution, chosen track, core features, stack, AI usage, and strongest differentiator.
- Use English narration, captions, title cards, and end cards.
- Use only synthetic data and hide access codes, credentials, full addresses, private URLs, and browser developer tools containing secrets.
- Display the public repository URL long enough to read.
- Do not call a fixture or deterministic fallback a live provider response.
- Do not claim that SOS works when the Caregiver tab is closed or that it contacts emergency services.
- Do not claim diagnosis, clinical validation, nutrition prescription, production readiness, or legal/compliance certification.
- Record at 1440x900 when possible, while including a brief 390x844 Patient mobile view if it remains readable in the final export.
- Use original narration and screen recordings unless every external audiovisual asset is credited.

## Final End Card Copy

```text
ChroniCare
Long-term care coordination for patients and caregivers

Next.js · TypeScript · Supabase · Prisma · Azure AI · Vercel
AI-assisted development disclosed; human-reviewed decisions

[PUBLIC REPOSITORY URL]
```
