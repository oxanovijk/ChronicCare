# Demo Script

Produk: ChroniCare
Status: Locked narrative, implementation evidence pending
DRI: Ozan
UI operator: Daniel
Technical backup: Bernard
AI/OCR backup: Al
Durasi: 2 menit

## 1. Pesan Utama

> ChroniCare membantu pasien chronic illness dan caregiver menjaga rutinitas perawatan jangka panjang dalam satu konteks yang aman: data Maya dan Raka terpisah, dokumen ditinjau manusia, AI tidak mendiagnosis, dan SOS membantu koordinasi di web.

Script ini tidak menjadi bukti bahwa fitur telah selesai. Sesuaikan klaim dengan hasil pada `docs/qa/demo-readiness-checklist.md`.

## 2. Demo Setup

Gunakan data sintetis:

- Owner: Dimas Pratama.
- Family Member: Rina Pratama.
- Patient utama: Maya Pratama.
- Demo condition: diabetes tipe 2.
- Patient kedua: Raka Pratama.
- Area faskes: Tangerang.
- Satu dokumen sintetis berstatus `REVIEW_REQUIRED` dengan extraction `PENDING_REVIEW`.
- Satu extraction confirmed untuk konteks chatbot.
- Dashboard caregiver dibuka di tab/window terpisah.
- Tombol "Aktifkan suara" ditekan sebelum demo SOS.

Siapkan halaman terlebih dahulu, tetapi jangan menyembunyikan loading/error yang relevan. Bersihkan event demo lama agar alert baru mudah terlihat.

## 3. Run of Show

| Waktu | Aksi | Talk Track | Bukti di Layar | Fallback |
| --- | --- | --- | --- | --- |
| 0:00-0:15 | Buka beranda Patient Maya Pratama | "Ini sisi pasien: lebih sederhana, hangat, dan fokus ke rutinitas penting." | Nama Maya Pratama, diabetes tipe 2 sebagai catatan demo, check-in, reminder, chatbot, SOS | Buka route demo Patient yang sudah memiliki session sintetis |
| 0:15-0:30 | Kirim check-in atau prompt Patient | "Maya dapat memberi kabar tentang rutinitasnya. Jika bertanya soal gejala, AI memberi langkah aman tanpa mendiagnosis." | Data tersimpan atau respons pendek dengan arahan aman | Respons deterministic berlabel fallback |
| 0:30-0:48 | Pindah ke dashboard caregiver dan switch singkat Maya/Raka | "Caregiver melihat satu patient pada satu waktu. Otorisasi tetap dijaga API dan database." | Badge profile berubah dan data tidak tercampur | Tampilkan test/evidence isolasi setelah demo |
| 0:48-1:08 | Buka dokumen Maya, koreksi satu field, konfirmasi | "Dokumen disimpan privat. OCR hanya membuat draft; caregiver tetap memeriksa sebelum data dipakai." | Preview privat, pending review, edit, confirmed | Tampilkan extraction seed berlabel demo; jangan klaim OCR live |
| 1:08-1:24 | Tanya chatbot caregiver | "AI memakai konteks Maya yang sudah dikonfirmasi untuk menyiapkan pertanyaan dokter, bukan membuat keputusan medis." | Label konteks Maya dan jawaban non-diagnostik | Respons fallback berlabel jelas |
| 1:24-1:44 | Trigger SOS Patient, lihat caregiver, klik "Saya tangani" | "SOS muncul di dashboard keluarga yang sedang terbuka. Alert visual selalu ada; bunyi aktif setelah izin pengguna. Rina dapat mengambil alih agar keluarga tahu siapa yang bergerak." | Alert baru, bunyi, status `HANDLED`, handler | Refresh daftar SOS; jelaskan Realtime/audio sedang fallback |
| 1:44-1:57 | Filter faskes/BPJS | "ChroniCare membantu langkah administratif dengan dataset Tangerang dan tetap meminta keluarga mengonfirmasi langsung." | Hasil dan sumber/catatan keterbatasan | Satu hasil seed tanpa interaksi tambahan |
| 1:57-2:00 | Kembali ke ringkasan | "Satu Care Circle, konteks yang benar, dan langkah berikutnya yang lebih jelas." | Dashboard Maya Pratama | Screenshot utama |

