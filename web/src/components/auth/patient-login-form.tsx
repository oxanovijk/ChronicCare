"use client";

import { type FormEvent, useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PatientLoginForm() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedCode = code;
    setCode("");
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/patient/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: submittedCode }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Terlalu banyak percobaan. Coba lagi nanti."
            : response.status === 401
              ? "Kode tidak valid atau sudah tidak berlaku."
              : "Proses masuk belum dapat diselesaikan. Coba lagi.",
        );
        return;
      }
      window.location.assign("/patient");
    } catch {
      setError("Proses masuk belum dapat diselesaikan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kode akses</CardTitle>
        <CardDescription>
          Gunakan kode yang diberikan oleh Owner Care Circle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive" aria-live="assertive">
            <AlertTitle>Belum dapat masuk</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="patient-access-code">Kode akses Patient</Label>
            <Input
              id="patient-access-code"
              name="code"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <LogIn aria-hidden="true" />
            )}
            Masuk
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
