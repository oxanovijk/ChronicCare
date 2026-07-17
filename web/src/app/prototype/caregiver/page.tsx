import { CaregiverShell } from "@/components/caregiver-shell";
import { PatientContextControl } from "@/components/patient-context-control";

export default function CaregiverPrototypePage() {
  return (
    <CaregiverShell active="overview" alert>
      <PatientContextControl />
    </CaregiverShell>
  );
}
