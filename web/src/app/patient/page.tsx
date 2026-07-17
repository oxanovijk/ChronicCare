import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PatientLogoutButton } from "@/components/auth/patient-logout-button";
import { BrandMark } from "@/components/brand-mark";
import { PatientAuthError, resolvePatientAuthContext } from "@/lib/auth/patient";

export const metadata: Metadata = { title: "Beranda Patient" };
export const dynamic = "force-dynamic";

export default async function PatientPage() {
  let context;
  try {
    context = await resolvePatientAuthContext();
  } catch (error) {
    if (error instanceof PatientAuthError) redirect("/patient/login");
    throw error;
  }

  return (
    <main className="patient-session-page">
      <header className="patient-session-header"><BrandMark /></header>
      <section className="patient-session-content" aria-labelledby="patient-session-title">
        <div className="patient-session-identity">
          <span className="patient-session-badge"><CheckCircle size={19} weight="fill" aria-hidden="true" />Patient Profile aktif</span>
          <h1 id="patient-session-title">Halo, {context.patientProfile.displayName}</h1>
          <p>{context.patientProfile.relationshipLabel}</p>
        </div>

        <div className="patient-session-card">
          <span className="patient-session-card-icon" aria-hidden="true"><LockKey size={26} weight="bold" /></span>
          <div>
            <h2>Akses Patient sudah aktif</h2>
            <p>
              Sesi ini hanya terhubung ke profil {context.patientProfile.displayName}.
              Kamu tidak dapat melihat atau memilih Patient Profile lain.
            </p>
            <p className="patient-session-notice">
              Fitur perawatan harian belum tersedia pada tahap ini.
            </p>
          </div>
          <PatientLogoutButton />
        </div>
      </section>
      <footer className="patient-session-footer">Koordinasi perawatan, bukan pengganti bantuan medis.</footer>
    </main>
  );
}
