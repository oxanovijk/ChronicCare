# Product Context

Produk: ChroniCare
Status: Locked for Hackathon MVP v1, Step 1 chronic illness positioning refinement
DRI: Ozan (Product Manager dan QA)
Kontributor: Daniel (UI/UX), Al (AI), Bernard (API dan database)
Konteks: Hackathon kesehatan, implementasi 30 jam, demo produk 2 menit
Challenge: How can we improve how people manage and live with chronic illness over the long term?

## 1. Ringkasan

ChroniCare adalah aplikasi web Care Circle untuk membantu pasien chronic illness dan caregiver menjaga rutinitas perawatan jangka panjang. Produk menyatukan konteks Patient Profile, check-in, obat dan reminder, dokumen kesehatan, chatbot, SOS caregiver/family, serta pencarian faskes/BPJS Tangerang.

Demo condition untuk hackathon adalah diabetes tipe 2. Kondisi ini dipilih agar cerita long-term chronic illness terasa konkret melalui rutinitas, dokumen kontrol, persiapan kunjungan dokter, dan kebutuhan dukungan caregiver. ChroniCare tetap bukan aplikasi klinis khusus diabetes.

ChroniCare bukan alat diagnosis, pengganti dokter, IGD, ambulans, BPJS, layanan darurat resmi, atau sistem rekomendasi nutrisi klinis. Semua bantuan AI dibatasi pada navigasi, peringkasan administratif, persiapan pertanyaan untuk tenaga kesehatan, dan eskalasi aman.

## 2. Masalah Pengguna

Pasien chronic illness dan caregiver sering menghadapi kondisi berikut:

- Rutinitas perawatan berlangsung lama dan mudah terputus: check-in, obat, reminder, dokumen kontrol, dan follow-up.
- Informasi kesehatan tersebar di percakapan, foto, berkas, dan ingatan caregiver.
- Caregiver tidak selalu mengetahui kondisi terbaru atau siapa yang sedang menangani kebutuhan pasien.
- Data dua Patient Profile mudah tercampur jika produk hanya bergantung pada state antarmuka.
- Patient membutuhkan antarmuka yang cheerful, sederhana, suportif, dan tidak terasa seperti dashboard klinis.
- Caregiver membutuhkan dashboard yang lebih informatif untuk memahami perubahan kondisi dan tindakan berikutnya.
- Dokumen kesehatan sulit dicari kembali dan isinya perlu dicatat ulang.
- Navigasi faskes, BPJS, dan rujukan terasa rumit saat pasien atau caregiver sedang terburu-buru.
- Dalam situasi memburuk, caregiver membutuhkan sinyal yang terlihat dan dapat segera diambil alih.

## 3. Target Pengguna

### 3.1 Owner

Caregiver utama atau pengelola Care Circle. Owner juga caregiver aktif dan memegang tindakan administratif sensitif: mengundang atau menghapus Family Member, menambah Patient Profile kedua, membuat ulang kode akses Patient, serta melakukan end-of-care/deactivate profile flow.

Owner dapat berupa anggota keluarga, pendamping utama, atau pasien yang mengelola Care Circle sendiri. Untuk demo MVP, Owner diposisikan sebagai caregiver utama.

### 3.2 Family Member

Caregiver yang bergabung ke satu Care Circle. Family Member dapat melihat dan memperbarui data perawatan harian, mengunggah dan mengonfirmasi hasil OCR, memakai chatbot caregiver, serta menangani SOS. Role ini tidak boleh melakukan tindakan administratif khusus Owner.

### 3.3 Patient

Pasien chronic illness yang masuk dengan kode akses khusus satu Patient Profile. Patient hanya dapat mengakses beranda, check-in, reminder, chatbot, dan SOS miliknya sendiri.

Patient UI harus terasa cheerful, sederhana, dan suportif. Cheerful tidak berarti childish; UI tetap harus menghormati kondisi kesehatan serius dan membuat SOS tetap jelas.

## 4. Nilai Produk

ChroniCare memberi pasien dan caregiver satu konteks yang dapat dipercaya untuk satu Patient Profile pada satu waktu:

- Patient dapat menjaga rutinitas harian tanpa menavigasi dashboard rumit.
- Caregiver melihat kondisi, catatan, obat, dan dokumen dalam profile yang benar.
- OCR mengubah dokumen menjadi draft terstruktur tanpa menjadikan hasil mesin sebagai fakta otomatis.
- Chatbot menggunakan hanya konteks Patient aktif yang diizinkan dan data yang sudah dikonfirmasi.
- SOS memberi notifikasi web kepada caregiver yang sedang membuka dashboard.
- Faskes/BPJS helper memberi langkah administratif berbasis dataset statis yang transparan.
- End-of-care/deactivate profile memberi lifecycle path sensitif tanpa hard delete.

## 5. Prinsip Produk

