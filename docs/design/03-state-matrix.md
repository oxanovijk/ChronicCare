# ChroniCare State Matrix

Status: Proposed  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Daniel  
Product/QA reviewer: Ozan  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-17  
Input Screen Specifications: `docs/design/02-screen-specifications.md`  
Input Screen Specifications SHA-256: `691B4C845E0260C11B8754BEB01A31837DE768A71517F2EE43198C0981ABB538`

## Authority

This State Matrix defines observable state behavior, trust, authorization effect,
permitted recovery, and exit truth for the existing ChroniCare surfaces. It is a
design coverage artifact, not a new product, safety, role, privacy, data, API,
provider, execution, demo, or QA contract.

Locked canonical documents override this matrix. This matrix does not define
final Indonesian copy, URLs, route groups, components, responsive structure,
provider adapters, database queries, state-machine code, or implementation
evidence.

`NEWDESIGN.md` controls how these states are visually expressed. This matrix
continues to control observable truth, persistence, authorization effects,
recovery, and permitted exits.

## Sources

- `AGENTS.md` — product boundary, role/access rules, terminology, provider and
  verification guardrails.
- `README.md` — repository orientation and documentation-first status.
- `PRODUCT.md` — proposed strategic adapter for product scope, role, trust,
  safety, demo, and lifecycle boundaries.
- `NEWDESIGN.md` — active visual state language, modes, accessibility, motion,
  fallback, and status differentiation.
- `docs/design/00-screen-inventory.md` — owning surface IDs, priorities, roles,
  state obligations, and packet trace.
- `docs/design/01-user-flow-map.md` — `FLOW-01`–`FLOW-21`, `TRN-01`–`TRN-60`,
  recovery destinations, and cross-actor handoffs.
- `docs/design/02-screen-specifications.md` — detailed surface contracts,
  authorization boundaries, and required state obligations.
- `docs/team/ownership.md` — DRI and reviewer boundaries.
- `docs/product/product-context.md` — challenge, actors, care context, and product
  limits.
- `docs/product/feature-scope.md` — P0, P1, lifecycle, parking-lot, and out-of-scope
  classification.
- `docs/product/user-journeys.md` — happy path, failure, recovery, and exit truth.
- `docs/product/hackathon-mvp-scope-demo.md` — connected two-minute demo and
  fallback requirements.
- `docs/technical/architecture.md` — client/server trust, provider boundary,
  Realtime, fallback, and error behavior.
- `docs/technical/data-model.md` — status enums, Patient Profile relations,
  non-destructive lifecycle, and atomic SOS truth.
- `docs/technical/api.md` — response/error contracts, session behavior, OCR review,
  AI context, SOS, facility data, and authorization effects.
- `docs/technical/ai-guardrails.md` — allowed assistance, refusal, emergency,
  context minimization, and provider fallback.
- `docs/security-privacy.md` — isolation, disclosure, logging, document privacy,
  and synthetic-data rules.
- `docs/execution/workflow.md` — packet dependencies, feature/demo freeze, and
  evidence rules.
