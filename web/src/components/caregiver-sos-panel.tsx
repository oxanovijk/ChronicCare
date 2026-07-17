"use client";

import { useState } from "react";

export function CaregiverSosPanel() {
  const [handled, setHandled] = useState(false);
  const [audio, setAudio] = useState(false);
  const [conflict, setConflict] = useState(false);
  return (
    <div className="sos-dashboard">
      <section className="sos-live-card" role="alert"><div className="sos-live-heading"><span className="sos-live-dot" aria-hidden="true" /><div><span>Alert visual aktif · 08.48</span><h1>Maya mengirim SOS</h1></div></div><p>Maya meminta bantuan caregiver melalui ChroniCare. Hubungi Maya dan tentukan langkah aman berikutnya.</p><dl><div><dt>Lokasi umum</dt><dd>Tangerang</dd></div><div><dt>Status koneksi</dt><dd>Dashboard terhubung</dd></div></dl>{handled ? <div className="handled-state" role="status"><strong>Ditangani oleh Dinda</strong><span>08.49 · Care Circle dapat melihat status ini.</span></div> : <button className="danger-button" type="button" onClick={() => setHandled(true)}>Saya tangani</button>}</section>
      <aside className="sos-controls"><span className="card-index">Kontrol alert</span><h2>Suara bersifat opsional.</h2><label className="switch-row"><span><strong>Aktifkan suara</strong><small>Hanya saat tab ini terbuka dan browser mengizinkan.</small></span><input type="checkbox" checked={audio} onChange={(event) => setAudio(event.target.checked)} /></label><p className="connection-note">Visual alert selalu tetap terlihat, dengan atau tanpa suara. Saat kembali tersambung atau tab fokus, data akan dimuat ulang.</p><button className="text-button" type="button" onClick={() => setConflict(true)}>Simulasikan sudah ditangani anggota lain</button>{conflict ? <p className="conflict-note" role="status">Alert ini baru saja ditangani oleh anggota lain. Status telah diperbarui dengan aman.</p> : null}</aside>
    </div>
  );
}

