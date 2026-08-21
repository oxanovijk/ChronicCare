import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CaregiverAuthPanel } from "@/components/auth/caregiver-auth-panel";
import { BrandMark } from "@/components/brand-mark";
import { PatientAuthError, resolvePatientAuthContext } from "@/lib/auth/patient";

export const metadata: Metadata = { title: "Asisten Caregiver" };
export const dynamic = "force-dynamic";

export default async function CaregiverChatPage() {
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
        <Link href="/" className="caregiver-back-link">
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          Beranda
        </Link>
      </header>

      <section
        className="production-caregiver-content"
        aria-labelledby="caregiver-chat-title"
      >
        <div className="production-caregiver-heading">
          <span className="section-kicker"><span />Area Caregiver</span>
          <h1 id="caregiver-chat-title">Asisten Caregiver</h1>
          <p>
            Siapkan pertanyaan kontrol dan ringkas konteks Patient Profile aktif
            dengan batas keselamatan ChroniCare.
          </p>
        </div>

        <div className="production-caregiver-layout">
          <CaregiverAuthPanel activeSection="chat" />
        </div>
      </section>
    </main>
  );
}
