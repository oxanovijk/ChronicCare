"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, KeyRound, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"form" | "sent" | "error">("form");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state !== "form") statusRef.current?.focus();
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setState("form");

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/caregiver/reset-password");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: callbackUrl.toString(),
      });

      if (error) throw new Error("PASSWORD_RESET_REQUEST_FAILED");
      setEmail("");
      setState("sent");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "sent") {
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
          Jika email tersebut terdaftar, tautan untuk membuat kata sandi baru
          akan dikirim. Periksa juga folder spam.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lupa kata sandi</CardTitle>
        <CardDescription>
          Masukkan email caregiver untuk menerima tautan pemulihan akun.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "error" ? (
          <Alert
            ref={statusRef}
            variant="destructive"
            tabIndex={-1}
            className="mb-4"
          >
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Email belum dapat dikirim</AlertTitle>
            <AlertDescription>
              Periksa koneksi Anda, tunggu sebentar, lalu coba lagi.
            </AlertDescription>
          </Alert>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="password-reset-email">Email caregiver</Label>
            <Input
              id="password-reset-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <MailCheck aria-hidden="true" />
            )}
            {submitting ? "Mengirim..." : "Kirim tautan pemulihan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

type PasswordUpdateState = "checking" | "ready" | "invalid" | "complete" | "error";

export function PasswordUpdateForm() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [state, setState] = useState<PasswordUpdateState>("checking");
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    void supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (active) setState(!error && data.user ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setState("invalid");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state === "invalid" || state === "complete" || state === "error") {
      statusRef.current?.focus();
    }
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage(null);

    if (password.length < 8 || password.length > 72) {
      setValidationMessage("Kata sandi harus terdiri dari 8–72 karakter.");
      return;
    }
    if (password !== passwordConfirmation) {
      setValidationMessage("Kata sandi belum sama.");
      return;
    }

    const submittedPassword = password;
    setPassword("");
    setPasswordConfirmation("");
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: submittedPassword,
      });
      setState(error ? "error" : "complete");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "checking") {
    return (
      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Memeriksa tautan pemulihan</CardTitle>
          <CardDescription>ChroniCare sedang memverifikasi sesi Anda.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Mohon tunggu.
        </CardContent>
      </Card>
    );
  }

  if (state === "invalid") {
    return (
      <Alert ref={statusRef} variant="destructive" tabIndex={-1}>
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>Tautan tidak dapat digunakan</AlertTitle>
        <AlertDescription>
          Tautan mungkin sudah kedaluwarsa atau pernah digunakan. Minta tautan
          pemulihan baru.
          <Link
            href="/caregiver/forgot-password"
            className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
          >
            Minta tautan baru
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (state === "complete") {
    return (
      <Alert
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="border-emerald-200 bg-emerald-50 text-emerald-950"
      >
        <KeyRound aria-hidden="true" />
        <AlertTitle>Kata sandi berhasil diperbarui</AlertTitle>
        <AlertDescription>
          Akun Anda sudah dipulihkan.
          <Link
            href="/caregiver"
            className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
          >
            Lanjut ke area caregiver
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat kata sandi baru</CardTitle>
        <CardDescription>
          Gunakan 8–72 karakter yang tidak mudah ditebak.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "error" ? (
          <Alert
            ref={statusRef}
            variant="destructive"
            tabIndex={-1}
            className="mb-4"
          >
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Kata sandi belum diperbarui</AlertTitle>
            <AlertDescription>
              Tautan mungkin sudah kedaluwarsa. Minta tautan pemulihan baru lalu
              coba lagi.
            </AlertDescription>
          </Alert>
        ) : null}
        {validationMessage ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {validationMessage}
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata sandi baru</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-confirmation">Ulangi kata sandi baru</Label>
            <Input
              id="new-password-confirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound aria-hidden="true" />
            )}
            {submitting ? "Memperbarui..." : "Simpan kata sandi baru"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
