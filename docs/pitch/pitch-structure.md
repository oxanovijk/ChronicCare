# Pitch Structure

Produk: ChroniCare
Status: Locked outline, rehearsal pending
DRI: Ozan
Kontributor: Daniel, Bernard, Al
Durasi total: 5 menit, termasuk demo 2 menit

## 1. Pesan yang Harus Diingat Juri

> ChroniCare adalah Care Circle untuk pasien chronic illness dan caregiver: satu konteks per Patient Profile, dokumen yang ditinjau, AI yang aman, dan koordinasi SOS di web.

## 2. Timebox

| Waktu | Bagian | Target |
| --- | --- | --- |
| 0:00-0:40 | Problem | Juri memahami rutinitas chronic illness yang panjang, informasi tercecer, beban caregiver, dan UX Patient |
| 0:40-1:15 | Solution | Jelaskan dua experience dan patient-bound context |
| 1:15-3:15 | Demo | Buktikan OCR review, AI guardrail, SOS, dan faskes tanpa melebar |
| 3:15-4:15 | Impact dan feasibility | Jelaskan stack, scope 30 jam, fallback, dan privacy |
| 4:15-5:00 | Closing | Kunci diferensiasi dan batas produk |

## 3. Problem: 40 Detik

Talk track:

> "Mengelola chronic illness seperti diabetes tipe 2 bukan kejadian satu kali. Ada rutinitas harian, obat, kontrol, dokumen, dan momen ketika kondisi memburuk. Informasi sering tersebar di chat, foto dokumen, dan ingatan. Pasien butuh alur yang sederhana, sementara caregiver butuh konteks terbaru tanpa mencampur profile."

Gunakan satu contoh keluarga, bukan daftar persona panjang.

## 4. Solution: 35 Detik

Talk track:

> "ChroniCare membuat satu Care Circle dengan pengalaman sederhana untuk Patient dan dashboard kontekstual untuk caregiver. Setiap check-in, obat, dokumen, chat, dan SOS terikat ke Patient Profile seperti Maya atau Raka. OCR mempercepat input tetapi tetap ditinjau manusia. AI membantu navigasi dan persiapan kunjungan dokter tanpa mendiagnosis."

Tiga diferensiasi:

- Patient-bound context dan pemisahan Maya/Raka.
- Human-in-the-loop untuk dokumen kesehatan.
- Koordinasi caregiver yang safety-aware, bukan klaim layanan medis.

## 5. Demo: 2 Menit

Ikuti `docs/pitch/demo-script.md`. Jangan menyisipkan penjelasan arsitektur selama demo. Jika satu langkah gagal, gunakan fallback yang sudah dilabeli dan lanjutkan.

## 6. Impact dan Feasibility: 60 Detik

### Impact

- Mengurangi input ulang dokumen dengan OCR yang tetap dapat dikoreksi.
- Membantu caregiver memahami kondisi terbaru dalam profile yang benar.
- Memberi Patient jalur bantuan sederhana.
- Membuat ownership SOS terlihat oleh caregiver/keluarga yang sedang aktif di aplikasi.
- Mengubah pencarian faskes/BPJS menjadi langkah administratif yang lebih terstruktur.

Jangan mengklaim outcome klinis, penghematan biaya, atau peningkatan keselamatan tanpa studi.

### Feasibility

> "Kami memilih modular monolith Next.js agar satu tim kecil dapat bergerak cepat. Supabase menangani Postgres, Auth, private Storage, dan Realtime. Prisma mengunci akses data, Azure Document Intelligence menangani OCR, dan Azure OpenAI berada di balik gateway dengan guardrail. Kontrak API dan data model dibekukan agar empat role dapat bekerja paralel tanpa mengubah scope."

Ownership:

- Bernard: API, database, auth, storage, Realtime, deploy path.
- Daniel: Patient dan Caregiver UX, accessibility, states, demo operation.
- Al: OCR schema, AI context, prompt, guardrail, fallback evaluation.
- Ozan: product verdict, QA evidence, cut line, pitch, rehearsal.

## 7. Safety dan Privacy Proof Points

- Patient session tidak dapat memilih profile lain.
- Database/API memverifikasi membership dan `patientProfileId`.
- Dokumen berada di private bucket dengan signed URL singkat.
- OCR pending tidak masuk chatbot.
- Chatbot menolak diagnosis dan perubahan obat/dosis.
- Chatbot menolak target diabetes personal, interpretasi lab final, dan diet/pantangan prescription.
- SOS tidak menjanjikan delivery ketika dashboard tertutup.
- Seluruh demo memakai data sintetis.

## 8. Closing: 45 Detik

Talk track:

> "ChroniCare tidak mencoba menjadi dokter digital. Kami membangun lapisan koordinasi keluarga yang sering hilang: konteks yang benar, dokumen yang dapat dipercaya setelah review, dan langkah berikutnya yang jelas. Untuk pasien, lebih sederhana. Untuk caregiver, lebih terstruktur. Untuk keluarga, tidak lagi saling menunggu tanpa tahu siapa yang bergerak."

Tutup pada dashboard atau Care Circle, bukan roadmap.

## 9. Q&A Guardrails

Jika ditanya akurasi OCR:

> "Hasil mesin selalu draft. Caregiver harus mengonfirmasi sebelum dipakai sebagai konteks."

Jika ditanya emergency:

> "SOS MVP mengoordinasikan caregiver di dashboard web yang terbuka. Ini bukan dispatch dan tidak menggantikan nomor darurat, IGD, atau ambulans."

Jika ditanya keamanan:

> "Akses dipagari membership, patient session terikat profile, storage privat, dan seluruh query patient-bound membawa ID eksplisit. Klaim production compliance belum dibuat."

Jika ditanya skalabilitas:

> "MVP sengaja satu Care Circle dan dua patient profile. Validasi berikutnya adalah penggunaan keluarga nyata dengan data non-sensitif/sintetis sebelum memperluas scope."

Jika ditanya apakah ini aplikasi diabetes:

> "Diabetes tipe 2 hanya skenario demo agar chronic illness terasa konkret. ChroniCare adalah care coordination layer, bukan diagnosis, treatment, dose, lab, atau nutrition-prescription product."

Jika ditanya menu makanan/pantangan:

> "Itu parking lot setelah demo path stabil. Untuk MVP, AI tidak memberi resep diet personal; maksimal membantu menyiapkan pertanyaan untuk dokter atau ahli gizi."

## 10. Slide Rule

- Maksimal satu pesan utama per slide.
- Gunakan tangkapan produk, bukan paragraf PRD.
- Jangan menampilkan secret, raw log, atau dokumen keluarga asli.
- Tampilkan batasan dekat dengan klaim, bukan hanya di slide terakhir.
- Angka impact harus memiliki sumber; jika belum ada, gunakan hipotesis kualitatif.

## 11. Change Log

- 16 Juli 2026: Mengubah pitch ke challenge chronic illness, skenario diabetes tipe 2, dan Patient Profile.
- 15 Juli 2026: Menyelaraskan pitch dengan OCR review, stack final, ownership tim, dan batas SOS web.
