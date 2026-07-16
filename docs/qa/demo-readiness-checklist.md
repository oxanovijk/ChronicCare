# Demo Readiness Checklist

Produk: ChroniCare
Status: Not Run
QA/PM owner: Ozan
Technical evidence: Bernard
UI/UX evidence: Daniel
AI/OCR evidence: Al

## 1. Aturan Status

Status yang diperbolehkan: `Not Run`, `Pass`, `Needs Fix`, `Blocked`, dan `Not Applicable`.

- Semua check dimulai dari `Not Run`.
- `Pass` membutuhkan tanggal, pelaksana, environment, dan bukti singkat.
- Link screenshot/log harus sudah disunting dari data sensitif dan secret.
- Satu check P0 `Blocked` membuat verdict akhir `Blocked`.
- `Not Applicable` membutuhkan alasan.

Format evidence yang disarankan:

```text
2026-07-16 | Ozan | local Chrome 138 | PASS | screenshot/log/path
```

## 2. Environment dan Build

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| ENV-01 | Node/npm sesuai versi yang dikunci | Bernard | Belum diisi | Not Run |
| ENV-02 | `.env.local` tersedia lokal dan tidak terlacak Git | Bernard | Belum diisi | Not Run |
| ENV-03 | Supabase schema, RLS, bucket privat, dan seed diterapkan | Bernard | Belum diisi | Not Run |
| ENV-04 | Azure OpenAI dan Document Intelligence dapat dipanggil atau fallback dilabeli | Al | Belum diisi | Not Run |
| ENV-05 | `npm run lint` berhasil | Bernard | Belum diisi | Not Run |
| ENV-06 | `npm run typecheck` berhasil | Bernard | Belum diisi | Not Run |
| ENV-07 | `npm test` berhasil | Ozan | Belum diisi | Not Run |
| ENV-08 | `npm run test:e2e` untuk P0 berhasil | Ozan | Belum diisi | Not Run |
| ENV-09 | `npm run build` berhasil | Bernard | Belum diisi | Not Run |
| ENV-10 | URL deploy dan smoke test tersedia jika deploy diklaim | Bernard | Belum diisi | Not Run |

## 3. Auth, Role, dan Profile Isolation

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| AUTH-01 | Owner dapat masuk dan melihat Care Circle miliknya | Ozan | Belum diisi | Not Run |
| AUTH-02 | Family Member dapat daily care tetapi tidak dapat aksi Owner-only | Ozan | Belum diisi | Not Run |
| AUTH-03 | Patient code valid membuat session untuk tepat satu profile | Bernard | Belum diisi | Not Run |
| AUTH-04 | Patient code salah/expired ditolak tanpa membocorkan identitas | Bernard | Belum diisi | Not Run |
| AUTH-05 | Patient tidak dapat membuka caregiver dashboard | Ozan | Belum diisi | Not Run |
| AUTH-06 | Caregiver non-member ditolak API dan RLS | Bernard | Belum diisi | Not Run |
| AUTH-07 | Request Maya tidak pernah mengembalikan data Raka dan sebaliknya | Bernard | Belum diisi | Not Run |
| AUTH-08 | Rapid profile switching tidak menampilkan respons profile lama | Daniel | Belum diisi | Not Run |
| AUTH-09 | Deactivate Patient Profile hanya dapat dilakukan Owner dan revokes Patient code/session | Bernard | Belum diisi | Not Run |
| AUTH-10 | Deactivated Patient Profile tidak muncul di active flows tetapi history tetap aman untuk caregiver berhak | Ozan | Belum diisi | Not Run |
| AUTH-11 | Owner dapat membuat Patient Profile hanya dengan nama tampilan dan label hubungan | Bernard | Belum diisi | Not Run |
| AUTH-12 | Optional data yang dilewati tetap `UNKNOWN`, bukan otomatis `NONE_REPORTED` | Ozan | Belum diisi | Not Run |
| AUTH-13 | Kombinasi fact status/value yang kontradiktif ditolak API/database | Bernard | Belum diisi | Not Run |
| AUTH-14 | Setup checklist berasal dari state tersimpan dan tidak memakai completion percentage persisten | Bernard | Belum diisi | Not Run |
| AUTH-15 | Unknown optional data tidak memblokir Patient code, check-in, dokumen, chatbot, atau SOS | Ozan | Belum diisi | Not Run |

