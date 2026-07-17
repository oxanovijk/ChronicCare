# Development Process

Status: Submission draft

## Submission-Ready Paragraph

ChroniCare was built as a modular Next.js monolith during a 30-hour hackathon, with the work divided into small, evidence-based implementation packets. Bernard owned the API, database, authentication, Supabase integration, and server-side authorization; Ozan owned product scope, acceptance criteria, QA evidence, demo readiness, and pitch coordination; Daniel owned the Patient and Caregiver information architecture, responsive UI, accessibility, and user-facing copy; and Al owned Azure OpenAI, Azure AI Document Intelligence, extraction design, AI safety rules, and provider fallbacks. The team prioritized one connected Patient-to-Caregiver journey, used fictional seed data, and required linting, type checking, automated tests, builds, responsive checks, and human review before marking a packet complete. Provider calls and sensitive authorization remained server-side, while explicit fallbacks kept the demo honest when an external service was unavailable.

## Architecture Notes for Judges

- One deployable Next.js App Router application contains the UI, Route Handlers, domain services, and provider adapters.
- Prisma accesses Supabase PostgreSQL, while Supabase also provides Caregiver authentication, private storage, and Realtime capabilities.
- Patient access uses a hashed access code and an opaque `httpOnly` session bound to one Patient Profile.
- Every patient-bound operation requires an explicit `patientProfileId` and server-side relationship authorization.
- External AI and OCR calls are designed to run only on the server and to return an explicitly labeled safe fallback when unavailable.
- OCR output remains a draft until a Caregiver reviews and confirms it; only confirmed data may be used as AI context.

## Team Review Note

Before submitting, each team member should confirm that the paragraph accurately reflects their contribution. The affected DRI for this submission package is Ozan, with Bernard reviewing technical claims, Daniel reviewing visible product claims, and Al reviewing AI/OCR claims.
