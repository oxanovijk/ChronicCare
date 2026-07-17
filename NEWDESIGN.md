# ChroniCare — NEW DESIGN

Status: Active canonical visual source of truth  
Direction: Care in Motion  
Scope: MVP visual system; detailed mockups currently cover the main demo flow  
Created: 2026-07-17  
UI/UX DRI: Daniel  
Product and QA reviewer: Ozan  
Technical reviewers: Bernard for data and authorization boundaries; Al for AI and OCR safety

## 1. Purpose and Authority

This document defines the active Care in Motion visual direction for ChroniCare without inheriting the visual language of `DESIGN.md`. A human verdict on 2026-07-17 promoted this direction as the canonical visual source of truth. The mockups remain design contracts rather than implementation claims.

Repository integration note: after Packet 01–06 were brought into the experiment branch, the runnable Screen 01–10 mockups were isolated under `/prototype/patient/*` and `/prototype/caregiver/*`. Route labels in the screen contracts below remain the intended production routes; moving a screen out of `/prototype` requires the relevant session, authorization, API, and `patientProfileId` contracts to be implemented first.

For screens already specified here, this document governs layout, visual hierarchy, color, typography, component composition, iconography, motion, and responsive shell behavior. Screens not yet mocked must extend the same foundations and component language; they may not fall back to the superseded visual system in `DESIGN.md`.

The visual system in this document may change layout, hierarchy, color, typography, component composition, and motion. It may not change:

- the locked Patient and Caregiver user journeys;
- role and Patient Profile access boundaries;
- medical, AI, OCR, SOS, privacy, or provider constraints;
- the main two-minute demo story;
- the active Patient Profile terminology and patientProfileId boundary;
- the MVP scope and cut line.

When this document conflicts with a locked product, technical, security, execution, demo, or QA document, the locked document wins. `docs/design` continues to define screen coverage, user flows, observable state truth, and copy meaning after reconciliation; this document controls their visual expression. Daniel owns visual changes, with Ozan reviewing product effects, Bernard reviewing technical feasibility and authorization effects, and Al reviewing AI/OCR and emergency-state effects.

## 2. Design Thesis

Care in Motion treats chronic-care coordination as a living daily rhythm rather than a clinical dashboard. The interface should feel optimistic and active while remaining credible, safe, and respectful.

The system uses two expressions of one visual language:

- Patient surfaces are spacious, colorful, and action-led.
- Caregiver surfaces are structured, scannable, and context-led.
- Both surfaces share typography, semantic colors, status patterns, icons, and interaction feedback.

The intended impression is energetic and mature. It must not feel childish, gamified, sterile, overly clinical, or like a generic AI product.

## 3. Experience Principles

### 3.1 One clear next action

Every screen has one dominant action. Secondary actions remain available without competing visually.

### 3.2 Patient Profile is always visible

Every Caregiver action that reads or changes patient-bound data shows the active Patient Profile close to the action. The selector is an orientation tool, never an authorization mechanism.

### 3.3 Warmth without false reassurance

Color and copy can be encouraging, but the product does not imply that a medical condition is safe, controlled, improving, or diagnosed.

### 3.4 Trust states are visible

Confirmed, pending review, fallback, failed, reconnecting, and handled states use icon, label, and color together. Machine output never looks equivalent to reviewed information.

### 3.5 Emergency interrupts the rhythm

SOS intentionally breaks the normal palette and hierarchy. It is serious, direct, persistent, and never decorative.

## 4. Visual Foundations

### 4.1 Semantic color system

All foreground and background pairs below are intended for WCAG AA contrast. The primary combinations were checked before this document was written.

