"use client";

import { useState } from "react";

export function OcrReviewWorkspace() {
  const initial = "Ringkasan kontrol rutin";
  const [title, setTitle] = useState(initial);
  const [status, setStatus] = useState<"review" | "confirmed" | "rejected">("review");
  if (status !== "review") return <section className="result-panel" role="status"><span className="result-index">{status === "confirmed" ? "Dikonfirmasi" : "Ditolak"}</span><h2>{status === "confirmed" ? "Ekstraksi dikonfirmasi." : "Ekstraksi ditolak."}</h2><p>{status === "confirmed" ? "Hanya data terstruktur yang dikonfirmasi ini yang dapat masuk ke konteks asisten." : "Dokumen privat tetap tersimpan; hasil ekstraksi tidak digunakan."}</p><a className="primary-button" href={status === "confirmed" ? "/prototype/caregiver/chat" : "/prototype/caregiver/documents/upload"}>{status === "confirmed" ? "Lanjut ke asisten" : "Kembali ke upload"}</a></section>;
  return (
    <div className="review-workspace">
      <section className="document-preview"><div className="preview-toolbar"><span>Dokumen privat sintetis</span><strong>Halaman 1 / 1</strong></div><article><span>KLINIK SEHAT BERSAMA · DEMO</span><h2>Ringkasan Kontrol Rutin</h2><p>Nama: Maya Pratama</p><p>Tanggal dokumen: 15 Juli 2026</p><hr /><p>Catatan kunjungan sintetis untuk kebutuhan demonstrasi alur review.</p></article></section>
      <form className="extraction-panel" onSubmit={(event) => event.preventDefault()}><div className="review-title-row"><div><span className="section-kicker"><span aria-hidden="true" /> Screen 06</span><h1>Review hasil ekstraksi</h1></div><span className="review-status">Perlu review</span></div><p>Periksa teks terhadap dokumen. Jangan gunakan bagian ini untuk menilai diagnosis, keamanan, atau rekomendasi terapi.</p><label>Nama dokumen<input aria-label="Nama dokumen" value={title} onChange={(event) => setTitle(event.target.value)} /></label>{title !== initial ? <span className="edited-label">Diedit caregiver</span> : null}<label>Tanggal dokumen<input value="2026-07-15" readOnly /></label><label>Ringkasan netral<textarea defaultValue="Kontrol rutin tercatat. Tidak ada interpretasi klinis yang dibuat oleh ChroniCare." /></label><div className="review-actions"><button className="primary-button" type="button" onClick={() => setStatus("confirmed")}>Konfirmasi ekstraksi</button><button className="secondary-button" type="button" onClick={() => setStatus("rejected")}>Tolak hasil</button></div></form>
    </div>
  );
}

