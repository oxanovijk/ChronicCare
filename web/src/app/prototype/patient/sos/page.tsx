import { PatientShell } from "@/components/patient-shell";
import { PatientSosPanel } from "@/components/patient-sos-panel";

export default function PatientSosPage() {
  return (
    <PatientShell active="sos">
      <header className="patient-page-heading sos-page-heading">
        <span className="danger-kicker">Screen 08 · SOS</span>
        <h1>Satu langkah untuk meminta bantuan.</h1>
        <p>SOS memberi alert kepada caregiver di ChroniCare. Kamu akan diminta mengonfirmasi sebelum mengirim.</p>
      </header>
      <PatientSosPanel />
    </PatientShell>
  );
}