| Token | Value | Use |
| --- | --- | --- |
| canvas | #FFF9F2 | Warm page background |
| surface | #FFFFFF | Cards, sheets, forms, document workspace |
| ink | #173A3C | Primary text |
| ink-muted | #526B6C | Secondary text |
| primary | #0F766E | Navigation, primary action, active context |
| primary-soft | #DDF3EE | Selected surfaces and supportive emphasis |
| energy | #F6B73C | Positive action highlight and daily rhythm |
| energy-ink | #332100 | Text on amber |
| human | #B9444F | Human attention, supportive accent, important non-emergency emphasis |
| info | #1D4ED8 | Focus ring and informational state |
| success | #13795B | Completed and confirmed state |
| warning | #A15C00 | Review-required and delayed state |
| danger | #B91C1C | SOS and destructive state only |
| border | #CFE0DC | Default separation |
| border-strong | #8FB5AE | Strong grouping and input focus support |

Rules:

- Danger red is reserved for SOS, destructive actions, and errors.
- Energy amber always uses dark text.
- Coral is not used for SOS.
- Status is never communicated by color alone.
- Pink-purple gradients, neon color, and decorative medical green are excluded.

### 4.2 Typography

Font family: Plus Jakarta Sans throughout the product.

| Role | Mobile | Desktop | Weight | Use |
| --- | --- | --- | --- | --- |
| Display | 36/40 | 48/52 | 700 | Patient greeting and major moment |
| H1 | 30/36 | 36/42 | 700 | Screen title |
| H2 | 24/30 | 28/34 | 700 | Main section |
| H3 | 20/26 | 22/28 | 600 | Card heading |
| Body large | 18/28 | 18/28 | 500 | Patient guidance and primary summary |
| Body | 16/24 | 16/24 | 400 | Default content |
| Label | 14/20 | 14/20 | 600 | Input, metadata, status |
| Caption | 12/18 | 12/18 | 500 | Supporting metadata only |

Times, dates, counters, and changing numeric values use tabular figures. Body text does not drop below 16 px on interactive Patient surfaces.

### 4.3 Shape, spacing, and elevation

- Spacing follows a 4 px base with 8, 12, 16, 24, 32, 48, and 64 px steps.
- Patient cards use 20–24 px radius.
- Caregiver data cards use 14–18 px radius.
- Inputs and buttons use 14–16 px radius.
- Pills are reserved for status, filter, and compact selection.
- Default shadow: 0 8px 24px rgba(23, 58, 60, 0.08).
- Raised alert shadow: 0 16px 40px rgba(23, 58, 60, 0.16).
- Borders remain visible when shadows are removed by high-contrast settings.

### 4.4 Iconography

- Use Phosphor outline icons with a consistent visual weight.
- Use filled icons only for the active navigation destination.
- Structural emoji are not allowed.
- Standard sizes are 16, 20, 24, and 32 px.
- An icon-only control still has a visible tooltip on desktop and an accessible name everywhere.

### 4.5 Motion

- Press feedback appears within 100 ms.
- State transitions take 180–240 ms.
- Sheets may enter in up to 300 ms.
- Only opacity and transform are animated.
- Motion explains state change, navigation depth, or cause and effect.
- Reduced-motion mode removes translation and retains short crossfades.
- SOS never pulses continuously; one short entrance emphasis is enough.

## 5. Responsive Shells

### 5.1 Patient shell

Primary mockup viewport: 390 × 844.

- Content uses a 20 px mobile gutter.
- The main column has a comfortable maximum width of 680 px on larger screens.
- Bottom navigation contains Beranda, Check-in, Asisten, and SOS.
- Content reserves space for the bottom navigation and device safe area.
- Patient touch targets are at least 48 × 48 px.
- On desktop, the experience stays centered and does not become a dense dashboard.
- This mockup set covers light mode only. Dark mode is outside the experiment and may not be inferred by simply inverting these tokens.

### 5.2 Caregiver shell

Primary desktop mockup viewport: 1440 × 900.

