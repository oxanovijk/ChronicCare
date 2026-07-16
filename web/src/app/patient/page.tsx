import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PatientLogoutButton } from "@/components/auth/patient-logout-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <Badge variant="secondary" className="w-fit">
        Patient Profile aktif
      </Badge>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Halo, {context.patientProfile.displayName}
        </h1>
        <p className="text-muted-foreground">
          Sesi ini hanya terhubung ke profil{" "}
          {context.patientProfile.relationshipLabel}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Akses Patient sudah aktif</CardTitle>
          <CardDescription>
            Check-in, pengingat, chatbot, dan SOS akan tersedia pada packet
            masing-masing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientLogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
