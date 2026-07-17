import { Bell, ChatCircleDots, FileText, FirstAidKit, House, MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

type CaregiverDestination = "overview" | "documents" | "assistant" | "sos" | "facilities";

const destinations = [
  { id: "overview", label: "Ringkasan", href: "/prototype/caregiver", icon: House },
  { id: "documents", label: "Dokumen", href: "/prototype/caregiver/documents/upload", icon: FileText },
  { id: "assistant", label: "Asisten", href: "/prototype/caregiver/chat", icon: ChatCircleDots },
  { id: "sos", label: "SOS", href: "/prototype/caregiver/sos", icon: FirstAidKit },
  { id: "facilities", label: "Faskes", href: "/prototype/caregiver/facilities", icon: MapPin },
];

export function CaregiverShell({ children, active, alert = false }: { children: ReactNode; active: CaregiverDestination; alert?: boolean }) {
  return (
    <div className="caregiver-shell">
      <a className="skip-link" href="#caregiver-content">Lewati ke konten utama</a>
      <aside className="caregiver-sidebar">
        <Link href="/prototype/caregiver" aria-label="Beranda ChroniCare"><BrandMark /></Link>
        <p className="sidebar-mode">Ruang Caregiver</p>
        <nav aria-label="Navigasi caregiver">
          {destinations.map((item) => {
            const Icon = item.icon;
            const current = item.id === active;
            return <Link key={item.id} className={current ? "is-active" : undefined} href={item.href} aria-current={current ? "page" : undefined}><Icon size={21} weight={current ? "fill" : "regular"} aria-hidden="true" /><span>{item.label}</span>{item.id === "sos" ? <span className="nav-alert-dot" aria-label="1 alert aktif">1</span> : null}</Link>;
          })}
        </nav>
        <div className="sidebar-person"><span>DP</span><div><strong>Dinda Pratama</strong><small>Owner · Demo</small></div></div>
      </aside>
      <div className="caregiver-stage">
        <header className="caregiver-topbar">
          <Link className="mobile-brand" href="/prototype/caregiver"><BrandMark compact /></Link>
          <div className="context-chip"><span>MP</span><div><small>Patient aktif</small><strong>Maya Pratama</strong></div></div>
          <Link className="alert-shortcut" href="/prototype/caregiver/sos" aria-label="Buka satu alert SOS"><Bell size={21} weight={alert ? "fill" : "regular"} /><span>1</span></Link>
        </header>
        {alert ? <Link className="global-sos-alert" href="/prototype/caregiver/sos" role="alert"><strong>Maya mengirim SOS</strong><span>Buka alert dan pilih siapa yang menangani.</span></Link> : null}
        <main id="caregiver-content" className="caregiver-main">{children}</main>
        <nav className="caregiver-mobile-nav" aria-label="Navigasi caregiver mobile">
          {destinations.map((item) => { const Icon = item.icon; const current = item.id === active; return <Link key={item.id} href={item.href} className={current ? "is-active" : undefined} aria-current={current ? "page" : undefined}><Icon size={21} weight={current ? "fill" : "regular"} /><span>{item.label}</span></Link>; })}
        </nav>
      </div>
    </div>
  );
}