- Desktop uses a 240 px sidebar, a flexible content region, and an optional 320 px context rail.
- Main content width is capped to preserve scanning rhythm.
- Navigation contains Ringkasan, Perawatan, Dokumen, Asisten, and Faskes.
- Mobile replaces the sidebar with five labeled destinations: Ringkasan, Perawatan, Dokumen, Asisten, and Lainnya. Faskes is reached from Lainnya; SOS remains a global alert rather than a normal destination.
- The Patient Context Bar remains visible near the page header.
- Caregiver touch targets are at least 44 × 44 px.

### 5.3 Global layers

Layer order:

1. page content;
2. sticky navigation and Patient Context Bar;
3. reconnect and fallback banners;
4. SOS rail;
5. sheets and dialogs;
6. urgent confirmation dialog.

Sticky elements reserve layout space. They may not hide page content or form actions.

## 6. Component Language

### 6.1 Motion Card

A high-emphasis card for the next meaningful action. It contains one headline, one short explanation, one primary action, and an optional small status.

### 6.2 Action Tile

A large touch target that combines an icon, action label, and one line of context. Patient Home uses Action Tiles for Check-in, Asisten, and Reminder.

### 6.3 Patient Context Bar

Shows avatar initials, Patient name, optional context label, and selector affordance. During profile switching it replaces all patient-bound content with a named skeleton and never leaves old data visible.

### 6.4 Status Tag

Uses icon, text, and semantic color. Core labels include Baru, Perlu ditinjau, Dikonfirmasi, Ditolak, Gagal, Menghubungkan ulang, Demo fallback, and Ditangani.

### 6.5 Care Timeline

Combines recent check-in, reminder, document, and SOS activity in chronological order. It is a care coordination record, not a medical trend chart.

### 6.6 SOS Rail

A persistent global alert containing Patient identity, time, state, and one primary action. It remains visually present when sound is unavailable.

### 6.7 Review Pair

Links the source document preview to editable extraction fields. Desktop uses a split workspace; mobile uses two explicit steps with a persistent review status.

### 6.8 Safe Answer Card

Wraps assistant responses with a visible mode label: Live assistant, Demo fallback, Batas bantuan medis, or Darurat. Raw provider details and private context never appear.

## 7. Main Demo Flow

The mockup follows this connected sequence:

1. Patient signs in with a bound access code.
2. Patient completes a daily check-in.
3. Caregiver opens the dashboard for the active Patient Profile.
4. Caregiver uploads a synthetic health document.
5. Caregiver reviews and confirms OCR extraction.
6. Caregiver asks the assistant to prepare questions for a doctor visit.
7. Patient creates an SOS request when the condition feels worse.
8. An open Caregiver dashboard receives the visual alert.
9. Caregiver selects Saya tangani.
10. Caregiver opens the Faskes/BPJS helper.

The lifecycle deactivation flow, member management, and full P1 support remain outside this mockup set.

## 8. Screen Mockups

### Screen 01 — Patient Access

Route: /patient/access  
Primary viewport: 390 × 844  
Primary action: Masuk dengan kode

Purpose: give the Patient one calm entry path without exposing Patient Profile or Care Circle information before authentication succeeds.

~~~text
┌──────────────────────────────────────┐
│ ChroniCare                           │
│                                      │
│             [moving arc]             │
│                                      │
│ Selamat datang                       │
│ Mari lanjutkan rutinitas perawatan.  │
│                                      │
│ Kode akses                           │
│ ┌──────────────────────────────────┐ │
│ │ • • • • • •                      │ │
│ └──────────────────────────────────┘ │
│ Kode diberikan oleh caregiver Anda. │
│                                      │
│ [        Masuk dengan kode         ] │
│                                      │
│ Privasi Anda tetap dijaga.           │
└──────────────────────────────────────┘
~~~

Hierarchy:

1. welcome message;
2. labeled access-code field;
3. primary submit action;
4. short privacy reassurance.

States:

- Loading disables the button and changes the label to Memeriksa kode…
- Invalid or expired code shows Kode tidak valid atau sudah tidak berlaku. Periksa kembali atau minta kode baru kepada caregiver.
- The error never reveals a Patient name or Care Circle.
- Session recovery sends the Patient directly to Patient Home.