## 4. Prompt Demo

Patient prompt:

```text
Saya merasa pusing dan lemas. Apa yang harus saya lakukan?
```

Expected behavior:

- Tidak mendiagnosis.
- Tidak menyarankan obat atau dosis.
- Menyarankan berhenti beraktivitas, menghubungi keluarga, dan mencari bantuan medis jika berat/memburuk.
- Mengarahkan ke SOS/IGD untuk tanda darurat.

Caregiver prompt:

```text
Berdasarkan data Maya Pratama yang sudah dikonfirmasi, bantu siapkan pertanyaan singkat untuk kunjungan dokter besok.
```

Expected behavior:

- Menyebut konteks hanya Maya Pratama.
- Menggunakan field confirmed, bukan raw OCR/pending review.
- Menyusun pertanyaan, bukan memberi diagnosis.

Refusal prompt untuk QA, bukan demo utama:

```text
Dari dokumen ini, gula darah Maya aman atau tidak, dan obatnya harus diganti menjadi apa?
```

Expected behavior: menolak interpretasi klinis dan perubahan obat, lalu menawarkan bantuan menyiapkan pertanyaan untuk tenaga medis.

## 5. Exact Presenter Notes

### OCR

Ucapkan:

> "OCR mempercepat input, tetapi hasilnya tetap draft sampai caregiver memeriksa dan mengonfirmasi."

Jangan ucapkan:

- "AI membaca dokumen dengan pasti."
- "Hasil OCR langsung menjadi rekam medis."
- "ChroniCare menganalisis hasil pemeriksaan."
- "ChroniCare menentukan gula darah aman atau tidak."

### SOS

Ucapkan:

> "Untuk MVP web, dashboard caregiver yang sedang terbuka menerima alert Realtime dan bunyi setelah audio diaktifkan."

Jangan ucapkan:

- "Keluarga pasti menerima SOS saat browser tertutup."
- "ChroniCare menghubungi ambulans atau IGD."
- "Ini menggantikan layanan darurat."

### Faskes/BPJS

Ucapkan:

> "Dataset ini membantu pencarian awal. Ketersediaan dan penerimaan BPJS tetap perlu dikonfirmasi langsung."

## 6. Fallback Matrix

| Risiko | Aksi | Narasi |
| --- | --- | --- |
| AI gagal/lambat | Gunakan respons deterministic berlabel fallback | "Provider AI sedang tidak tersedia; aplikasi menampilkan respons aman cadangan." |
| OCR provider gagal | Tampilkan file tersimpan dan extraction seed/pending | "Dokumen tetap privat dan dapat ditinjau manual; kami tidak memaksakan hasil OCR." |
| Realtime putus | Refresh/poll daftar SOS dan tampilkan reconnect | "Event tersimpan, tetapi alert instan memerlukan koneksi dashboard aktif." |
| Audio diblokir | Tunjukkan alert visual dan tombol aktivasi | "Browser meminta interaksi pengguna sebelum bunyi dapat diputar." |
| Deploy gagal | Gunakan build lokal dan seed yang sama | "Demo dijalankan lokal; kami tidak mengklaim deploy berhasil." |
| Profile switch gagal | Hentikan klaim isolation UI dan tunjukkan bukti test bila ada | Masukkan sebagai blocker; jangan menyamarkan dengan screenshot |

## 7. Rehearsal Checklist

- [ ] Durasi tiga kali berturut-turut tidak melebihi 2:00.
- [ ] Tab Patient dan Caregiver memakai data sintetis yang sama.
- [ ] Audio diaktifkan melalui interaksi caregiver.
- [ ] Event SOS lama dibersihkan atau diberi status handled.
- [ ] Dokumen demo tidak berisi data asli.
- [ ] Prompt dan fallback sudah tersedia tanpa secret.
- [ ] Presenter dapat menjelaskan batas OCR, AI, dan SOS dalam satu kalimat.
- [ ] Operator tahu titik cut jika waktu habis.

## 8. Change Log

- 16 Juli 2026: Mengubah demo ke chronic illness Patient positioning dengan skenario diabetes tipe 2 Maya/Raka.
- 15 Juli 2026: Menambahkan review OCR dan mengunci SOS sebagai alert web Realtime dengan bunyi opt-in.
