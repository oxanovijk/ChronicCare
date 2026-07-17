import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { UsersThree } from "@phosphor-icons/react/dist/ssr/UsersThree";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export default function Home() {
  return (
    <main className="role-gateway">
      <header className="role-gateway-header">
        <BrandMark />
        <span className="role-gateway-status">Care in Motion</span>
      </header>

      <section className="role-gateway-content" aria-labelledby="gateway-title">
        <div className="role-gateway-intro">
          <span className="section-kicker"><span />Ruang perawatan bersama</span>
          <h1 id="gateway-title">Satu langkah tenang untuk mulai merawat.</h1>
          <p>
            ChroniCare membantu Patient dan caregiver mengakses Care Circle
            mereka melalui jalur yang aman dan terpisah.
          </p>
        </div>

        <div className="role-choice-grid" aria-label="Pilih cara masuk">
          <article className="role-choice role-choice-patient">
            <span className="role-choice-icon" aria-hidden="true"><User size={28} weight="bold" /></span>
            <div>
              <span className="role-choice-label">Untuk Patient</span>
              <h2>Masuk dengan kode akses</h2>
              <p>Gunakan kode privat yang diberikan oleh Owner Care Circle.</p>
            </div>
            <Link href="/patient/login" className="role-choice-action">
              Buka halaman masuk Patient <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </Link>
          </article>

          <article className="role-choice role-choice-caregiver">
            <span className="role-choice-icon" aria-hidden="true"><UsersThree size={28} weight="bold" /></span>
            <div>
              <span className="role-choice-label">Untuk Caregiver</span>
              <h2>Kelola Patient Profile</h2>
              <p>Masuk sebagai Owner atau Family Member yang telah terverifikasi.</p>
            </div>
            <Link href="/caregiver" className="role-choice-action role-choice-action-secondary">
              Buka area caregiver <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <footer className="role-gateway-footer">
        <strong>Koordinasi perawatan, bukan keputusan medis.</strong>
        <span>
          ChroniCare bukan alat diagnosis, penentu dosis, atau pengganti dokter,
          IGD, ambulans, maupun BPJS.
        </span>
      </footer>
    </main>
  );
}
