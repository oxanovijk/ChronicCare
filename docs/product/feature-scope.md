# Feature Scope

Produk: Navicare
Status: Locked for Hackathon MVP v1, Step 2 chronic illness feature-scope refinement
DRI: Ozan (Product Manager dan QA)
Kontributor: Daniel (UI/UX), Bernard (API dan database), Al (AI)
Challenge: How can we improve how people manage and live with chronic illness over the long term?
Demo condition: diabetes tipe 2

## 1. Cara Membaca Prioritas

- P0: wajib untuk alur demo dan harus memiliki bukti verifikasi.
- P1: pendukung MVP, dikerjakan hanya setelah semua P0 stabil.
- P2: boleh berupa UI flow atau data seed, tidak boleh diklaim sebagai integrasi penuh.
- Out of scope: tidak dibangun selama hackathon tanpa perubahan scope tertulis.

Urutan prioritas saat waktu menipis: correctness dan privacy, Patient Profile isolation, main demo flow, fallback, accessibility, lalu polish.

## 2. P0: Identity dan Care Circle

### 2.1 Caregiver authentication

Outcome:

- Owner dan Family Member masuk dengan Supabase Auth.
- Session server tervalidasi sebelum akses data.
- User yang bukan anggota Care Circle ditolak.

Acceptance:

- Route caregiver terlindungi.
- Membership diverifikasi di API dan database, bukan dari state client.
- Logout mengakhiri session.

Owner: Bernard. UX: Daniel. QA: Ozan.

### 2.2 Patient access code

Outcome:

- Patient masuk dengan kode sintetis yang terikat tepat ke satu Patient Profile.
- Kode disimpan dalam bentuk hash dan dapat dibuat ulang oleh Owner.
- Session Patient menggunakan cookie aman dan tidak memberi akses caregiver.

Acceptance:

- Kode salah atau kedaluwarsa ditolak tanpa membocorkan profile.
- Regenerasi kode mencabut session lama bila fitur tersebut didemo.
- Patient tidak dapat memilih atau menebak profile lain.

Owner: Bernard. UX: Daniel. QA: Ozan.

### 2.3 Patient Profile switching

Outcome:

- Caregiver memilih Patient aktif, maksimum dua Patient Profile untuk MVP.
- Identitas Patient aktif selalu terlihat di area yang mengubah data.
- Demo memakai Maya sebagai Patient diabetes tipe 2 dan Raka sebagai second Patient untuk bukti isolation.

Acceptance:

- Query, mutation, upload, chat, dan SOS menggunakan `patientProfileId` eksplisit setelah technical rename selesai.
- Cache/state profile lama dibersihkan saat berpindah.
- Request cross-profile yang tidak sah gagal meskipun UI dimanipulasi.

Owner: Bernard dan Daniel. QA: Ozan.

## 3. P0: Patient Experience

### 3.1 Patient homepage

Menampilkan salam, check-in, reminder terdekat, chatbot, dan SOS. Bahasa harus cheerful, sederhana, suportif, target sentuh besar, fokus keyboard terlihat, serta tidak mengandalkan warna sebagai satu-satunya sinyal.

Cheerful tidak berarti childish. SOS dan emergency copy tetap serius dan direct.

Owner: Daniel. API: Bernard. QA: Ozan.

### 3.2 Daily check-in

Patient memilih kondisi singkat dan boleh menambahkan catatan pendek. Caregiver melihat check-in terbaru pada Patient Profile yang benar.

Minimum data: status, catatan opsional, waktu, actor, dan `patientProfileId` setelah technical rename.

Untuk demo diabetes tipe 2, check-in boleh mencatat rutinitas/keluhan umum secara non-klinis. Produk tidak menyimpulkan kontrol gula darah, target klinis, atau keputusan terapi.

Owner: Bernard. UX: Daniel. QA: Ozan.

### 3.3 Patient chatbot

Chatbot menjawab dalam bahasa sederhana, tidak mendiagnosis, tidak memberi dosis, dan mempersingkat respons saat ada indikasi darurat. Context hanya berasal dari Patient session sendiri.

Acceptance:

- Pertanyaan routine support boleh dijawab secara umum.
- Pertanyaan target gula darah, dosis obat/insulin, interpretasi lab, atau pantangan makanan personal ditolak atau diarahkan ke tenaga kesehatan.
- Emergency diarahkan ke caregiver, SOS, IGD, atau tenaga medis.

Owner: Al. API: Bernard. UX: Daniel. QA: Ozan.

### 3.4 SOS

Patient menekan tombol, melihat konfirmasi, lalu membuat SOS event. Setelah berhasil, Patient melihat bahwa caregiver/family telah diberi tahu melalui aplikasi.

Tidak ada WhatsApp, SMS, push notification, live location, atau panggilan otomatis.