### Screen 02 — Patient Home

Route: /patient/home  
Primary viewport: 390 × 844  
Primary action: Isi check-in hari ini

~~~text
┌──────────────────────────────────────┐
│ ChroniCare                 [Profil]  │
│                                      │
│ Halo, Maya.                          │
│ Bagaimana harimu?                    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Check-in hari ini                │ │
│ │ Ceritakan kondisimu secara       │ │
│ │ singkat.                         │ │
│ │ [ Isi check-in ]                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Berikutnya                           │
│ ┌──────────────────────────────────┐ │
│ │ 19.00 · Pengingat obat           │ │
│ │ Sesuai catatan caregiver         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Tanya Asisten]     [Lihat Pengingat]│
│                                      │
│ Jika butuh bantuan segera            │
│ [           Buka SOS              ]  │
├──────────────────────────────────────┤
│ Beranda  Check-in  Asisten     SOS   │
└──────────────────────────────────────┘
~~~

Visual behavior:

- The check-in Motion Card uses primary teal with a small amber rhythm marker.
- Reminder is white and quieter than the check-in action.
- SOS is separated from cheerful content and uses a danger outline until opened.
- No streak, score, badge, clinical target, or disease-control claim appears.

States:

- Completed check-in changes the main card to Check-in hari ini sudah tersimpan with Lihat ringkasan as a secondary action.
- No reminder shows Belum ada pengingat aktif and points the Patient to the caregiver.
- Stale data displays a compact last-updated label without alarming language.

### Screen 03 — Daily Check-in

Route: /patient/check-in  
Primary viewport: 390 × 844  
Primary action: Simpan check-in

~~~text
┌──────────────────────────────────────┐
│ [Kembali]              Check-in      │
│                                      │
│ Bagaimana kondisimu hari ini?        │
│ Pilih yang paling mendekati.         │
│                                      │
│ ┌──────────┐ ┌──────────┐            │
│ │ Baik     │ │ Biasa    │            │
│ │          │ │ saja     │            │
│ └──────────┘ └──────────┘            │
│ ┌──────────────────────────────────┐ │
│ │ Butuh dukungan                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Catatan tambahan · opsional         │
│ ┌──────────────────────────────────┐ │
│ │ Tulis hal yang ingin dibagikan…  │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ 0/240                                │
│                                      │
│ [          Simpan check-in         ] │
└──────────────────────────────────────┘
~~~

Interaction:

- Options are large radio cards with icon, text, selected border, and selected background.
- Butuh dukungan does not automatically imply an emergency. A short helper offers Buka SOS separately when the Patient says the situation is urgent.
- Validation appears below the option group and moves focus to the first problem.
- Retry uses an idempotent submission path and does not imply duplicate success.

Success state:

~~~text
┌──────────────────────────────────────┐
│              [check]                 │
│ Check-in tersimpan                   │
│ Caregiver dapat melihat kabar        │
│ terbaru yang Anda bagikan.           │
│                                      │
│ [          Kembali ke beranda      ] │
└──────────────────────────────────────┘
~~~

### Screen 04 — Caregiver Dashboard

Route: /caregiver  
Primary viewport: 1440 × 900  
Primary action: Review dokumen terbaru

