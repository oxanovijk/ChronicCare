import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { CaregiverRegistrationForm } from "@/components/auth/caregiver-registration-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Daftar Caregiver" };

export default function CaregiverRegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="mx-auto gap-1.5">
          <ShieldCheck aria-hidden="true" />
          Registrasi Caregiver
        </Badge>
        <h1 className="text-2xl font-semibold sm:text-3xl">Mulai Care Circle</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Daftar sebagai Owner untuk mengoordinasikan perawatan keluarga.
        </p>
      </div>
      <CaregiverRegistrationForm />
      <Link href="/caregiver" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft aria-hidden="true" />
        Sudah punya akun
      </Link>
    </main>
  );
}