Owner: Bernard. UX: Daniel. QA dan wording: Ozan.

## 4. P0: Caregiver Experience

### 4.1 Dashboard

Dashboard menampilkan Patient aktif, check-in terbaru, reminder/obat, dokumen terbaru, dan SOS. Setiap loading, empty, error, dan stale state harus dapat dibedakan.

Caregiver dashboard boleh lebih informatif daripada Patient UI, tetapi tetap harus scannable untuk demo dua menit.

Owner: Daniel. API/data: Bernard. QA: Ozan.

### 4.2 Medication dan reminder basics

Caregiver dapat membuat dan melihat catatan obat/reminder sederhana. Produk menyimpan nama sesuai input caregiver, instruksi yang dicatat, jadwal dasar, dan status aktif.

Produk tidak menyarankan obat, tidak memvalidasi dosis secara klinis, tidak memberi target diabetes personal, dan tidak mengirim notifikasi sistem operasi.

Owner: Bernard dan Daniel. Safety/QA: Ozan.

### 4.3 Health document OCR

Outcome:

- Caregiver mengunggah PDF/JPG/PNG maksimal 5 MB dan tiga halaman.
- File asli masuk bucket privat Supabase Storage.
- Azure AI Document Intelligence membuat extraction draft.
- Caregiver mengedit lalu mengonfirmasi atau menolak field.
- Hanya data `confirmed` yang masuk ringkasan/chat context.

Demo diabetes tipe 2 memakai dokumen sintetis, misalnya hasil kontrol/lab/checkup. OCR tidak boleh mengubah hasil menjadi diagnosis atau menyimpulkan kondisi aman/berbahaya secara final.

Required UI states dan padanannya di kontrak tersimpan:

