import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PasswordResetRequestForm } from "@/components/auth/password-reset-forms";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Lupa Kata Sandi Caregiver" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="mx-auto gap-1.5">
          <ShieldCheck aria-hidden="true" />
          Pemulihan akun caregiver
        </Badge>
        <h1 className="text-2xl font-semibold sm:text-3xl">Kembali ke Care Circle</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Tautan pemulihan hanya dikirim ke email caregiver yang terdaftar.
        </p>
      </div>
      <PasswordResetRequestForm />
      <Link href="/caregiver" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft aria-hidden="true" />
        Kembali ke halaman masuk
      </Link>
    </main>
  );
}
