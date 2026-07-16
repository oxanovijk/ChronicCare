# User Journeys

Produk: Navicare
Status: Locked for Hackathon MVP v1, Step 2 chronic illness journey refinement
DRI: Ozan (Product Manager dan QA)
UX owner: Daniel
API/data owner: Bernard
AI/OCR owner: Al
Challenge: How can we improve how people manage and live with chronic illness over the long term?
Demo condition: diabetes tipe 2

## 1. Aturan Lintas Journey

- Owner dan Family Member hanya dapat mengakses Care Circle tempat mereka menjadi anggota.
- Patient session terikat tepat ke satu Patient Profile.
- Semua data patient-bound memakai `patientProfileId` eksplisit setelah technical terminology refinement selesai.
- Profile aktif di UI membantu orientasi, tetapi bukan sumber authorization.
- Maksimal dua Patient Profile per Care Circle untuk MVP hackathon.
- Hasil OCR berstatus pending tidak boleh dianggap sebagai fakta.
- Chatbot hanya menggunakan konteks profile aktif yang diizinkan.
- SOS hanya memberi alert kepada dashboard web caregiver yang sedang terbuka.
- Demo diabetes tipe 2 tidak boleh berubah menjadi diagnosis, dosing, lab interpretation, atau nutrition prescription.

## 2. Owner: Membuat Care Circle

Precondition: Owner telah masuk melalui Supabase Auth.

Alur:

1. Owner membuat Care Circle.
2. Owner membuat Patient Profile pertama.
3. Sistem menampilkan identitas Patient Profile dan meminta konfirmasi.
4. Owner membuat kode akses Patient.
5. Sistem menampilkan kode satu kali atau sesuai kebijakan demo.
6. Owner masuk ke dashboard dengan Patient Profile pertama aktif.

Success: Care Circle, membership Owner, Patient Profile, dan hashed access code tersimpan atomically.

Failure states: nama kosong, Patient kedua melebihi batas, transaksi gagal, atau kode gagal dibuat. UI tidak boleh menunjukkan setup selesai jika transaksi belum berhasil.

## 3. Owner: Mengundang Family Member

1. Owner membuat invite dengan expiry.
2. Family Member membuka invite dan masuk/mendaftar.
3. API memvalidasi token, expiry, dan status penggunaan.
4. Membership dibuat satu kali.
5. Family Member melihat Care Circle tanpa hak admin Owner.

Owner dapat menghapus anggota jika fitur P1 dikerjakan. Family Member tidak dapat menghapus Owner atau anggota lain.

## 4. Caregiver: Berpindah Patient Profile

1. Caregiver melihat selector dengan maksimal dua Patient Profile.
2. Caregiver memilih Patient kedua.
3. UI segera menampilkan loading/skeleton yang menyebut Patient baru.
4. Query baru membawa `patientProfileId`.
5. Cache/panel Patient sebelumnya tidak ditampilkan selama request berjalan.
6. Dashboard, dokumen, chat, dan SOS kemudian menampilkan Patient yang dipilih.

Demo:

- Maya Pratama adalah Patient utama untuk skenario diabetes tipe 2.
- Raka Pratama adalah Patient kedua untuk bukti isolation.

Negative path:

- Memanipulasi URL dengan profile yang bukan anggota menghasilkan 403/404 aman.
- Mengirim ID Maya melalui session Patient Raka ditolak.
- Berpindah cepat tidak boleh membuat respons lama menimpa profile baru.

## 5. Patient: Masuk dengan Kode

1. Patient membuka halaman akses.
2. Patient memasukkan kode sintetis.
3. Server membandingkan hash, expiry, dan status aktif.
4. Server membuat cookie session aman yang terikat ke satu Patient Profile.
5. Patient diarahkan ke homepage miliknya.

Error harus sederhana: kode tidak valid atau sudah tidak berlaku. Pesan tidak boleh membocorkan nama Patient atau Care Circle.

## 6. Patient: Check-in Harian

1. Patient melihat pertanyaan kondisi hari ini dengan tone cheerful dan suportif.
2. Patient memilih status sederhana dan catatan opsional.
3. UI menampilkan ringkasan sebelum atau sesudah submit sesuai desain final.
4. API mengambil `patientProfileId` dari session, bukan input bebas client.
5. Dashboard caregiver untuk profile itu menampilkan check-in terbaru.

Untuk demo diabetes tipe 2, check-in boleh berbunyi seperti rutinitas atau keluhan umum. Copy tidak boleh menyimpulkan target gula darah, kontrol penyakit, atau tindakan medis.

Success copy harus singkat. Retry tidak boleh membuat duplikasi yang membingungkan.

