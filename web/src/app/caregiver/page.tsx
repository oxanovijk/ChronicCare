import type { Metadata } from "next";
import Link from "next/link";

import { CaregiverAuthPanel } from "@/components/auth/caregiver-auth-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Area Caregiver",
};

export default function CaregiverPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Autentikasi caregiver aktif
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Area Caregiver
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Masuk dengan akun Owner atau Family Member. ChroniCare memverifikasi
          sesi, keanggotaan Care Circle, dan peran melalui server.
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <CaregiverAuthPanel />

        <Alert>
          <AlertTitle>Dashboard Patient belum tersedia</AlertTitle>
          <AlertDescription>
            Packet 04 hanya mengaktifkan login caregiver dan fondasi
            otorisasi. Pergantian Patient Profile serta data perawatan tetap
            dibangun pada packet berikutnya.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
