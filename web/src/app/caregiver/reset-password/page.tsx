import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { PasswordUpdateForm } from "@/components/auth/password-reset-forms";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Atur Ulang Kata Sandi Caregiver" };

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="mx-auto gap-1.5">
          <ShieldCheck aria-hidden="true" />
          Pemulihan akun caregiver
        </Badge>
        <h1 className="text-2xl font-semibold sm:text-3xl">Atur ulang kata sandi</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Buat kata sandi baru untuk akun caregiver Anda.
        </p>
      </div>
      <PasswordUpdateForm />
    </main>
  );
}
