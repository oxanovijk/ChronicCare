"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, MailCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { caregiverRegistrationSchema } from "@/lib/onboarding/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function CaregiverRegistrationForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [careCircleName, setCareCircleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"form" | "verification" | "error">("form");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "verification") statusRef.current?.focus();
    if (state === "error") errorRef.current?.focus();
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage(null);
    setState("form");
    const values = {
      displayName,
      careCircleName,
      email: email.trim(),
      password,
      passwordConfirmation,
    };
    const parsed = caregiverRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      setValidationMessage(
        password !== passwordConfirmation
          ? "Kata sandi belum sama."
          : "Periksa kembali data pendaftaran.",
      );
      return;
    }

    const submittedPassword = parsed.data.password;
    setPassword("");
    setPasswordConfirmation("");
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/caregiver");
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: submittedPassword,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: {
            display_name: parsed.data.displayName,
            care_circle_name: parsed.data.careCircleName,
          },
        },
      });
      if (error) throw new Error("SIGN_UP_FAILED");
      if (!data.session) {
        setState("verification");
        return;
      }

      const response = await fetch("/api/v1/onboarding/owner", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: parsed.data.displayName,
          careCircleName: parsed.data.careCircleName,
        }),
      });
      if (!response.ok) throw new Error("OWNER_ONBOARDING_FAILED");
      router.replace("/caregiver");
      router.refresh();
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "verification") {
    return (
      <Alert
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="border-emerald-200 bg-emerald-50 text-emerald-950"
      >
        <MailCheck aria-hidden="true" />
        <AlertTitle>Periksa email Anda</AlertTitle>
        <AlertDescription>
          Kami mengirim tautan konfirmasi ke email Anda. Setelah dikonfirmasi,
          kembali dan masuk untuk melanjutkan.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat akun Owner</CardTitle>
        <CardDescription>
          Daftar sebagai Owner untuk membuat ruang perawatan. Family Member
          dapat bergabung melalui undangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "error" ? (
          <Alert ref={errorRef} variant="destructive" tabIndex={-1} className="mb-4">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Pendaftaran belum dapat diselesaikan</AlertTitle>
            <AlertDescription>
              Periksa koneksi dan data Anda, lalu coba lagi atau masuk jika akun sudah ada.
            </AlertDescription>
          </Alert>
        ) : null}
        {validationMessage ? (
          <p className="mb-4 text-sm text-destructive">{validationMessage}</p>
        ) : null}
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="registration-display-name">Nama tampilan</Label>
            <Input id="registration-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-circle-name">Nama Care Circle</Label>
            <Input id="registration-circle-name" value={careCircleName} onChange={(event) => setCareCircleName(event.target.value)} required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-email">Email</Label>
            <Input id="registration-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-password">Kata sandi</Label>
            <Input id="registration-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-password-confirmation">Ulangi kata sandi</Label>
            <Input id="registration-password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required disabled={submitting} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
            {submitting ? "Mendaftarkan..." : "Daftar sebagai Owner"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