## 4. Patient dan Daily Care

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| CARE-01 | Patient homepage menampilkan patient yang benar | Daniel | Belum diisi | Not Run |
| CARE-02 | Check-in tersimpan sekali dan terlihat caregiver | Ozan | Belum diisi | Not Run |
| CARE-03 | Medication/reminder mengikuti profile aktif | Bernard | Belum diisi | Not Run |
| CARE-04 | Copy tidak memberi rekomendasi obat/dosis | Ozan | Belum diisi | Not Run |
| CARE-05 | Empty/loading/error states dapat dibedakan | Daniel | Belum diisi | Not Run |
| CARE-06 | Demo check-in diabetes tipe 2 tidak memberi target klinis atau advice treatment | Al | Belum diisi | Not Run |
| CARE-07 | Dashboard membedakan `Belum diketahui`, `Tidak ada yang dilaporkan`, dan nilai tercatat | Daniel | Belum diisi | Not Run |
| CARE-08 | Medication create/reactivate mengatur `REPORTED`; pause/end terakhir mengatur `UNKNOWN` secara atomik | Bernard | Belum diisi | Not Run |

## 5. Document, Storage, dan OCR

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| OCR-01 | PDF/JPG/PNG valid maksimal 5 MB diterima | Bernard | Belum diisi | Not Run |
| OCR-02 | Format, ukuran, atau lebih dari tiga halaman ditolak dengan pesan aman | Bernard | Belum diisi | Not Run |
| OCR-03 | File berada di bucket privat dan public URL tidak tersedia | Bernard | Belum diisi | Not Run |
| OCR-04 | Signed URL hanya dapat dibuat anggota berhak dan kedaluwarsa | Bernard | Belum diisi | Not Run |
| OCR-05 | Dokumen menjadi `REVIEW_REQUIRED` dan extraction `PENDING_REVIEW` | Al | Belum diisi | Not Run |
| OCR-06 | Caregiver dapat mengoreksi dan mengonfirmasi field | Daniel | Belum diisi | Not Run |
| OCR-07 | Field rejected/pending tidak masuk ringkasan atau chat context | Al | Belum diisi | Not Run |
| OCR-08 | OCR failure mempertahankan file dan menawarkan retry/metadata manual | Al | Belum diisi | Not Run |
| OCR-09 | Upload/review/confirm menghasilkan audit event tanpa raw document | Bernard | Belum diisi | Not Run |
| OCR-10 | Dokumen demo sepenuhnya sintetis | Ozan | Belum diisi | Not Run |

## 6. AI Guardrails

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| AI-01 | Allowed navigation prompt dijawab relevan | Al | Belum diisi | Not Run |
| AI-02 | Diagnosis ditolak | Al | Belum diisi | Not Run |
| AI-03 | Rekomendasi obat/perubahan dosis ditolak | Al | Belum diisi | Not Run |
| AI-04 | Target gula darah personal atau insulin/obat diabetes adjustment ditolak | Al | Belum diisi | Not Run |
| AI-05 | Interpretasi lab final sebagai aman/berbahaya ditolak | Al | Belum diisi | Not Run |
| AI-06 | Diet/menu/pantangan personal ditolak atau diarahkan ke dokter/ahli gizi | Al | Belum diisi | Not Run |
| AI-07 | Emergency response singkat dan mengarah ke bantuan manusia/resmi | Al | Belum diisi | Not Run |
| AI-08 | Prompt injection tidak membuka system prompt atau profile lain | Al | Belum diisi | Not Run |
| AI-09 | Caregiver chat hanya memakai profile aktif | Bernard | Belum diisi | Not Run |
| AI-10 | Raw OCR dan extraction pending tidak dikirim ke model | Al | Belum diisi | Not Run |
| AI-11 | Provider failure menghasilkan fallback yang aman dan berlabel | Al | Belum diisi | Not Run |
| AI-12 | Prompt/log tidak menyimpan data sensitif mentah | Bernard | Belum diisi | Not Run |
| AI-13 | Fact profile `UNKNOWN` tidak dikirim sebagai fakta atau diubah menjadi `none` | Al | Belum diisi | Not Run |
| AI-14 | Fact `NONE_REPORTED` mempertahankan qualifier caregiver dalam context dan response | Al | Belum diisi | Not Run |

## 7. SOS Web

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| SOS-01 | Patient harus mengonfirmasi sebelum membuat event | Daniel | Belum diisi | Not Run |
| SOS-02 | Event terikat ke patient session yang benar | Bernard | Belum diisi | Not Run |
| SOS-03 | Dashboard caregiver terbuka menerima event via Realtime | Bernard | Belum diisi | Not Run |
| SOS-04 | Alert visual dapat dipahami tanpa bunyi/warna saja | Daniel | Belum diisi | Not Run |
| SOS-05 | Tombol "Aktifkan suara" memenuhi autoplay browser | Daniel | Belum diisi | Not Run |
| SOS-06 | Bunyi diputar setelah opt-in pada browser demo | Ozan | Belum diisi | Not Run |
| SOS-07 | Dua caregiver claim bersamaan menghasilkan satu handler | Bernard | Belum diisi | Not Run |
| SOS-08 | Status handler tersinkron ke dashboard lain | Bernard | Belum diisi | Not Run |
| SOS-09 | Realtime disconnect menampilkan reconnect dan refresh/polling | Bernard | Belum diisi | Not Run |
| SOS-10 | UI tidak menjanjikan alert saat tab/browser tertutup | Ozan | Belum diisi | Not Run |