## 7. Caregiver: Mengelola Obat dan Reminder

1. Caregiver memastikan badge Patient aktif benar.
2. Caregiver menambah nama dan instruksi yang berasal dari catatan pasien/keluarga/tenaga kesehatan.
3. Caregiver mengatur jadwal dasar.
4. API memvalidasi membership dan Patient Profile.
5. Patient melihat reminder terkait miliknya.

Produk tidak menyimpulkan dosis, target diabetes, atau rekomendasi klinis. Copy harus memakai "catatan yang dimasukkan caregiver" atau "sesuai instruksi yang dicatat", bukan "resep dari Navicare".

## 8. Caregiver: Upload dan Review OCR

1. Caregiver memilih Patient aktif dan membuka Dokumen Kesehatan.
2. Caregiver memilih PDF/JPG/PNG maksimal 5 MB dan tiga halaman.
3. Client memvalidasi format/ukuran dasar; server mengulang validasi.
4. API membuat record dokumen dan signed upload untuk bucket privat.
5. File diunggah lalu job OCR dimulai.
6. UI menampilkan `PROCESSING`, kemudian `REVIEW_REQUIRED` atau `FAILED`.
7. Caregiver membandingkan preview dokumen dengan field hasil OCR.
8. Caregiver memperbaiki nilai yang keliru.
9. Caregiver mengonfirmasi field yang benar atau menolak extraction.
10. Hanya field confirmed tersedia untuk ringkasan dan chatbot.

Demo diabetes tipe 2 memakai dokumen sintetis kontrol/lab/checkup. OCR tidak boleh menyimpulkan diagnosis, dosis, target gula darah, atau status aman/berbahaya secara klinis.

Failure/recovery:

- Upload gagal: pengguna dapat retry tanpa record ganda yang tidak jelas.
- OCR gagal: file tetap privat dan metadata manual tetap tersedia.
- Session kedaluwarsa: signed URL lama tidak menjadi akses permanen.
- Profile berpindah saat proses: hasil tetap terikat ke profile saat upload dan UI memberi label profile secara jelas.

## 9. Patient: Chatbot Aman

1. Patient membuka chatbot dari homepage.
2. Patient menulis keluhan, pertanyaan rutinitas, atau kekhawatiran umum.
3. Context builder memakai profile dari Patient session dan data confirmed minimum.
4. Chatbot menjawab dengan bahasa sederhana.
5. Untuk gejala darurat, respons dipersingkat dan mengarahkan ke caregiver, SOS, IGD, atau tenaga medis.

Chatbot tidak boleh mengajak percakapan panjang saat ada tanda darurat, memberikan diagnosis, menyarankan perubahan obat/dosis, menentukan target diabetes personal, menafsirkan lab final, atau memberi pantangan makanan personal.

## 10. Caregiver: Chatbot Kontekstual

1. Caregiver memilih Maya.
2. Caregiver membuka chatbot dan melihat label "Konteks: Maya Pratama".
3. Context builder memverifikasi membership dan mengambil check-in, medication record, catatan, serta extraction confirmed milik Maya.
4. Caregiver meminta daftar pertanyaan untuk kunjungan dokter atau penjelasan BPJS.
5. Respons menyebut keterbatasan jika data kurang dan tidak mengambil data Patient lain.

Negative path mencakup prompt diagnosis, perubahan dosis, target gula darah personal, interpretasi lab, pantangan makanan, emergency, cross-profile injection, dan provider failure.

## 11. Patient dan Caregiver: SOS

Patient flow:

1. Patient menekan tombol SOS.
2. UI meminta konfirmasi singkat agar tidak terpencet.
3. API membuat event `new` untuk profile dari session.
4. Patient melihat pesan bahwa caregiver/family telah diberi tahu melalui Navicare.

Caregiver flow:

1. Caregiver sebelumnya menekan "Aktifkan suara" jika ingin bunyi.
2. Dashboard terbuka menerima event melalui Supabase Realtime.
3. Alert visual menampilkan Patient, waktu, status, dan konteks minimum yang diizinkan.
4. Audio lokal berbunyi jika opt-in dan browser mengizinkan.
5. Caregiver membuka detail lalu menekan "Saya tangani".
6. API melakukan claim atomic dan menyimpan handler serta waktu.
7. Dashboard caregiver lain menerima status `HANDLED` dan nama handler.

Fallback:

- Jika Realtime terputus, banner reconnect tampil dan daftar SOS di-refresh/poll.
- Jika audio diblokir, alert visual tetap menjadi sumber utama dan tombol aktivasi ditampilkan.
- Jika dua caregiver menekan bersamaan, hanya satu claim berhasil; lainnya melihat handler terbaru.
- Tab tertutup tidak menerima alert. Produk tidak boleh menjanjikan sebaliknya.

