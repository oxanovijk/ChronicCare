# Hackathon MVP Scope and Demo Narrative

Produk: Navicare
Status: Locked for Hackathon MVP v1, Step 2 chronic illness product-scope refinement
DRI: Ozan (Product Manager dan QA)
Kontributor: Daniel (UI/UX), Bernard (API dan database), Al (AI)
Implementasi: 30 jam
Demo produk: 2 menit
Presentasi total: 5 menit
Challenge: How can we improve how people manage and live with chronic illness over the long term?
Demo condition: diabetes tipe 2

## 1. Tujuan

Dokumen ini mengunci apa yang harus dibuktikan dalam demo setelah repositioning ke chronic illness care. Detail fitur berada di `feature-scope.md`; kontrak implementasi teknis berada di `docs/technical/` dan `docs/execution/`.

Hipotesis MVP:

> Satu Care Circle dengan Patient Profile yang terpisah, rutinitas perawatan harian, dokumen yang dapat ditinjau, AI yang dibatasi, dan koordinasi SOS di web dapat membantu pasien chronic illness dan caregiver menjaga care continuity jangka panjang.

Demo memakai diabetes tipe 2 sebagai skenario konkret. Navicare tetap bukan aplikasi diagnosis, penentuan dosis, interpretasi lab final, atau rekomendasi nutrisi personal.

## 2. Prinsip Scope

- Demo-first dan patient-bound.
- Satu alur end-to-end sebelum polish.
- Maksimal dua Patient Profile untuk MVP hackathon.
- Fitur eksternal harus punya fallback yang jujur.
- Hasil OCR adalah draft sampai dikonfirmasi caregiver.
- AI membantu navigasi, persiapan kontrol, dan rutinitas umum; bukan keputusan klinis.
- SOS adalah alert koordinasi web, bukan pengganti layanan darurat.
- End-of-care/deactivate profile masuk MVP sebagai lifecycle flow sensitif, bukan demo utama.
- Food/menu/pantangan tidak masuk MVP packet.
- Tidak ada klaim fitur selesai tanpa bukti verifikasi.

## 3. Main Demo Flow

1. Patient membuka homepage cheerful yang terikat ke Patient Profile Maya.
2. Patient melakukan check-in atau bertanya kepada chatbot tentang rutinitas/keluhan ringan terkait diabetes tipe 2.
3. Caregiver membuka dashboard dan melihat konteks Maya sebagai Patient aktif.
4. Caregiver melakukan switch singkat ke Patient kedua untuk membuktikan isolation, lalu kembali ke Maya.
5. Caregiver membuka dokumen sintetis hasil kontrol/lab, melihat draft OCR, mengoreksi satu field, lalu mengonfirmasi.
6. Caregiver memakai chatbot untuk menyiapkan pertanyaan kunjungan dokter menggunakan hanya data terkonfirmasi.
7. Patient memicu SOS saat merasa kondisi memburuk.
8. Dashboard caregiver yang terbuka menampilkan alert dan bunyi setelah audio diaktifkan.
9. Caregiver menekan "Saya tangani".
10. Caregiver membuka faskes/BPJS helper untuk langkah administratif berikutnya.

Patient kedua digunakan sebagai bukti isolasi data, bukan sebagai alur kedua yang panjang.

## 4. Run of Show Dua Menit

| Waktu | Adegan | Bukti Utama | DRI Demo |
| --- | --- | --- | --- |
| 0:00-0:15 | Patient homepage | UI cheerful, Patient benar, check-in/reminder/chat/SOS terlihat | Daniel |
| 0:15-0:30 | Check-in atau Patient chatbot | Input tersimpan atau respons aman tanpa diagnosis/dosis | Al |
| 0:30-0:48 | Caregiver dashboard dan switch singkat | Patient Maya aktif, second Patient tidak mencampur data | Bernard, Daniel |
| 0:48-1:08 | Review OCR | Dokumen privat, draft dikoreksi, status menjadi confirmed | Al, Bernard |
| 1:08-1:25 | Caregiver chatbot | Jawaban memakai konteks Maya dan field confirmed untuk persiapan dokter | Al |
| 1:25-1:45 | SOS | Alert visual, bunyi opt-in, "Saya tangani" tersimpan | Bernard, Daniel |
| 1:45-1:57 | Faskes/BPJS | Dataset Tangerang dan wording yang jujur | Ozan |
| 1:57-2:00 | Closing | Care Circle menjaga rutinitas chronic illness tanpa mengganti dokter | Presenter |

Jika rehearsal melebihi dua menit, potong Patient chatbot terlebih dahulu. Jangan memotong bukti Patient Profile isolation, review OCR, atau penanganan SOS.

