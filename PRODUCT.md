# ChroniCare Product Context

Status: Proposed strategic adapter for locked MVP documents  
Repository: ChronicCare  
Product name: ChroniCare  
DRI: Ozan  
UI/UX owner: Daniel  
Technical reviewer: Bernard  
AI/OCR reviewer: Al  
Validated against repository state: 2026-07-16

## Register

product

## Challenge

ChroniCare menjawab challenge:

> How can we improve how people manage and live with chronic illness over the long term?

Pasien chronic illness menjalani rutinitas yang panjang. Check-in, catatan obat, reminder, dokumen kontrol, persiapan kunjungan dokter, dukungan keluarga, dan kebutuhan bantuan dapat tersebar di banyak tempat. Caregiver juga perlu memahami perubahan terbaru tanpa mencampur data antar Patient Profile.

ChroniCare menempatkan kegiatan tersebut dalam satu Care Circle. Produk memberi Patient pengalaman yang sederhana untuk rutinitas sehari-hari dan memberi Caregiver konteks operasional untuk koordinasi keluarga.

Diabetes tipe 2 dipakai sebagai demo condition. ChroniCare tetap produk care coordination untuk chronic illness, bukan aplikasi khusus diabetes atau sistem diagnosis dan treatment.

Sumber utama: `docs/product/product-context.md`, `docs/product/hackathon-mvp-scope-demo.md`, dan `AGENTS.md`.

## Product Summary

ChroniCare adalah authenticated task-oriented web application untuk Patient chronic illness serta caregiver mereka. Produk menghubungkan Patient homepage, check-in, reminder, catatan obat, dokumen kesehatan yang ditinjau manusia, chatbot dengan batas medis, SOS keluarga, dan helper faskes/BPJS.

Nilai utamanya adalah konteks yang benar untuk satu Patient Profile pada satu waktu. Patient mendapat alur mobile-first yang hangat dan ringan. Caregiver mendapat dashboard yang tenang, informatif, dan mudah dipindai. OCR mempercepat pencatatan, tetapi hasil mesin tetap draft sampai caregiver mengonfirmasi. AI membantu navigasi, peringkasan data yang diizinkan, dan persiapan pertanyaan untuk dokter. AI tidak mengambil keputusan klinis.

Kontrak MVP tidak menjanjikan diagnosis, treatment, delivery SOS ketika dashboard tertutup, penerimaan BPJS, ketersediaan fasilitas, akurasi OCR klinis, atau production compliance.

## Product Purpose

ChroniCare ada untuk membantu keluarga menjaga continuity of care jangka panjang tanpa mengubah aplikasi menjadi dokter digital atau sistem rumah sakit.

MVP berhasil bila satu connected flow dapat dibuktikan dengan data sintetis:

- Patient masuk ke Patient Profile yang benar.
- Patient mengirim check-in atau mendapat respons chatbot yang aman.
- Caregiver melihat konteks Patient aktif tanpa kebocoran antar profile.
- Dokumen privat masuk ke review flow dan hasil extraction dikonfirmasi manusia.
- Caregiver chatbot memakai data yang sudah dikonfirmasi.
- SOS terlihat pada dashboard caregiver yang terbuka dan satu caregiver mengambil penanganan.
- Helper faskes/BPJS memberi langkah administratif dengan batas yang jujur.
- Demo selesai dalam dua menit atau memakai fallback yang telah direhearsal dan dilabeli.

## Target Users

### Owner

Owner adalah caregiver utama atau pengelola Care Circle. Dalam demo, Owner diposisikan sebagai caregiver aktif.

Owner dapat menjalankan daily care, mengunggah dan meninjau dokumen, memakai Caregiver chatbot, menangani SOS, serta membuka helper faskes/BPJS. Owner juga memegang tindakan administratif sensitif:

- Mengelola Family Member.
- Membuat atau meregenerasi Patient access code.
- Menambah Patient Profile kedua.
- Menjalankan end-of-care atau deactivation Patient Profile.

Owner dapat berupa anggota keluarga, pendamping utama, atau Patient yang mengelola Care Circle sendiri. MVP demo memakai pola caregiver utama.

### Family Member

Family Member adalah caregiver aktif di Care Circle yang sama. Role ini dapat membaca dan memperbarui daily care, mengelola catatan obat dan reminder sesuai izin, mengunggah dan meninjau dokumen, memakai Caregiver chatbot, serta menangani SOS.

Family Member tidak dapat mengubah Owner, menjalankan membership action sensitif, mengelola Patient access code, menambah Patient Profile kedua, atau menonaktifkan Patient Profile.

### Patient

Patient adalah orang dengan chronic illness yang menerima dukungan melalui satu Patient Profile. Patient masuk dengan Patient access code. Login yang valid membuat Patient session yang terikat tepat ke satu `patientProfileId`.