## 12. Caregiver: Faskes/BPJS Helper

1. Caregiver memastikan Patient aktif benar.
2. Caregiver memilih area/jenis layanan/filter BPJS.
3. Sistem membaca dataset statis Tangerang.
4. UI menampilkan fasilitas, sumber, dan catatan agar pengguna mengonfirmasi langsung.
5. Chatbot boleh membantu menjelaskan langkah administratif, tetapi tidak memilih fasilitas secara klinis.

Empty state menjelaskan bahwa hasil tidak ditemukan dalam dataset, bukan bahwa fasilitas tidak ada.

## 13. Owner: End-of-Care / Deactivate Patient Profile

1. Owner membuka settings Patient Profile.
2. Owner memilih flow "Akhiri perawatan" atau "Nonaktifkan profil pasien".
3. UI menjelaskan bahwa tindakan ini sensitif dan tidak menghapus data secara permanen secara default.
4. Owner memilih alasan, misalnya "Perawatan berakhir", "Pasien berpindah perawatan", atau "Pasien meninggal dunia".
5. Owner mengonfirmasi.
6. Sistem mengubah status Patient Profile sesuai kontrak teknis berikutnya dan mencatat audit event.

Rules:

- Family Member tidak dapat menjalankan flow ini.
- UI tidak memakai istilah "mark as dead".
- Jika ada cancel-subscription screen, itu dummy/contextual only dan tidak memproses payment/subscription.
- Profile inactive/deactivated tidak boleh tetap terlihat sebagai active daily-care target.

Flow ini bukan bagian demo utama kecuali juri bertanya tentang lifecycle.

## 14. Food/Menu Parking Lot

Menu makanan dan pantangan tidak masuk MVP journey.

Jika future feature dibuat:

1. Caregiver atau Patient memasukkan catatan dari dokter/nutrisionis.
2. UI menampilkan catatan tersebut sebagai recorded guidance.
3. AI hanya boleh menjelaskan secara umum dan menyarankan konfirmasi ke tenaga kesehatan.

AI tidak boleh menentukan makanan yang "boleh" atau "dilarang" secara personal untuk pasien diabetes atau chronic illness lain.

## 15. Journey Priority

| Prioritas | Journey | Bukti Demo |
| --- | --- | --- |
| P0 | Patient login dan homepage | Session terikat profile dan UI cheerful sederhana |
| P0 | Patient Profile switch | Data Maya/Raka terpisah |
| P0 | Check-in/daily care | Perubahan Patient terlihat caregiver |
| P0 | OCR review | Draft dapat diperbaiki dan confirmed |
| P0 | Caregiver chatbot | Context confirmed dan tidak diagnosis/dosis/lab-final |
| P0 | SOS | Realtime visual/audio opt-in dan claim |
| P0 | Faskes/BPJS | Dataset lokal dan wording jujur |
| MVP lifecycle | End-of-care/deactivate profile | Owner-only flow sensitif, bukan demo utama |
| P1 | Invite lengkap dan medication log | Hanya jika P0 stabil |

## 16. Accessibility dan Copy

Daniel bertanggung jawab atas:

- Target sentuh minimal yang layak untuk Patient.
- Focus state, label form, kontras, dan urutan keyboard.
- Tidak mengandalkan bunyi atau warna saja untuk SOS.
- Konfirmasi untuk tindakan berisiko salah tekan.
- Bahasa Indonesia sederhana, warm, dan konsisten.
- Patient UI yang cheerful tanpa menjadi childish.
- Caregiver UI yang informatif tanpa menjadi terlalu padat.

Ozan memverifikasi bahwa copy tidak membuat janji medis, emergency delivery, BPJS, OCR accuracy, diabetes outcome, atau nutrition advice yang tidak terbukti.

## 17. Change Control

Dokumen ini locked untuk product journey Step 2. Perubahan role atau data access memerlukan verdict Ozan dan review Bernard. Perubahan AI/OCR memerlukan review Al. Perubahan alur Patient dan accessibility memerlukan review Daniel.

Technical docs masih perlu refinement untuk mengganti legacy Parent terminology menjadi Patient terminology sebelum implementasi dimulai.

## 18. Change Log

- 15 Juli 2026: Menambahkan journey OCR lengkap dan mengganti SOS eksternal dengan alert web Realtime dan bunyi opt-in.
- 16 Juli 2026: Step 2 refinement, mengganti journey dari Parent/elderly care ke chronic illness Patient care, menambahkan diabetes tipe 2 sebagai demo condition, end-of-care lifecycle, dan food/menu parking lot.
