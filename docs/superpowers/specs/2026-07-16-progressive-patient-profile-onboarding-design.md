# Progressive Patient Profile Onboarding Design

Produk: ChroniCare

Status: Approved by Ozan, Bernard, Daniel, and Al; ready for implementation

Decision owner: Ozan

Required technical reviewer: Bernard

Required UX reviewer: Daniel

Required AI/OCR reviewer: Al

## Review Confirmation

| Reviewer | Domain confirmation | Decision |
| --- | --- | --- |
| Bernard | Schema/API contract, Prisma mapping, fact-state constraints, profile limits, and Supabase implementation suitability | Approved |
| Daniel | Minimum Patient Profile fields, progressive onboarding UX, sparse/unknown states, setup checklist, and synthetic seed suitability for Patient/caregiver UI | Approved |
| Al | Synthetic seed privacy, audit minimization, OCR non-automation boundary, and `UNKNOWN`/`NONE_REPORTED` handling in AI context | Approved |
| Ozan | Product scope, acceptance semantics, QA gate, and Packet 03 readiness | Approved |

The reviewers confirmed that the design can proceed without changing locked
role permissions, provider choices, medical-safety boundaries, privacy rules,
or the two-minute demo promise.

## Implementation Review Confirmation

Commit `9c5daf3` was reviewed after implementation:

| Reviewer role | Result | Implementation conclusion |
| --- | --- | --- |
| Daniel | Pass | Stored fields and explicit sparse states are sufficient and understandable for the upcoming Patient/caregiver UI. |
| Al | Pass | Synthetic seed, hash-only Patient fixtures, generic logging, and bounded audit summaries meet the approved privacy/minimization contract. |
| Ozan | Pass | Database evidence and fresh automated checks satisfy all Packet 03 acceptance criteria. |

The implementation intentionally leaves Maya's
`current_medications_status = UNKNOWN` until Packet 08 introduces an active
Medication row. Setting it to `REPORTED` in Packet 03 would contradict the
approved cross-table rule.

## 1. Decision

ChroniCare uses progressive Patient Profile onboarding. An Owner may create a usable Patient Profile with only:

- `displayName`
- `relationshipLabel`

All demographic, health, administrative, emergency-contact, and document information may be completed later. The product must not force a caregiver to guess information they do not know.

Skipping optional information does not block Patient access code creation, dashboard access, check-in, document upload, chatbot, or SOS. Each feature must degrade honestly when relevant context is unavailable.

## 2. Data Semantics

Empty health data must distinguish:

- `UNKNOWN`: the caregiver does not know or has not reviewed the information.
- `NONE_REPORTED`: the caregiver explicitly reports that none is currently known.
- `REPORTED`: one or more values have been recorded.

`NONE_REPORTED` is not clinical proof that something does not exist. UI copy must say `Tidak ada yang diketahui` or `Tidak ada yang dilaporkan`, not an absolute medical claim.

The shared enum is:

```text
profile_fact_status = UNKNOWN | NONE_REPORTED | REPORTED
```

It applies to:

- Primary conditions.
- Allergies.
- Current medications.
- Emergency contact.

BPJS needs a separate semantic enum:

```text
bpjs_membership_status = UNKNOWN | NOT_REGISTERED | REGISTERED
```

A registered Patient may still have no BPJS suffix stored because the caregiver may know membership status without having the card available. ChroniCare does not accept or store a full BPJS number in the MVP; it stores at most the last four digits for recognition.

`NOT_REGISTERED` is caregiver-reported administrative information, not a live verification result from BPJS.

## 3. Storage Decision

For the hackathon MVP, fact statuses are explicit columns on `patient_profiles`. A generic fact/provenance table is intentionally not introduced because it would add EAV-style complexity, cross-table synchronization, and implementation risk during Packet 03.

Locked additions to `patient_profiles`:

- `primary_conditions_status profile_fact_status default UNKNOWN`
- `allergies_status profile_fact_status default UNKNOWN`
- `current_medications_status profile_fact_status default UNKNOWN`
- `emergency_contact_status profile_fact_status default UNKNOWN`
- `bpjs_membership_status bpjs_membership_status default UNKNOWN`
- `updated_by_user_id uuid nullable`

Existing nullable demographic fields remain nullable. For fields where `NONE_REPORTED` has no meaningful interpretation, such as date of birth, city, or usual facility, `null` means unknown or not yet recorded. UI must render `Belum diisi`, never invent a value.

Patient gender, personal phone number, full address, and province are not stored in the MVP Patient Profile because no locked workflow consumes them. Broad location uses `city` and `location_label`; reachable family information uses the explicit emergency-contact fields.

## 3.1 Patient Profile Field Matrix