Patient tidak memilih profile setelah login. Patient hanya dapat mengakses homepage, check-in, reminder, medication text atau medication log yang diizinkan, Patient chatbot, dan SOS untuk profile miliknya.

Patient membutuhkan pengalaman yang hangat, sederhana, cheerful tanpa menjadi childish, serta mudah digunakan ketika lelah atau khawatir. SOS tetap serius, eksplisit, dan tidak playful.

Sumber utama: `docs/product/product-context.md`, `docs/product/user-journeys.md`, `docs/security-privacy.md`, dan `docs/technical/api.md`.

## User Problems

Masalah yang menjadi dasar MVP:

- Rutinitas chronic illness berlangsung lama dan mudah terputus.
- Informasi tersebar di percakapan, foto, berkas, dan ingatan caregiver.
- Caregiver tidak selalu mengetahui kondisi terbaru atau siapa yang sedang menangani kebutuhan Patient.
- Data dua Patient Profile dapat tercampur jika aplikasi hanya mengandalkan state antarmuka.
- Patient membutuhkan UI yang lebih ringan daripada dashboard caregiver.
- Caregiver membutuhkan konteks terbaru, provenance, recency, dan next action yang cepat dipahami.
- Dokumen kesehatan perlu dicatat ulang, tetapi hasil mesin tidak boleh langsung dipercaya.
- Navigasi faskes dan BPJS terasa rumit saat keluarga sedang terburu-buru.
- Saat kondisi memburuk, keluarga membutuhkan alert yang terlihat serta status siapa yang menangani.

Klaim ini berasal dari product documents repository. Draft ini tidak menambahkan external research claim.

## Jobs to Be Done

### Patient Jobs

- Masuk ke Patient Profile milik sendiri tanpa mengelola akun caregiver.
- Melihat rutinitas terdekat.
- Memberi kabar melalui check-in singkat.
- Membaca reminder dan medication text yang telah dicatat.
- Meminta bantuan umum dalam bahasa sederhana.
- Meminta bantuan keluarga melalui SOS bila kondisi terasa memburuk.
- Mengetahui bahwa permintaan bantuan sudah tercatat di ChroniCare tanpa menerima janji delivery eksternal.

### Caregiver Jobs

- Melihat Patient aktif dan perubahan terbaru.
- Berpindah antara maksimal dua Patient Profile tanpa stale data.
- Mencatat medication text, reminder, check-in, dan health note dasar.
- Menyimpan dokumen kesehatan secara privat.
- Membandingkan dokumen dengan draft extraction.
- Mengedit, mengonfirmasi, atau menolak extraction.
- Menyiapkan pertanyaan untuk dokter memakai konteks yang sudah dikonfirmasi.
- Melihat dan menangani SOS keluarga.
- Mencari informasi awal faskes/BPJS Tangerang dan mengonfirmasinya langsung.

### Owner Jobs

- Mengelola membership Care Circle.
- Membuat atau meregenerasi Patient access code.
- Menambah Patient Profile kedua tanpa melewati batas dua profile.
- Menjalankan deactivation Patient Profile dengan konfirmasi, alasan yang sensitif, revocation Patient access, dan audit.
- Menjaga tindakan admin tetap terpisah dari daily-care action Family Member.

## Product Promise

ChroniCare membantu Patient dan keluarga menjaga rutinitas, memahami konteks yang sudah dicatat, meninjau dokumen, dan menentukan langkah koordinasi berikutnya.

Promise ini hangat, tetapi terbatas. ChroniCare tidak menentukan diagnosis, treatment, dosis, target diabetes, interpretasi lab final, atau diet personal. ChroniCare juga tidak menjamin caregiver menerima SOS ketika dashboard tertutup dan tidak menggantikan dokter, IGD, ambulans, BPJS, atau layanan darurat resmi.

## Core Product Model

Satu Care Circle adalah batas keanggotaan caregiver untuk MVP.

Satu Care Circle memiliki:

- Tepat satu Owner aktif.
- Family Member aktif sesuai membership.
- Maksimal dua Patient Profile.
- Daily-care, document, chat, dan SOS data yang selalu terikat ke Patient Profile.
- Audit event untuk tindakan sensitif.

Caregiver memakai Supabase Auth. Server mencari membership dan role dari session, bukan dari input client.

Patient memakai Patient access code yang disimpan sebagai hash. Login yang valid membuat opaque Patient session dengan cookie `HttpOnly`. Database hanya menyimpan token hash. Session tersebut terikat ke satu Patient Profile dan tidak memberi caregiver access.

`patientProfileId` adalah parameter eksplisit pada seluruh operasi patient-bound. Care Circle membership, Patient Profile relation, role, dan status profile diperiksa server sebelum query data berjalan.