- `validating` hanya state client sebelum request.
- `UPLOADING`, `UPLOADED`, `PROCESSING`, `REVIEW_REQUIRED`, `CONFIRMED`, `REJECTED`, dan `FAILED` mengikuti `document_status`.
- Extraction review memakai `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, atau `FAILED`.

Acceptance:

- File type, size, dan page count divalidasi.
- Signed URL berdurasi pendek dan hanya diberikan kepada anggota berhak.
- OCR gagal tidak menghapus file.
- Raw OCR tidak otomatis mengubah medication/reminder.
- Audit event mencatat upload, confirm, reject, dan delete jika delete dibangun.

Owner OCR: Al. Owner API/storage: Bernard. Owner review UX: Daniel. QA: Ozan.

### 4.4 Caregiver chatbot

Chatbot membantu memahami catatan yang sudah dimasukkan, menyusun pertanyaan untuk dokter, dan menjelaskan langkah administratif BPJS/faskes. Prompt context builder hanya mengambil data untuk Patient aktif dan hanya extraction `confirmed`.

Acceptance:

- Allowed, medical refusal, emergency, provider failure, diabetes safety, dan cross-profile tests tersedia.
- UI membedakan jawaban live dan fallback.
- Raw document dan field pending tidak dikirim ke model.
- Chatbot tidak memberi target gula darah personal, interpretasi lab final, rekomendasi obat/dosis, atau pantangan makanan personal.

Owner: Al. API/context: Bernard. UX: Daniel. QA: Ozan.

### 4.5 SOS caregiver alert

Dashboard yang sedang terbuka berlangganan perubahan SOS melalui Supabase Realtime. Alert visual selalu tampil. Bunyi hanya diputar setelah caregiver menekan "Aktifkan suara" karena kebijakan autoplay browser.

"Saya tangani" harus atomic: hanya handler pertama yang berhasil untuk event `new`, sementara client lain menerima status terbaru.

Fallback: reconnect banner dan refresh/polling daftar event. Tidak ada klaim delivery ketika tab tertutup.

Owner Realtime/API: Bernard. UX/audio: Daniel. QA: Ozan.

### 4.6 Faskes/BPJS helper

Dataset statis Tangerang menyediakan nama, tipe, area, alamat ringkas, telepon bila sintetis/publik, atribut BPJS yang tercatat, layanan yang tercatat, sumber, dan tanggal pembaruan.

UI tidak boleh menjanjikan fasilitas buka, menerima BPJS, atau tersedia. Pengguna diarahkan untuk mengonfirmasi langsung.

Owner: Ozan. API/data: Bernard. UX: Daniel.

## 5. MVP Lifecycle: End-of-Care / Deactivate Patient Profile

Outcome:

- Owner dapat membuka flow end-of-care/deactivate Patient Profile sebagai lifecycle action sensitif.
- UI memakai wording manusiawi, bukan "mark as dead".
- Flow tidak melakukan hard delete secara default.
- Action diaudit.

Minimum MVP:

- Owner-only entry point.
- Confirmation screen.
- Reason option seperti "Perawatan berakhir", "Pasien berpindah perawatan", atau "Pasien meninggal dunia".
- Resulting state tidak boleh tetap terlihat sebagai active daily-care flow.

Out of scope untuk lifecycle MVP:

- Payment/subscription sungguhan.
- Data deletion automation.
- Legal/compliance workflow.
- Notification ke pihak eksternal.

Owner: Ozan. API/data: Bernard. UX: Daniel. Safety/privacy: Bernard.

## 6. P1: MVP Support

- Invite dan remove Family Member dengan state lengkap.
- Regenerasi kode Patient dan revoke session.
- Medication log "sudah diminum".
- Filter/search dokumen.
- Riwayat SOS dan audit activity sederhana.
- Chat history terbatas untuk session yang sama.
- Empty/error/reconnect state yang lebih lengkap.
- Dataset provenance yang lebih rinci.

P1 tidak boleh menggeser waktu verifikasi P0.

## 7. P2 / Parking Lot

- Food/menu/pantangan guidance.
- Onboarding chronic condition yang lebih personal.
- Edit profil caregiver.
- Notification preferences di dalam aplikasi.
- Insight card non-klinis berbasis seed.

P2 wajib diberi label jika belum memiliki backend. Jangan menampilkan tombol seolah tindakan telah tersimpan.

Food/menu tetap di luar MVP implementation packet. Jika nanti dipilih, fitur harus berbasis catatan manusia atau sumber resmi dan tidak boleh menjadi rekomendasi klinis otomatis.

## 8. Out of Scope

- Diagnosis, prognosis, risk score klinis, rekomendasi obat, perubahan dosis, target gula darah personal, dan interpretasi lab final.
- OCR tanpa review manusia, analisis citra medis, dan keputusan klinis dari dokumen.
- Rekomendasi makanan/pantangan personal.
- WhatsApp, SMS, email alert, web push, service worker, dan notifikasi OS.
- Panggilan otomatis, ambulans, dispatch IGD, dan integrasi layanan darurat.
- Live location, wearable, sensor, live monitoring, voice input/output.
- Scraping faskes real-time dan integrasi BPJS/rumah sakit.
- Family chat, payment/subscription nyata, marketplace.
- Multi Care Circle per user dan lebih dari dua Patient Profile.
- Fine-grained custom permission di luar Owner, Family Member, dan Patient.
- Klaim compliance production.

## 9. Cut Line

Jika waktu kurang:

1. Pertahankan auth, Patient Profile isolation, document privacy, dan medical guardrail.
2. Pertahankan satu check-in, satu OCR review, satu chatbot caregiver, satu SOS, dan satu hasil faskes.
3. Gunakan seed dan fallback yang diberi label.
4. Potong Patient chatbot dari demo sebelum memotong caregiver flow.
5. Potong P1 dan P2 seluruhnya kecuali end-of-care jika sudah menjadi UI flow ringan.
6. Jangan mengubah hasil OCR menjadi auto-confirm demi mengejar waktu.
7. Jangan menambahkan food/menu demi mengejar challenge chronic illness.

## 10. Dependency Map

| Fitur | Data/API | UI | AI | QA/Product |
| --- | --- | --- | --- | --- |
| Auth/Care Circle | Bernard | Daniel | Tidak ada | Ozan |
| Patient Profile access | Bernard | Daniel | Tidak ada | Ozan |
| Daily care | Bernard | Daniel | Context only | Ozan |
| Document OCR | Bernard | Daniel | Al | Ozan |
| Chatbot | Bernard | Daniel | Al | Ozan |
| SOS | Bernard | Daniel | Tidak ada | Ozan |
| Faskes/BPJS | Bernard | Daniel | Optional explanation only | Ozan |
| End-of-care | Bernard | Daniel | Tidak ada | Ozan |

## 11. Change Control

Status dokumen ini locked untuk product scope Step 2. Perubahan kategori P0/P1/P2/out-of-scope membutuhkan verdict Ozan. Perubahan yang memengaruhi API/data membutuhkan review Bernard, UX membutuhkan review Daniel, dan OCR/AI membutuhkan review Al.

Technical docs masih perlu refinement untuk mengganti legacy Parent terminology menjadi Patient terminology sebelum implementasi dimulai.

## 12. Change Log

- 15 Juli 2026: OCR dengan caregiver review menjadi P0; SOS dikunci sebagai alert web Realtime dengan bunyi opt-in.
- 16 Juli 2026: Step 2 refinement, mengganti feature scope dari Parent/elderly care ke chronic illness Patient care, menambahkan diabetes tipe 2 sebagai demo condition, dan memasukkan end-of-care/deactivate Patient Profile sebagai MVP lifecycle flow.
