"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, LogIn, MailCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { caregiverRegistrationSchema } from "@/lib/onboarding/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type InvitationPreview = {
  careCircleName: string;
  expiresAt: string;
};

type ViewState = "loading" | "ready" | "verification" | "unavailable" | "error";

export function FamilyInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/v1/care-circle/invitations/${token}`, {
        cache: "no-store",
        credentials: "same-origin",
      }),
      createSupabaseBrowserClient().auth.getSession(),
    ])
      .then(async ([response, sessionResult]) => {
        if (!active) return;
        if (!response.ok) {
          setViewState("unavailable");
          return;
        }
        if (sessionResult.error) {
          setViewState("error");
          return;
        }
        const body = (await response.json()) as { data: InvitationPreview };
        setPreview(body.data);
        setHasSession(Boolean(sessionResult.data.session));
        setViewState("ready");
      })
      .catch(() => {
        if (active) setViewState("error");
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (["verification", "unavailable", "error"].includes(viewState)) {
      focusRef.current?.focus();
    }
  }, [viewState]);

  async function acceptInvitation(name: string) {
    const response = await fetch(
      `/api/v1/care-circle/invitations/${token}/accept`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      },
    );
    if (!response.ok) throw new Error("INVITATION_ACCEPT_FAILED");
    router.replace("/caregiver");
    router.refresh();
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage(null);
    const parsed = caregiverRegistrationSchema.safeParse({
      displayName,
      careCircleName: preview?.careCircleName ?? "Care Circle",
      email: email.trim(),
      password,
      passwordConfirmation,
    });
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
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", `/caregiver/invite/${token}`);
      const { data, error } = await createSupabaseBrowserClient().auth.signUp({
        email: parsed.data.email,
        password: submittedPassword,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: { display_name: parsed.data.displayName },
        },
      });
      if (error) throw new Error("SIGN_UP_FAILED");
      if (!data.session) {
        setViewState("verification");
        return;
      }
      await acceptInvitation(parsed.data.displayName);
    } catch {
      setViewState("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      setValidationMessage("Nama tampilan perlu diisi.");
      return;
    }
    const submittedPassword = password;
    setPassword("");
    setSubmitting(true);
    setValidationMessage(null);
    try {
      const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim(),
        password: submittedPassword,
      });
      if (error) throw new Error("SIGN_IN_FAILED");
      await acceptInvitation(displayName.trim());
    } catch {
      setViewState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (viewState === "loading") {
    return (
      <Card aria-live="polite">
        <CardContent className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          Memeriksa undangan.
        </CardContent>
      </Card>
    );
  }

  if (viewState === "verification") {
    return (
      <Alert ref={focusRef} role="status" tabIndex={-1} className="border-emerald-200 bg-emerald-50 text-emerald-950">
        <MailCheck aria-hidden="true" />
        <AlertTitle>Periksa email Anda</AlertTitle>
        <AlertDescription>
          Buka tautan verifikasi untuk kembali ke undangan dan menyelesaikan proses bergabung.
        </AlertDescription>
      </Alert>
    );
  }

  if (viewState === "unavailable" || viewState === "error") {
    return (
      <Alert ref={focusRef} variant="destructive" tabIndex={-1}>
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>
          {viewState === "unavailable" ? "Undangan tidak tersedia" : "Undangan belum dapat diproses"}
        </AlertTitle>
        <AlertDescription>
          {viewState === "unavailable"
            ? "Minta Owner membuat tautan undangan baru."
            : "Periksa koneksi atau data masuk, lalu coba lagi dari tautan undangan."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gabung ke {preview?.careCircleName}</CardTitle>
        <CardDescription>
          Setelah bergabung, Anda dapat membantu mengelola perawatan di Care
          Circle ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationMessage ? (
          <p className="mb-4 text-sm text-destructive">{validationMessage}</p>
        ) : null}
        {hasSession ? (
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            setSubmitting(true);
            void acceptInvitation(displayName.trim())
              .catch(() => setViewState("error"))
              .finally(() => setSubmitting(false));
          }}>
            <DisplayNameField value={displayName} onChange={setDisplayName} disabled={submitting} />
            <Button type="submit" className="w-full" disabled={submitting || displayName.trim().length < 2}>
              {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
              Gabung sebagai Family Member
            </Button>
          </form>
        ) : (
          <Tabs defaultValue="register">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Daftar</TabsTrigger>
              <TabsTrigger value="sign-in">Sudah punya akun</TabsTrigger>
            </TabsList>
            <TabsContent value="register" className="pt-4">
              <form className="space-y-4" onSubmit={register} noValidate>
                <DisplayNameField value={displayName} onChange={setDisplayName} disabled={submitting} />
                <CredentialFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} disabled={submitting} newPassword />
                <div className="space-y-2">
                  <Label htmlFor="family-password-confirmation">Ulangi kata sandi</Label>
                  <Input id="family-password-confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required disabled={submitting} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                  Daftar dan bergabung
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="sign-in" className="pt-4">
              <form className="space-y-4" onSubmit={signIn}>
                <DisplayNameField value={displayName} onChange={setDisplayName} disabled={submitting} />
                <CredentialFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} disabled={submitting} />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
                  Masuk dan bergabung
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function DisplayNameField({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="family-display-name">Nama tampilan</Label>
      <Input id="family-display-name" autoComplete="name" minLength={2} maxLength={120} value={value} onChange={(event) => onChange(event.target.value)} required disabled={disabled} />
    </div>
  );
}

function CredentialFields({ email, setEmail, password, setPassword, disabled, newPassword = false }: { email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; disabled: boolean; newPassword?: boolean }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`family-email-${newPassword ? "register" : "sign-in"}`}>Email</Label>
        <Input id={`family-email-${newPassword ? "register" : "sign-in"}`} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={disabled} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`family-password-${newPassword ? "register" : "sign-in"}`}>Kata sandi</Label>
        <Input id={`family-password-${newPassword ? "register" : "sign-in"}`} type="password" autoComplete={newPassword ? "new-password" : "current-password"} minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={disabled} />
      </div>
    </>
  );
}