## Main Experience

### Patient Experience

Patient masuk menggunakan Patient access code. Server membuat Patient session yang terikat ke satu profile.

Homepage menampilkan:

- Identitas Patient.
- Greeting sederhana.
- Check-in hari ini.
- Reminder terdekat.
- Akses ke Patient chatbot.
- SOS.

Check-in memakai pilihan kondisi sederhana dan catatan opsional. Produk tidak menyimpulkan diagnosis, kontrol penyakit, target gula darah, atau tindakan terapi dari input tersebut.

Reminder dan medication text ditampilkan sebagai catatan yang dimasukkan caregiver atau berasal dari arahan yang mereka rekam. ChroniCare tidak membuat resep.

Patient chatbot memakai jawaban pendek dan bahasa Indonesia sehari-hari. Untuk kemungkinan emergency, percakapan dipersingkat dan Patient diarahkan ke keluarga, SOS, IGD, atau tenaga medis.

### Caregiver Experience

Owner dan Family Member masuk lewat caregiver auth.

Caregiver selalu melihat active Patient context. Profile switch memuat ulang dashboard, dokumen, chat, dan SOS untuk `patientProfileId` baru. Data profile sebelumnya tidak boleh tetap terlihat selama loading.

Dashboard merangkum:

- Latest check-in.
- Medication text dan log dasar.
- Upcoming reminder.
- Recent document.
- Active SOS.
- Next action menuju dokumen, chatbot, faskes/BPJS, dan Care Circle.

Caregiver dapat mencatat daily care, meninjau OCR, memakai chatbot persiapan dokter, menangani SOS, dan membuka helper faskes/BPJS. Family Member tidak mendapat Owner-only action.

### OCR Review Experience

Owner atau Family Member memilih Patient aktif lalu mengunggah satu PDF, JPEG, atau PNG sintetis. File asli berada di private Supabase Storage.

Azure AI Document Intelligence menghasilkan OCR text dan layout. Azure OpenAI memetakan OCR text minimum ke `document-extraction.v1`. Zod memvalidasi provider output.

Hasil mesin adalah draft:

- Extraction mulai sebagai `PENDING_REVIEW`.
- Caregiver membandingkan dokumen asli dengan field extraction.
- Caregiver dapat mengedit draft.
- Caregiver dapat mengonfirmasi atau menolak.
- `CONFIRMED` adalah satu-satunya status yang boleh masuk chatbot context.
- `PENDING_REVIEW`, `REJECTED`, dan `FAILED` tidak boleh dianggap sebagai fakta.

OCR tidak memperbarui medication, reminder, check-in, diagnosis, atau health note secara otomatis.

### SOS Experience

Patient menekan SOS dan melihat confirmation sebelum event dibuat.

Setelah berhasil:

- Event tersimpan untuk Patient Profile dari session.
- Patient melihat bahwa permintaan bantuan telah dicatat dan dikirim melalui ChroniCare.
- Dashboard caregiver yang terbuka dan berhak menerima insert atau update melalui Supabase Realtime.
- Alert visual tetap terlihat sampai status berubah.
- Audio hanya diputar setelah caregiver memilih `Aktifkan suara` dan browser mengizinkannya.
- Caregiver memilih `Saya tangani`.
- Update bersifat atomic. Handler pertama menang.
- Caregiver kedua menerima conflict dan melihat handler terbaru.
- Reconnect atau focus memicu REST refetch terhadap active SOS.

Tab tertutup atau dashboard tanpa koneksi tidak mendapat delivery guarantee. ChroniCare tidak menghubungi ambulans, IGD, WhatsApp, SMS, Push API, atau notifikasi sistem operasi.

## Main Demo Flow

1. Patient masuk dengan Patient access code dan membuka homepage Maya.
2. Patient mengirim check-in atau memakai Patient chatbot untuk rutinitas atau keluhan umum terkait demo diabetes tipe 2.
3. Caregiver membuka dashboard Maya sebagai Patient aktif.
4. Caregiver berpindah singkat ke Raka lalu kembali ke Maya untuk memperlihatkan profile isolation.
5. Caregiver membuka atau mengunggah dokumen sintetis.
6. Caregiver melihat `PENDING_REVIEW`, memperbaiki satu field, lalu mengonfirmasi extraction.
7. Caregiver chatbot memakai daily-care dan confirmed OCR context Maya untuk menyusun pertanyaan kunjungan dokter.
8. Patient membuat SOS setelah confirmation.
9. Dashboard caregiver yang terbuka menampilkan visual alert dan audio bila sudah diaktifkan. Caregiver memilih `Saya tangani`.
10. Caregiver membuka helper faskes/BPJS Tangerang dan melihat source, review date, serta instruksi konfirmasi langsung.

