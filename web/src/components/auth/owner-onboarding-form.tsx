"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, UserRoundCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CaregiverContext = {
  actorType: "CAREGIVER";
  user: { id: string; displayName: string };
  membership: { careCircleId: string; role: "OWNER" | "FAMILY_MEMBER" };
};

export function OwnerOnboardingForm({
  initialValues = {},
  onComplete,
}: {
  initialValues?: { displayName?: string; careCircleName?: string };
  onComplete: (context: CaregiverContext) => void;
}) {
  const [displayName, setDisplayName] = useState(initialValues.displayName ?? "");
  const [careCircleName, setCareCircleName] = useState(
    initialValues.careCircleName ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setSubmitting(true);
    try {
      const response = await fetch("/api/v1/onboarding/owner", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          careCircleName: careCircleName.trim(),
        }),
      });
      if (!response.ok) throw new Error("OWNER_ONBOARDING_FAILED");
      const body = (await response.json()) as { data: CaregiverContext };
      onComplete(body.data);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Selesaikan pendaftaran Owner</h2>
        </CardTitle>
        <CardDescription>
          Email Anda sudah dikonfirmasi. Sekarang beri nama ruang perawatan
          keluarga Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert ref={errorRef} variant="destructive" tabIndex={-1} className="mb-4">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Pendaftaran belum selesai</AlertTitle>
            <AlertDescription>
              Data belum dibuat. Periksa isian lalu coba lagi.
            </AlertDescription>
          </Alert>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="owner-display-name">Nama tampilan</Label>
            <Input
              id="owner-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={120}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner-care-circle-name">Nama Care Circle</Label>
            <Input
              id="owner-care-circle-name"
              value={careCircleName}
              onChange={(event) => setCareCircleName(event.target.value)}
              minLength={2}
              maxLength={120}
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <UserRoundCheck aria-hidden="true" />
            )}
            {submitting ? "Menyelesaikan..." : "Selesaikan pendaftaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
