import { CheckInForm } from "@/components/check-in-form";
import { PatientShell } from "@/components/patient-shell";

export default function PatientCheckInPage() {
  return (
    <PatientShell active="check-in">
      <header className="patient-page-heading">
        <span className="section-kicker"><span aria-hidden="true" /> Screen 03 · Check-in</span>
        <h1>Bagaimana kabarmu hari ini?</h1>
        <p>Cukup pilih satu jawaban. Tidak ada jawaban benar atau salah.</p>
      </header>
      <CheckInForm />
    </PatientShell>
  );
}