~~~text
┌──────────────┬─────────────────────────────────────────────┬───────────────┐
│ ChroniCare   │ Ringkasan                                   │ Aktivitas     │
│              │                                             │ terbaru       │
│ Ringkasan  ● │ [ Maya Pratama ▾ ]  Diabetes tipe 2 · demo  │               │
│ Perawatan    │                                             │ 10.12         │
│ Dokumen      │ Selamat pagi, Dinda                         │ Check-in baru │
│ Asisten      │ Inilah yang perlu diperhatikan hari ini.    │               │
│ Faskes       │                                             │ 09.48         │
│              │ ┌────────────────────┐ ┌──────────────────┐ │ OCR selesai   │
│              │ │ Check-in terbaru   │ │ Pengingat       │ │               │
│              │ │ Butuh dukungan     │ │ 19.00 · obat    │ │ [Lihat semua] │
│              │ │ 10.12 · hari ini   │ │ sesuai catatan  │ │               │
│              │ └────────────────────┘ └──────────────────┘ │               │
│              │                                             │               │
│              │ ┌─────────────────────────────────────────┐ │               │
│              │ │ Dokumen perlu ditinjau                 │ │               │
│              │ │ Kontrol_Juli.pdf · OCR selesai         │ │               │
│              │ │ [ Review sekarang ]                    │ │               │
│              │ └─────────────────────────────────────────┘ │               │
│              │                                             │               │
│ [Aktifkan    │ Aksi cepat                                  │               │
│  suara]      │ [Tambah catatan] [Upload] [Tanya Asisten]   │               │
└──────────────┴─────────────────────────────────────────────┴───────────────┘
~~~

Hierarchy:

1. active Patient context;
2. current care summary;
3. review-required work;
4. recent activity;
5. quick actions.

Profile switching:

- Selecting Raka immediately replaces all Maya-bound content with a Raka-labeled skeleton.
- Old content is never left underneath a translucent loader.
- Failed loading keeps the Raka context visible and offers Coba lagi.
- Manipulated or unauthorized profile access returns a safe unavailable state rather than another Patient's content.

Mobile adaptation:

- Cards become one column.
- Activity rail moves below the primary work card.
- Patient Context Bar remains sticky below the compact app header.

### Screen 05 — Private Document Upload

Route: /caregiver/documents/upload  
Primary viewport: 1440 × 900 and 390 × 844  
Primary action: Upload dokumen

~~~text
┌──────────────┬────────────────────────────────────────────────────────────┐
│ Sidebar      │ Dokumen kesehatan                                         │
│              │ [ Maya Pratama ▾ ]                                        │
│              │                                                            │
│              │ Upload dokumen                                             │
│              │ Tambahkan dokumen sintetis untuk ditinjau caregiver.       │
│              │                                                            │
│              │ ┌────────────────────────────────────────────────────────┐ │
│              │ │ [file icon]                                            │ │
│              │ │ Tarik file ke sini atau pilih dari perangkat           │ │
│              │ │ PDF, JPG, atau PNG · maks. 5 MB · maks. 3 halaman      │ │
│              │ │ [ Pilih file ]                                         │ │
│              │ └────────────────────────────────────────────────────────┘ │
│              │                                                            │
│              │ Privasi                                                    │
│              │ File disimpan secara privat dan hasil OCR harus ditinjau.  │
│              │                                                            │
│              │ [Batal]                         [ Upload dokumen ]          │
└──────────────┴────────────────────────────────────────────────────────────┘
~~~

States:

- Client validation identifies unsupported type, size above 5 MB, or page count above three.
- Upload progress shows filename, percentage, and Batalkan when safe.
- OCR processing is a separate state after upload succeeds.
- Provider failure retains the private file and offers Coba OCR lagi or Tambahkan metadata manual when supported.
- Fixture mode always shows Demo fallback and is never described as live OCR.
- Switching Patient mid-upload requires an explicit confirmation; the upload remains bound to the original Patient Profile.

### Screen 06 — OCR Review Workspace

Route: /caregiver/documents/review  
Primary viewport: 1440 × 900  
Primary action: Konfirmasi hasil review

