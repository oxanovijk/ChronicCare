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

type RegistrationValues = {
  displayName: string;
  careCircleName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type RegistrationField = keyof RegistrationValues;
type RegistrationErrors = Partial<Record<RegistrationField, string>>;

const registrationFields: RegistrationField[] = [
  "displayName",
  "careCircleName",
  "email",
  "password",
  "passwordConfirmation",
];

const registrationFieldIds: Record<RegistrationField, string> = {
  displayName: "registration-display-name",
  careCircleName: "registration-circle-name",
  email: "registration-email",
  password: "registration-password",
  passwordConfirmation: "registration-password-confirmation",
};

const existingIdentityErrorCodes = new Set([
  "email_exists",
  "user_already_exists",
]);

function validationMessage(
  field: RegistrationField,
  value: string,
  issueCode: string,
) {
  const empty = value.trim().length === 0;

  if (field === "displayName") {
    if (empty) return "Masukkan nama tampilan.";
    return issueCode === "too_big"
      ? "Nama tampilan maksimal 120 karakter."
      : "Nama tampilan minimal 2 karakter.";
  }
  if (field === "careCircleName") {
    if (empty) return "Masukkan nama Care Circle.";
    return issueCode === "too_big"
      ? "Nama Care Circle maksimal 120 karakter."
      : "Nama Care Circle minimal 2 karakter.";
  }
  if (field === "email") {
    if (empty) return "Masukkan email.";
    return issueCode === "too_big"
      ? "Email maksimal 254 karakter."
      : "Masukkan alamat email yang valid.";
  }
  if (field === "password") {
    if (empty) return "Masukkan kata sandi.";
    return issueCode === "too_big"
      ? "Kata sandi maksimal 72 karakter."
      : "Kata sandi minimal 8 karakter.";
  }
  if (empty) return "Ulangi kata sandi.";
  if (issueCode === "too_small") {
    return "Konfirmasi kata sandi minimal 8 karakter.";
  }
  if (issueCode === "too_big") {
    return "Konfirmasi kata sandi maksimal 72 karakter.";
  }
  return "Kata sandi belum sama.";
}

function validateRegistration(values: RegistrationValues) {
  const result = caregiverRegistrationSchema.safeParse(values);
  const errors: RegistrationErrors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (
        typeof field !== "string" ||
        !registrationFields.includes(field as RegistrationField)
      ) {
        continue;
      }
      const registrationField = field as RegistrationField;
      errors[registrationField] ??= validationMessage(
        registrationField,
        values[registrationField],
        issue.code,
      );
    }
  }

  return { result, errors };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

export function CaregiverRegistrationForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [careCircleName, setCareCircleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"form" | "verification" | "error">("form");
  const [validationErrors, setValidationErrors] = useState<RegistrationErrors>({});
  const statusRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === "verification") statusRef.current?.focus();
    if (state === "error") errorRef.current?.focus();
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("form");
    const values = {
      displayName,
      careCircleName,
      email: email.trim(),
      password,
      passwordConfirmation,
    };
    const validation = validateRegistration(values);
    if (!validation.result.success) {
      setValidationErrors(validation.errors);
      const firstInvalidField = registrationFields.find(
        (field) => validation.errors[field],
      );
      if (firstInvalidField) {
        formRef.current
          ?.querySelector<HTMLInputElement>(
            `#${registrationFieldIds[firstInvalidField]}`,
          )
          ?.focus();
      }
      return;
    }
    setValidationErrors({});
    const parsed = validation.result;

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
      if (error) {
        if (error.code && existingIdentityErrorCodes.has(error.code)) {
          setState("verification");
          return;
        }
        throw new Error("SIGN_UP_FAILED");
      }
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

  function revalidate(nextValues: RegistrationValues) {
    if (Object.keys(validationErrors).length === 0) return;
    setValidationErrors(validateRegistration(nextValues).errors);
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
        <AlertTitle>Periksa email atau masuk</AlertTitle>
        <AlertDescription>
          Jika alamat ini dapat didaftarkan, kami mengirim tautan konfirmasi.
          Jika Anda sudah punya akun, gunakan tombol masuk di bawah.
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
        <form ref={formRef} className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="registration-display-name">Nama tampilan</Label>
            <Input
              id="registration-display-name"
              value={displayName}
              onChange={(event) => {
                const nextValue = event.target.value;
                setDisplayName(nextValue);
                revalidate({ displayName: nextValue, careCircleName, email, password, passwordConfirmation });
              }}
              autoComplete="name"
              minLength={2}
              maxLength={120}
              required
              disabled={submitting}
              aria-invalid={validationErrors.displayName ? true : undefined}
              aria-describedby={validationErrors.displayName ? "registration-display-name-error" : undefined}
            />
            <FieldError id="registration-display-name-error" message={validationErrors.displayName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-circle-name">Nama Care Circle</Label>
            <Input
              id="registration-circle-name"
              value={careCircleName}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCareCircleName(nextValue);
                revalidate({ displayName, careCircleName: nextValue, email, password, passwordConfirmation });
              }}
              minLength={2}
              maxLength={120}
              required
              disabled={submitting}
              aria-invalid={validationErrors.careCircleName ? true : undefined}
              aria-describedby={validationErrors.careCircleName ? "registration-circle-name-error" : undefined}
            />
            <FieldError id="registration-circle-name-error" message={validationErrors.careCircleName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-email">Email</Label>
            <Input
              id="registration-email"
              type="email"
              value={email}
              onChange={(event) => {
                const nextValue = event.target.value;
                setEmail(nextValue);
                revalidate({ displayName, careCircleName, email: nextValue, password, passwordConfirmation });
              }}
              autoComplete="email"
              maxLength={254}
              required
              disabled={submitting}
              aria-invalid={validationErrors.email ? true : undefined}
              aria-describedby={validationErrors.email ? "registration-email-error" : undefined}
            />
            <FieldError id="registration-email-error" message={validationErrors.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-password">Kata sandi</Label>
            <Input
              id="registration-password"
              type="password"
              value={password}
              onChange={(event) => {
                const nextValue = event.target.value;
                setPassword(nextValue);
                revalidate({ displayName, careCircleName, email, password: nextValue, passwordConfirmation });
              }}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              disabled={submitting}
              aria-invalid={validationErrors.password ? true : undefined}
              aria-describedby={validationErrors.password ? "registration-password-error" : undefined}
            />
            <FieldError id="registration-password-error" message={validationErrors.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-password-confirmation">Ulangi kata sandi</Label>
            <Input
              id="registration-password-confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => {
                const nextValue = event.target.value;
                setPasswordConfirmation(nextValue);
                revalidate({ displayName, careCircleName, email, password, passwordConfirmation: nextValue });
              }}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              disabled={submitting}
              aria-invalid={validationErrors.passwordConfirmation ? true : undefined}
              aria-describedby={validationErrors.passwordConfirmation ? "registration-password-confirmation-error" : undefined}
            />
            <FieldError
              id="registration-password-confirmation-error"
              message={validationErrors.passwordConfirmation}
            />
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