| Field/group | Required at create | Unknown representation | Notes |
| --- | --- | --- | --- |
| `display_name` | Yes | Not allowed | Human-readable Patient identity |
| `relationship_label` | Yes | Not allowed | Short Care Circle label |
| `date_of_birth` | No | `null` | Age is derived, never stored |
| `city` | No | `null` | Broad location only |
| `location_label` | No | `null` | Broad human-readable area only |
| `primary_conditions` + status | No | `UNKNOWN` + empty array | Caregiver-reported, not diagnosis by ChroniCare |
| `allergies` + status | No | `UNKNOWN` + empty array | Never infer none from an empty array |
| Current medications status | No | `UNKNOWN` | Client may select `UNKNOWN`/`NONE_REPORTED`; `REPORTED` is server-managed from active Medication rows |
| BPJS status + `bpjs_number_last4` | No | `UNKNOWN` + `null` | Full BPJS number is never accepted/stored |
| `usual_facility_name` | No | `null` | Recorded facility name, no availability claim |
| Emergency contact + status | No | `UNKNOWN` + null fields | At least name or phone when `REPORTED` |
| Lifecycle status | System | `ACTIVE` default | Not an onboarding question |
| Created/updated actor and timestamps | System | Not applicable | Supports authorization and audit |

## 4. Consistency Rules

- `primary_conditions_status = REPORTED` requires a non-empty `primary_conditions` array.
- `primary_conditions_status != REPORTED` requires an empty `primary_conditions` array.
- `allergies_status = REPORTED` requires a non-empty `allergies` array.
- `allergies_status != REPORTED` requires an empty `allergies` array.
- `emergency_contact_status = REPORTED` requires at least a contact name or phone.
- `emergency_contact_status != REPORTED` requires both emergency-contact fields to be null.
- `bpjs_membership_status = UNKNOWN` or `NOT_REGISTERED` requires `bpjs_number_last4` to be null.
- `bpjs_membership_status = REGISTERED` does not require `bpjs_number_last4`.
- When present, `bpjs_number_last4` contains exactly four digits.
- Profile PATCH cannot set `current_medications_status = REPORTED` directly.
- Creating or reactivating an active Medication sets `current_medications_status = REPORTED` in the same transaction.
- `current_medications_status = REPORTED` requires at least one active Medication.
- Setting `current_medications_status = UNKNOWN` or `NONE_REPORTED` is rejected while an active Medication exists.
- Pausing or ending the last active Medication sets `current_medications_status = UNKNOWN`, never `NONE_REPORTED`.
- OCR confirmation never changes these fields or statuses automatically.

Database checks should enforce same-row rules. Service transactions and tests enforce Medication cross-table rules.

## 5. Derived Setup Checklist

Profile completeness is derived by the API and is not stored as a percentage or database status.

The checklist exposes:

- Whether minimum identity exists.
- Knowledge status for conditions, allergies, current medications, emergency contact, and BPJS.
- Whether date of birth, broad location, and usual facility are recorded.
- A list of recommended next actions.

Unknown information is a recommendation, not an access blocker. The UI may show `Profil belum lengkap`, but it must not imply the Patient Profile is invalid or unsafe to use.

The checklist is derived only from `patient_profiles` so it can exist before daily-care and document packets. Medication services later maintain `current_medications_status`; document upload remains an optional workflow and is not a profile-completion requirement.

`broadLocationRecorded` is true when either `location_label` or `city` is recorded. Recommended actions use this deterministic priority:

1. Review allergies.
2. Review current medications.
3. Review emergency contact.
4. Review primary conditions.
5. Review BPJS status.
6. Add date of birth.
7. Add broad location.
8. Add usual facility.

## 6. Onboarding UX

1. Owner enters Patient display name and relationship label.
2. The profile is created immediately after confirmation.
3. The Owner may choose `Lengkapi sekarang` or `Isi nanti`.
4. Optional groups use explicit choices:
   - `Tambahkan informasi`
   - `Tidak ada yang diketahui/dilaporkan`
   - `Belum tahu, isi nanti`
   For current medications, `Tambahkan informasi` opens the Medication flow; it does not write `REPORTED` through Patient Profile PATCH.
5. Document upload is optional and occurs only after a Patient Profile exists.
6. Dashboard shows a compact, dismissible setup checklist.

No optional health field may use a generic required marker. No placeholder may suggest a value the caregiver should guess.

## 7. Sparse-Context Behavior

- Dashboard distinguishes `Belum diketahui`, `Tidak ada yang dilaporkan`, and an actual empty feature history.
- Chatbot omits `UNKNOWN` facts from provider context and states when relevant information is unavailable.
- Chatbot may describe `NONE_REPORTED` only as caregiver-reported information, never as clinical certainty.
- SOS remains available even when emergency-contact data is unknown because MVP SOS coordinates through authorized open caregiver dashboards.
- Faskes/BPJS helper works without stored BPJS membership and asks the user to confirm status directly when needed.

## 8. Out of Scope

- Identity verification using KTP or Dukcapil.
- Automatic content classification that detects identity documents uploaded under `OTHER`; UI must instead tell users not to upload KTP.
- Clinical verification of caregiver-entered facts.
- Per-field provenance history.
- Automated profile completion from OCR.
- Batch document ingestion.
- A medical risk score based on missing information.
- Blocking emergency or daily-care features because optional profile data is incomplete.