1. Patient Profile adalah batas data, bukan sekadar filter tampilan.
2. Satu alur stabil lebih penting daripada banyak fitur setengah jadi.
3. Hasil OCR harus dikonfirmasi caregiver sebelum dianggap sebagai data terverifikasi.
4. AI tidak mendiagnosis, memilih obat, mengubah dosis, menafsirkan lab sebagai keputusan final, atau memberi pantangan makanan personal.
5. SOS MVP adalah koordinasi caregiver/family di web, bukan layanan dispatch darurat.
6. Semua data demo harus sintetis.
7. Keterbatasan provider dan browser harus disampaikan secara jujur.
8. Patient UI harus warm dan supportive; caregiver UI harus informatif dan scannable.

## 6. Pengalaman Utama

### 6.1 Patient experience

- Masuk menggunakan kode yang terikat tepat ke satu Patient Profile.
- Melihat homepage cheerful dengan salam, check-in, reminder terdekat, chatbot, dan tombol SOS.
- Mengirim check-in singkat terkait rutinitas atau keluhan umum.
- Meminta bantuan chatbot dengan respons ringkas, aman, dan non-diagnostik.
- Mengonfirmasi SOS sebelum event dibuat.
- Melihat status bahwa caregiver telah diberi tahu melalui aplikasi.

### 6.2 Caregiver experience

- Masuk menggunakan Supabase Auth.
- Memilih Patient Profile aktif, maksimal dua profile per Care Circle untuk MVP.
- Melihat dashboard informatif dengan identitas profile aktif yang selalu terlihat.
- Mengelola check-in, obat, reminder, dan dokumen untuk profile aktif.
- Meninjau hasil OCR sebelum mengonfirmasi field terstruktur.
- Memakai chatbot yang menerima hanya konteks Patient aktif dan data terkonfirmasi.
- Melihat SOS baru secara Realtime, mendengar bunyi jika audio sudah diaktifkan, lalu memilih "Saya tangani".
- Mencari faskes Tangerang dan melihat panduan BPJS yang tidak menjanjikan penerimaan atau ketersediaan.

## 7. Demo Diabetes Tipe 2

Demo diabetes tipe 2 digunakan untuk membuat challenge chronic illness lebih konkret.

Demo story:

1. Patient melakukan check-in sederhana tentang rutinitas atau kondisi harian.
2. Caregiver melihat konteks Patient aktif.
3. Caregiver membuka dokumen sintetis, misalnya hasil kontrol/lab/checkup, lalu mengoreksi dan mengonfirmasi hasil OCR.
4. Caregiver bertanya ke chatbot apa yang perlu disiapkan sebelum kontrol dokter.
5. Patient membuat SOS jika kondisi terasa memburuk.
6. Caregiver menangani SOS dan membuka faskes/BPJS helper.

AI tidak boleh memberi target gula darah personal, menyarankan obat/insulin, mengubah dosis, atau menyimpulkan hasil lab sebagai aman/berbahaya secara final.

## 8. Dokumen Kesehatan dan OCR

Owner atau Family Member dapat mengunggah PDF, JPG, atau PNG dengan batas 5 MB dan maksimum tiga halaman. Berkas asli disimpan di bucket privat Supabase Storage. Metadata selalu terikat pada Patient Profile.

Azure AI Document Intelligence mengekstrak teks dan field kandidat. Hasil disimpan sebagai draft berstatus `PENDING_REVIEW`. Caregiver dapat mengoreksi, mengonfirmasi, atau menolak hasil. Hanya field berstatus `CONFIRMED` yang boleh masuk ringkasan kesehatan atau konteks chatbot.

OCR bukan diagnosis dan tidak boleh menyimpulkan kondisi klinis. Jika provider gagal, dokumen tetap tersimpan dan dapat diberi metadata manual atau memakai fallback sintetis berlabel.

## 9. SOS Web MVP

Alur SOS:

1. Patient menekan SOS dan mengonfirmasi.
2. API membuat event yang terikat ke Patient Profile.
3. Dashboard caregiver yang sedang terbuka menerima perubahan melalui Supabase Realtime.
4. UI menampilkan alert visual. Bunyi diputar hanya jika caregiver sudah mengaktifkan audio melalui interaksi pengguna.
5. Caregiver menekan "Saya tangani".
6. Semua dashboard aktif melihat handler dan status terbaru.

MVP tidak memakai WhatsApp, SMS, web push, service worker, notifikasi sistem operasi, live location, atau integrasi layanan darurat. Jika Realtime gagal, dashboard melakukan refresh/polling ringan dan alert tetap dapat ditemukan dari daftar SOS.

## 10. Faskes dan BPJS

Dataset faskes bersifat statis dan fokus pada Tangerang. Filter boleh meliputi jenis fasilitas, dukungan BPJS yang tercatat, dan layanan darurat yang tercatat. UI wajib menampilkan sumber dan waktu pembaruan dataset jika tersedia.

Produk tidak boleh mengklaim sebuah fasilitas pasti buka, pasti menerima BPJS, paling dekat, atau paling tepat tanpa sumber aktual. Pengguna tetap diarahkan untuk melakukan konfirmasi langsung.

## 11. End-of-Care / Deactivate Profile

End-of-care masuk MVP sebagai lifecycle action Owner-only yang sensitif.

Prinsip:

