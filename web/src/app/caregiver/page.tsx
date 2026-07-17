import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CaregiverAuthPanel } from "@/components/auth/caregiver-auth-panel";
import { BrandMark } from "@/components/brand-mark";
import { PatientAuthError, resolvePatientAuthContext } from "@/lib/auth/patient";

export const metadata: Metadata = { title: "Area Caregiver" };
export const dynamic = "force-dynamic";

export default async function CaregiverPage() {
  try {
    await resolvePatientAuthContext();
    redirect("/patient");
  } catch (error) {
    if (!(error instanceof PatientAuthError)) throw error;
  }

  return (
    <main className="production-caregiver-page">
      <header className="production-caregiver-header">
        <BrandMark compact />
        <Link href="/" className="caregiver-back-link"><ArrowLeft size={18} weight="bold" aria-hidden="true" />Beranda</Link>
      </header>

      <section className="production-caregiver-content" aria-labelledby="caregiver-title">
        <div className="production-caregiver-heading">
          <span className="section-kicker"><span />Area Caregiver</span>
          <h1 id="caregiver-title">Konteks perawatan yang jelas, tanpa kebisingan.</h1>
          <p>
            Masuk untuk melihat dan mengatur perawatan anggota keluarga.
          </p>
        </div>

        <div className="production-caregiver-layout">
          <CaregiverAuthPanel />
          <aside className="caregiver-security-note">
            <LockKey size={24} weight="bold" aria-hidden="true" />
            <div>
              <strong>Data setiap Patient tetap terpisah</strong>
              <p>
                Pilih Patient yang ingin Anda dampingi. Informasi yang tampil
                akan mengikuti Patient tersebut.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
