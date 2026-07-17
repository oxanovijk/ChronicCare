# AI Usage Disclosure

Status: Submission draft

## Submission-Ready Disclosure

ChroniCare uses and was developed with AI in two distinct ways.

First, the target product architecture uses Azure AI Document Intelligence to extract text and layout from a privately stored synthetic health document. Azure OpenAI then maps the minimum required OCR text into a validated structured draft. That draft is not treated as medical truth: a Caregiver must review and confirm it before any extracted information can be included in chatbot context. The target Patient and Caregiver assistants use Azure OpenAI for product navigation, general routine support, and doctor-visit question preparation. They are explicitly restricted from diagnosing conditions, interpreting laboratory values as final clinical conclusions, recommending medication or dose changes, prescribing nutrition, or replacing emergency services. If a provider is unavailable, ChroniCare is designed to show a clearly labeled deterministic fallback rather than pretending that a live AI response succeeded.

Second, OpenAI Codex was used as an AI-assisted development tool for planning implementation packets, drafting and reviewing code, suggesting tests, checking consistency against project guardrails, and preparing submission documentation. Team members remained responsible for product decisions, reviewed AI-assisted changes, ran the available verification commands, and accepted packet completion based on evidence. No real patient records, production credentials, access codes, private health documents, or other sensitive personal data were intentionally provided to the development assistant.

## Disclosure by Function

| AI system | Use | Human control | Final-status requirement |
| --- | --- | --- | --- |
| Azure AI Document Intelligence | Target OCR text and layout extraction from a synthetic document | Caregiver reviews the draft; failure does not create confirmed data | Mention as a working feature only when Packet 09 is `Done` |
| Azure OpenAI | Target structured extraction, safe navigation, routine support, and doctor-visit preparation | Zod validation, server-side context selection, refusal rules, and labeled fallback | Mention live product behavior only when Packets 09 and 11 are `Done` |
| OpenAI Codex | Development planning, implementation assistance, test assistance, review, and documentation drafting | Human team reviews changes and owns final decisions | Disclose in the final submission regardless of product AI status |

## Video Disclosure Line

Use this line near the end of the video:

> We use Azure AI for human-reviewed document extraction and guarded care navigation, and we used OpenAI Codex to assist development; our team reviewed the outputs and retained every product and safety decision.

If Azure-backed product features are not verified before recording, replace it with:

> Our target architecture uses Azure AI for human-reviewed document extraction and guarded care navigation. OpenAI Codex assisted development, while our team reviewed the outputs and retained every product and safety decision.

## Final Review Questions

- Did the team use another generative AI assistant, image generator, transcription service, voice generator, or editing tool? If yes, add its name and exact use.
- Were any AI-generated images, voices, music, or video clips included? If yes, identify them in `copyright-and-credits.md`.
- Does the final wording distinguish a live Azure call from a labeled fallback or prerecorded result?
- Does every AI claim match the final QA evidence?