Jika waktu melebihi dua menit, Patient chatbot dipotong lebih dahulu. Bukti profile isolation, OCR review gate, dan SOS handling tetap dipertahankan.

## Scope

### P0 Demo-Critical

P0 mempunyai execution path melalui Packet 01 sampai 13, tetapi belum diimplementasikan:

- Responsive app shell untuk Patient dan Caregiver.
- Typed environment dan server-only provider boundaries.
- Prisma schema, audit foundation, serta synthetic seed Dimas, Rina, Maya, dan Raka.
- Caregiver authentication dan membership authorization.
- Patient access code, Patient session, dan Patient Profile isolation.
- Caregiver profile switching dengan maksimal dua Patient Profile.
- Patient homepage dan daily check-in.
- Caregiver dashboard dan daily-care summary.
- Medication text, medication log basics, dan reminder basics.
- Private document upload.
- OCR, structured extraction, caregiver review, edit, confirm, dan reject.
- Patient chatbot dan Caregiver chatbot dengan safety gateway.
- Confirmed-only OCR context.
- SOS Realtime pada dashboard terbuka, persistent visual alert, audio opt-in, reconnect recovery, dan atomic handling.
- Static Tangerang faskes/BPJS helper.
- Synthetic data, provider fallback, audit event, responsive checks, accessibility checks, deploy/local fallback, dan rehearsal evidence.

### MVP Lifecycle

Owner-only end-of-care atau deactivation Patient Profile masuk MVP, tetapi bukan alur utama demo.

Flow wajib:

- Memakai wording manusiawi seperti `Akhiri perawatan` atau `Nonaktifkan profil pasien`.
- Meminta confirmation.
- Menyimpan reason category.
- Tidak melakukan hard delete.
- Mengeluarkan profile dari active daily-care flows.
- Mencabut active Patient access code dan Patient session.
- Menyimpan audit event.
- Mempertahankan history untuk caregiver yang masih berhak.

Flow ini bukan cancellation payment atau subscription.

### P1 Support

P1 dikerjakan hanya setelah P0 stabil:

- Invite dan remove Family Member dengan state lengkap.
- Regenerasi Patient access code dan revocation Patient session.
- Medication log `sudah diminum`.
- Search dan filter dokumen.
- Search dan filter faskes tambahan.
- SOS history dan audit activity sederhana.
- Chat history terbatas untuk session yang sama.
- Loading, empty, error, reconnect, dan retry state yang lebih lengkap.
- Facility dataset provenance yang lebih rinci.

### Parking Lot

- Food, menu, dan pantangan guidance.
- Onboarding chronic condition yang lebih personal.
- Edit caregiver profile.
- In-app notification preferences.
- Non-clinical insight card berbasis seed.
- Settings non-kritis.

Food atau pantangan hanya dapat dipertimbangkan setelah human verdict baru. Jika kelak dibuat, sumbernya harus berupa catatan Patient, caregiver, dokter, nutrisionis, atau sumber resmi. AI tetap tidak boleh membuat diet prescription personal.

### Out of Scope

- Diagnosis, prognosis, clinical risk score, dan clinical decision support.
- Drug recommendation, dose calculation, perubahan dosis, atau instruksi menghentikan obat.
- Target gula darah personal, insulin adjustment, atau oral medication adjustment.
- Interpretasi lab final sebagai normal, aman, berbahaya, atau dasar treatment.
- Personal nutrition prescription, menu, atau pantangan otomatis.
- OCR tanpa human review.
- Medical image analysis.
- Automatic daily-care update dari OCR.
- Batch OCR, file di atas 5 MB, dokumen di atas tiga halaman, dan background OCR queue.
- Voice-to-text, text-to-speech, wearable, sensor, dan live monitoring.
- Live location.
- WhatsApp, SMS, email alert, Push API, service worker, dan OS notification.
- Ambulance call, IGD dispatch, dan official emergency integration.
- Live facility scraping, booking, route navigation, doctor schedule, hospital integration, dan BPJS integration.
- Family chat.
- Real payment atau subscription.
- Multi-Care Circle.
- Patient Profile ketiga.
- Fine-grained custom permission di luar Owner, Family Member, dan Patient.
- Formal retention, consent, legal hold, right-to-erasure, atau production incident workflow.
- HIPAA, clinical validation, medical device, legal approval, atau production-readiness claim.

## Role and Access Principles

Owner:

- Dapat menjalankan daily care dan seluruh caregiver action.
- Dapat mengelola membership, Patient access code, Patient Profile kedua, dan deactivation.
- Owner-only action tetap diperiksa server.

Family Member:

- Dapat membaca dan memperbarui caregiving data dalam Care Circle sendiri.
- Dapat upload dan review dokumen, memakai chatbot, serta menangani SOS.
- Tidak dapat menjalankan Owner-only action.