- UI tidak boleh memakai istilah kasar seperti "mark as dead".
- Gunakan wording seperti "Akhiri perawatan", "Nonaktifkan profil pasien", atau "Pasien meninggal dunia" hanya sebagai alasan sensitif bila perlu.
- Flow tidak melakukan hard delete secara default.
- Profile yang dinonaktifkan menjadi archived/read-only atau disembunyikan dari alur harian sesuai kontrak teknis di `docs/technical/data-model.md` dan `docs/technical/api.md`.
- Action harus diaudit.
- Subscription/payment nyata tidak masuk MVP. Jika ada layar cancel subscription, itu hanya dummy/contextual dan tidak memproses pembayaran.

Flow ini tidak perlu menjadi bagian demo utama kecuali diminta juri saat Q&A.

## 12. Food/Menu Parking Lot

Menu makanan dan pantangan relevan untuk chronic illness, terutama diabetes tipe 2, tetapi tidak masuk MVP implementation packet.

Jika future feature ini dibuat:

- Data harus berasal dari input caregiver, dokter, nutrisionis, atau catatan pasien.
- AI tidak boleh menentukan pantangan personal sebagai keputusan klinis.
- UI harus menyatakan bahwa pengguna perlu konfirmasi dengan tenaga kesehatan.
- Fitur tidak boleh menggeser fokus MVP dari care coordination.

## 13. Batas MVP

Termasuk dalam MVP:

- Satu Care Circle per user.
- Satu Owner dan beberapa Family Member.
- Maksimal dua Patient Profile.
- Kode akses Patient yang terikat satu profile.
- Dashboard caregiver dan beranda Patient.
- Check-in, obat, reminder, dan catatan dasar.
- Upload dokumen privat, OCR, review, dan konfirmasi.
- Chatbot Patient dan Caregiver dengan guardrail.
- SOS web Realtime, alert visual, bunyi opt-in, dan "Saya tangani".
- Faskes/BPJS helper dengan dataset statis Tangerang.
- End-of-care/deactivate Patient Profile sebagai lifecycle action sensitif.

Tidak termasuk:

- Diagnosis, rekomendasi obat, perubahan dosis, interpretasi lab final, atau rekomendasi makanan personal.
- Voice-to-text atau text-to-speech.
- Wearable, sensor, live monitoring, atau live location.
- Food/menu implementation.
- Family chat, payment, subscription nyata, dan multi Care Circle.
- Scraping faskes real-time.
- Push notification, WhatsApp, SMS, atau dispatch darurat.
- Klaim compliance medis atau enterprise.

## 14. Ukuran Keberhasilan Demo

Demo dinilai berhasil bila dapat menunjukkan dengan data sintetis:

- Patient masuk ke profile yang benar dan melakukan check-in atau chatbot.
- Caregiver berpindah Patient Profile tanpa kebocoran data.
- Satu dokumen menghasilkan draft OCR yang dapat dikoreksi dan dikonfirmasi.
- Chatbot memakai konteks Patient aktif tanpa diagnosis, dosis, atau interpretasi lab final.
- SOS muncul di dashboard terbuka, bunyi bekerja setelah audio diaktifkan, dan handler tersimpan.
- Faskes/BPJS helper menghasilkan langkah berikutnya yang jujur.
- Alur selesai dalam dua menit atau memiliki fallback yang sudah direhearsal.

## 15. Ownership dan Perubahan

- Ozan memutuskan scope, acceptance, cut line, dan narasi demo.
- Daniel memutuskan hierarki informasi, accessibility, responsive state, dan copy UX bersama Ozan.
- Bernard meninjau feasibility API, database, auth, storage, dan Realtime.
- Al meninjau OCR, prompt, guardrail, fallback, dan evaluasi AI.

Perubahan yang memengaruhi scope, role, Patient Profile isolation, medical safety, OCR trust, SOS promise, atau demo membutuhkan verdict Ozan dan review pemilik teknis terkait. Kontrak teknis rinci berada di `docs/technical/`.

## 16. Refinement Status

Refinement chronic illness sudah diselaraskan lintas product, technical, execution, pitch, QA, README, dan AGENTS untuk MVP v1 docs.

Dokumen teknis detail sudah diarahkan ke `Patient Profile`, `PatientAccessCode`, `PatientSession`, `patientProfileId`, dan endpoint `patient-profiles`. Jika masih ada legacy `Parent` di luar change log historis, anggap itu drift yang harus diperbaiki sebelum implementasi packet.

## 17. Change Log

- 15 Juli 2026: Mengunci Next.js full-stack, OCR dengan caregiver review, Supabase private storage, dan SOS web Realtime dengan bunyi opt-in.
- 16 Juli 2026: Mengubah positioning dari elderly/Parent care menjadi chronic illness Patient care, mengunci demo condition diabetes tipe 2, menambahkan Patient terminology verdict, end-of-care MVP lifecycle note, dan food/menu parking lot.
- 16 Juli 2026: Step 6/7 consistency pass, mencatat bahwa Patient terminology sudah menjadi implementation truth lintas dokumen.
