"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { type FormEvent, useState } from "react";

export function PatientLoginForm() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedCode = code.trim();
    setCode("");
    setError(null);

    try {
      const candidate = new URL(submittedCode);
      if (candidate.protocol === "http:" || candidate.protocol === "https:") {
        setError(
          "Ini tautan undangan Family Member, bukan kode akses Patient.",
        );
        return;
      }
    } catch {
      // Patient codes are opaque values, not URLs.
    }

    setSubmitting(true);

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
    <section className="access-panel" aria-labelledby="access-form-title">
      <div className="panel-marker" aria-hidden="true"><span>01</span><i /></div>
      <div className="access-panel-heading">
        <span>Akses privat</span>
        <h2 id="access-form-title">Masukkan kode dari caregiver</h2>
      </div>

      <form className="access-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="patient-access-code">Kode akses Patient</label>
          <div className="code-input-wrap">
            <LockKey size={22} weight="bold" aria-hidden="true" />
            <input
              id="patient-access-code"
              name="code"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "patient-access-error" : "patient-access-hint"}
              placeholder="Masukkan kode akses"
            />
          </div>
          <p id="patient-access-hint" className="field-hint">Masukkan kode dari caregiver Anda.</p>
          {error ? <p id="patient-access-error" className="field-error" role="alert">{error}</p> : null}
        </div>

        <button type="submit" className="primary-button" disabled={submitting}>
          <span>{submitting ? "Memeriksa kode..." : "Masuk"}</span>
          {submitting ? <span className="button-spinner" aria-hidden="true" /> : <ArrowRight size={21} weight="bold" aria-hidden="true" />}
        </button>

        <div className="privacy-note">
          <ShieldCheck size={21} weight="bold" aria-hidden="true" />
          <span><strong>Kode tetap privat.</strong>Kode akan dikosongkan setelah dikirim dan tidak ditampilkan kembali.</span>
        </div>
      </form>
    </section>
  );
}