Patient:

- Hanya mengakses Patient Profile yang terikat pada Patient session.
- Tidak memilih profile secara bebas.
- Tidak dapat membuka caregiver dashboard, document admin, membership, settings, atau profile lain.

Aturan lintas role:

- Active Patient UI state bukan authorization.
- Server memvalidasi caregiver membership dan Patient Profile relation.
- Setiap patient-bound operation memakai `patientProfileId`.
- Client-supplied role dan `careCircleId` tidak dipercaya.
- Browser code tidak memutasi application tables secara langsung.
- Data Care Circle dan Patient Profile tidak boleh silang.
- Cache dan query key harus memuat actor serta `patientProfileId`.
- Profile switch harus membersihkan stale data.
- Deactivated profile tidak dapat digunakan untuk check-in, document upload, chat, atau SOS.

## Medical and Safety Boundaries

Allowed support:

- Feature explanation.
- General chronic illness routine support.
- Administrative BPJS/faskes guidance.
- Doctor-visit preparation.
- Summary dari authorized daily-care data.
- Summary dari confirmed OCR data.
- Short emergency escalation.
- Pengulangan medication text sesuai catatan caregiver tanpa interpretasi.

Forbidden behavior:

- Menentukan diagnosis atau kepastian kondisi.
- Menyarankan obat baru.
- Mengubah atau menghentikan dosis.
- Menentukan target diabetes personal.
- Menginterpretasikan lab sebagai clinical truth.
- Menentukan diet atau pantangan personal.
- Menenangkan pengguna secara berlebihan saat ada red flag.
- Menahan pengguna dalam percakapan panjang saat kemungkinan emergency.
- Menggantikan dokter, IGD, ambulans, BPJS, atau layanan darurat.

## AI Principles

Patient persona:

- Bahasa Indonesia sederhana.
- Jawaban pendek.
- Sabar dan suportif.
- Satu pertanyaan lanjutan pada satu waktu.
- Emergency diarahkan cepat ke bantuan manusia.

Caregiver persona:

- Lebih informatif dan terstruktur.
- Membantu merangkum catatan.
- Membantu menyiapkan pertanyaan dokter dan dokumen kontrol.
- Menjelaskan langkah administratif tanpa keputusan klinis.

Allowed context hanya minimum data dari satu authorized Patient Profile:

- Display name.
- Broad location.
- Latest check-in.
- Active medication text.
- Upcoming reminder.
- Relevant health note.
- Confirmed OCR summary.
- Relevant facility result.

Context tidak boleh memuat raw document, raw OCR text, pending/rejected/failed extraction, full BPJS number, full address, phone number yang tidak diperlukan, Patient access code, Patient session, full chat history, profile lain, atau hidden system prompt.

Safety pre-routing harus menangani diagnosis, medication/dose, diabetes target, lab interpretation, diet/pantangan, hidden-context request, dan emergency sebelum model bebas berimprovisasi.

Emergency response harus singkat dan mengarahkan ke keluarga, SOS, IGD, tenaga medis, atau layanan darurat resmi.

Jika Azure OpenAI gagal, timeout, rate-limited, atau menghasilkan output tidak valid, UI menampilkan fallback yang aman dan berlabel. Fallback tidak boleh disamarkan sebagai jawaban live.

Prompt body, AI response yang berisi private context, raw OCR, hidden context, provider secret, dan system prompt tidak boleh masuk log.

## OCR Principles

- Input hanya PDF, JPEG, atau PNG.
- Ukuran maksimum 5 MB.
- Maksimum tiga halaman.
- Satu file per extraction.
- Original file disimpan di private Supabase Storage.
- Azure AI Document Intelligence menangani OCR dan layout.
- Azure OpenAI memetakan OCR text minimum ke `document-extraction.v1`.
- Zod memvalidasi provider output.
- Extraction baru berstatus `PENDING_REVIEW`.
- Caregiver dapat mengedit, mengonfirmasi, atau menolak.
- Confirmation mengubah extraction dan document state secara atomic.
- Hanya `CONFIRMED` extraction yang dapat masuk summary dan chatbot context.
- OCR mempertahankan source wording melalui field `AsWritten`.
- Field tidak terbaca memakai `null` atau array kosong.
- Nomor BPJS dimasking kecuali empat karakter terakhir.
- OCR tidak menambah diagnosis, lab meaning, dose calculation, atau clinical warning yang tidak tertulis.
- OCR tidak memperbarui daily-care entity secara otomatis.
- Provider failure mempertahankan private file dan menyediakan retry atau metadata manual.
- Fixture mode harus tampil sebagai `DEMO_FALLBACK`.
- UI tidak boleh menyebut fallback sebagai live OCR.

