import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BellSimpleRinging } from "@phosphor-icons/react/dist/ssr/BellSimpleRinging";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr/ChatCircleDots";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Pill } from "@phosphor-icons/react/dist/ssr/Pill";
import { Warning } from "@phosphor-icons/react/dist/ssr/Warning";
import Link from "next/link";
import { PatientShell } from "@/components/patient-shell";

export default function PatientHomePage() {
  return (
    <PatientShell>
      <section className="home-greeting" aria-labelledby="home-title">
        <div>
          <span className="home-date">Kamis · 17 Juli</span>
          <h1 id="home-title">Halo, Maya.</h1>
          <p>Bagaimana harimu? Kita mulai dari satu kabar singkat.</p>
        </div>
        <div className="home-rhythm" aria-label="Rutinitas hari ini">
          <span className="rhythm-dot" aria-hidden="true" />
          <span>Ritme hari ini</span>
          <strong>2 hal berikutnya</strong>
        </div>
      </section>

      <section className="home-primary-grid" aria-label="Prioritas hari ini">
        <article className="motion-card">
          <div className="motion-card-orbit" aria-hidden="true" />
          <div className="motion-card-topline">
            <span className="motion-number">01</span>
            <span className="status-label">
              <CheckCircle size={17} weight="fill" aria-hidden="true" />
              Siap diisi
            </span>
          </div>
          <div className="motion-card-copy">
            <span>Check-in hari ini</span>
            <h2>Ceritakan kondisimu secara singkat.</h2>
            <p>
              Kabar sederhana membantu caregiver memahami perubahan rutinitasmu.
            </p>
          </div>
          <Link className="energy-button" href="/prototype/patient/check-in">
            <span>Isi check-in hari ini</span>
            <ArrowRight size={21} weight="bold" aria-hidden="true" />
          </Link>
        </article>

        <article className="reminder-card">
          <div className="reminder-heading">
            <span className="reminder-icon" aria-hidden="true">
              <Clock size={22} weight="bold" />
            </span>
            <span>Berikutnya</span>
          </div>
          <div className="reminder-time">
            <strong>19.00</strong>
            <span>malam ini</span>
          </div>
          <div className="reminder-detail">
            <Pill size={22} weight="fill" aria-hidden="true" />
            <div>
              <h2>Pengingat obat</h2>
              <p>Metformin · sesudah makan malam</p>
            </div>
          </div>
          <p className="recorded-note">Sesuai catatan caregiver.</p>
          <Link className="text-link" href="/prototype/patient/home#prototype-next">
            Buka detail
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </article>
      </section>

      <section className="home-actions" aria-labelledby="actions-title">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">
              <span aria-hidden="true" /> Pilihan cepat
            </span>
            <h2 id="actions-title">Apa yang ingin kamu lakukan?</h2>
          </div>
          <span className="section-index" aria-hidden="true">
            02
          </span>
        </div>

        <div className="action-grid">
          <Link className="action-tile action-tile-assistant" href="/prototype/patient/home#prototype-next">
            <span className="action-icon" aria-hidden="true">
              <ChatCircleDots size={26} weight="bold" />
            </span>
            <span>
              <strong>Tanya Asisten</strong>
              <small>Bantuan singkat untuk rutinitas dan navigasi.</small>
            </span>
            <ArrowRight size={19} weight="bold" aria-hidden="true" />
          </Link>

          <Link
            className="action-tile action-tile-reminder"
            href="/prototype/patient/home#prototype-next"
          >
            <span className="action-icon" aria-hidden="true">
              <BellSimpleRinging size={26} weight="bold" />
            </span>
            <span>
              <strong>Lihat Pengingat</strong>
              <small>Periksa catatan berikutnya dari caregiver.</small>
            </span>
            <ArrowRight size={19} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="sos-entry" aria-labelledby="sos-title">
        <span className="sos-icon" aria-hidden="true">
          <Warning size={26} weight="fill" />
        </span>
        <div className="sos-copy">
          <span>Jika butuh bantuan segera</span>
          <h2 id="sos-title">Hubungi caregiver melalui ChroniCare.</h2>
          <p>
            ChroniCare bukan layanan darurat resmi. Jika dalam bahaya, hubungi
            IGD atau layanan darurat setempat.
          </p>
        </div>
        <Link className="sos-button" href="/prototype/patient/sos">
          Buka SOS
          <ArrowRight size={20} weight="bold" aria-hidden="true" />
        </Link>
      </section>

      <footer className="patient-footer">
        <span>Eksperimen UI · Data sintetis</span>
        <span>Informasi obat berasal dari catatan caregiver.</span>
      </footer>
    </PatientShell>
  );
}