## 5. P0 Demo-Critical

- App shell responsif untuk Patient dan Caregiver.
- Supabase Auth untuk caregiver.
- Session kode khusus Patient yang terikat ke satu Patient Profile.
- Care Circle, membership, dan Patient Profile switching.
- Check-in dan ringkasan daily care.
- Medication/reminder dasar yang dapat dibaca.
- Upload dokumen privat dan metadata patient-bound.
- OCR Azure, draft extraction, caregiver review, dan confirmation.
- Patient dan Caregiver chatbot dengan context isolation dan fallback.
- SOS web melalui Realtime, visual alert, audio opt-in, dan claim handler.
- Faskes/BPJS helper dengan dataset statis Tangerang.
- Synthetic seed data dan audit event untuk aksi sensitif.

## 6. MVP Lifecycle Support

Lifecycle support masuk MVP tetapi tidak wajib muncul di demo utama:

- Owner-only end-of-care/deactivate Patient Profile flow.
- Wording sensitif, misalnya "Akhiri perawatan" atau "Nonaktifkan profil pasien".
- Tidak memakai istilah kasar seperti "mark as dead" di UI.
- Tidak melakukan hard delete secara default.
- Action tercatat dalam audit.
- Jika ada cancel-subscription screen, itu dummy/contextual only dan tidak memproses payment/subscription nyata.

## 7. P1 Pendukung

P1 hanya dikerjakan setelah P0 happy path stabil:

- Invite Family Member yang lengkap.
- Medication log "sudah diminum".
- Empty, loading, error, dan reconnect state yang lebih halus.
- Search dan filter dokumen/faskes tambahan.
- Riwayat chat singkat.
- Revoke session Patient setelah regenerasi kode.
- Dataset provenance yang lebih rinci.

## 8. P2 / Parking Lot

- Food/menu/pantangan guidance.
- Onboarding chronic condition yang lebih personal.
- Insight card non-klinis berbasis seed.
- Settings non-kritis.
- Notification preferences di dalam aplikasi.

Food/menu tidak boleh masuk MVP packet kecuali human verdict baru mengubah scope. Jika nanti dibuat, data harus berasal dari catatan dokter/nutrisionis/caregiver dan tidak boleh diklaim sebagai rekomendasi klinis otomatis.

## 9. Simplifikasi yang Diizinkan

- Dataset faskes berupa seed statis yang dapat diaudit.
- Satu tipe dokumen demo dengan mapping ekstraksi yang konsisten.
- Reminder tidak mengirim notifikasi sistem operasi.
- Bunyi SOS memakai satu file audio lokal dan tombol "Aktifkan suara".
- Realtime hanya dijamin untuk dashboard caregiver yang sedang terbuka.
- AI fallback dapat berupa respons deterministic yang diberi label jelas.
- Tampilan Patient dapat memakai satu viewport utama selama responsivitas dasar tetap diuji.
- Demo condition diabetes tipe 2 boleh memakai data sintetis sederhana, bukan model klinis lengkap.

## 10. Out of Scope

- Diagnosis, triase klinis, rekomendasi obat, perubahan dosis, target gula darah personal, dan interpretasi lab final.
- Rekomendasi makanan/pantangan personal atau nutrition prescription.
- WhatsApp, SMS, push notification, service worker, dan dispatch darurat.
- Live location, wearable, sensor, voice, dan live monitoring.
- OCR tanpa review manusia atau ekstraksi yang langsung dianggap benar.
- Analisis citra medis.
- Real-time scraping faskes atau integrasi rumah sakit/BPJS.
- Family chat, payment/subscription nyata, dan multi Care Circle.
- Lebih dari dua Patient Profile.
- Fine-grained permissions di luar role MVP.

## 11. Demo Data Minimum

- Owner/caregiver utama: Dimas Pratama.
- Family Member/caregiver: Rina Pratama.
- Patient 1: Maya Pratama, skenario diabetes tipe 2 sintetis.
- Patient 2: Raka Pratama, data berbeda untuk bukti isolation.
- Kode akses sintetis yang berbeda untuk setiap Patient.
- Check-in normal dan satu check-in perlu perhatian.
- Dua obat/reminder yang dicatat caregiver untuk Maya; data berbeda untuk Raka.
- Satu dokumen sintetis tiga halaman atau kurang dengan hasil OCR pending review.
- Satu hasil OCR confirmed untuk konteks chatbot.
- Satu SOS baru dan satu SOS yang telah ditangani.
- Lima atau lebih faskes sintetis/terverifikasi untuk Tangerang dengan atribut BPJS.

Tidak boleh memakai nama, nomor telepon, nomor identitas, dokumen, hasil lab, obat, atau data kesehatan orang nyata.