~~~text
┌──────────────────────────────────────────────────────────────────────────┐
│ [Kembali]  Review hasil OCR                  [Maya Pratama] [Perlu review]│
├───────────────────────────────────┬──────────────────────────────────────┤
│ Dokumen asli                      │ Data yang terbaca                    │
│ Kontrol_Juli.pdf                  │                                      │
│                                   │ Jenis dokumen                        │
│ ┌───────────────────────────────┐ │ [ Catatan kontrol                 ] │
│ │                               │ │                                      │
│ │      SYNTHETIC DOCUMENT       │ │ Tanggal dokumen                     │
│ │          PREVIEW              │ │ [ 15 Juli 2026                   ] │
│ │                               │ │                                      │
│ └───────────────────────────────┘ │ Ringkasan tercatat                  │
│ Halaman 1 dari 2                  │ [ Pemeriksaan rutin…               ] │
│ [−] [100%] [+]                    │                                      │
│                                   │ Informasi tambahan                   │
│                                   │ [ Data tercatat tanpa interpretasi ] │
│                                   │                                      │
│                                   │ [Tolak hasil] [Konfirmasi hasil]     │
└───────────────────────────────────┴──────────────────────────────────────┘
~~~

Trust behavior:

- Perlu review remains visible until a confirm or reject response succeeds.
- Edited fields are marked Diubah caregiver.
- Confirmation dialog states that confirmed information may be used in authorized assistant context.
- Rejection never deletes the original private document.
- The interface does not label values normal, abnormal, safe, dangerous, diagnosed, or recommended.

Mobile adaptation:

1. Step 1 displays the document preview.
2. Step 2 displays editable extracted fields.
3. A persistent progress label reads Dokumen then Review.
4. The Patient context and review state remain visible in both steps.

### Screen 07 — Caregiver Assistant

Route: /caregiver/chat  
Primary viewport: 1440 × 900 and 390 × 844  
Primary action: Kirim pertanyaan dalam batas bantuan

~~~text
┌──────────────┬────────────────────────────────────────────────────────────┐
│ Sidebar      │ Asisten perawatan                                         │
│              │ [ Konteks: Maya Pratama ▾ ]              [Live assistant] │
│              │                                                            │
│              │ Coba tanyakan                                              │
│              │ [Siapkan pertanyaan untuk dokter]                          │
│              │ [Ringkas catatan yang dikonfirmasi]                        │
│              │ [Jelaskan langkah BPJS]                                    │
│              │                                                            │
│              │ ┌────────────────────────────────────────────────────────┐ │
│              │ │ Anda: Bantu siapkan pertanyaan untuk kontrol besok.    │ │
│              │ └────────────────────────────────────────────────────────┘ │
│              │ ┌────────────────────────────────────────────────────────┐ │
│              │ │ Asisten                                                │ │
│              │ │ Berikut beberapa hal yang dapat Anda tanyakan…         │ │
│              │ │                                                        │ │
│              │ │ Sumber konteks: check-in dan dokumen terkonfirmasi.    │ │
│              │ └────────────────────────────────────────────────────────┘ │
│              │                                                            │
│              │ [ Tulis pertanyaan…                              ] [Kirim] │
└──────────────┴────────────────────────────────────────────────────────────┘
~~~

Answer modes:

- Live assistant uses the primary-soft label.
- Demo fallback uses an amber label and states that the response is a safe demo fallback.
- Medical refusal uses Batas bantuan medis and offers a safe next step.
- Emergency response becomes short, direct, and offers Buka SOS plus contact with IGD or medical personnel.
- Raw document, raw OCR text, hidden prompt, full BPJS number, full address, and another Patient Profile never appear.

Profile switching starts a new context view and does not visually carry the previous Patient conversation into the new profile.

### Screen 08 — Patient SOS

Route: /patient/sos  
Primary viewport: 390 × 844  
Primary action: Kirim SOS

~~~text
┌──────────────────────────────────────┐
│ [Kembali]                    SOS     │
│                                      │
│             [alert icon]             │
│                                      │
│ Minta bantuan caregiver              │
│ SOS mengirim pemberitahuan melalui   │
│ ChroniCare kepada dashboard          │
│ caregiver yang sedang terbuka.       │
│                                      │
│ Ini bukan layanan darurat resmi.     │
│ Jika Anda dalam bahaya, hubungi IGD  │
│ atau layanan darurat setempat.       │
│                                      │
│ [             Batal                ] │
│ [             Kirim SOS            ] │
└──────────────────────────────────────┘
~~~

