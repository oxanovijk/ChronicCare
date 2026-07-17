"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const moods = [
  { value: "baik", label: "Baik", detail: "Rutinitas terasa cukup lancar hari ini." },
  { value: "biasa", label: "Biasa saja", detail: "Tidak ada perubahan besar yang ingin dicatat." },
  { value: "dukungan", label: "Butuh dukungan", detail: "Saya ingin caregiver melihat kabar ini lebih dekat." },
];

export function CheckInForm() {
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mood) {
      setError("Pilih satu kabar yang paling sesuai dengan harimu.");
      return;
    }
    setError("");
    setSaved(true);
  }

  if (saved) {
    return (
      <section className="result-panel result-panel-success" role="status">
        <span className="result-index">03 / Tersimpan</span>
        <h2>Check-in tersimpan.</h2>
        <p>Caregiver dapat melihat kabar terbaru ini di Patient Profile Maya.</p>
        <Link className="primary-button" href="/prototype/patient/home">Kembali ke beranda</Link>
      </section>
    );
  }

  return (
    <form className="checkin-form" onSubmit={submit} noValidate>
      <fieldset aria-describedby={error ? "checkin-error" : undefined}>
        <legend>Pilih kabarmu hari ini</legend>
        <div className="choice-stack">
          {moods.map((item, index) => (
            <label className="choice-card" key={item.value}>
              <input
                type="radio"
                name="mood"
                value={item.value}
                checked={mood === item.value}
                onChange={() => setMood(item.value)}
              />
              <span className="choice-number">0{index + 1}</span>
              <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              <span className="choice-dot" aria-hidden="true" />
            </label>
          ))}
        </div>
        {error ? <p className="form-error" id="checkin-error" role="alert">{error}</p> : null}
      </fieldset>

      <div className="field-group">
        <div className="field-label-row">
          <label htmlFor="checkin-note">Catatan tambahan <span>(opsional)</span></label>
          <span>{note.length}/240</span>
        </div>
        <textarea
          id="checkin-note"
          maxLength={240}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tulis kabar singkat yang ingin caregiver ketahui."
        />
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">Simpan check-in</button>
        {mood === "dukungan" ? (
          <p className="support-note">Butuh dukungan bukan otomatis keadaan darurat. Jika perlu bantuan segera, <Link href="/prototype/patient/sos">buka SOS</Link>.</p>
        ) : null}
      </div>
    </form>
  );
}

