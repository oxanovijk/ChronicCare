"use client";

import Link from "next/link";
import { useState } from "react";

export function PatientContextControl() {
  const [profile, setProfile] = useState("maya");
  return (
    <>
      <section className="patient-context-bar">
        <div><span className="section-kicker"><span aria-hidden="true" /> Patient yang dipilih</span><h1>{profile === "maya" ? "Maya Pratama" : "Raka Pratama"}</h1><p>{profile === "maya" ? "Data contoh · Diabetes tipe 2" : "Data contoh belum tersedia"}</p></div>
        <label>Patient Profile aktif<select aria-label="Patient Profile aktif" value={profile} onChange={(event) => setProfile(event.target.value)}><option value="maya">Maya Pratama</option><option value="raka">Raka Pratama</option></select></label>
      </section>
      {profile === "raka" ? (
        <section className="empty-context" aria-live="polite"><span className="skeleton-orbit" aria-hidden="true" /><h2>Data Raka belum tersedia.</h2><p>Pilih Maya untuk kembali melihat contoh alur perawatan.</p></section>
      ) : (
        <div className="dashboard-grid">
          <section className="care-summary"><span className="card-index">01 · Hari ini</span><h2>Kabar terbaru Maya</h2><div className="support-signal"><strong>Butuh dukungan</strong><span>17 Juli · 08.42</span></div><p>“Saya ingin ditemani bicara.”</p><small>Status ini bukan klasifikasi keadaan darurat.</small></section>
          <section className="review-card"><span className="card-index">02 · Perlu aksi</span><h2>1 dokumen perlu review</h2><p>Hasil ekstraksi belum dapat dipakai oleh asisten sebelum dikonfirmasi caregiver.</p><Link className="primary-button" href="/prototype/caregiver/documents/review">Review sekarang</Link></section>
          <section className="activity-card"><span className="card-index">03 · Aktivitas</span><h2>Jejak perawatan terbaru</h2><ol><li><strong>Check-in disimpan</strong><span>08.42 · Butuh dukungan</span></li><li><strong>Dokumen diunggah</strong><span>Kemarin · Data sintetis</span></li><li><strong>Pengingat dicatat</strong><span>Metformin · 19.00</span></li></ol></section>
          <section className="quick-card"><span className="card-index">04 · Lanjutkan</span><h2>Quick actions</h2><div className="quick-links"><Link href="/prototype/caregiver/documents/upload">Upload dokumen</Link><Link href="/prototype/caregiver/chat">Buka asisten</Link><Link href="/prototype/caregiver/facilities">Cari faskes/BPJS</Link></div></section>
        </div>
      )}
    </>
  );
}

