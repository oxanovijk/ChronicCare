import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr/ChatCircleDots";
import { FirstAidKit } from "@phosphor-icons/react/dist/ssr/FirstAidKit";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

const patientDestinations = [
  { id: "home", label: "Beranda", href: "/prototype/patient/home", icon: House },
  {
    id: "check-in",
    label: "Check-in",
    href: "/prototype/patient/check-in",
    icon: Heartbeat,
  },
  {
    id: "assistant",
    label: "Asisten",
    href: "/prototype/patient/home#prototype-next",
    icon: ChatCircleDots,
  },
  { id: "sos", label: "SOS", href: "/prototype/patient/sos", icon: FirstAidKit },
];

type PatientDestination = "home" | "check-in" | "assistant" | "sos";

export function PatientShell({
  children,
  active = "home",
}: {
  children: ReactNode;
  active?: PatientDestination;
}) {
  return (
    <div className="patient-shell">
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>

      <header className="patient-header">
        <Link href="/prototype/patient/home" aria-label="Beranda ChroniCare">
          <BrandMark compact />
        </Link>

        <nav
          className="patient-nav patient-nav-desktop"
          aria-label="Navigasi utama desktop"
        >
          {patientDestinations.map((destination) => {
            const Icon = destination.icon;
            const current = destination.id === active;
            return (
              <Link
                key={destination.label}
                className={current ? "is-active" : undefined}
                href={destination.href}
                aria-current={current ? "page" : undefined}
              >
                <Icon
                  size={20}
                  weight={current ? "fill" : "regular"}
                  aria-hidden="true"
                />
                <span>{destination.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="patient-profile" aria-label="Patient Profile Maya Pratama">
          <span className="patient-avatar" aria-hidden="true">
            MP
          </span>
          <span className="patient-profile-copy">
            <strong>Maya</strong>
            <small>Ruang Patient</small>
          </span>
        </div>
      </header>

      <main className="patient-main" id="main-content">
        {children}
      </main>

      <nav className="patient-nav patient-nav-mobile" aria-label="Navigasi pasien">
        {patientDestinations.map((destination) => {
          const Icon = destination.icon;
          const current = destination.id === active;
          return (
            <Link
              key={destination.label}
              className={current ? "is-active" : undefined}
              href={destination.href}
              aria-current={current ? "page" : undefined}
            >
              <Icon
                size={22}
                weight={current ? "fill" : "regular"}
                aria-hidden="true"
              />
              <span>{destination.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