- `docs/execution/packets.md` — Packet 01–13 index and ownership.
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md` through
  `docs/execution/packets/13-qa-deploy-and-demo-rehearsal.md` — packet-specific
  acceptance, error, fallback, manual QA, and stop conditions.
- `docs/pitch/demo-script.md` — demo order and truthful fallback narrative.
- `docs/qa/demo-readiness-checklist.md` — verification obligations; status remains
  `Not Run`.

## Scope

In scope:

- Functional state vocabulary for the 19 detailed specifications.
- Recovery contracts for `SYS-01` through `SYS-07`.
- Authorization, isolation, provenance, provider, OCR, AI, SOS, faskes/BPJS,
  lifecycle, and P1 state boundaries.
- Cross-surface stored-state and signal handoffs.
- Traceability to all 30 inventory IDs, 21 flows, 60 transitions, and 13 packets.

Out of scope:

- Final UX copy and message wording.
- Responsive layout, wireframes, prototypes, and navigation architecture.
- URLs, route groups, browser redirects, implementation paths, or source code.
- New screen IDs or expansion of P1 into P0.
- Claims that any documented state is implemented, tested, deployed, or ready.

## State Modeling Principles

1. Every state belongs to an owning surface or system recovery contract; a state
   does not create a new screen.
2. Functional state names describe truth, not final user-facing copy.
3. Every failure exposes a safe permitted recovery or an explicit terminal
   limitation.
4. Retry, refresh, and reconnect always revalidate the actor session and server
   authorization before restoring data.
5. Loading or switching Patient Profile context clears prior-profile data before
   presenting the newly selected identity.
6. Forbidden and concealed-resource states reveal neither protected identity nor
   resource existence.
7. Critical truth—OCR status, SOS, and lifecycle result—must persist on the
   owning surface; a toast may only supplement it.
8. Provider unavailability and `DEMO_FALLBACK` are distinct from live-provider
   success and remain visibly labeled while active.
9. Realtime receipt, audio state, connection state, REST recovery, and SOS
   handling are separate truths.
10. Empty, stale, unavailable, and error are distinct; none may imply clinical,
    delivery, facility, or BPJS certainty.

## Global State Definitions

| State | Meaning | Required Feedback | Permitted Action | Must Not Imply |
|---|---|---|---|---|
| Default | Surface is ready and no operation is in progress | Current actor/context and available primary action | Begin an authorized task | Data is current if freshness is not shown |
| Loading | Initial authorized data request is unresolved | Context-matched progress or skeleton; old Patient data absent | Wait, cancel where safe, or use allowed navigation | Success, emptiness, or another Patient Profile's data |
| Empty | Request succeeded and no relevant record exists | Empty reason, scope, and available next action | Create, clear filters, return, or continue | Request failure or hidden protected data |
| Partial | Request succeeded with only a safe subset | Missing sections and freshness are explicit | Retry missing data or use available safe actions | Complete or current data |
| Validation | Local or server validation prevents acceptance | Affected field/rule and correction path | Correct and resubmit | Accepted mutation |
| Submitting | A mutation request is unresolved | Pending state on dominant action; duplicate action prevented | Wait or cancel only when contract permits | Stored success |
| Saving | A daily-care or review mutation is unresolved | Pending state and retained unsaved context | Wait; safe retry only after outcome is known | Accepted write or cross-profile write |
| Claiming | Atomic SOS handling request is unresolved | Handler action pending and latest event identity retained | Wait or refresh after uncertain outcome | Handler ownership before server result |
| Success | Server accepted the operation and resulting truth is known | Resulting state and next permitted destination | Continue or return | External delivery, clinical validity, or provider certainty |
| Error | Operation failed without a more specific state | Safe failure category and recovery | Retry, refresh, return, or reauthenticate | Stack, query, provider secret, or protected record detail |
| Retry | User may safely repeat after failure or unknown outcome | What will be revalidated and whether idempotency applies | Repeat guarded operation | Automatic success or preserved authorization |
| Disabled | Action is unavailable because a known prerequisite is unmet | Why unavailable and the prerequisite | Satisfy prerequisite or choose allowed alternative | Permission denial when authorization has not been evaluated |
| Forbidden | Server denies actor, role, Care Circle, or Patient relation | Generic denial and safe exit | Return to last authorized context or sign in correctly | Protected identity, record existence, or denial internals |
| Session expired | Session is missing, expired, revoked, or unusable | Actor-appropriate re-entry requirement | Patient returns to Patient access; Caregiver returns to caregiver sign-in | Patient/caregiver session interchangeability |
| Not found | Resource is missing, deactivated, or deliberately concealed | Safe unavailability without existence detail | Return to authorized context | Whether another Care Circle or Patient owns it |
| Offline | Browser cannot complete a network-dependent operation | Connection status, retained safe local context, and limitation | Retry when connected or return without mutation | Server acceptance, current data, or Realtime delivery |
| Reconnecting | Connection restoration and authorization refresh are pending | Connection progress and stale marker | Wait, trigger authorized REST refresh where specified | Continuity of Realtime events |
| Stale | Displayed authorized data may no longer match server truth | Last-known/freshness status | Refresh and revalidate | Current data or safe mutation against stale version |
| Provider unavailable | Azure or another contracted provider cannot answer | Provider-independent safe limitation | Retry or enter allowed labeled fallback | Live provider result |
| DEMO_FALLBACK | Synthetic demo fixture or safe scripted behavior is active | Persistent `DEMO_FALLBACK` provenance | Continue only within documented safe limits or retry live provider | Live OCR/AI, clinical truth, or provider accuracy |
| Conflict | Server truth changed or another actor won a conditional update | Current server truth and affected action | Refresh, reconcile, or acknowledge | Failed authorization or permission to overwrite |
| Processing | Accepted asynchronous/synchronous provider work is incomplete | Progress, document identity, and provenance boundary | Wait, return safely, or retry after explicit failure | Reviewable or confirmed extraction |
| Pending review | Machine-generated extraction awaits human decision | Original-first evidence, editable draft, and untrusted status | Edit, confirm, reject, or leave pending | Confirmed medical fact or chatbot eligibility |
| Confirmed | Human review was accepted and stored as confirmed extraction | Confirmation, reviewer/provenance context, and stored status | Continue to allowed confirmed-context use | Clinical interpretation or automatic daily-care update |
| Rejected | Human rejected extraction and status is stored | Rejected status and audit-safe consequence | Return or restart allowed review path | Confirmed or chatbot-eligible data |
| Cancelled | User exits before an accepted mutation | No-write/no-event truth and return destination | Return to origin or restart | Accepted change |
| Deactivated | Owner-confirmed end-of-care removed profile from active flows | Non-destructive outcome, revoked active access, retained-history limitation | Return to remaining authorized context | Hard deletion, subscription cancellation, or erased history |
| Audio enabled | SOS audio may play after explicit opt-in | Audio status plus mandatory visual alert | Mute/disable or open alert | Guaranteed sound or delivery |
| Audio blocked | Browser policy/device prevents audio | Blocked status plus mandatory visual alert | Enable through user gesture or continue visually | Missing SOS event |
| Audio muted | User has opted out or muted SOS audio | Muted status plus mandatory visual alert | Re-enable or continue visually | Alert handled or absent |
| Already handled | SOS has a server-confirmed handler | Current handler and event status | Acknowledge or refresh | Current actor won the claim |

## Authorization State Rules

| Authorization condition | Required state behavior | Recovery | Forbidden disclosure |
|---|---|---|---|
| Public | Only role entry and sign-in choices are available | Select Patient or Caregiver entry | Patient names, Care Circle, health data, or membership |
| Valid Patient session | Access is bound to exactly one active Patient Profile | Continue only within that profile | Selector, other Patient Profiles, caregiver surfaces |
| Invalid/expired/revoked Patient session | Clear protected Patient context and enter `Session expired` | `PAT-01` through `SYS-03` | Prior Patient data or reason revealing another actor |
| Valid caregiver authentication and membership | Revalidate membership, role, Care Circle, and explicit `patientProfileId` | Continue to authorized caregiver surface | Other Care Circle or unauthorized profile data |
| Authenticated caregiver with invalid membership | Enter `Forbidden`; authentication alone is insufficient | Last authorized surface or `CG-01` | Care Circle membership or Patient identity details |
| Owner | Owner-only action is visible only after server role validation | Continue or guarded retry | Client role as authority |
| Family Member | Caregiving actions allowed; Owner-only mutation denied | Return to authorized caregiver context | Owner-only control or lifecycle detail enabling mutation |
| Authorized `patientProfileId` | Active Patient identity is visible and data is fetched after server relation check | Continue on owning surface | Treating UI selection as authorization |
| Unauthorized `patientProfileId` | Clear attempted context and enter `Forbidden`/concealed state | Restore last authorized profile or sign in | Requested Patient identity or record existence |
| Wrong Care Circle | Deny event/resource subscription and clear payload | Return to authorized Care Circle context | Event, Patient, handler, or facility context tied to denied data |
| Deactivated Patient Profile | Remove from active selection; revoke Patient codes/sessions | Patient re-enters access; Caregiver returns to remaining context | Active-care capability or hard-delete claim |
| Missing or concealed resource | Use indistinguishable `Not found` behavior | Return to last authorized context | Whether resource exists elsewhere |
| Profile switching | Show selected identity with loading boundary only after old data is cleared | On failure retain last authorized profile without relabeling stale data | Old Patient data beneath new Patient identity |

## Screen State Matrix

State names in this section remain functional. Rows group only states with the
same trust and recovery behavior; critical domain sections below separate every
trust-sensitive state.

| Screen ID | State | Trigger | Actor/Session | Visible Behavior | Primary/Permitted Action | Recovery Destination | Data/Authorization Effect | Must Not Show | Flow/Transition Evidence |
|---|---|---|---|---|---|---|---|---|---|
| PAT-01 | Default | Public Patient entry opens | Public Patient actor | Access-code input and Patient boundary | Submit Patient access code | PAT-01 | No profile data loaded | Patient name before validation | FLOW-01–02; TRN-01, TRN-03 |
| PAT-01 | Submitting | Access code submitted | Public Patient actor | Submit pending; duplicates blocked | Wait | PAT-01/PAT-02 | Server validates code/profile and creates bound session only on success | Session token or profile data before success | FLOW-02; TRN-03–04 |
| PAT-01 | Validation / locked | Invalid, expired, revoked, or rate-limited code | Public Patient actor | Generic invalid/unavailable state | Correct or retry when allowed | PAT-01 | No Patient session created | Patient identity, code status detail, or account enumeration | FLOW-02; TRN-04 |
| PAT-01 | Success | Session created for active bound profile | Valid Patient session | Brief accepted state before Patient home | Continue | PAT-02 | Bound Patient session established | Caregiver auth or profile selector | FLOW-02; TRN-03 |
| PAT-01 | Offline / error / retry | Network or generic request failure | Public Patient actor | No-success truth and retry affordance | Retry | PAT-01/SYS-07 | Revalidation occurs on retry | Claimed login or cached protected data | FLOW-02, FLOW-16; TRN-03–06, TRN-54–55 |
| PAT-02 | Loading | Authorized home request begins | Valid Patient session | Bound Patient identity with content skeleton; no stale other-profile data | Wait | PAT-02 | Server checks active bound profile | Other Patient or caregiver data | FLOW-02, FLOW-04–05; TRN-03, TRN-13, TRN-16 |
| PAT-02 | Empty / partial | No routine or only safe subset available | Valid Patient session | Clear missing sections and available tasks | Check in or use available task | PAT-02/PAT-03 | Only bound-profile data shown | Complete-data claim | FLOW-04–05; TRN-13–17 |
| PAT-02 | Fresh / success acknowledgement | Current data loaded or check-in accepted | Valid Patient session | Current routine and accepted result persist in context | Continue primary task | PAT-02 | Accepted check-in becomes server truth | Clinical interpretation or streak claim | FLOW-04; TRN-14 |
| PAT-02 | Active SOS | Stored active event belongs to profile | Valid Patient session | Persistent serious event state | View allowed status or continue safe action | SOS-01/PAT-02 | Reads bound event only | Dispatch/delivery guarantee | FLOW-12–13; TRN-40–43 |
| PAT-02 | Session expired / deactivated / forbidden | Session revoked, profile deactivated, or relation denied | Invalid Patient session | Protected content cleared | Re-enter Patient access | SYS-03/PAT-01 | Active access removed | Prior profile data or caregiver context | FLOW-02, FLOW-15–16; TRN-05–06, TRN-53–55 |
| PAT-02 | Offline / error | Data unavailable | Valid or uncertain Patient session | Last-known data marked stale or content withheld | Retry | PAT-02/SYS-05/SYS-07 | Retry revalidates session | Current-data claim | FLOW-04–05, FLOW-16; TRN-54–55 |
| PAT-03 | Default / validation | Check-in opened or required input invalid | Valid Patient session | Bound identity and concise input requirements | Correct and submit | PAT-03 | No write until accepted | Another profile or diagnostic conclusion | FLOW-04; TRN-13–14 |
| PAT-03 | Submitting / duplicate prevention | Check-in submit begins or uncertain retry exists | Valid Patient session | Pending action; repeated mutation blocked | Wait or idempotent retry after outcome check | PAT-03/PAT-02 | Server binds write to session profile | Multiple-success implication | FLOW-04; TRN-14, TRN-54–55 |
| PAT-03 | Success / cancelled | Server accepts check-in or Patient exits before write | Valid Patient session | Accepted result or explicit no-write exit | Return | PAT-02 | Accepted write only on success | Clinical assessment or write on cancel | FLOW-04; TRN-14–15 |
| PAT-03 | Forbidden / session expired / deactivated | Wrong relation or invalid active access | Invalid/denied Patient session | Input and protected context cleared | Re-enter access or safe return | SYS-02/SYS-03/PAT-01 | Mutation denied | Patient identity beyond safe context | FLOW-04, FLOW-16; TRN-05–06, TRN-11, TRN-54–55 |
| PAT-03 | Offline / error / retry | Network or application failure | Valid or uncertain Patient session | Unaccepted state and guarded retry | Retry | PAT-03/SYS-05/SYS-07 | Authorization and duplicate status rechecked | Stored-success claim | FLOW-04, FLOW-16; TRN-14, TRN-54–55 |
| PAT-04 | Loading / current | Reminder or medication record requested and resolves | Valid Patient session | Bound identity, then current item and status | Read; return | PAT-04/PAT-02 | Bound-profile read only | Caregiver controls or clinical advice | FLOW-05; TRN-16–17 |
| PAT-04 | Empty / inactive | No reminder exists or item is inactive | Valid Patient session | No-current-item truth and return path | Return | PAT-02 | No mutation | Error or stopped-medication instruction | FLOW-05; TRN-16–17 |
| PAT-04 | Offline / stale / error | Fresh request fails or cached value ages | Valid Patient session | Freshness limitation | Retry or return | PAT-04/PAT-02/SYS-05 | Revalidation before refresh | Current schedule claim | FLOW-05, FLOW-16; TRN-16–17, TRN-54–55 |
| PAT-04 | Forbidden / session expired / not found | Session/relation invalid or record concealed | Invalid/denied Patient session | Protected detail withheld | Re-enter or return | SYS-02/SYS-03/SYS-04 | No record disclosure | Resource existence or another profile | FLOW-05, FLOW-16; TRN-05–12 |
| PAT-05 | Empty / composing | Chat opens or Patient prepares request | Valid Patient session | Bound persona and limited support scope | Send allowed request | PAT-05 | Minimum bound context only | Full hidden context or other profile | FLOW-10; TRN-33–35 |
| PAT-05 | Sending / response | Allowed request sent and safe response returned | Valid Patient session | Pending then bounded assistance | Continue or ask allowed follow-up | PAT-05 | No clinical mutation | Diagnosis, dose, target, lab, or diet authority | FLOW-10; TRN-34 |
| PAT-05 | Refusal | Clinical/forbidden request detected | Valid Patient session | Refusal distinct from provider failure | Use allowed support | PAT-05 | No prohibited response/context mutation | Medical recommendation | FLOW-10; TRN-35 |
| PAT-05 | Emergency escalation | Possible emergency detected | Valid Patient session | Short escalation and SOS entry | Continue to SOS confirmation | SOS-01 | No long chat | Dispatch or ambulance claim | FLOW-10, FLOW-12; TRN-36, TRN-40 |
| PAT-05 | Provider unavailable / DEMO_FALLBACK / retry | Azure failure or fixture mode | Valid Patient session | Provider state and persistent fallback provenance | Retry or use safe fallback | PAT-05/SYS-06 | Fallback remains separated from live response | Live-provider success | FLOW-10, FLOW-16; TRN-34, TRN-54–55 |
| PAT-05 | Profile/context invalid / session expired / offline | Bound context invalid, session revoked, or no network | Invalid/uncertain Patient session | Conversation context cleared or disabled | Re-enter access or retry | SYS-03/PAT-01/SYS-05 | No old context reuse | Prior Patient context | FLOW-10, FLOW-16; TRN-05–06, TRN-54–55 |
| CG-01 | Default / submitting | Caregiver entry or credential submit | Public Caregiver actor | Sign-in form; pending blocks duplicates | Submit or wait | CG-01/CG-02 | Auth plus membership validated before caregiver data | Care Circle or Patient data pre-auth | FLOW-01, FLOW-03; TRN-02, TRN-07–08 |
| CG-01 | Validation | Credentials invalid | Public Caregiver actor | Generic credential error | Correct and retry | CG-01 | No session/membership disclosure | Account/membership enumeration | FLOW-03; TRN-08 |
| CG-01 | Authenticated but forbidden | Auth succeeds but membership/role invalid | Authenticated caregiver without valid membership | Safe denial | Use authorized account or exit | SYS-02/CG-01 | Authentication does not grant product authorization | Care Circle or Patient identity | FLOW-03, FLOW-16; TRN-07, TRN-11 |
| CG-01 | Provider unavailable / offline / retry | Auth provider/network unavailable | Public Caregiver actor | No-success state | Retry | CG-01/SYS-06/SYS-07 | Full validation repeats | Authenticated-success claim | FLOW-03, FLOW-16; TRN-07–12, TRN-54–55 |
| CG-02 | Loading / profile switching | Dashboard or new Patient context requested | Valid caregiver session | Active identity boundary; previous Patient data cleared | Wait | CG-02/CG-03 | Server validates membership and explicit `patientProfileId` | Old data under new identity | FLOW-03, FLOW-06; TRN-07, TRN-18–20 |
| CG-02 | Empty / partial / fresh | Authorized daily-care request resolves | Valid caregiver session | Empty, incomplete, or current sections differentiated | Begin allowed care task | CG-02/CG-04 | Same-profile authorized data only | Complete-data or health-score claim | FLOW-06–07; TRN-18–23 |
| CG-02 | Active SOS | Current authorized profile has active event | Valid caregiver session | Persistent visual alert independent of audio | Open alert | SOS-02/SOS-03 | Matching Care Circle/profile only | Closed-tab or dispatch guarantee | FLOW-13; TRN-43–47 |
| CG-02 | Stale / offline / error | Data freshness or connection fails | Valid caregiver session | Stale/connection marker; risky mutations gated | Refresh or retry | CG-02/SYS-05/SYS-07 | Authorization revalidated | Current-data claim | FLOW-06–07, FLOW-13, FLOW-16; TRN-18–23, TRN-43–47, TRN-54–55 |
| CG-02 | Forbidden / session expired | Membership, role, relation, or session invalid | Invalid/denied caregiver session | Protected data cleared | Return/sign in | SYS-02/SYS-03/CG-01 | Access denied server-side | Denied resource detail | FLOW-03, FLOW-06–07, FLOW-16; TRN-09–12, TRN-54–55 |
| CG-02 | Deactivated-profile resolution | Active profile becomes deactivated | Valid caregiver session | Profile removed from active context | Select remaining authorized profile or safe empty state | CG-03/CG-02 | No further active operations | Hard-delete claim or stale profile content | FLOW-15; TRN-51–53 |
| CG-03 | Loading / switching | Selector opens or selection is submitted | Valid caregiver session | Zero/one/two authorized options; old context cleared before switch | Select or wait | CG-03/CG-02 | Server validates relation | Third profile or old-profile data under new label | FLOW-06; TRN-18–20 |
| CG-03 | Zero / one / two profiles | Authorized profile list resolves | Valid caregiver session | Exact available active-profile count | Select if applicable or return | CG-02/CG-03 | Deactivated profiles excluded | Multi-Care Circle or third active profile | FLOW-06; TRN-18–20 |
| CG-03 | Success / cancelled | Switch accepted or selector dismissed | Valid caregiver session | Fresh selected context or unchanged last context | Continue | CG-02 | Accepted selection is UI context, not authorization | Stale data relabeled as selected Patient | FLOW-06; TRN-19–20 |
| CG-03 | Forbidden / error / offline | Relation denied or load fails | Valid/uncertain caregiver session | Denied option concealed; last authorized context retained safely | Return or retry | CG-02/SYS-02/SYS-05/SYS-07 | No unauthorized selection | Denied Patient identity | FLOW-06, FLOW-16; TRN-18–20, TRN-54–55 |
| CG-04 | Loading / empty / editing | Daily-care surface opens | Valid caregiver session with authorized `patientProfileId` | Active Patient identity and current/empty records | Edit allowed care data | CG-04 | Same-profile context only | Other Patient or clinical interpretation | FLOW-07; TRN-21–23 |
| CG-04 | Validation / saving | Input invalid or save unresolved | Valid caregiver session | Field issue or pending mutation | Correct or wait | CG-04 | Server revalidates relation and version | Accepted write before response | FLOW-07; TRN-22 |
| CG-04 | Success / cancelled | Save accepted or exit without save | Valid caregiver session | Stored result or no-write truth | Continue or return | CG-04/CG-02 | Only accepted write becomes shared care truth | Mutation on cancel | FLOW-07; TRN-22–23 |
| CG-04 | Conflict / profile interruption | Server version changes or active profile switch starts | Valid caregiver session | Unsaved/stale context isolated | Refresh/reconcile or discard safely | CG-04/CG-03 | Old profile mutation blocked | Silent overwrite or cross-profile save | FLOW-06–07; TRN-18–23 |
| CG-04 | Forbidden / session expired / offline / error | Authorization/session/network/app failure | Invalid or uncertain caregiver session | Mutation disabled; protected context withheld as needed | Return, sign in, or retry | SYS-02/SYS-03/SYS-05/SYS-07 | Retry revalidates all guards | Stored-success claim | FLOW-07, FLOW-16; TRN-21–23, TRN-54–55 |
| CG-05 | Context loading / empty context | Chat opens or authorized minimum context is absent | Valid caregiver session and `patientProfileId` | Active Patient and provenance boundary; safe reduced-context state | Ask allowed question | CG-05 | Confirmed OCR only; omission is allowed | Pending/rejected/raw OCR or other profile | FLOW-09, FLOW-11; TRN-32, TRN-37–39 |
| CG-05 | Composing / sending / response | Caregiver submits allowed request | Valid caregiver session | Pending then bounded response with provenance as applicable | Continue allowed task | CG-05 | Minimum daily-care and confirmed OCR context only | Clinical authority | FLOW-11; TRN-38 |
| CG-05 | Refusal / emergency | Forbidden clinical request or possible emergency | Valid caregiver session | Refusal or short escalation, semantically distinct | Use allowed support or emergency guidance | CG-05/SOS context | No prohibited answer | Dose/diagnosis or dispatch guarantee | FLOW-11; TRN-38 |
| CG-05 | Provider unavailable / DEMO_FALLBACK / retry | Azure unavailable or fixture active | Valid caregiver session | Provider status and persistent fallback provenance | Retry or safe reduced fallback | CG-05/SYS-06 | No live-provider assertion | Live result or hidden fallback | FLOW-11, FLOW-16; TRN-38, TRN-54–55 |
| CG-05 | Profile switch / context conflict | Active Patient changes or response context no longer matches | Valid caregiver session | Old conversation context cleared | Select authorized Patient and reopen | CG-03/CG-05 | Fresh authorization/context required | Old profile content under new identity | FLOW-06, FLOW-11; TRN-18–20, TRN-39 |
| CG-05 | Session expired / offline / error | Session/network/application fails | Invalid/uncertain caregiver session | Protected context disabled or cleared | Sign in or retry | SYS-03/CG-01/SYS-05/SYS-07 | Guards rerun | Cached sensitive context as current | FLOW-11, FLOW-16; TRN-09–10, TRN-54–55 |
| CG-06 | Initial / filtering | Helper opens or filters change | Valid caregiver session | Static Tangerang source context and review date | Apply/clear filters | CG-06 | Administrative dataset only | Ranking or live availability | FLOW-14; TRN-48–49 |
| CG-06 | Results / empty | Static query returns matches or none | Valid caregiver session | Result or no-match truth plus direct-confirmation limitation | Review or clear filters | CG-06 | No acceptance inference | Guaranteed BPJS acceptance | FLOW-14; TRN-49 |
| CG-06 | Stale source / unavailable / offline | Review age, dataset failure, or connection issue | Valid/uncertain caregiver session | Freshness/unavailability explicitly differentiated | Retry, clear, or return | CG-06/CG-02/SYS-05/SYS-07 | No live lookup | Current availability claim | FLOW-14, FLOW-16; TRN-48–50, TRN-54–55 |
| CG-06 | DEMO_FALLBACK / retry / session expired | Fixture/provider state or session loss | Valid or invalid caregiver session | Labeled fallback or protected re-entry | Retry or sign in | SYS-06/SYS-03/CG-01 | Source/provenance retained | Live dataset or acceptance certainty | FLOW-14, FLOW-16; TRN-49–50, TRN-54–55 |
| OWN-04 | Consequence / reason / validation | Owner opens lifecycle action and has not supplied valid reason | Authenticated Owner | Non-destructive consequence and required reason | Continue to confirmation | OWN-04 | No mutation yet | Hard delete or subscription cancellation | FLOW-15; TRN-51–52 |
| OWN-04 | Confirmation / submitting | Valid reason accepted and Owner confirms | Authenticated Owner | Sensitive confirmation then pending mutation | Confirm once or wait | OWN-04 | Server revalidates Owner, Care Circle, profile | Success before acceptance | FLOW-15; TRN-52–53 |
| OWN-04 | Deactivated success / access revoked / active-list removal | Server commits non-destructive deactivation | Authenticated Owner | Persistent result and consequences | Return to authorized caregiver context | CG-02/CG-03 | Codes/sessions revoked; profile inactive; history retained | Hard-delete or erased-history claim | FLOW-15; TRN-53 |
| OWN-04 | Conflict / already deactivated | Current profile no longer active or version changed | Authenticated Owner | Current server truth | Acknowledge/refresh | CG-02/OWN-04 | No duplicate mutation | Second deactivation success | FLOW-15–16; TRN-53–55 |
| OWN-04 | Forbidden / session expired | Family Member/Patient or invalid session attempts action | Denied actor/session | Sensitive data concealed | Return/sign in | SYS-02/SYS-03 | No lifecycle mutation | Owner-only details to denied actor | FLOW-15–16; TRN-51–55 |
| OWN-04 | Offline / error / retry | Network/app failure before known acceptance | Authenticated or uncertain Owner session | Outcome unknown or failed; no false success | Refresh truth then guarded retry | OWN-04/SYS-05/SYS-07 | Authorization and active status rechecked | Deactivated-success claim | FLOW-15–16; TRN-53–55 |
| OCR-01 | Loading / empty | Document list requested and resolves empty | Valid caregiver session with authorized `patientProfileId` | Active Patient and empty/list loading boundary | Upload document or return | OCR-01/OCR-02 | Private same-profile metadata only | Public URL or other-profile document | FLOW-08–09; TRN-24–25 |
| OCR-01 | Processing / pending / confirmed / rejected / failed / fallback | Documents exist in distinct statuses | Valid caregiver session | Status, provenance, and permitted next action remain distinct | Open review, retry failed, or upload | OCR-03/OCR-02 | Status remains server truth | Pending/fallback styled as confirmed | FLOW-08–09; TRN-26–32 |
| OCR-01 | Profile switch / forbidden / session expired | Active context changes or authorization fails | Invalid/changed caregiver context | Old list cleared | Switch/re-enter/return | CG-03/SYS-02/SYS-03 | Fresh relation required | Old documents under new identity | FLOW-06, FLOW-08–09; TRN-18–20, TRN-24–32 |
| OCR-01 | Offline / error / retry | List request fails | Valid/uncertain caregiver session | Stale or unavailable list marked | Retry | OCR-01/SYS-05/SYS-07 | Guards rerun | Current list claim | FLOW-08–09, FLOW-16; TRN-24–32, TRN-54–55 |
| OCR-02 | No file / selected | Upload starts or file chosen | Valid caregiver session and authorized `patientProfileId` | File identity and constraints | Choose/submit valid file | OCR-02 | No upload before submit | Document contents beyond necessary metadata | FLOW-08; TRN-25–27 |
| OCR-02 | Validation | Type unsupported, over 5 MB, over three pages, or integrity issue | Valid caregiver session | Specific constraint category | Replace file | OCR-02 | No provider call | Accepted/uploaded state | FLOW-08; TRN-26 |
| OCR-02 | Uploading / accepted | Valid file sent and private upload accepted | Valid caregiver session | Pending upload then transition to processing | Wait | OCR-03 | Private storage and same-profile binding | Public URL or confirmed extraction | FLOW-08; TRN-26 |
| OCR-02 | Error / retry / offline | Upload fails or connection is absent | Valid/uncertain caregiver session | No-accepted-upload truth unless server confirms otherwise | Verify then retry | OCR-02/SYS-05/SYS-07 | Duplicate/integrity checked | Duplicate accepted upload | FLOW-08, FLOW-16; TRN-26, TRN-54–55 |
| OCR-02 | Provider unavailable / DEMO_FALLBACK | OCR/extraction provider unavailable after accepted upload | Valid caregiver session | Provider boundary and fallback provenance | Continue labeled fallback or retry | OCR-03/SYS-06 | Fallback draft remains untrusted | Live OCR success | FLOW-08; TRN-26–28 |
| OCR-02 | Profile switch / forbidden / session expired | Context/session changes | Invalid/changed caregiver context | Selected file context cleared or upload disabled | Return/re-enter | CG-03/SYS-02/SYS-03 | Fresh authorization required | Cross-profile upload | FLOW-06, FLOW-08; TRN-18–20, TRN-25–27 |
| OCR-03 | Processing / review required / pending review | Provider accepted work then produces valid draft | Valid caregiver session and authorized `patientProfileId` | Original-first evidence; untrusted status | Wait, review, edit, confirm, reject, or leave pending | OCR-03/OCR-01 | Not chatbot-eligible | Confirmed truth | FLOW-08–09; TRN-26–31 |
| OCR-03 | Editable / validation / confirming | Caregiver edits draft, validation blocks, or confirm is pending | Valid caregiver session | Draft differences and pending decision | Correct or wait | OCR-03 | No confirmed status before atomic acceptance | Automatic medical update | FLOW-09; TRN-28–29 |
| OCR-03 | Confirmed success / CONFIRMED | Human confirmation accepted | Valid caregiver session | Persistent confirmed provenance and result | Continue or return | OCR-03/OCR-01/CG-05 | Minimum structured context becomes eligible | Clinical interpretation or raw OCR context | FLOW-09, FLOW-11; TRN-29, TRN-32 |
| OCR-03 | Reject confirmation / rejected success / REJECTED | Caregiver confirms rejection | Valid caregiver session | Explicit sensitive decision then persistent rejected state | Return or reopen allowed path | OCR-03/OCR-01 | Not chatbot-eligible | Confirmed styling or context use | FLOW-09; TRN-30–31 |
| OCR-03 | FAILED / retry / DEMO_FALLBACK | Processing fails or fixture is active | Valid caregiver session | Failure or fallback provenance remains distinct | Retry or review fallback draft | OCR-03/SYS-06/SYS-07 | Fallback never becomes trusted without human confirm | Live-provider success | FLOW-08–09; TRN-26–30 |
| OCR-03 | Conflict / profile switch | Server version changes or active Patient changes | Valid caregiver session | Decision suspended; old context cleared on switch | Refresh/reselect | OCR-03/CG-03 | Same-profile/version revalidation | Silent overwrite or old document under new identity | FLOW-06, FLOW-09; TRN-18–20, TRN-29–30 |
| OCR-03 | Forbidden / session expired / offline | Authorization/session/network fails | Invalid/uncertain caregiver session | Protected document/draft withheld | Return/sign in/retry | SYS-02/SYS-03/SYS-05 | Guards rerun | Original or extracted content to denied actor | FLOW-08–09, FLOW-16; TRN-24–32, TRN-54–55 |
| SOS-01 | Confirmation / cancelling | Patient opens SOS or cancels before create | Valid Patient session | Serious confirmation and no-event-on-cancel truth | Confirm or cancel | SOS-01/origin Patient surface | Event absent until accepted | Dispatch or automatic delivery | FLOW-12; TRN-40–41 |
| SOS-01 | Creating / stored success | Patient confirms and server stores minimum event | Valid Patient session | Pending then stored-event acknowledgement | Wait or return | SOS-01/PAT-02 | Bound event stored; Realtime delivery remains separate | Caregiver receipt or ambulance claim | FLOW-12–13; TRN-42–43 |
| SOS-01 | Duplicate / idempotent | Retry finds existing equivalent event/result | Valid Patient session | Single current stored truth | Acknowledge | PAT-02/SOS-01 | No duplicate event implied | Multiple alerts created | FLOW-12; TRN-42, TRN-54–55 |
| SOS-01 | Error / retry / offline / not sent | Create not accepted or outcome unavailable | Valid/uncertain Patient session | Explicit not-sent/unknown truth | Verify connection/status then retry | SOS-01/SYS-05/SYS-07 | Revalidates session and duplicate state | Stored/delivered success | FLOW-12, FLOW-16; TRN-42, TRN-54–55 |
| SOS-01 | Session expired / deactivated | Patient access revoked | Invalid Patient session | Creation disabled and protected context cleared | Re-enter access | SYS-03/PAT-01 | No event mutation | Active-profile or delivery claim | FLOW-12, FLOW-15–16; TRN-05–06, TRN-53–55 |
| SOS-02 | New alert / visual-only | Authorized open dashboard receives matching Realtime event | Valid caregiver session | Persistent Patient identity, time, event, handler/connection status; visual always present | Open alert | SOS-03 | Receipt applies only to current open authorized dashboard | Closed-tab delivery or dispatch | FLOW-13; TRN-43–44 |
| SOS-02 | Audio enabled / blocked / muted | Opt-in succeeds, browser blocks, or user mutes | Valid caregiver session | Secondary audio status; visual alert unchanged | Enable/mute/open alert | SOS-02/SOS-03 | No event truth change | Audio as sole alert | FLOW-13; TRN-43–44 |
| SOS-02 | Disconnected / reconnecting / refreshing / refreshed | Realtime disconnects or focus/reconnect triggers REST | Valid caregiver session | Connection state then latest authorized truth | REST refresh / retry | SYS-05/SOS-02/SOS-03 | Membership and event relation revalidated | Uninterrupted delivery | FLOW-13, FLOW-16; TRN-43, TRN-47, TRN-54–55 |
| SOS-02 | Already handled / stale | Event updated elsewhere or view lags | Valid caregiver session | Current handler/server status | Open/acknowledge/refresh | SOS-03/SOS-02 | Server truth supersedes UI | Available-to-claim state | FLOW-13; TRN-45–47 |
| SOS-02 | Forbidden / session expired / error | Authorization/session/app fails | Invalid/denied caregiver session | Alert payload concealed | Return/sign in/retry | SYS-02/SYS-03/SYS-07 | No event data disclosed | Patient/event/handler detail | FLOW-13, FLOW-16; TRN-43–47, TRN-54–55 |
| SOS-03 | Available / claiming | Authorized event is unhandled and actor claims it | Valid caregiver session | Current event context then atomic pending action | Claim once or wait | SOS-03 | Conditional update decides winner | Handler ownership before response | FLOW-13; TRN-44–45 |
| SOS-03 | Handled success / current handler | Current actor wins or current server handler is known | Valid caregiver session | Persistent handler and event state | Acknowledge/continue | SOS-03/CG-02 | Server truth shared to authorized views | Dispatch completion | FLOW-13; TRN-45–46 |
| SOS-03 | First-handler conflict | Another caregiver wins atomic update | Valid caregiver session | Conflict and current handler | Acknowledge/refresh | SOS-03 | Latest server value replaces stale UI | Retry-to-overwrite | FLOW-13; TRN-45–46 |
| SOS-03 | Stale / disconnected / reconnecting / REST refresh | View loses freshness or connection | Valid caregiver session | Mutation gated; connection and refresh distinct | REST refresh | SYS-05/SOS-03 | Authorization and event state rechecked | Realtime continuity | FLOW-13, FLOW-16; TRN-47, TRN-54–55 |
| SOS-03 | Cancelled | Caregiver exits before claim acceptance | Valid caregiver session | No-handler-change truth | Return | SOS-02/CG-02 | No mutation | Handled state | FLOW-13; TRN-44–45 |
| SOS-03 | Forbidden / wrong Care Circle / session expired / error | Relation/session/app fails | Invalid/denied caregiver session | Event details concealed | Return/sign in/retry | SYS-02/SYS-03/SYS-07 | No event read/update | Patient, handler, or event existence | FLOW-13, FLOW-16; TRN-43–47, TRN-54–55 |
| SYS-01 | Default / keyboard focus | Public product entry opens or receives keyboard navigation | Public | Two actor-entry choices and visible focus | Choose Patient or Caregiver | PAT-01/CG-01 | No authentication | Product data or implied role | FLOW-01; TRN-01–02 |
| SYS-01 | Path unavailable / offline / application error | Entry dependency is unavailable | Public | Affected path unavailable without protected detail | Retry or choose available path | SYS-01/SYS-07 | No session state created | Implementation/provider internals | FLOW-01, FLOW-16; TRN-01–02, TRN-54–55 |

## System Recovery Matrix

| System ID | Owning Screens/Flows | Trigger | Presentation | Safe Information | Permitted Recovery | Destination | Must Not Reveal | Limitation |
|---|---|---|---|---|---|---|---|---|
| SYS-01 | SYS-01; FLOW-01 | Public actor chooses a product access path | Full-page public entry | Product name and Patient/Caregiver access distinction | Choose an available actor path or retry entry | PAT-01 or CG-01 | Patient identity, Care Circle, membership, or health data | Does not authenticate or authorize |
| SYS-02 | Protected surfaces; FLOW-02–21 as applicable | Wrong role, Care Circle, Patient relation, or Owner requirement | Full-page or owning-surface forbidden state | Generic access denial and safe exit | Return to last authorized context or use correct sign-in | Last authorized surface, PAT-01, or CG-01 | Denied resource identity, existence, membership, or data | Server decision; active UI context is not authority |
| SYS-03 | All protected surfaces; FLOW-02–21 | Missing, expired, or revoked Patient/caregiver session | Full-page session-expired state or blocking dialog before clear exit | Actor type and need to re-enter | Reauthenticate through the same actor path | Patient to PAT-01; Caregiver to CG-01 | Previous protected content, token, or session reason beyond safe category | Patient and caregiver sessions never interchange |
| SYS-04 | Resource-owning surfaces; FLOW-03, FLOW-05–09, FLOW-11, FLOW-13, FLOW-16–21 | Resource missing, deactivated, or concealed | Full-page/inline not-found state | Generic unavailability and safe return | Return to last authorized context | Owning parent surface or actor sign-in | Whether another Patient/Care Circle owns the resource | Intentionally indistinguishable concealment |
| SYS-05 | Network-dependent surfaces; FLOW-04–16 | Offline, Realtime disconnect, reconnect, or focus refresh | Persistent connection banner plus owning-surface stale state | Connection/freshness status and last safe known time | Retry authorized request; SOS uses REST refetch | Owning surface, SOS-02, or SOS-03 | Missed event payload from unauthorized context | Does not claim uninterrupted connection or delivery |
| SYS-06 | OCR, AI, and permitted data fallback surfaces; FLOW-08–11, FLOW-14, FLOW-16 | Provider unavailable or fixture mode active | Persistent provider/fallback banner or inline provenance | Provider unavailable category and `DEMO_FALLBACK` status | Retry live provider or continue only within safe fallback | Owning OCR/AI/faskes surface | Provider secret, raw prompt, raw OCR, or fake live status | Fallback remains visible while fallback content is used |
| SYS-07 | Any owning surface; FLOW-01–16 | Generic application failure not covered above | Full-page, inline, banner, dialog, or sheet according to owning task | Safe error category and recovery options | Guarded retry, refresh, return, or reauthenticate | Owning surface, SYS-03, or last authorized context | Stack trace, SQL, storage path, provider key, or protected data | Retry revalidates all guards and may still fail |

## Cross-Surface State Handoffs

| Producer | Producer State | Stored/Signaled Truth | Consumer | Consumer State | Trust Check | Failure/Recovery |
|---|---|---|---|---|---|---|
| PAT-03 | Success | Accepted check-in bound to Patient session's profile | CG-02 | Fresh or partial daily-care data | Caregiver membership plus explicit matching `patientProfileId` | Omit/update stale section; refresh through SYS-05/SYS-07 |
| CG-04 | Success | Accepted same-profile daily-care record | PAT-02 / PAT-04 | Fresh routine or current/inactive item | Patient session must be bound to the same active Patient Profile | Patient sees no cross-profile data; retry or safe empty/stale state |
| OCR-02 | Accepted / provider processing | Private document record and incomplete extraction work | OCR-03 | Processing, review required, or failed | Same caregiver membership/profile; private document access; provider output validation | FAILED with retry or labeled `DEMO_FALLBACK`; never auto-confirm |
| OCR-03 | CONFIRMED | Human-confirmed minimum structured extraction | CG-05 | Confirmed provenance / context available | Same `patientProfileId`, authorized caregiver, status exactly `CONFIRMED`, minimum context only | Omit OCR context and continue safely; do not substitute pending/rejected/raw text |
| SOS-01 | Stored success | Minimum SOS event stored for bound active profile | SOS-02 through Realtime | New alert / visual-only plus current audio state | Authorized open caregiver dashboard in matching Care Circle/profile relation | If no signal or disconnected, no receipt claim; recover with REST through SYS-05 |
| SYS-05 | Reconnecting / REST refreshing | Latest authorized SOS server state | SOS-02 / SOS-03 | Refreshed, already handled, available, or conflict | Caregiver session, membership, Care Circle, and event relation revalidated | Remain disconnected/stale, sign in, or retry; never infer missed delivery |
| SOS-03 | Handled success / first-handler conflict | Atomic first-handler result and current server handler | SOS-02 / SOS-03 / authorized caregiver views | Already handled / current handler | Same event and authorized Care Circle; server version wins | Refresh current truth; no overwrite of winning handler |
| OWN-04 | Deactivated success | Profile inactive; active Patient codes/sessions revoked; records retained | CG-02 / CG-03 / PAT-01 / SYS-03 | Active-list removal, remaining-context state, or session expired | Owner authorization and committed lifecycle state | Resolve stale caregiver context; Patient re-enters access; no hard-delete claim |

## Critical Domain Matrices

### OCR Trust States

| OCR state | Trigger and visible trust behavior | Permitted action | Chatbot context eligible | Recovery / exit | Must Not Imply |
|---|---|---|---|---|---|
| PROCESSING | Accepted document is still being processed; original metadata and provider boundary visible | Wait or leave safely | No | Remain OCR-03; on failure enter FAILED | Reviewable or confirmed data |
| REVIEW_REQUIRED | Zod-valid machine draft is available and explicitly requires human review | Open review | No | Continue to PENDING_REVIEW | Human confirmation |
| PENDING_REVIEW | Draft is stored but undecided; original document remains visually primary | Edit, confirm, reject, or leave pending | No | OCR-03 or OCR-01 with pending status | Medical truth or automatic daily-care update |
| Editable draft | Authorized caregiver changes proposed structured fields | Edit and validate | No | Stay OCR-03 | Stored confirmation |
| Validation issue | Draft violates structured contract or required review input | Correct fields | No | Stay OCR-03 | Provider accuracy or accepted decision |
| Confirm pending | Human confirmation request is unresolved | Wait; prevent duplicate confirm | No | CONFIRMED, conflict, forbidden, or error | Confirmation before server acceptance |
| CONFIRMED | Human-reviewed structured extraction is stored atomically | Continue or return | Yes, minimum authorized structured fields only | OCR-01 or later CG-05 request | Diagnosis, lab interpretation, or raw document context |
| Reject confirmation | Caregiver is asked to confirm rejection and required reason | Confirm rejection or cancel | No | REJECTED or PENDING_REVIEW | Rejection already stored |
| REJECTED | Human rejection is stored and remains auditable | Return or begin allowed new process | No | OCR-01 | Confirmed styling or eligibility |
| FAILED | Processing/provider/validation pipeline did not produce a reviewable draft | Retry or use permitted fallback | No | PROCESSING, SYS-06, or OCR-01 | Reviewable result |
| Retry | A failed operation may be repeated after authorization and duplicate checks | Retry | No until later CONFIRMED | PROCESSING or FAILED | Guaranteed live success |
| DEMO_FALLBACK | Synthetic fixture produced a clearly labeled draft | Review with persistent fallback provenance | No until human confirmation; confirmed data retains fallback provenance | PENDING_REVIEW then possible CONFIRMED | Live Azure OCR/extraction |
| Profile switch | Active Patient context changes | Clear document/draft context and reselect | No | CG-03 then fresh OCR surface | Old document under new Patient identity |
| Forbidden | Membership, role, Care Circle, or Patient relation fails | Return to authorized context | No | SYS-02 | Document existence/content |
| Session expired | Caregiver session is invalid or revoked | Sign in again | No | SYS-03 then CG-01 | Cached private document access |

### AI States

| Persona | State | Trigger | Context rule | Permitted result/action | Recovery | Must Not Show |
|---|---|---|---|---|---|---|
| Patient | Context loading | PAT-05 opens with valid bound Patient session | Minimum bound profile/routine context only | Wait or compose without sending | Retry or SYS-03 | Other profile, caregiver data, raw OCR |
| Patient | Allowed request | Navigation, general routine support, or doctor-question preparation | Minimum necessary authorized context | Safe bounded response | Continue | Diagnosis, dose change, targets, lab interpretation, diet prescription |
| Patient | Refusal | Forbidden clinical request | Do not expand sensitive context | Refusal plus allowed alternative | Continue safe support | Clinical answer |
| Patient | Possible emergency | Urgent symptom language detected | Minimum data; stop long chat | Short escalation and SOS-01 entry | Retry SOS entry or show limitation | Ambulance/dispatch guarantee |
| Caregiver | Context loading | CG-05 opens for explicit authorized `patientProfileId` | Daily-care minimum plus `CONFIRMED` OCR only | Wait or safe empty-context state | Retry/omit unavailable context | Pending/rejected/raw OCR or other Patient |
| Caregiver | Allowed request | Navigation, summary, or doctor-visit preparation | Revalidate profile relation at request time | Safe response with provenance boundary | Continue | Medical authority |
| Caregiver | Refusal | Diagnosis, dose, lab, target, or prescription request | No prohibited inference | Refusal plus allowed preparation support | Continue safe support | Clinical recommendation |
| Either | Provider unavailable | Azure request cannot complete | Context stays private; no raw prompt logging | Retry or safe fallback option | SYS-06 | Live response claim |
| Either | DEMO_FALLBACK | Approved scripted fallback is active | Minimum context; persistent fallback label | Use safe bounded fallback | Retry live provider | Provider-generated response |
| Either | Retry | User repeats failed request | Revalidate session, profile, and current minimum context | Repeat once safe | Response/fallback/error | Reuse of stale context |
| Either | Profile/context invalidation | Patient context changes, deactivates, or no longer matches | Clear old conversation context | Select/re-enter correct context | CG-03, SYS-03, or PAT-01 | Old profile content under new identity |
| Either | Offline | Network unavailable | Do not send or claim response | Retry after connection | SYS-05 | Cached response as new live answer |
| Either | Session expired | Actor session invalid | Clear protected context | Actor-appropriate sign-in | Patient PAT-01; Caregiver CG-01 | Cross-actor sign-in or protected history |

### SOS States

| SOS state | Owning surface | Trigger | Required visible truth | Permitted action | Recovery / destination | Must Not Imply |
|---|---|---|---|---|---|---|
| Confirmation | SOS-01 | Patient begins SOS | Patient identity context and consequence | Confirm or cancel | SOS-01/origin | Event exists |
| Creating | SOS-01 | Patient confirms | Store request pending | Wait | Stored/error | Delivery or receipt |
| Stored | SOS-01 | Server accepts minimum event | Event stored acknowledgement | Return/continue | PAT-02 | Caregiver received it |
| Realtime received | SOS-02 | Matching event reaches authorized open dashboard | Event identity, Patient, time, connection | Open alert | SOS-03 | Closed-tab notification |
| Visual-only | SOS-02 | Audio absent, muted, or blocked | Persistent visual alert | Open alert or manage audio | SOS-02/SOS-03 | Missing event or lesser urgency |
| Audio enabled | SOS-02 | Explicit opt-in succeeds | Enabled status plus visual alert | Mute/open | SOS-02/SOS-03 | Guaranteed playback |
| Audio blocked | SOS-02 | Browser policy/device blocks audio | Blocked status plus visual alert | User gesture/continue visually | SOS-02 | Delivery failure |
| Audio muted | SOS-02 | User disables sound | Muted status plus visual alert | Re-enable/open | SOS-02/SOS-03 | Event handled |
| Claiming | SOS-03 | Authorized caregiver chooses handling | Atomic request pending | Wait | Handled/conflict/error | Handler ownership |
| Handled | SOS-03 | Current actor wins atomic update | Current handler and server status | Acknowledge | SOS-03/CG-02 | Emergency resolved or dispatched |
| First-handler conflict | SOS-03 | Another actor wins | Conflict and latest handler | Refresh/acknowledge | SOS-03 | Permission to overwrite |
| Current handler | SOS-02/SOS-03 | Server event already has handler | Handler identity allowed by contract and status | Acknowledge | Owning surface | Current actor handled it |
| Stale | SOS-02/SOS-03 | Local event may lag | Stale/freshness marker | REST refresh | SYS-05 | Current event truth |
| Disconnected | SOS-02/SOS-03 | Realtime channel unavailable | Connection loss plus visual last-known alert | Reconnect/REST refresh | SYS-05 | Continued delivery |
| Reconnecting | SYS-05/SOS-02/SOS-03 | Connection restoration begins | Progress and stale boundary | Wait or REST refresh | Latest authorized state | Missed events recovered already |
| REST refreshing | SYS-05/SOS-02/SOS-03 | Focus/reconnect requests server truth | Refresh pending | Wait | Refreshed/session expired/error | Realtime receipt |
| Refreshed | SOS-02/SOS-03 | Authorized REST request resolves | Latest event/handler truth | Open/acknowledge/claim if available | Owning SOS surface | Guarantee that no event was missed outside retained data |
| Cancelled | SOS-01/SOS-03 | Actor exits before accepted create/claim | No accepted mutation | Return | Origin | Stored or handled success |
| Forbidden | SOS-02/SOS-03 | Actor/role/profile relation denied | Generic denial; payload concealed | Return | SYS-02 | Event existence |
| Wrong Care Circle | SOS-02/SOS-03 | Event belongs outside membership | Generic denial and payload clear | Return | SYS-02 | Patient/event/handler identity |
| Session expired | Any SOS surface | Actor session invalid/revoked | Protected context cleared | Actor sign-in | SYS-03 | Continued subscription/access |
| Closed-tab limitation | Cross-surface boundary | Dashboard is closed/disconnected | No success state is generated | Use app only when open; no false recovery promise | None within MVP | Delivery, push, SMS, WhatsApp, or dispatch |

### Faskes and BPJS States

| State | Trigger | Required visible truth | Permitted action | Recovery | Must Not Imply |
|---|---|---|---|---|---|
| Initial | CG-06 opens | Static Tangerang scope, source, and review date | Apply filters or return | CG-06/CG-02 | Nationwide/live coverage |
| Filtering | Filter inputs change | Filter-in-progress or applied criteria | Apply/clear | Results/empty | Ranking |
| Results | Static dataset has matches | Sourced records plus direct-confirmation limitation | Review details | CG-06 | Current availability or BPJS acceptance |
| Empty | Valid query has no matches | No-match truth and clear-filter path | Clear/change filters | CG-06 | System failure or no real-world facility |
| Stale source | Review date indicates aging data | Freshness limitation | Continue cautiously or return | CG-06 | Current administrative policy |
| Unavailable | Dataset cannot be loaded | Data-unavailable state | Retry/return | SYS-07/CG-02 | No facilities exist |
| Offline | Network request cannot complete | Connection limitation | Retry after connection | SYS-05 | Cached data is current |
| DEMO_FALLBACK | Approved static/demo fixture is used as fallback | Persistent fallback provenance and source boundary | Continue within limits | Retry live application data | Live scrape/provider result |
| Retry | Prior load failed | Revalidation notice | Retry | Results/empty/error | Guaranteed success or BPJS acceptance |

### Lifecycle States

| State | Trigger | Required visible truth | Permitted action | Authorization/data effect | Recovery | Must Not Imply |
|---|---|---|---|---|---|---|
| Active | Authorized Owner views active profile context | Active care status | Begin lifecycle action | No mutation | OWN-04 | Permanent obligation to remain active |
| Reason required | No valid reason supplied | Required reason category | Enter reason | No mutation | OWN-04 | Deactivation accepted |
| Confirmation | Valid reason is ready | Non-destructive consequences and access revocation | Confirm/cancel | No mutation until accepted | OWN-04/CG-02 | Hard deletion or payment cancellation |
| Submitting | Confirmed request unresolved | Pending sensitive action | Wait | Server revalidates Owner/profile | Success/conflict/error | Deactivation already complete |
| Deactivated success | Atomic lifecycle mutation accepted | Inactive status and retained-history boundary | Return | Profile removed from active operations | CG-02/CG-03 | Erased records |
| Access revoked | Deactivation commits | Patient codes and Patient sessions no longer active | Re-enter only with future authorized lifecycle decision outside this stage | Patient active access removed | PAT-01/SYS-03 | Account deletion |
| Removed from active selection | Caregiver refreshes profile list | Profile absent from active choices | Select remaining profile | No active patient-bound mutation | CG-02/CG-03 | Historical deletion |
| Conflict / already deactivated | Profile changed before request or is already inactive | Latest server truth | Refresh/acknowledge | No duplicate mutation | CG-02/OWN-04 | New success event |
| Forbidden | Family Member, Patient, or wrong relation attempts action | Generic denial | Return | No mutation | SYS-02 | Owner-only sensitive details |
| Session expired | Caregiver session invalid | Reauthentication requirement | Sign in | No mutation | SYS-03/CG-01 | Preserved authorization |
| Offline / error | Request cannot establish accepted result | Unknown/failed outcome | Refresh truth before retry | No assumed mutation | SYS-05/SYS-07/OWN-04 | Deactivated success |
| Retained-history limitation | Profile is inactive | Records retained under future formal retention rules | Authorized historical handling only when specified elsewhere | Non-destructive retention | Authorized context | Production retention/legal completeness |

## P1 State Boundaries

P1 rows are coverage obligations only. They do not promote these capabilities
into the P0 demo or define detailed copy and layout.

| Surface / expansion | Minimum state obligations | Authorization boundary | Recovery boundary | P0 exclusion |
|---|---|---|---|---|
| OWN-01 | Loading, member list empty/current, invite/update validation, submitting, success, conflict, forbidden, session expired, error | Owner only; one Care Circle; exactly one active Owner preserved | Refresh membership, return, or reauthenticate | No P0 member-management flow |
| OWN-02 | Loading, code absent/active, generating, generated-once display, revoking, revoked, conflict, forbidden, session expired, error | Owner only; explicit authorized `patientProfileId`; secret never logged | Regenerate/revoke only after latest truth | No P0 code-management screen behavior |
| OWN-03 | Loading, one-profile eligibility, validation, creating, success, max-two disabled, conflict, forbidden, error | Owner only; maximum two Patient Profiles; one Care Circle | Refresh count, correct, return | No third profile |
| CG-07 | Loading, empty history, results, filter, stale, forbidden, session expired, error | Owner/Family Member within authorized profile | Clear filters, refresh, return | No P0 history expansion |
| SOS-04 | Loading, empty history, results, stale, forbidden, session expired, error | Authorized caregiver and Care Circle only | Refresh/return | No background notification implication |
| PAT-04 medication-taken expansion | Default, confirming, submitting, success, duplicate, disabled/inactive, session expired, offline, error | Bound active Patient session only | Verify latest truth then idempotent retry | Reading remains P0; mutation is P1 |
| OCR-01 search/filter expansion | Initial, filtering, results, empty, stale, forbidden, error | Authorized same-profile document metadata only | Clear filters/refresh | No batch OCR |
| CG-05 same-session history expansion | Empty, loading, current session history, context invalidated, session expired, error | Same actor, same authorized `patientProfileId`; no cross-profile history | Clear on profile switch; retry current context | No durable full-chat-history promise |
| CG-06 richer filter/provenance expansion | Initial, filtering, results, empty, source detail, stale, error | Authorized caregiver; static Tangerang data | Clear/refresh | No ranking, realtime availability, or booking |

## Requirement Coverage

| Requirement | Canonical Source | Screen IDs | State Coverage | Gap |
|---|---|---|---|---|
| Public role entry | AGENTS.md; Screen Inventory; FLOW-01 | SYS-01, PAT-01, CG-01 | Default, focus, path unavailable, error | None |
| Patient access and bound session | API; Packet 05; FLOW-02 | PAT-01, PAT-02, SYS-03 | Default, validation, submitting, success, expired/revoked | None |
| Caregiver auth plus membership | API; Packet 04; FLOW-03 | CG-01, CG-02, SYS-02–04 | Auth validation, membership forbidden, session expired, concealed resource | None |
| Patient check-in | Product journeys; Packet 07; FLOW-04 | PAT-02, PAT-03 | Loading, validation, submitting, duplicate, success, retry | None |
| Reminder/medication reading | Feature scope; Packet 07; FLOW-05 | PAT-02, PAT-04 | Loading, empty, current/inactive, stale, not found | None |
| Patient Profile switch/isolation | Architecture; Packet 05/08; FLOW-06 | CG-02, CG-03 | Clear-old-data loading, switching, zero/one/two, forbidden, deactivated | None |
| Caregiver daily care | Data/API; Packet 08; FLOW-07 | CG-02, CG-04 | Empty, editing, validation, saving, success, conflict | None |
| Private document upload | Security/API; Packet 09; FLOW-08 | OCR-01, OCR-02, OCR-03 | Validation, private upload, processing, failure/fallback | None |
| Human-reviewed OCR trust | AI guardrails; Packet 09; FLOW-09 | OCR-01, OCR-03 | Pending, editable, confirm, reject, confirmed, failed, fallback | None |
| Patient chatbot safety | AI guardrails; Packet 11; FLOW-10 | PAT-05, SOS-01 | Allowed, refusal, emergency, provider failure/fallback | None |
| Caregiver chatbot context | AI guardrails; Packet 11; FLOW-11 | CG-05, OCR-03 | Confirmed-only context, refusal, emergency, invalidation, fallback | None |
| Patient SOS creation | API; Packet 12; FLOW-12 | SOS-01 | Confirmation, creating, stored, cancelled, not sent, duplicate | None |
| Cross-actor SOS handling | Architecture/API; Packet 12; FLOW-13 | SOS-02, SOS-03, SYS-05 | Realtime, audio states, claim, conflict, REST recovery | None |
| Faskes/BPJS guidance | Product/API; Packet 10; FLOW-14 | CG-06 | Initial, results, empty, stale, unavailable, fallback | None |
| Non-destructive deactivation | Product/API; Packet 06; FLOW-15 | OWN-04, CG-02, SYS-03 | Reason, confirm, submit, deactivate, revoke, conflict | None |
| Generic recovery | Architecture; FLOW-16 | SYS-02–07 and owning surfaces | Forbidden, expired, not found, offline, reconnect, fallback, error | None |
| P1 support boundaries | Feature scope; FLOW-17–21 | OWN-01–03, CG-07, SOS-04 plus four expansions | Minimum state obligations retained as P1 | None |
| Accessibility of state feedback | NEWDESIGN.md; Packet 13; QA checklist | All active surfaces | Non-color status, persistent critical truth, visible focus, visual audio equivalent | None |

## Flow and Transition Coverage

| Flow ID | Transition IDs | State Rows | Failure Covered | Recovery Covered | Coverage |
|---|---|---|---|---|---|
| FLOW-01 | TRN-01–02 | SYS-01 default/path unavailable; PAT-01/CG-01 entry | Yes | Retry or alternate actor path | Complete |
| FLOW-02 | TRN-03–06, TRN-11 | PAT-01 submit/validation/success; PAT-02/session recovery; SYS-02–03 | Yes | PAT-01 through actor-appropriate re-entry | Complete |
| FLOW-03 | TRN-07–12 | CG-01 auth; CG-02; SYS-02–04/07 | Yes | CG-01, last authorized context, or safe concealment | Complete |
| FLOW-04 | TRN-13–15, TRN-54–55 | PAT-02/PAT-03 default, submit, success, cancel, retry | Yes | Idempotent retry or safe return | Complete |
| FLOW-05 | TRN-16–17, TRN-54–55 | PAT-02/PAT-04 loading/current/empty/error | Yes | PAT-02, refresh, or re-entry | Complete |
| FLOW-06 | TRN-18–20, TRN-54–55 | CG-02/CG-03 switch, clear stale, forbidden/error | Yes | Last authorized profile or fresh load | Complete |
| FLOW-07 | TRN-21–23, TRN-54–55 | CG-02/CG-04 edit/save/conflict/cancel | Yes | Refresh/reconcile/retry/return | Complete |
| FLOW-08 | TRN-24–28, TRN-54–55 | OCR-01–03 upload/processing/failure/fallback | Yes | Correct, retry, labeled fallback, reauth | Complete |
| FLOW-09 | TRN-28–32, TRN-54–55 | OCR-03 pending/edit/confirm/reject/conflict | Yes | Refresh/review/retry/leave pending | Complete |
| FLOW-10 | TRN-33–36, TRN-54–55 | PAT-05 allowed/refusal/emergency/fallback | Yes | Safe fallback, retry, SOS-01, reauth | Complete |
| FLOW-11 | TRN-32, TRN-37–39, TRN-54–55 | CG-05 confirmed context/refusal/fallback/invalidation | Yes | Omit context, retry, CG-03, reauth | Complete |
| FLOW-12 | TRN-40–42, TRN-54–55 | SOS-01 confirm/cancel/create/stored/not sent | Yes | Verify/idempotent retry/origin | Complete |
| FLOW-13 | TRN-42–47, TRN-54–55 | SOS-01–03 Realtime/audio/claim/conflict/REST | Yes | SYS-05 REST, refresh, reauth | Complete |
| FLOW-14 | TRN-48–50, TRN-54–55 | CG-06 filtering/results/empty/stale/fallback | Yes | Clear/retry/return/reauth | Complete |
| FLOW-15 | TRN-51–55 | OWN-04 reason/confirm/deactivate/conflict/forbidden | Yes | Refresh truth, return, reauth | Complete |
| FLOW-16 | TRN-05–12, TRN-47, TRN-54–55 | SYS-02–07 recovery contracts | Yes | Actor-appropriate and authorization-revalidated | Complete |
| FLOW-17 | TRN-56 | OWN-01 P1 member states | Yes | Refresh/return/reauth | Complete at P1 boundary |
| FLOW-18 | TRN-57 | OWN-02 P1 code states | Yes | Refresh/revoke/regenerate under Owner guard | Complete at P1 boundary |
| FLOW-19 | TRN-58 | OWN-03 P1 profile creation states | Yes | Refresh/correct/return | Complete at P1 boundary |
| FLOW-20 | TRN-59 | CG-07 P1 history states | Yes | Clear/refresh/return | Complete at P1 boundary |
| FLOW-21 | TRN-60 | SOS-04 P1 history states | Yes | Refresh/return/reauth | Complete at P1 boundary |

Transition coverage is explicit and exhaustive: `TRN-01` through `TRN-60` are
represented by the flow rows above and the owning screen/system rows. Ranges are
inclusive; they do not introduce additional transition IDs.

## Packet Coverage

| Packet | Screen/State Coverage | User-Visible State | Technical-Only Boundary | Coverage |
|---|---|---|---|---|
| 01 — Scaffold/tooling | SYS-01/SYS-07; global loading/error/accessibility obligations | Stable shell-level entry/error behavior once implemented | Toolchain, scripts, dependencies, and `/web` scaffold are absent | Complete as design contract |
| 02 — Env/provider boundary | SYS-06; OCR/AI/faskes provider states | Provider unavailable and labeled fallback | Environment validation and server-only provider adapters | Complete |
| 03 — Schema/seed | Cross-surface stored truth; P1 OWN-03 boundary | Synthetic profile/status data once implemented | Prisma schema, migrations, seed, enum persistence | Complete |
| 04 — Caregiver auth/membership | CG-01, CG-02, SYS-02–04; OWN-01 P1 | Sign-in, forbidden, session expiry, concealed resource | Supabase Auth and server membership checks | Complete |
| 05 — Patient access/isolation | PAT-01–04, CG-03, SYS-02–04; OWN-02 P1 | Bound Patient session, switching, wrong-profile denial | Code hashing, session cookie, server relation helpers | Complete |
| 06 — Lifecycle deactivation | OWN-04, CG-02/03, PAT-01, SYS-03/04 | Reason, confirmation, deactivate, revoke, remove active context | Non-destructive transaction/audit details | Complete |
| 07 — Patient homepage/check-in | PAT-02–04 | Loading, empty, check-in submit/success/retry, reminder states | Daily-care service/query implementation | Complete |
| 08 — Caregiver daily care | CG-02–04; CG-07 P1 | Dashboard, switch freshness, save/conflict/history boundary | Patient-bound services and persistence | Complete |
| 09 — Document/OCR review | OCR-01–03, SYS-06 | Upload validation, processing, pending, confirm/reject/fallback | Private Storage, provider calls, Zod/schema persistence | Complete |
| 10 — Faskes/BPJS | CG-06 | Initial/filter/results/empty/stale/fallback | Static dataset loading/versioning | Complete |
| 11 — Chatbot safety/personas | PAT-05, CG-05, SYS-06 | Allowed/refusal/emergency/context/fallback | Safety gateway, prompt assembly, server logging controls | Complete |
| 12 — SOS Realtime/handling | SOS-01–04, SYS-05 | Create, alert/audio, disconnect, REST, atomic conflict | Realtime policy/channel and conditional update implementation | Complete |
| 13 — QA/deploy/rehearsal | All surfaces/states | Recovery/fallback/accessibility/demo-state evidence when run | Automated checks, deploy, and rehearsal evidence remain absent | Complete as verification coverage; QA Not Run |

## Deferred Decisions

The following are deliberately deferred to their owning stages and are not
unresolved product decisions:

- Final Indonesian UX copy, action labels, validation wording, and refusal text.
- Exact visual and responsive layout at 390×844, 768×1024, and 1440×900.
- URL structure, route groups, dynamic segments, redirect behavior, and browser
  history behavior.
- Component implementation, state-machine code, storage/query implementation,
  and provider adapter mechanics beyond locked contracts.
- Wireframes, prototype behavior, and implementation plan.

## State Gaps

None.

## Open Decisions

None.

## Canonical References

Strategic and visual adapters:

- `PRODUCT.md` — Proposed; subordinate to locked product/technical contracts.
- `NEWDESIGN.md` — Active visual authority; subordinate to product, safety, role, privacy, data,
  API, provider, execution, and demo contracts.

Locked and governing references:

- `AGENTS.md`
- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`
- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/security-privacy.md`
- `docs/execution/workflow.md`
- `docs/execution/packets.md`
- `docs/execution/packets/01-scaffold-and-tooling-baseline.md`
- `docs/execution/packets/02-env-and-provider-boundary.md`
- `docs/execution/packets/03-data-schema-prisma-and-seed-base.md`
- `docs/execution/packets/04-caregiver-auth-and-membership-authorization.md`
- `docs/execution/packets/05-patient-access-code-and-profile-isolation.md`
- `docs/execution/packets/06-patient-profile-lifecycle-deactivation.md`
- `docs/execution/packets/07-patient-homepage-and-check-in.md`
- `docs/execution/packets/08-caregiver-dashboard-medication-and-reminder.md`
- `docs/execution/packets/09-document-upload-ocr-and-review.md`
- `docs/execution/packets/10-faskes-and-bpjs-helper.md`
- `docs/execution/packets/11-chatbot-safety-gateway-and-personas.md`
- `docs/execution/packets/12-sos-realtime-and-handling.md`
- `docs/execution/packets/13-qa-deploy-and-demo-rehearsal.md`
- `docs/pitch/demo-script.md`
- `docs/qa/demo-readiness-checklist.md`
- `docs/team/ownership.md`

Design trace inputs:

- `docs/design/00-screen-inventory.md`
- `docs/design/01-user-flow-map.md`
- `docs/design/02-screen-specifications.md`

## Authority and Change Control

- Daniel owns interaction-state clarity, accessibility expression, recovery
  behavior, and traceability in this artifact.
- Ozan reviews scope, priority, acceptance evidence, demo truth, and overclaim.
- Bernard reviews session, membership, Patient Profile isolation, API/error,
  storage, Realtime, atomic update, and lifecycle effects.
- Al reviews OCR trust, AI safety, emergency behavior, provider failure, and
  `DEMO_FALLBACK` boundaries.
- A change to scope, roles, providers, medical safety, privacy, data model, API,
  execution structure, or demo promise requires a human verdict and update to
  its canonical source before this matrix changes.
- This artifact remains `Proposed` until the named reviewers approve it. Its
  completeness is not implementation, QA, deployment, or production evidence.
- The repository name `ChronicCare` never changes the product name `ChroniCare`.
