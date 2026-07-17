"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

const DEMO_CODE = "204682";
const SAFE_ERROR =
  "Kode tidak valid atau sudah tidak berlaku. Periksa kembali atau minta kode baru kepada caregiver.";

export function PatientAccessForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    },
    [],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code !== DEMO_CODE) {
      setBusy(false);
      setError(SAFE_ERROR);
      return;
    }

    setError("");
    setBusy(true);
    navigationTimer.current = setTimeout(
      () => router.push("/prototype/patient/home"),
      240,
    );
  }

  return (
    <form className="access-form" onSubmit={submit} noValidate>
      <div className="field-group">
        <label htmlFor="patient-code">Kode akses</label>
        <div className="code-input-wrap">
          <LockKey size={22} weight="bold" aria-hidden="true" />
          <input
            id="patient-code"
            name="patient-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, ""));
              if (error) setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "patient-code-hint patient-code-error" : "patient-code-hint"}
            placeholder="6 digit"
          />
        </div>
        <p className="field-hint" id="patient-code-hint">
          Kode diberikan oleh caregiver Anda.
        </p>
        {error ? (
          <p className="field-error" id="patient-code-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <button className="primary-button" type="submit" disabled={busy}>
        <span>{busy ? "Memeriksa kode…" : "Masuk dengan kode"}</span>
        {busy ? (
          <span className="button-spinner" aria-hidden="true" />
        ) : (
          <ArrowRight size={21} weight="bold" aria-hidden="true" />
        )}
      </button>

      <div className="privacy-note">
        <ShieldCheck size={20} weight="fill" aria-hidden="true" />
        <span>
          <strong>Privasi Anda tetap dijaga.</strong>
          Halaman contoh ini hanya menggunakan data sintetis.
        </span>
      </div>
    </form>
  );
}

