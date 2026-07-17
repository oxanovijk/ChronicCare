"use client";

import { ChangeEvent, useEffect, useState } from "react";

export function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setProgress(0); setFile(null); setError("");
    if (!next) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(next.type)) { setError("Gunakan file PDF, JPG, atau PNG."); return; }
    if (next.size > 5 * 1024 * 1024) { setError("Ukuran file maksimal 5 MB."); return; }
    setFile(next);
  }

  useEffect(() => {
    if (!file || progress >= 100) return;
    const timer = window.setTimeout(() => setProgress((value) => Math.min(100, value + 25)), 120);
    return () => window.clearTimeout(timer);
  }, [file, progress]);

  return (
    <section className="upload-workspace">
      <div className="upload-dropzone">
        <span className="upload-orbit" aria-hidden="true" />
        <span className="card-index">File privat · Data sintetis</span>
        <h2>Pilih dokumen untuk ruang review.</h2>
        <p>PDF, JPG, atau PNG · maksimum 5 MB · maksimum 3 halaman.</p>
        <label className="primary-button" htmlFor="document-file">Pilih dokumen sintetis</label>
        <input id="document-file" className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={choose} />
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
      <aside className="upload-rules"><h3>Sebelum upload</h3><ul><li>Gunakan data sintetis saja.</li><li>File disiapkan sebagai dokumen privat.</li><li>OCR dimulai terpisah setelah upload berhasil.</li></ul><p>Jenis file, ukuran, dan jumlah halaman akan diperiksa kembali sebelum dokumen diproses.</p></aside>
      {file ? <div className="upload-progress" aria-live="polite"><div><strong>{file.name}</strong><span>{progress < 100 ? `Mengunggah · ${progress}%` : "Upload selesai · Siap mulai OCR"}</span></div><progress max="100" value={progress}>{progress}%</progress>{progress < 100 ? <button type="button" onClick={() => { setFile(null); setProgress(0); }}>Batalkan upload</button> : <a className="primary-button" href="/prototype/caregiver/documents/review">Mulai OCR demo</a>}</div> : null}
    </section>
  );
}