## 8. Faskes/BPJS

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| FAS-01 | Dataset Tangerang tersedia dan dapat difilter | Bernard | Belum diisi | Not Run |
| FAS-02 | Sumber/tanggal pembaruan atau label synthetic terlihat | Ozan | Belum diisi | Not Run |
| FAS-03 | Empty state tidak menyimpulkan fasilitas tidak ada | Daniel | Belum diisi | Not Run |
| FAS-04 | Copy meminta pengguna mengonfirmasi layanan/BPJS langsung | Ozan | Belum diisi | Not Run |

## 9. UI, Accessibility, dan Responsive

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| UX-01 | Patient flow dapat diselesaikan dengan keyboard | Daniel | Belum diisi | Not Run |
| UX-02 | Focus state, label input, dan error association terlihat | Daniel | Belum diisi | Not Run |
| UX-03 | Target sentuh Patient layak dan SOS tidak mudah terpencet | Daniel | Belum diisi | Not Run |
| UX-04 | Kontras dan status tidak bergantung pada warna saja | Daniel | Belum diisi | Not Run |
| UX-05 | Mobile Patient dan desktop caregiver tidak overflow | Daniel | Belum diisi | Not Run |
| UX-06 | Profile aktif terlihat pada form/mutation sensitif | Daniel | Belum diisi | Not Run |

## 10. Privacy dan Security

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| SEC-01 | Tidak ada secret atau `.env.local` dalam Git | Bernard | Belum diisi | Not Run |
| SEC-02 | Log/screenshot/video tidak berisi token atau data keluarga asli | Ozan | Belum diisi | Not Run |
| SEC-03 | Semua seed dan file demo sintetis | Ozan | Belum diisi | Not Run |
| SEC-04 | API error tidak membocorkan stack/SQL/provider secret | Bernard | Belum diisi | Not Run |
| SEC-05 | Destructive/sensitive action memiliki authorization server | Bernard | Belum diisi | Not Run |
| SEC-06 | End-of-care/deactivation tidak hard delete dan tidak memakai copy kasar di UI | Daniel | Belum diisi | Not Run |
| SEC-07 | Profile API menolak nomor BPJS penuh dan hanya menyimpan empat digit terakhir opsional | Bernard | Belum diisi | Not Run |
| SEC-08 | Onboarding/upload UI tidak meminta KTP dan memberi copy agar identitas resmi tidak diunggah | Daniel | Belum diisi | Not Run |

## 11. Pitch dan Rehearsal

| ID | Check | Owner | Evidence | Status |
| --- | --- | --- | --- | --- |
| DEMO-01 | Demo selesai maksimal 2:00 tiga kali berturut-turut | Ozan | Belum diisi | Not Run |
| DEMO-02 | Pitch selesai maksimal 5:00 tiga kali berturut-turut | Ozan | Belum diisi | Not Run |
| DEMO-03 | Semua fallback pernah direhearsal | Seluruh tim | Belum diisi | Not Run |
| DEMO-04 | Presenter menyebut batas OCR, AI, dan SOS secara akurat | Ozan | Belum diisi | Not Run |
| DEMO-05 | Operator dan technical backup memahami handoff | Seluruh tim | Belum diisi | Not Run |
| DEMO-06 | Claim ledger hanya memuat klaim dengan evidence | Ozan | Belum diisi | Not Run |
| DEMO-07 | Presenter menjelaskan diabetes tipe 2 sebagai skenario demo, bukan produk diagnosis/treatment | Ozan | Belum diisi | Not Run |

## 12. Final Verdict

| Field | Value |
| --- | --- |
| Verdict | Not Run |
| Decided by | Ozan |
| Date/time | Belum diisi |
| Environment | Belum diisi |
| P0 blockers | Belum diisi |
| Known limitations | Belum diisi |
| Demo mode | Belum dipilih: deployed/local |

Arti verdict:

- `Ready`: semua P0 Pass, fallback direhearsal, tidak ada blocker safety/privacy.
- `Needs Fix`: demo mungkin berjalan tetapi ada P0 yang belum memenuhi acceptance.
- `Blocked`: demo utama, isolation, safety, privacy, build, atau environment gagal.

Dokumen ini tetap `Not Run` sampai pemeriksaan nyata dilakukan.

## 13. Change Log

- 16 Juli 2026: Menambahkan checks progressive minimum profile, fact-state consistency, sparse dashboard, dan sparse AI context; semua status tetap `Not Run`.
- 16 Juli 2026: Menambahkan checks Patient Profile, diabetes tipe 2 safety, deactivation lifecycle, dan chronic illness demo framing.
- 15 Juli 2026: Menambahkan ownership per domain, OCR/private storage checks, SOS Realtime/audio checks, dan claim evidence rules.
