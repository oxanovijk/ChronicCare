import type { Metadata } from "next";
import Link from "next/link";

import { PatientLoginForm } from "@/components/auth/patient-login-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk Patient",
};

export default function PatientLoginShellPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-3 text-center">
        <Badge variant="secondary" className="mx-auto w-fit">
          Akses Patient
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Masuk sebagai Patient
        </h1>
        <p className="text-muted-foreground">
          Masuk dengan kode akses yang dibuat oleh caregiver-mu. Patient tidak perlu membuat akun.
        </p>
      </div>

      <PatientLoginForm />

      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