## SOS Principles

- SOS adalah caregiver dan family coordination alert.
- Data yang disimpan hanya kebutuhan koordinasi minimum.
- Lokasi hanya broad location, bukan live atau precise location.
- Patient melihat confirmation sebelum event dibuat.
- Dashboard caregiver yang terbuka menerima Realtime insert/update bila authorized.
- Persistent visual alert adalah sumber utama.
- Audio hanya enhancement setelah caregiver opt-in.
- `Saya tangani` memakai conditional atomic update.
- Handler pertama menang.
- Handler kedua mendapat conflict dan current handler summary.
- REST refetch pada reconnect atau focus memulihkan active event.
- Wrong Care Circle tidak boleh menerima event.
- Tab tertutup atau disconnected tidak memiliki delivery guarantee.
- ChroniCare tidak melakukan WhatsApp, SMS, push, ambulance, IGD, atau official emergency dispatch.

## Faskes and BPJS Principles

Helper memakai versioned static Tangerang dataset.

Filter yang diperbolehkan:

- Area.
- Facility type.
- Recorded BPJS support.
- Recorded emergency unit.
- Service.
- Specialty.

Setiap record atau result harus menampilkan source label serta review date bila tersedia. Dataset atau seed belum ada pada repository pre-scaffold, jadi `PRODUCT.md` tidak mengarang nama sumber atau tanggal review.

UI dan AI hanya memberi administrative guidance. Pengguna harus menghubungi fasilitas atau BPJS untuk konfirmasi.

Produk tidak boleh:

- Memberi ranking `terbaik`.
- Menyatakan fasilitas paling tepat secara klinis.
- Mengklaim real-time availability.
- Menjamin fasilitas buka.
- Menjamin layanan tersedia.
- Menjamin penerimaan atau coverage BPJS.
- Menyimpulkan ketiadaan fasilitas dari empty search result.

## Privacy and Trust Principles

- Seluruh demo memakai data sintetis.
- Context dan layar menampilkan minimum necessary data.
- Health documents private by default.
- Public document URL dilarang.
- Signed URL harus singkat dan diberikan setelah authorization.
- BPJS number dimasking.
- Raw document, raw OCR, prompt, hidden context, full address, phone, token, code, session, dan provider secret tidak masuk log.
- Provider SDK debug logging tetap mati.
- Patient Profile dan Care Circle isolation adalah P0 blocker.
- Fallback selalu dilabeli secara jujur.
- Deactivation bersifat non-destructive dan diaudit.
- Data real Patient, keluarga, dokumen, medication, nomor identitas, atau kredensial tidak boleh masuk Git, fixtures, screenshot, video, terminal, atau demo.
- ChroniCare tidak mengklaim HIPAA, legal compliance, clinical validation, atau production security.

## Brand Personality

ChroniCare terasa:

- Warm.
- Supportive.
- Dependable.
- Mature.
- Calm.
- Clear.

Satu identitas produk diekspresikan lewat empat mode:

Patient Mode memakai ruang lega, bahasa sederhana, target besar, dan suasana cheerful yang tetap menghormati kondisi serius.

Caregiver Mode lebih informatif, scannable, dan operational. Active Patient context, recency, provenance, serta next action lebih penting daripada dekorasi.

OCR Review terasa precise dan evidence-oriented. Dokumen asli tetap utama. Draft machine output terlihat sebagai draft, bukan hasil final.

SOS terasa urgent, explicit, persistent, dan non-playful. SOS memakai bahasa khusus, visual alert yang kuat, serta satu dominant action.

## Anti-References

Childish wellness application tidak cocok karena Patient tetap orang dewasa yang menghadapi kondisi serius. Cheerful tidak berarti karakter kartun, maskot, stiker, atau copy kekanak-kanakan.

Hospital dashboard tidak cocok karena ChroniCare bukan hospital information system. Patient tidak membutuhkan tabel klinis padat, sementara caregiver hanya membutuhkan konteks keluarga yang dapat dipindai.

Gamified health tracker tidak cocok karena streak, reward, atau celebration dapat mengubah rutinitas perawatan menjadi permainan dan membuat missed routine terasa menghukum.

AI health command center tidak cocok karena AI bukan pusat otoritas produk. Human review, authorization, dan recorded data lebih tinggi daripada machine output.

Clinical decision-support interface tidak cocok karena ChroniCare tidak memberi diagnosis, triage klinis, treatment recommendation, dose calculation, atau lab interpretation.

Colorful category dashboard tidak cocok karena banyak warna dan equal cards mengaburkan hierarchy, active Patient context, trust state, dan urgent action.

Emergency dispatch application tidak cocok karena SOS hanya mengoordinasikan keluarga pada dashboard web yang terbuka.

