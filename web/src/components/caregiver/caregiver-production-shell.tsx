"use client";

import type { ReactNode } from "react";
import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { FileText } from "@phosphor-icons/react/dist/csr/FileText";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { ListChecks } from "@phosphor-icons/react/dist/csr/ListChecks";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { SignOut } from "@phosphor-icons/react/dist/csr/SignOut";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function CaregiverProductionShell({
  children,
  caregiverName,
  role,
  activeSection = "overview",
  onLogout,
  loggingOut,
}: {
  children: ReactNode;
  caregiverName: string;
  role: "OWNER" | "FAMILY_MEMBER";
  activeSection?: "overview" | "facilities";
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const initials = caregiverName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase("id-ID");
  return (
    <div className="caregiver-production-shell">
      <a className="skip-link" href="#caregiver-production-content">Lewati ke konten utama</a>
      <aside className="caregiver-production-sidebar">
        <Link href="/caregiver" aria-label="Ringkasan ChroniCare"><BrandMark /></Link>
        <p className="sidebar-mode">Ruang Caregiver</p>
        <nav aria-label="Navigasi caregiver">
          <Link href="/caregiver" className={activeSection === "overview" ? "is-active" : undefined} aria-current={activeSection === "overview" ? "page" : undefined}><House size={21} weight={activeSection === "overview" ? "fill" : "regular"} aria-hidden="true" /><span>Ringkasan</span></Link>
          <Link href="/caregiver#daily-care"><ListChecks size={21} aria-hidden="true" /><span>Perawatan</span></Link>
          <Link href="/caregiver/facilities" className={activeSection === "facilities" ? "is-active" : undefined} aria-current={activeSection === "facilities" ? "page" : undefined}><MapPin size={21} weight={activeSection === "facilities" ? "fill" : "regular"} aria-hidden="true" /><span>Fasilitas Kesehatan</span></Link>
          <span aria-disabled="true"><FileText size={21} aria-hidden="true" /><span>Dokumen</span><small>Belum tersedia</small></span>
          <span aria-disabled="true"><ChatCircleDots size={21} aria-hidden="true" /><span>Asisten</span><small>Belum tersedia</small></span>
        </nav>
        <div className="caregiver-production-person"><span>{initials}</span><div><strong>{caregiverName}</strong><small>{role === "OWNER" ? "Owner" : "Family Member"}</small></div></div>
        <Button type="button" variant="outline" onClick={onLogout} disabled={loggingOut} className="caregiver-production-logout">{loggingOut ? <SpinnerGap className="animate-spin" aria-hidden="true" /> : <SignOut aria-hidden="true" />}{loggingOut ? "Keluar…" : "Keluar"}</Button>
      </aside>
      <div className="caregiver-production-stage">
        <header className="caregiver-production-mobile-header"><BrandMark compact /><span>Ruang Caregiver</span></header>
        <main id="caregiver-production-content" className="caregiver-production-main">{children}</main>
        <nav className="caregiver-production-mobile-nav" aria-label="Navigasi caregiver mobile">
          <Link href="/caregiver" className={activeSection === "overview" ? "is-active" : undefined} aria-current={activeSection === "overview" ? "page" : undefined}><House size={20} weight={activeSection === "overview" ? "fill" : "regular"} aria-hidden="true" /><span>Ringkasan</span></Link>
          <Link href="/caregiver#daily-care"><ListChecks size={20} aria-hidden="true" /><span>Perawatan</span></Link>
          <Link href="/caregiver/facilities" className={activeSection === "facilities" ? "is-active" : undefined} aria-current={activeSection === "facilities" ? "page" : undefined}><MapPin size={20} weight={activeSection === "facilities" ? "fill" : "regular"} aria-hidden="true" /><span>Fasilitas</span></Link>
          <span aria-disabled="true"><FileText size={20} aria-hidden="true" /><span>Dokumen</span></span>
        </nav>
      </div>
    </div>
  );
}
