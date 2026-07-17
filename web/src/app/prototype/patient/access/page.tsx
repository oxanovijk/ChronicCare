import { BrandMark } from "@/components/brand-mark";
import { PatientAccessForm } from "@/components/patient-access-form";

export default function PatientAccessPage() {
  return (
    <main className="access-page" id="main-content">
      <div className="access-orbit access-orbit-large" aria-hidden="true" />
      <div className="access-orbit access-orbit-small" aria-hidden="true" />

      <header className="access-header">
        <BrandMark />
        <span className="experiment-label">Eksperimen UI · Data sintetis</span>
      </header>

      <section className="access-content" aria-labelledby="access-title">
        <div className="access-intro">
          <span className="section-kicker">
            <span aria-hidden="true" /> Ruang perawatan pribadi
          </span>
          <h1 id="access-title">
            Selamat datang.
            <span>Kembali ke ritme perawatanmu.</span>
          </h1>
          <p>
            Satu langkah sederhana untuk melihat pengingat, memberi kabar, dan
            tetap terhubung dengan caregiver.
          </p>
        </div>

        <div className="access-panel">
          <div className="panel-marker" aria-hidden="true">
            <span>01</span>
            <i />
          </div>
          <div className="access-panel-heading">
            <span>Masuk sebagai Patient</span>
            <h2>Lanjutkan rutinitas hari ini</h2>
          </div>
          <PatientAccessForm />
        </div>
      </section>

      <footer className="access-footer">
        <span>ChroniCare</span>
        <span>Bukan layanan darurat atau pengganti tenaga medis.</span>
      </footer>
    </main>
  );
}

