import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { Metadata } from "next";
import Link from "next/link";

import { PatientLoginForm } from "@/components/auth/patient-login-form";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = { title: "Masuk Patient" };

export default function PatientLoginShellPage() {
  return (
    <main className="access-page production-patient-access">
      <header className="access-header">
        <BrandMark />
        <Link href="/" className="access-back-link">
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          Beranda
        </Link>
      </header>

      <div className="access-content">
        <section className="access-intro" aria-labelledby="patient-access-title">
          <span className="section-kicker"><span />Akses Patient</span>
          <h1 id="patient-access-title">Selamat datang. <span>Mari mulai dengan aman.</span></h1>
          <p>
            Kode akses menghubungkan sesi ini hanya ke Patient Profile milikmu
            di dalam Care Circle.
          </p>
        </section>
        <PatientLoginForm />
      </div>

      <footer className="access-footer">
        <span>Care in Motion</span>
        <span>Jangan bagikan kode akses di ruang publik.</span>
      </footer>
      <span className="access-orbit access-orbit-large" aria-hidden="true" />
      <span className="access-orbit access-orbit-small" aria-hidden="true" />
    </main>
  );
}
