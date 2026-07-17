import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

test("Care in Motion Patient Access opens Patient Home safely", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/patient/access");

  await expect(
    page.getByRole("heading", { name: /selamat datang/i }),
  ).toBeVisible();
  await expect(page.getByLabel("Kode akses")).toHaveAttribute(
    "autocomplete",
    "one-time-code",
  );
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: "test-results/care-in-motion-patient-access-390x844.png",
    fullPage: true,
    caret: "initial",
  });

  await page.getByLabel("Kode akses").fill("123456");
  await page.getByRole("button", { name: "Masuk dengan kode" }).click();
  await expect(page.locator("#patient-code-error")).toContainText(
    "Kode tidak valid atau sudah tidak berlaku",
  );
  await expect(page.getByText("Maya Pratama")).toHaveCount(0);

  await page.getByLabel("Kode akses").fill("204682");
  await page.getByRole("button", { name: "Masuk dengan kode" }).click();
  await expect(page).toHaveURL(/\/prototype\/patient\/home$/);

  await expect(
    page.getByRole("heading", { name: "Halo, Maya." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Isi check-in hari ini" }),
  ).toBeVisible();
  await expect(page.getByText("Sesuai catatan caregiver.")).toBeVisible();
  await expect(page.getByRole("link", { name: /buka sos/i })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigasi pasien" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: "test-results/care-in-motion-patient-home-390x844.png",
    fullPage: true,
    caret: "initial",
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/prototype/patient/access");
  await expect(
    page.getByRole("heading", { name: /selamat datang/i }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: "test-results/care-in-motion-patient-access-1440x900.png",
    fullPage: true,
    caret: "initial",
  });

  await page.goto("/prototype/patient/home");
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama desktop" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigasi pasien" }),
  ).toBeHidden();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: "test-results/care-in-motion-patient-home-1440x900.png",
    fullPage: true,
    caret: "initial",
  });
});

test("Care in Motion connects Screen 03–10 with honest mock states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/prototype/patient/check-in");
  await expect(page.getByRole("heading", { name: /bagaimana kabarmu/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-03-patient-check-in-390x844.png", fullPage: true, caret: "initial" });
  await page.getByRole("button", { name: /simpan check-in/i }).click();
  await expect(page.locator("#checkin-error")).toContainText("Pilih satu kabar");
  await page.getByRole("radio", { name: /butuh dukungan/i }).check();
  await page.getByLabel("Catatan tambahan (opsional)").fill("Saya ingin ditemani bicara.");
  await page.getByRole("button", { name: /simpan check-in/i }).click();
  await expect(page.getByRole("status")).toContainText("Check-in tersimpan");

  await page.goto("/prototype/patient/sos");
  await page.getByRole("button", { name: /lanjutkan ke konfirmasi/i }).click();
  await expect(page.getByRole("heading", { name: /kirim sos sekarang/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-08-patient-sos-390x844.png", fullPage: true, caret: "initial" });
  await page.getByRole("button", { name: /ya, kirim sos/i }).click();
  await expect(page.getByRole("status")).toContainText("SOS terkirim melalui ChroniCare");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/prototype/caregiver");
  await expect(page.getByRole("heading", { name: "Maya Pratama" })).toBeVisible();
  await expect(page.getByText("Kabar terbaru Maya")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-04-caregiver-dashboard-1440x900.png", fullPage: true, caret: "initial" });

  await page.goto("/prototype/caregiver/documents/upload");
  await expect(page.getByRole("heading", { name: /upload dokumen kesehatan/i })).toBeVisible();
  await expect(page.getByText(/jumlah halaman pdf diperiksa kembali di server/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-05-document-upload-1440x900.png", fullPage: true, caret: "initial" });

  await page.goto("/prototype/caregiver/documents/review");
  await expect(page.getByText("Perlu review")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-06-document-review-1440x900.png", fullPage: true, caret: "initial" });
  await page.getByRole("button", { name: /konfirmasi ekstraksi/i }).click();
  await expect(page.getByRole("status")).toContainText("Ekstraksi dikonfirmasi");

  await page.goto("/prototype/caregiver/chat");
  await expect(page.getByText("Demo fallback")).toBeVisible();
  await page.getByRole("button", { name: /siapkan pertanyaan untuk dokter/i }).click();
  await expect(page.getByText(/bukan diagnosis atau rekomendasi terapi/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-07-caregiver-assistant-1440x900.png", fullPage: true, caret: "initial" });

  await page.goto("/prototype/caregiver/sos");
  await expect(page.locator(".sos-live-card")).toContainText("Maya mengirim SOS");
  await page.getByRole("button", { name: /saya tangani/i }).click();
  await expect(page.getByRole("status")).toContainText("Ditangani oleh Dinda");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-09-caregiver-sos-1440x900.png", fullPage: true, caret: "initial" });

  await page.goto("/prototype/caregiver/facilities");
  await expect(page.getByText(/data statis tangerang/i)).toBeVisible();
  await page.getByLabel("Wilayah").selectOption("cipondoh");
  await expect(page.getByRole("heading", { name: "Puskesmas Cipondoh" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-10-facilities-1440x900.png", fullPage: true, caret: "initial" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/caregiver");
  await expect(page.getByRole("navigation", { name: /navigasi caregiver mobile/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-04-caregiver-dashboard-390x844.png", fullPage: true, caret: "initial" });

  await page.goto("/prototype/caregiver/facilities");
  await expect(page.getByRole("heading", { name: /faskes & bpjs helper/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/screen-10-facilities-390x844.png", fullPage: true, caret: "initial" });
});
