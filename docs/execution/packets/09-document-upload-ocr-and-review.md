# Packet 09: Document Upload, OCR, and Review

Status: Draft

Driver / DRI: Al

Contributors: Bernard, Daniel, Ozan

Reviewer: Ozan

Timebox: hours 16 to 19

## Role Work

- Role A - OCR/extraction, DRI: Al: implement Azure Document Intelligence/OCR fallback and structured extraction mapping with safety boundaries.
- Role B - Storage/API, DRI: Bernard: implement private document upload, document records, review state, validation, and confirmed-summary selector.
- Role C - Review UI, DRI: Daniel: build caregiver review/edit/reject/confirm UI with source-versus-extraction clarity.
- Role D - QA/product, DRI: Ozan: verify fallback labeling, cross-profile isolation, and demo timing.

## Goal

Implement private synthetic document upload, OCR or labeled fallback, structured extraction, caregiver review, and confirmation gate.

## User-Visible Outcome

Caregiver uploads a synthetic document, sees extraction as draft, edits one field, and confirms it before the summary can be used by chatbot context.

## Covered Canonical Sources

- `AGENTS.md`
- `docs/execution/packets.md`
- `docs/execution/packets/09-document-upload-ocr-and-review.md`
- `docs/technical/api.md`
- `docs/technical/data-model.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`
- `docs/product/feature-scope.md`

## Dependency Inputs

- Completed Packet 08 caregiver dashboard entry point exists.
- Private Supabase Storage bucket is available or setup blocker is documented.
- Azure Document Intelligence and Azure OpenAI credentials work, or `DEMO_FALLBACK` mode is configured.
- Synthetic demo document is available.

## Hard Dependencies

- Packet 02 provider boundary must exist.
- Packet 05 profile isolation must exist.
- Packet 06 lifecycle exclusion must exist.
- Packet 08 caregiver dashboard must exist.

## Soft Dependencies / Parallel Prep

- Daniel can prepare review UI states while Al validates OCR fixture.
- Bernard can prepare storage policy/API shell while Al maps extraction schema.
- Ozan can prepare invalid file, fallback, and profile-switch manual QA cases.

## Allowed Files / Areas

- `web/src/app/api/v1/patient-profiles/[patientProfileId]/documents/`
- `web/src/components/documents/`
- `web/src/lib/documents/`
- `web/src/lib/ocr/`
- `web/src/lib/azure/`
- `web/src/lib/ai/extraction/`
- `web/prisma/` only for document/review models if not already added
- `web/tests/**/documents*`
- `web/tests/**/ocr*`

## Out of Scope

- Batch OCR.
- Files over 5 MB or more than three pages.
- Real family documents.
- Automatic medication/reminder updates from OCR.
- Clinical interpretation, lab safety interpretation, or diagnosis.
- Diabetes lab interpretation, target recommendation, or food/pantangan advice.
- Background OCR queue.
- Automatic content classification for KTP or other identity documents.

## Acceptance Criteria

- Upload accepts PDF/JPEG/PNG only and rejects unsupported type, size, and page limit.
- File stays in private Supabase Storage with no public URL.
- OCR produces `PENDING_REVIEW` extraction or a labeled `DEMO_FALLBACK` extraction.
- Zod validates `document-extraction.v1`.
- Caregiver can edit, confirm, or reject the draft.
- Confirmation is atomic and audit logged.
- Confirmed-summary selector returns only confirmed extraction for one authorized `patientProfileId`.
- Document upload, extraction, review, and confirmed-summary selection reject a deactivated Patient Profile before storage or provider work begins.
- Pending/rejected/failed extraction never enters chatbot context.
- Raw OCR text, file bytes, BPJS number, and provider errors are not logged.
- Upload UI lists supported health-document categories and tells users not to upload KTP or other identity documents.

## Automated Checks

| Command | Expected |
| --- | --- |
| `npm test -- documents` from `/web` if supported | Upload validation, review states, and profile isolation pass. |
| `npm test -- ocr` from `/web` if supported | Extraction schema validation and fallback labeling pass. |
| `npm run typecheck` from `/web` | Document/OCR route and selector types compile. |
| `npm run lint` from `/web` | Document/OCR code lint cleanly. |
| `npm run test:e2e` from `/web` if document route exists | Upload-review-confirm happy path and invalid-file case pass. |

## Manual QA

- Upload one synthetic Maya document.
- Observe processing and review-required states.
- Correct one field and confirm.
- Try invalid type, oversize file, and unreadable file.
- Switch to Raka and confirm Maya document does not appear.
- Try the document entry points with a deactivated resettable profile and confirm no upload, extraction, or confirmed summary is available.
- Confirm `DEMO_FALLBACK` is visible when fixture mode is used.
- Confirm upload copy does not request KTP and warns against uploading identity documents.

## Documentation Update Rules

- Do not change OCR provider or extraction contract without human verdict.
- Do not update AI guardrails to permit clinical interpretation.
- If final selector names differ from planning, record them in handoff for Packet 11.

## Blockers / Stop Conditions

- Private storage cannot be enforced.
- Provider latency threatens the two-minute demo and fallback label is not ready.
- Extraction context would include pending/rejected/failed or wrong-profile data.
- Review UI cannot distinguish source text from extracted fields.

## Handoff Notes

Provide confirmed OCR summary selector, provider mode, fallback trigger, review-state evidence, private storage evidence, and cross-profile document isolation evidence. Packet 11 must use only the confirmed selector.
