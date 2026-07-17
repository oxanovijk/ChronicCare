import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PatientHome } from "@/components/patient/patient-home";
import {
  PatientAuthError,
  resolvePatientAuthContext,
} from "@/lib/auth/patient";

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

  return <PatientHome patientProfile={context.patientProfile} />;
}
