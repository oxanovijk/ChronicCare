"use client";

import { useState } from "react";
import { SignOut } from "@phosphor-icons/react/dist/csr/SignOut";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function PatientLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setSubmitting(true);
    setError(false);

    try {
      const response = await fetch("/api/v1/auth/patient/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) {
        setError(true);
        return;
      }
      router.replace("/patient/login");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="patient-logout-control">
      {error ? (
        <Alert variant="destructive" aria-live="assertive">
          <AlertTitle>Belum dapat keluar</AlertTitle>
          <AlertDescription>
            Proses keluar belum dapat diselesaikan. Coba lagi.
          </AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={logout}
        disabled={submitting}
      >
        {submitting ? (
          <SpinnerGap className="animate-spin" aria-hidden="true" />
        ) : (
          <SignOut aria-hidden="true" />
        )}
        Keluar
      </Button>
    </div>
  );
}