Diabetes treatment application tidak cocok karena diabetes tipe 2 hanya demo condition. Produk tetap mendukung konteks chronic illness secara umum.

Generic AI-generated healthcare dashboard tidak cocok karena tampilan seperti kumpulan KPI, gradient, equal cards, AI sparkles, dan health analytics palsu akan memberi kesan capability yang tidak ada.

## Design Principles

1. Patient Profile adalah batas kepercayaan.
2. Satu connected flow mengalahkan feature breadth.
3. Patient simplicity dan caregiver clarity.
4. Human review sebelum machine output dipercaya.
5. Safety dan limitation selalu terlihat.
6. Recovery path adalah bagian dari experience.
7. Synthetic demo truth tanpa overclaim.
8. Familiar product affordances mengalahkan dekorasi.
9. Active Patient context harus selalu jelas.
10. Urgency menggunakan bahasa khusus yang tidak playful.

## Accessibility and Inclusion

- Target WCAG AA.
- Patient touch target minimum 48px.
- Caregiver target minimum 44px bila praktis.
- Patient body text minimum 18px.
- Seluruh critical flow dapat digunakan dengan keyboard.
- Focus order harus logis.
- Visible focus wajib.
- Form control mempunyai label dan error association.
- Status tidak boleh disampaikan lewat warna saja.
- Audio SOS selalu mempunyai visual equivalent.
- `prefers-reduced-motion` dihormati.
- Bahasa Indonesia harus terbaca, ringkas, dan tidak memakai jargon yang tidak perlu.
- Critical mobile action tidak boleh memerlukan horizontal scroll.
- Critical information tidak boleh tersedia hanya saat hover.
- Sensitive action, SOS, dan deactivation membutuhkan confirmation yang jelas.
- Patient UI tidak mengandalkan icon-only primary action.
- Loading, empty, error, forbidden, reconnect, fallback, dan conflict harus dapat dibedakan.

## Demo Context

Diabetes tipe 2 hanya demo condition.

Synthetic identities:

- Dimas Pratama: Owner.
- Rina Pratama: Family Member.
- Maya Pratama: main demo Patient dengan skenario diabetes tipe 2 sintetis.
- Raka Pratama: second Patient untuk isolation checks.

Batas waktu:

- Implementation window: 30 jam.
- Product demo: 2 menit.
- Total presentation: 5 menit.
- P0 scope freeze: sekitar hour 6.
- Feature freeze: sekitar hour 22.
- Setelah hour 24 hanya blocker, safety, privacy, dan demo-critical fix.
- Demo freeze: sekitar hour 27.

Fallback yang harus dipersiapkan:

- Azure OpenAI safe deterministic fallback.
- OCR failed state dan labeled synthetic extraction.
- Realtime reconnect dan REST refetch.
- Audio visual-only fallback.
- Local build serta sanitized recording atau screenshot bila deployment gagal.

Repository masih pre-scaffold pada 2026-07-16. Belum ada `/web`, command, provider evidence, database, test result, deployment, rehearsal, atau implementation evidence.

## Success Criteria

Success harus dibuktikan dengan implementation dan QA evidence:

- Caregiver auth dan Patient access memakai jalur terpisah.
- Owner dan Family Member permission diuji.
- Patient session terikat tepat ke satu Patient Profile.
- Wrong-profile dan wrong-Care-Circle access ditolak.
- Patient check-in tersimpan sekali dan terlihat pada dashboard profile yang benar.
- Caregiver dashboard mengikuti active Patient tanpa stale data.
- Dokumen valid tersimpan privat.
- OCR menghasilkan review state atau labeled fallback.
- Caregiver dapat edit, reject, dan confirm.
- Pending, rejected, failed, dan wrong-profile extraction tidak masuk chatbot context.
- Caregiver chatbot memakai confirmed context.
- Diagnosis, dose, diabetes target, lab, diet, emergency, hidden-context, provider-failure, dan profile-switch cases diuji.
- SOS visual alert tetap bekerja tanpa audio.
- Audio bekerja setelah opt-in pada browser demo atau fallback visual dijelaskan.
- Atomic handling menghasilkan satu handler.
- Reconnect dan wrong-Care-Circle behavior diuji.
- Faskes/BPJS result menunjukkan source/review information dan limitation copy.
- Patient surface diuji pada 390x844.
- Caregiver surface diuji pada 1440x900.
- Keyboard, focus, labels, contrast, target size, reduced motion, dan no-color-only status diperiksa.
- Seluruh data dan dokumen demo sintetis.
- Demo selesai maksimal dua menit tiga kali berturut-turut atau memakai cut path dan fallback yang telah direhearsal.

## Known MVP Limitations

