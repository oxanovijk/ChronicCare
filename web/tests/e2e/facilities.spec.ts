import "dotenv/config";

import { expect, test, type Page } from "@playwright/test";

const owner = {
  email: process.env.CAREGIVER_DEMO_OWNER_EMAIL,
  password: process.env.CAREGIVER_DEMO_OWNER_PASSWORD,
};
const family = {
  email: process.env.CAREGIVER_DEMO_FAMILY_EMAIL,
  password: process.env.CAREGIVER_DEMO_FAMILY_PASSWORD,
};
const mayaPatientCode = process.env.PATIENT_DEMO_MAYA_CODE;

async function signIn(page: Page, account: { email?: string; password?: string }) {
  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(account.email ?? "");
  await page.getByLabel("Kata sandi").fill(account.password ?? "");
  const dashboardResponse = page.waitForResponse((response) => response.url().endsWith("/dashboard"));
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  await expect(page.getByLabel("Patient Profile aktif")).toBeVisible({ timeout: 15_000 });
  const dashboard = await dashboardResponse;
  expect(dashboard.status(), await dashboard.text()).toBe(200);
}

test.describe.configure({ mode: "serial" });

test("Owner completes the stable Tangerang Raya facility and BPJS flow", async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(!owner.email || !owner.password, "Synthetic Owner credentials are unavailable.");

  expect((await page.request.get("/api/v1/facilities")).status()).toBe(401);
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, owner);

  const startedAt = Date.now();
  await page.getByRole("navigation", { name: "Navigasi caregiver" }).getByRole("link", { name: "Fasilitas Kesehatan" }).click();
  await expect(page).toHaveURL(/\/caregiver\/facilities$/);
  await expect(page.getByRole("heading", { name: "Faskes & panduan BPJS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Selamat datang/ })).toHaveCount(0);
  await expect(page.getByText("Konteks aktif: Maya Pratama")).toBeVisible();
  await page.getByRole("combobox", { name: "Kota", exact: true }).selectOption("Kota Tangerang");
  await page.getByLabel("Layanan").selectOption("Penyakit Dalam");
  await page.getByRole("checkbox", { name: "Informasi BPJS terverifikasi" }).check();
  await expect(page.getByRole("heading", { name: "RSUD Kota Tangerang" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "RS Sari Asih Cipondoh" })).toBeVisible();
  await expect(page.getByText(/Sumber: Website Resmi RSUD Kota Tangerang/i)).toBeVisible();
  await expect(page.getByText("Ditinjau 17 Juli 2026").first()).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(20_000);

  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByRole("checkbox", { name: "Unit darurat tercatat" }).check();
  await expect(page.getByRole("heading", { name: "Puskesmas Cipondoh" })).toBeVisible();

  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByRole("combobox", { name: "Kota", exact: true }).selectOption("Kabupaten Tangerang");
  await page.getByLabel("Layanan").selectOption("Dokter Umum");
  await expect(page.getByRole("heading", { name: "Tidak ada hasil pada dataset ini" })).toBeVisible();
  await expect(page.getByText(/bukan berarti fasilitas tersebut tidak ada/i)).toBeVisible();

  await page.getByRole("tab", { name: "Panduan BPJS" }).click();
  await page.getByText("Cek Status Kepesertaan JKN").click();
  await expect(page.getByText("Buka aplikasi Mobile JKN dan masuk ke akun peserta.")).toBeVisible();
  await expect(page.getByText(/Ketentuan dapat berubah/i)).toBeVisible();

  await page.getByLabel("Patient Profile aktif").selectOption({ label: "Raka Pratama" });
  await expect(page.getByText("Konteks aktif: Raka Pratama")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Kota", exact: true })).toHaveValue("");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Faskes & panduan BPJS" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi caregiver mobile" }).getByRole("link", { name: "Fasilitas" })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("Family Member can use the helper while unauthenticated callers remain denied", async ({ page }) => {
  test.skip(!family.email || !family.password, "Synthetic Family Member credentials are unavailable.");
  expect((await page.request.get("/api/v1/bpjs-guides")).status()).toBe(401);

  await signIn(page, family);
  expect((await page.request.get("/api/v1/facilities?supportsBpjs=true")).status()).toBe(200);
  expect((await page.request.get("/api/v1/bpjs-guides")).status()).toBe(200);
  await page.getByRole("navigation", { name: "Navigasi caregiver" }).getByRole("link", { name: "Fasilitas Kesehatan" }).click();
  await expect(page.getByRole("heading", { name: "Faskes & panduan BPJS" })).toBeVisible();
  await expect(page.getByText("Konteks aktif: Maya Pratama")).toBeVisible();
});

test("an authenticated Patient session cannot access caregiver facility data", async ({ page }) => {
  test.skip(!mayaPatientCode, "Synthetic Maya Patient code is unavailable.");

  await page.goto("/patient/login");
  await page.getByLabel("Kode akses Patient").fill(mayaPatientCode ?? "");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Halo, Maya Pratama" })).toBeVisible({ timeout: 15_000 });

  const facilities = await page.request.get("/api/v1/facilities");
  const guides = await page.request.get("/api/v1/bpjs-guides");
  expect(facilities.status()).toBe(401);
  expect(guides.status()).toBe(401);
  expect(await facilities.json()).not.toHaveProperty("data");
  expect(await guides.json()).not.toHaveProperty("data");

  await page.goto("/caregiver/facilities");
  await expect(page).toHaveURL(/\/patient$/);
});