## 12. Acceptance Demo

| Area | Acceptance Minimum |
| --- | --- |
| Auth | Caregiver dan Patient masuk melalui mekanisme terpisah |
| Isolation | Request dengan `patientProfileId` yang tidak boleh diakses ditolak API/database setelah technical rename selesai |
| Profile switch | Semua panel dan query mengikuti Patient aktif tanpa data lama tertinggal |
| Daily care | Check-in dan reminder diabetes demo tampil sebagai data yang dicatat, bukan saran klinis |
| OCR | File privat; extraction pending; caregiver dapat edit dan confirm |
| AI | Allowed, refused, emergency, fallback, diabetes safety, dan cross-profile cases diuji |
| SOS | Dashboard terbuka menerima event; visual alert tampil; audio berjalan setelah opt-in; handler atomic |
| Faskes | Filter menggunakan dataset statis dan tidak membuat klaim ketersediaan |
| UX | Patient flow cheerful, jelas, fokus terlihat, dan target sentuh layak |
| Privacy | Demo memakai data sintetis dan tidak menampilkan secret/raw document URL publik |

## 13. Fallback Matrix

| Risiko | Fallback Produk | Narasi Jujur |
| --- | --- | --- |
| Azure OpenAI gagal | Respons aman deterministic dengan label fallback | Provider AI sedang tidak tersedia; guardrail tetap berlaku |
| Document Intelligence gagal | Dokumen tersimpan, status OCR failed, metadata dapat diisi manual | Dokumen tidak hilang dan tidak ada hasil mesin yang dipaksakan |
| Supabase Realtime putus | Banner reconnect dan refresh/polling daftar SOS | Alert tetap tersimpan di database, tetapi bunyi real-time membutuhkan koneksi aktif |
| Browser memblokir audio | Tombol "Aktifkan suara" dan alert visual tetap tampil | Browser membutuhkan interaksi pengguna sebelum memutar bunyi |
| Deploy bermasalah | Jalankan build lokal dengan seed yang sama | Demo lokal digunakan tanpa mengklaim deployment sukses |
| AI lambat | Prompt dan respons fallback yang sudah direhearsal | Tampilkan fallback tanpa menyebutnya sebagai respons live |
| Diabetes wording terlalu klinis | Gunakan script non-diagnostik dan batasi ke persiapan kontrol | Produk membantu koordinasi dan persiapan, bukan keputusan klinis |

## 14. Freeze Rules

- Scope P0 membeku setelah jam ke-6.
- API dan data model membeku setelah technical Patient terminology refinement selesai; perubahan memakai change record.
- Narasi demo membeku setelah rehearsal pertama Packet 8.
- Sesudah jam ke-24, hanya perbaikan blocker, safety, privacy, dan demo-critical yang diterima.
- Ozan memegang verdict cut line. Bernard, Daniel, atau Al dapat memblokir perubahan yang melanggar domain mereka.

## 15. Definition of Ready

Sebuah packet siap dimulai jika dependency selesai, acceptance dapat diuji, allowed files jelas, API/data dependency diketahui, dan driver menerima handoff.

## 16. Definition of Done

Sebuah item hanya dianggap selesai jika:

- Implementasi tersedia di file yang sesuai.
- Acceptance criteria terbukti.
- Lint, typecheck, test, dan build relevan berhasil.
- Manual QA dicatat.
- Tidak ada kebocoran lintas Patient Profile atau data asli.
- Dokumentasi yang terdampak diselaraskan.

Status checklist QA tetap `Not Run` sampai pemeriksaan benar-benar dilakukan.

## 17. Keputusan Final

- Stack: Next.js full-stack TypeScript di Vercel.
- Data/auth/storage/realtime: Supabase.
- ORM: Prisma 7.
- AI: Azure OpenAI melalui package `openai`.
- OCR: Azure AI Document Intelligence melalui `@azure/ai-form-recognizer`.
- SOS: in-app Realtime untuk dashboard terbuka, alert visual, dan bunyi opt-in.
- Test: Vitest dan Playwright.
- API: REST `/api/v1`.
- Product positioning: chronic illness Patient care.
- Demo condition: diabetes tipe 2.

Tidak ada keputusan provider besar yang masih pending untuk memulai scaffold, tetapi technical terminology rename dari Parent ke Patient harus diselesaikan sebelum implementasi.

## 18. Change Log

- 15 Juli 2026: Mengunci scope OCR, review manusia, Supabase private storage, dan SOS web Realtime.
- 16 Juli 2026: Step 2 refinement, mengganti demo narrative dari elderly/Parent care ke chronic illness Patient care dengan diabetes tipe 2 sebagai demo condition.
