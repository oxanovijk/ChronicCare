"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PatientLogoutButton() {
  const [submitting, setSubmitting] = useState(false);

  async function logout() {
    setSubmitting(true);
    try {
      await fetch("/api/v1/auth/patient/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      window.location.assign("/patient/login");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={logout}
      disabled={submitting}
    >
      {submitting ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      Keluar
    </Button>
  );
}