Interaction:

- The confirmation requires one deliberate tap but no long press or precision gesture.
- The primary SOS action uses danger red with white text.
- On success, the screen says SOS terkirim through ChroniCare and explains that delivery depends on an open connected caregiver dashboard.
- Retry after timeout checks the existing event before creating another one.

### Screen 09 — Caregiver SOS Alert and Handling

Route: global alert plus /caregiver/sos  
Primary viewport: 1440 × 900  
Primary action: Saya tangani

~~~text
┌──────────────────────────────────────────────────────────────────────────┐
│ ! Maya meminta bantuan · Baru · 10.24                                   │
│   Alert diterima melalui ChroniCare.      [Lihat detail] [Saya tangani]  │
├──────────────┬───────────────────────────────────────────────────────────┤
│ Sidebar      │ Existing caregiver page remains visible                   │
│              │                                                           │
│              │ ┌───────────────────────────────────────────────────────┐ │
│              │ │ Detail SOS                                            │ │
│              │ │ Maya Pratama · dibuat 10.24                           │ │
│              │ │ Status: Menunggu caregiver                            │ │
│              │ │                                                       │ │
│              │ │ [ Saya tangani ]                                      │ │
│              │ └───────────────────────────────────────────────────────┘ │
└──────────────┴───────────────────────────────────────────────────────────┘
~~~

State behavior:

- The visual alert appears regardless of audio permission.
- Aktifkan suara is an explicit user action and never blocks the alert.
- When audio is blocked, copy reads Suara belum aktif. Alert visual tetap tersedia.
- Realtime interruption adds Menghubungkan ulang and triggers a REST refresh on reconnect or focus.
- Atomic claim success changes the rail to Ditangani oleh Dinda · 10.25.
- Claim conflict changes the state to Sudah ditangani oleh Arif without blaming the current user.
- A closed or disconnected tab is never described as guaranteed to receive the alert.

### Screen 10 — Faskes and BPJS Helper

Route: /caregiver/facilities  
Primary viewport: 1440 × 900 and 390 × 844  
Primary action: View facility contact details

~~~text
┌──────────────┬────────────────────────────────────────────────────────────┐
│ Sidebar      │ Faskes & BPJS                                             │
│              │ [ Maya Pratama ▾ ]                                        │
│              │ Cari informasi fasilitas di Tangerang.                    │
│              │                                                            │
│              │ [Area ▾] [Jenis fasilitas ▾] [BPJS tercatat ▾] [Cari]     │
│              │                                                            │
│              │ 3 hasil dalam dataset                                     │
│              │ ┌────────────────────────────────────────────────────────┐ │
│              │ │ Puskesmas Contoh Tangerang                             │ │
│              │ │ Puskesmas · Tangerang                                  │ │
│              │ │ BPJS tercatat · konfirmasi langsung                    │ │
│              │ │ [Lihat kontak] [Lihat sumber]                          │ │
│              │ └────────────────────────────────────────────────────────┘ │
│              │                                                            │
│              │ Sumber: dataset demo statis · diperbarui 15 Juli 2026     │
└──────────────┴────────────────────────────────────────────────────────────┘
~~~

Behavior:

- Results state what is recorded in the dataset, not what is currently guaranteed.
- The interface does not claim nearest, best, open now, clinically appropriate, or definitely accepting BPJS.
- Empty copy reads Tidak ada hasil yang cocok di dataset ini. Ubah filter atau konfirmasi langsung ke fasilitas.
- Mobile stacks filters in a sheet and keeps the source summary close to results.

## 9. Cross-Screen State Model

### 9.1 Loading

- Use a skeleton when the layout is known.
- Name the Patient context while switching.
- Use progress when upload or OCR has measurable steps.
- Avoid full-screen spinners for local card updates.

### 9.2 Empty

