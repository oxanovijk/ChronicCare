"use client";

import Link from "next/link";
import { useState } from "react";

export function PatientSosPanel() {
  const [step, setStep] = useState<"intro" | "confirm" | "sent">("intro");

  if (step === "sent") {
    return (
      <section className="result-panel sos-result" role="status">
        <span className="result-index">SOS / Terkirim</span>
        <h2>SOS terkirim melalui ChroniCare.</h2>
        <p>Alert muncul pada dashboard caregiver yang sedang terbuka dan terhubung. ChroniCare tidak menjamin alert diterima saat dashboard tertutup atau koneksi terputus.</p>
        <Link className="secondary-button" href="/prototype/patient/home">Kembali ke beranda</Link>
      </section>
    );
  }

  if (step === "confirm") {
    return (
      <section className="sos-confirm-card" aria-labelledby="sos-confirm-title">
        <span className="danger-kicker">Konfirmasi penting</span>
        <h2 id="sos-confirm-title">Kirim SOS sekarang?</h2>
        <p>Dashboard caregiver harus terbuka dan terhubung agar alert dapat terlihat. Ini bukan layanan darurat resmi.</p>
        <div className="stacked-actions">
          <button className="danger-button" type="button" onClick={() => setStep("sent")}>Ya, kirim SOS</button>
          <button className="secondary-button" type="button" onClick={() => setStep("intro")}>Batal</button>
        </div>
      </section>
    );
  }

  return (
    <section className="sos-intro-card">
      <div className="sos-pulse" aria-hidden="true">SOS</div>
      <div>
        <span className="danger-kicker">Bantuan caregiver</span>
        <h2>Beri tahu Care Circle bahwa kamu membutuhkan bantuan.</h2>
        <p>Jika kamu dalam bahaya atau membutuhkan bantuan medis segera, hubungi IGD atau layanan darurat setempat.</p>
      </div>
      <button className="danger-button" type="button" onClick={() => setStep("confirm")}>Lanjutkan ke konfirmasi</button>
    </section>
  );
}

