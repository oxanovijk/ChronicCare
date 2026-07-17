import type { Metadata } from "next";
import Link from "next/link";

import { FamilyInvitationForm } from "@/components/auth/family-invitation-form";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Undangan Family Member",
};

export default async function FamilyInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Undangan caregiver</h1>
        <p className="text-muted-foreground">
          Daftar atau masuk untuk bergabung sebagai Family Member.
        </p>
      </div>
      <FamilyInvitationForm token={token} />
      <Link href="/caregiver" className={buttonVariants({ variant: "outline", className: "w-full" })}>
        Kembali ke halaman masuk
      </Link>
    </main>
  );
}