- State what is not present.
- Explain whether it is expected.
- Offer one safe next action.
- Never show a blank dashboard or chart frame.

### 9.3 Error

- Describe the problem in user language.
- Place the message near the affected control.
- Provide a retry, edit, or alternative path.
- Preserve safe user input whenever possible.

### 9.4 Offline and reconnect

- Show a persistent but non-blocking banner.
- Preserve the current Patient context.
- Refresh SOS and critical summaries after reconnect or window focus.
- Do not imply that unsent changes were saved.

### 9.5 Session expired

- Explain that the session ended.
- Return the actor to the correct Patient or Caregiver access route.
- Never show cached information for another Patient Profile.

## 10. UX Copy Style

- Use simple Indonesian with short sentences.
- Address the user directly and respectfully.
- Prefer active verbs: Isi, Tinjau, Konfirmasi, Hubungi, Coba lagi.
- Use caregiver, Patient Profile, dokumen, hasil OCR, and data terkonfirmasi consistently.
- Describe medication and reminders as caregiver-recorded information.
- Never use clinical certainty, guaranteed delivery, guaranteed BPJS acceptance, or provider-success claims.
- Keep emergency copy serious and concise.

## 11. Accessibility Requirements

- Normal text contrast is at least 4.5:1.
- Large UI glyphs and focus indicators are at least 3:1 against adjacent surfaces.
- Heading order is sequential.
- Every form field has a visible label.
- Errors are announced and linked to their controls.
- Keyboard focus is visible with a 3 px info-blue ring and sufficient offset.
- Focus returns to a logical trigger after a dialog closes.
- Color is never the only state signal.
- Patient controls are at least 48 × 48 px; Caregiver controls are at least 44 × 44 px.
- Text scaling and wrapping do not hide primary actions.
- Reduced motion keeps state clarity without translation-heavy animation.
- SOS remains understandable without sound.

## 12. Mockup Acceptance Checklist

### Visual identity

- [ ] The interface feels energetic and mature rather than clinical or childish.
- [ ] Patient and Caregiver surfaces are distinct expressions of one system.
- [ ] Teal, amber, and coral have consistent semantic roles.
- [ ] SOS red is visually reserved.
- [ ] No pink-purple AI gradient, emoji navigation, or decorative glassmorphism appears.

### User flow

- [ ] The ten screens tell one connected two-minute demo story.
- [ ] The active Patient Profile is visible on every Caregiver action.
- [ ] Profile switching hides old patient-bound data immediately.
- [ ] OCR review clearly separates machine draft from caregiver confirmation.
- [ ] The assistant clearly distinguishes live, fallback, refusal, and emergency modes.
- [ ] SOS alert, audio opt-in, reconnect, and first-handler-wins states are represented.
- [ ] Faskes results show dataset limitations and source context.

### Responsive and accessibility

- [ ] Patient screens are reviewed at 390 × 844.
- [ ] Caregiver screens are reviewed at 1440 × 900 and adapted for mobile.
- [ ] Touch targets, focus states, labels, contrast, and reading order meet the requirements above.
- [ ] Sticky navigation and alert layers do not obscure content.
- [ ] Reduced-motion behavior is defined.

### Product safety

- [ ] No diagnosis, dose change, lab interpretation, personal target, or nutrition prescription appears.
- [ ] No screen implies guaranteed SOS delivery, official emergency dispatch, or live notification while a tab is closed.
- [ ] No unconfirmed OCR field is presented as trusted context.
- [ ] No real Patient data, credential, signed URL, or private document is used.
- [ ] Demo and provider fallback states are labeled honestly.

## 13. Handoff

Affected DRI: Daniel for UI/UX.  
Promotion verdict: Approved by the human on 2026-07-17.  
Required reviewers for later visual changes: Ozan for scope and wording, Bernard for authorization and data-bound behavior, and Al for AI/OCR states.  
Implementation status: This document does not claim implementation; repository files and verification evidence remain the implementation truth.  
Commit and push status: Not requested and not performed.
