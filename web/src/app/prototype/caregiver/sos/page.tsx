import { CaregiverShell } from "@/components/caregiver-shell";
import { CaregiverSosPanel } from "@/components/caregiver-sos-panel";

export default function CaregiverSosPage() { return <CaregiverShell active="sos"><header className="caregiver-page-heading danger-heading"><span className="danger-kicker">Screen 09 · Alert aktif</span><h1>Koordinasikan bantuan untuk Maya.</h1><p>Alert ini bukan layanan darurat resmi dan tidak memiliki jaminan ketika dashboard tertutup atau terputus.</p></header><CaregiverSosPanel /></CaregiverShell>; }