- Repository masih pre-scaffold.
- Provider availability bergantung pada Supabase, Azure, Vercel, credential, quota, dan network.
- Browser autoplay dapat memblokir audio sebelum caregiver berinteraksi.
- Realtime hanya menjangkau dashboard caregiver yang terbuka dan terhubung.
- Facility data bersifat statis.
- OCR hanya menerima satu PDF, JPEG, atau PNG hingga 5 MB dan tiga halaman.
- Tidak ada batch OCR atau background OCR queue.
- Tidak ada background SOS delivery, Push API, service worker, atau OS notification.
- OCR tetap memerlukan human confirmation.
- AI dan OCR belum memiliki clinical validation.
- Tidak ada formal retention, consent, deletion, legal, atau incident-response workflow.
- Tidak ada production compliance claim.
- Tidak ada production-readiness claim.
- Tidak ada implementation evidence sebelum Packet 01 sampai 13 dijalankan dan QA mencatat hasil.

## Execution Context

`PRODUCT.md` tidak menentukan file atau implementation detail. Urutan strategis MVP mengikuti 13 packet:

1. Scaffold dan tooling baseline.
2. Environment serta provider boundary.
3. Schema, Prisma, audit, dan synthetic seed.
4. Caregiver auth serta membership authorization.
5. Patient access code dan Patient Profile isolation.
6. Patient Profile lifecycle deactivation.
7. Patient homepage dan check-in.
8. Caregiver dashboard serta daily care.
9. Document upload, OCR, dan review.
10. Faskes/BPJS helper.
11. Chatbot safety gateway dan personas.
12. SOS Realtime dan handling.
13. QA, deploy atau local fallback, serta rehearsal.

Packet 01 sampai 05 membangun foundation. Packet 06 menambahkan lifecycle. Packet 07 dan 08 membuat daily-care core. Packet 09, 11, dan 12 bergantung pada profile isolation serta Patient/Caregiver surfaces. Packet 10 dapat dimulai setelah Packet 05 dan dapat berjalan paralel selama tidak menyentuh OCR areas. Packet 13 mengumpulkan evidence sejak awal dan menjadi final gate.

Semua packet tetap `Draft` sampai Ozan menerima dependency dan evidence yang diperlukan.

## Ownership and Review

- Ozan memegang product scope, priority, acceptance, packet status, QA evidence, cut line, demo freeze, pitch readiness, dan copy overclaim.
- Daniel memegang information architecture, user flow, component behavior, responsive layout, accessibility, UX copy, serta Patient/Caregiver state interpretation.
- Bernard memegang API, database, Supabase Auth, Patient session, private Storage, Realtime, deployment path, role enforcement, dan Patient Profile isolation.
- Al memegang Azure OpenAI, Azure AI Document Intelligence, structured extraction, prompt, AI safety, emergency behavior, context boundary, serta provider fallback.

Perubahan lintas domain perlu review dari DRI terkait. Ozan menutup packet hanya setelah evidence tersedia.

## Canonical References

Guardrail dan orientasi:

- `AGENTS.md`
- `README.md`
- `docs/team/ownership.md`

Product:

- `docs/product/product-context.md`
- `docs/product/feature-scope.md`
- `docs/product/user-journeys.md`
- `docs/product/hackathon-mvp-scope-demo.md`

Technical dan security:

- `docs/technical/architecture.md`
- `docs/technical/data-model.md`
- `docs/technical/api.md`
- `docs/technical/ai-guardrails.md`
- `docs/technical/env-and-deploy.md`
- `docs/technical/dev-installations.md`
- `docs/security-privacy.md`

Execution:

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

Demo, pitch, dan QA:

- `docs/pitch/demo-script.md`
- `docs/pitch/pitch-structure.md`
- `docs/pitch/judging-rubric-mapping.md`
- `docs/qa/demo-readiness-checklist.md`

Visual:

- `DESIGN.md`

`DESIGN.md` adalah visual source. Product, safety, role, privacy, data, API, provider, execution, dan demo contracts selalu mengalahkan keputusan visual jika terjadi konflik.

## Authority and Change Control

`PRODUCT.md` adalah strategic adapter untuk UI/UX designer dan design skill. File ini merangkum product truth, tetapi tidak menggantikan dokumen kanonis.

Urutan authority:

1. Instruksi manusia terbaru.
2. Current files on disk.
3. `AGENTS.md`.
4. Locked product dan technical documents.
5. Security, execution, QA, demo, pitch, dan ownership documents.
6. Visual references.

Perubahan scope, priority, role, provider, medical safety, privacy, data model, API, execution structure, atau demo promise memerlukan human verdict dan review DRI terkait.

Jika `PRODUCT.md` berbeda dari current locked document, dokumen kanonis menang sampai perubahan disetujui serta dicatat.

Nama repository `ChronicCare` tidak mengubah nama produk `ChroniCare`.