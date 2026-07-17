# Hackathon Submission Checklist

Status: Working checklist

Owner: Ozan

Technical reviewer: Bernard  
UI and media reviewer: Daniel  
AI and OCR reviewer: Al

## 1. English-Only Requirement

- [ ] Project title, summary, development process, tools list, disclosures, captions, narration, title cards, and end card are in English.
- [ ] Any Indonesian text visible inside the application is explained by English narration or captions.
- [ ] No untranslated submission-form answer remains.

## 2. Required Written Submission

- [ ] Copy the approved short summary from `project-summary.md`.
- [ ] Copy the approved development paragraph from `development-process.md`.
- [ ] Copy the final tools list from `tools-and-tech-stack.md`.
- [ ] Copy the reviewed AI disclosure from `ai-usage-disclosure.md`.
- [ ] Copy the reviewed copyright and third-party disclosure from `copyright-and-credits.md`.
- [ ] Remove all bracketed instructions and unused optional lines.
- [ ] Confirm the chosen track name appears exactly as required by the submission platform.

## 3. Public Development Evidence

- [ ] Repository URL is public and opens in a signed-out/incognito browser.
- [ ] The repository shows meaningful commit history and development work.
- [ ] No secret, real patient data, private document, access code, database URL, API key, or service-role key is committed.
- [ ] If Figma is disclosed, provide a public view-only link to the design file, not only a prototype link.
- [ ] If a live deployment is disclosed, it opens without team-only access.
- [ ] Do not list an unavailable or private link.

Repository URL: `[INSERT]`  
Deployment URL: `[INSERT OR REMOVE]`  
Figma project URL: `[INSERT OR REMOVE]`

## 4. Two-Minute Demo Video

- [ ] Final runtime is no longer than 2:00; target runtime is 1:55.
- [ ] The opening identifies the chronic-illness coordination problem and chosen track.
- [ ] The video explains the solution instead of only showing screens.
- [ ] Every visible feature has implementation and QA evidence.
- [ ] The technology stack is spoken or clearly displayed.
- [ ] AI product usage and AI-assisted development are disclosed.
- [ ] The strongest product quality—safe, separated Patient context—is clear.
- [ ] English captions are accurate and readable.
- [ ] The public repository URL is readable on the end card.
- [ ] The video contains no harmful, hateful, discriminatory, or exploitative content.
- [ ] The final upload plays correctly from beginning to end in a signed-out/incognito browser.

Video URL: `[INSERT]`

## 5. Claim and Safety Review

- [ ] Packet statuses are checked immediately before recording and immediately before submission.
- [ ] Packets not marked `Done` are not presented as completed features.
- [ ] The video distinguishes live provider behavior from a labeled fallback or fixture.
- [ ] ChroniCare is described as care coordination, not diagnosis or clinical decision support.
- [ ] No medication recommendation, dose change, final lab interpretation, personalized diet, or treatment target is claimed.
- [ ] SOS is described as coordination for an open Caregiver dashboard, not guaranteed delivery or emergency dispatch.
- [ ] Facility/BPJS data is described as a starting point that requires direct confirmation.
- [ ] OCR is described as a draft requiring Caregiver confirmation.
- [ ] All demo people, documents, contacts, and health data are fictional or synthetic.

## 6. AI Disclosure Review

- [ ] Azure AI Document Intelligence usage is described accurately.
- [ ] Azure OpenAI usage is described accurately.
- [ ] OpenAI Codex development assistance is disclosed.
- [ ] Any other AI assistant, image generator, voice generator, transcription tool, or video tool is added.
- [ ] Human review and responsibility are stated.
- [ ] No real health data or credentials were supplied to an AI tool.

## 7. Copyright and Media Review

- [ ] Direct open-source dependencies and important licenses are disclosed.
- [ ] Plus Jakarta Sans, Phosphor Icons, and Lucide are credited as applicable.
- [ ] Unused default scaffold assets are removed before final publication, or retained with appropriate license/brand handling.
- [ ] Every external image, illustration, template, audio clip, music track, video clip, font, and voice has a recorded source and license.
- [ ] AI-generated audiovisual assets identify the generating tool.
- [ ] If no external media is used, the final disclosure explicitly says the video uses original screen recordings and narration.

## 8. Final Technical Gate

Record fresh results rather than copying historical claims.

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Manual Patient journey at 390x844
- [ ] Manual Patient and Caregiver journey at 1440x900
- [ ] Owner, Family Member, Patient, and wrong-profile access checks
- [ ] Synthetic-data and secret scan
- [ ] Final demo rehearsal completed three times at or below 2:00

## 9. Four-Person Sign-Off

| Reviewer | Approval focus | Status | Evidence or note |
| --- | --- | --- | --- |
| Ozan | Scope, claims, QA, timing, and final submission | Pending | `[ADD NOTE]` |
| Bernard | Architecture, data, authorization, repository, and deployment claims | Pending | `[ADD NOTE]` |
| Daniel | Visible flow, accessibility, captions, and media presentation | Pending | `[ADD NOTE]` |
| Al | Azure AI, OCR, chatbot safety, fallback, and AI disclosure | Pending | `[ADD NOTE]` |

## 10. Final Submission Record

- Submission platform: `[INSERT]`
- Submission owner: `[INSERT]`
- Submission deadline and timezone: `[INSERT]`
- Final submission timestamp and timezone: `[INSERT AFTER SUBMISSION]`
- Repository URL: `[INSERT]`
- Video URL: `[INSERT]`
- Deployment URL: `[INSERT OR REMOVE]`
- Public design file URL: `[INSERT OR REMOVE]`
- Final commit SHA shown to judges: `[INSERT]`

No item marked `Pending`, no bracketed instruction, and no inaccessible link should remain in the submitted copy.
