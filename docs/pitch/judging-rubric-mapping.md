# Judging Rubric Mapping

Produk: ChroniCare
Status: Working pitch aid, evidence pending
DRI: Ozan
Reviewers: Daniel (UX), Bernard (technical), Al (AI/OCR)

## 1. Prinsip

Dokumen ini membantu tim menghubungkan bukti produk dengan rubric umum hackathon. Ini bukan izin menambah scope atau mengklaim hasil yang belum diuji.

Core positioning:

> ChroniCare membantu pasien chronic illness dan caregiver menjaga rutinitas jangka panjang melalui konteks patient yang terpisah, dokumen yang ditinjau, AI non-diagnostik, dan koordinasi SOS di web.

## 2. Mapping

| Area | Bukti yang Ditunjukkan | Pemilik Bukti | Risiko Klaim | Mitigasi |
| --- | --- | --- | --- | --- |
| Problem definition | Rutinitas chronic illness panjang, informasi tersebar, UX Patient kompleks, caregiver kehilangan konteks | Ozan | Terlalu umum | Pakai skenario diabetes tipe 2 Maya sebagai patient profile utama |
| User experience | Patient homepage sederhana, profile label jelas, review OCR, SOS multimodal | Daniel | UI terlihat sebagai dashboard generik | Tunjukkan perbedaan Patient/Caregiver dan state nyata |
| Technical implementation | Next.js modular monolith, API `/api/v1`, Prisma/Supabase, private storage, Realtime | Bernard | Hanya menyebut vendor | Tunjukkan isolation test, state transition, dan failure handling |
| AI use | Azure OpenAI guardrail dan Azure Document Intelligence extraction | Al | AI dianggap gimmick atau berbahaya | Tunjukkan human review, confirmed-only context, refusal, dan fallback |
| Innovation | Care Circle menghubungkan daily care, reviewed document context, dan family SOS ownership | Ozan | Daftar fitur tanpa thesis | Tekankan continuity of context per patient |
| Impact | Keluarga mendapat konteks dan langkah administratif lebih jelas | Ozan | Mengklaim outcome klinis | Gunakan bahasa hipotesis dan batas MVP |
| Safety/trust | Patient-bound access, private file, audit, AI refusal, honest SOS limits | Bernard, Al, Ozan | Klaim compliance berlebihan | Jelaskan kontrol yang ada dan yang belum dibuktikan |
| Feasibility | Scope 30 jam, 9 packet, role DRI, cut line, fallbacks | Ozan | Scope tampak terlalu lebar | Tunjukkan P0, seed, provider fallback, dan freeze rules |
| Presentation | Demo 2 menit, pitch 5 menit, exact talk track | Ozan | Melewati waktu | Rehearsal tiga kali dan titik cut |

## 3. Evidence Package

Sebelum presentasi, siapkan:

- Screenshot atau live state Patient homepage.
- Bukti API/database menolak akses lintas profile.
- Bukti deactivation/end-of-care bersifat Owner-only dan non-destruktif jika diklaim.
- Dokumen sintetis dengan status pending, edit, dan confirmed.
- Hasil evaluasi chatbot: allowed, refusal, emergency, fallback, cross-profile.
- Rekaman atau live bukti SOS Realtime, alert visual, audio opt-in, dan atomic handler.
- Dataset faskes dengan sumber/tanggal pembaruan.
- Hasil lint, typecheck, unit/integration test, build, dan Playwright.
- Checklist QA dengan evidence, bukan status kosong.

Jika bukti tidak tersedia, hapus klaim terkait dari pitch.

## 4. Differentiation

ChroniCare bukan chatbot kesehatan generik karena:

- Context builder dibatasi ke satu patient profile.
- OCR tidak dipercaya otomatis; manusia mengonfirmasi field.
- Daily care, document context, SOS ownership, dan faskes berada dalam alur keluarga yang sama.
- UX Patient dan Caregiver sengaja berbeda.
- Diabetes tipe 2 hanya membuat demo konkret; produk tetap coordination-first.

ChroniCare juga bukan emergency platform. SOS MVP hanya membuat event keluarga, menampilkan alert pada dashboard terbuka, dan mencatat siapa yang menangani.

## 5. Likely Questions

### Bagaimana mencegah data Maya dan Raka tercampur?

Jawaban: semua tabel patient-bound, API, storage path, AI context, dan policy memakai `patientProfileId`. Active selector bukan authorization. Tunjukkan negative test.

### Apakah OCR dapat dipercaya?

Jawaban: OCR hanya menghasilkan candidate fields. Status awal pending review; caregiver mengoreksi dan mengonfirmasi. Hanya data confirmed dapat dipakai chatbot.

### Mengapa SOS tidak mengirim ke telepon?

Jawaban: MVP ini web-only dan tidak menjanjikan delivery saat browser tertutup. Realtime membuktikan koordinasi pada dashboard aktif; kanal eksternal sengaja di luar scope agar demo jujur dan stabil.

### Apa yang terjadi jika Azure gagal?

Jawaban: OCR failure mempertahankan file dan memungkinkan metadata manual. Chatbot memakai respons fallback aman yang diberi label. Sistem tidak berpura-pura mendapat jawaban live.

### Apakah ini memberi saran medis?

Jawaban: tidak. Guardrail menolak diagnosis, rekomendasi obat, dan perubahan dosis. Untuk emergency, respons dipersingkat dan pengguna diarahkan ke keluarga serta layanan medis resmi.

### Apakah ChroniCare memberi target diabetes atau menu pantangan?

Jawaban: tidak untuk MVP. Diabetes tipe 2 adalah skenario demo. AI tidak memberi target gula darah personal, interpretasi lab final, insulin/obat adjustment, atau diet/pantangan prescription. ChroniCare hanya membantu koordinasi, rangkuman data yang sudah diotorisasi, dan persiapan pertanyaan untuk tenaga medis.

### Mengapa stack ini feasible dalam 30 jam?

Jawaban: satu Next.js modular monolith mengurangi koordinasi deploy, sementara Supabase menyediakan primitive data/auth/storage/realtime. Kontrak locked membagi kerja Bernard, Daniel, Al, dan Ozan dengan handoff eksplisit.

## 6. Claim Ledger

| Klaim | Boleh Dipakai Jika | Status Awal |
| --- | --- | --- |
| "Data Maya dan Raka terpisah" | Negative authorization test lulus | Unverified |
| "Dokumen disimpan privat" | Bucket/policy dan signed URL test lulus | Unverified |
| "OCR dapat diekstrak" | Provider atau labeled fallback diuji | Unverified |
| "AI tidak mendiagnosis" | Refusal/emergency evaluation lulus | Unverified |
| "SOS muncul real-time" | Dua session browser diuji | Unverified |
| "Bunyi SOS bekerja" | Audio opt-in diuji di browser demo | Unverified |
| "Deactivation aman" | Owner-only test, revoke session/code, dan non-destructive history diuji | Unverified |
| "Aplikasi siap didemo" | Verdict checklist Ready | Unverified |

Ozan memperbarui claim ledger berdasarkan evidence QA. `Unverified` tidak boleh dibacakan sebagai fakta implementasi.

## 7. Change Log

- 16 Juli 2026: Mengubah rubric mapping ke chronic illness challenge, diabetes tipe 2 demo, Patient Profile, dan deactivation claim gate.
- 15 Juli 2026: Menyelaraskan rubric dengan ownership tim, OCR review, stack final, dan batas SOS web.
