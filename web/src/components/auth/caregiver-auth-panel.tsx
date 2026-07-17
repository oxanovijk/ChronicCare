"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { SignIn } from "@phosphor-icons/react/dist/csr/SignIn";
import { SignOut } from "@phosphor-icons/react/dist/csr/SignOut";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CaregiverProfilePanel } from "@/components/profile/caregiver-profile-panel";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type CaregiverContext = {
  actorType: "CAREGIVER";
  user: { id: string; displayName: string };
  membership: {
    careCircleId: string;
    role: "OWNER" | "FAMILY_MEMBER";
  };
};

type AuthState =
  | { status: "checking" }
  | { status: "signed-out" }
  | { status: "signed-in"; context: CaregiverContext }
  | { status: "denied" }
  | { status: "error" };

async function fetchCaregiverContext(): Promise<AuthState> {
  const response = await fetch("/api/v1/auth/me", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.ok) {
    const body = (await response.json()) as { data: CaregiverContext };
    return { status: "signed-in", context: body.data };
  }
  if (response.status === 401) return { status: "signed-out" };
  if (response.status === 403) return { status: "denied" };
  return { status: "error" };
}

async function resolveInitialAuthState(): Promise<AuthState> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) return { status: "error" };
  if (!data.session) return { status: "signed-out" };

  return fetchCaregiverContext();
}

export function CaregiverAuthPanel() {
  const [state, setState] = useState<AuthState>({ status: "checking" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void resolveInitialAuthState()
      .then((nextState) => {
        if (active) setState(nextState);
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedPassword = password;
    setPassword("");
    setSubmitting(true);
    setFormError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: submittedPassword,
      });

      if (error) {
        setFormError("Email atau kata sandi belum sesuai.");
        return;
      }

      const nextState = await fetchCaregiverContext();
      setState(nextState.status === "signed-out" ? { status: "error" } : nextState);
    } catch {
      setFormError("Proses masuk belum dapat diselesaikan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setSubmitting(true);
    setFormError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setFormError("Proses keluar belum dapat diselesaikan. Coba lagi.");
        return;
      }

      setPassword("");
      setState({ status: "signed-out" });
    } catch {
      setFormError("Proses keluar belum dapat diselesaikan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === "checking") {
    return (
      <Card className="care-auth-card care-auth-checking" aria-live="polite">
        <CardHeader>
          <CardTitle>Memeriksa sesi caregiver</CardTitle>
          <CardDescription>
            ChroniCare sedang memverifikasi sesi melalui server.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-20 items-center gap-2 text-sm text-muted-foreground">
          <SpinnerGap className="size-4 animate-spin" aria-hidden="true" />
          Mohon tunggu.
        </CardContent>
      </Card>
    );
  }

  if (state.status === "signed-in") {
    const roleLabel =
      state.context.membership.role === "OWNER" ? "Owner" : "Family Member";

    return (
      <Card className="care-auth-card care-auth-signed-in">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{state.context.user.displayName}</CardTitle>
              <CardDescription>
                Identitas dan peran telah diverifikasi oleh server.
              </CardDescription>
            </div>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {formError ? (
            <Alert
              variant="destructive"
              className="mb-4"
              aria-live="assertive"
            >
              <AlertTitle>Belum dapat keluar</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <Alert>
            <ShieldCheck aria-hidden="true" />
            <AlertTitle>Sesi caregiver aktif</AlertTitle>
            <AlertDescription>
              Patient Profile hanya dimuat setelah server memverifikasi Care
              Circle dan peran akun ini.
            </AlertDescription>
          </Alert>
          <CaregiverProfilePanel role={state.context.membership.role} />
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={submitting}
          >
            {submitting ? (
              <SpinnerGap className="animate-spin" aria-hidden="true" />
            ) : (
              <SignOut aria-hidden="true" />
            )}
            Keluar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="care-auth-card care-auth-signed-out">
      <CardHeader>
        <CardTitle>Masuk sebagai caregiver</CardTitle>
        <CardDescription>
          Gunakan akun caregiver demo yang disiapkan secara privat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.status === "denied" ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Akses Care Circle tidak tersedia</AlertTitle>
            <AlertDescription>
              Akun ini belum memiliki membership caregiver aktif.
            </AlertDescription>
          </Alert>
        ) : null}
        {state.status === "error" ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Sesi belum dapat diperiksa</AlertTitle>
            <AlertDescription>
              Coba muat ulang halaman atau masuk kembali.
            </AlertDescription>
          </Alert>
        ) : null}
        {formError ? (
          <Alert
            variant="destructive"
            className="mb-4"
            aria-live="assertive"
          >
            <AlertTitle>Belum dapat masuk</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="care-auth-form" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="caregiver-email">Email caregiver</Label>
            <Input
              id="caregiver-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caregiver-password">Kata sandi</Label>
            <Input
              id="caregiver-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="caregiver-primary-button w-full" disabled={submitting}>
            {submitting ? (
              <SpinnerGap className="animate-spin" aria-hidden="true" />
            ) : (
              <SignIn aria-hidden="true" />
            )}
            Masuk sebagai caregiver
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
