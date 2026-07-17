import "dotenv/config";

import { randomBytes } from "node:crypto";

import { expect, test } from "@playwright/test";
import { Client } from "pg";

const ownerEmail = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const ownerPassword = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;
const configured = Boolean(
  ownerEmail &&
    ownerPassword &&
    process.env.DATABASE_URL &&
    process.env.DIRECT_URL &&
    process.env.PATIENT_SESSION_SECRET,
);

test.describe.configure({ mode: "serial" });

test("caregiver daily-care journey works at desktop and mobile", async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(!configured, "Synthetic caregiver and database configuration is unavailable.");

  const marker = randomBytes(5).toString("hex");
  const medicationName = `Obat sintetis QA ${marker}`;
  const reminderTitle = `Pengingat sintetis QA ${marker}`;
  const noteTitle = `Catatan sintetis QA ${marker}`;

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/caregiver");
    await page.getByLabel("Email caregiver").fill(ownerEmail ?? "");
    await page.getByLabel("Kata sandi").fill(ownerPassword ?? "");
    await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();

    const profileSelector = page.getByLabel("Patient Profile aktif");
    await expect(profileSelector).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Berikut konteks perawatan Maya Pratama sesuai informasi yang dicatat.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah pengingat" })).toBeVisible();

    await page.getByRole("button", { name: "Tambah pengingat" }).click();
    await page.getByLabel("Judul pengingat").fill(reminderTitle);
    await page.getByLabel("Waktu atau jadwal yang dicatat").fill("Besok pukul 08.00 sesuai catatan caregiver");
    const dashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const reminderResponse = page.waitForResponse((response) =>
      response.url().endsWith("/reminders") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    const createdReminder = await reminderResponse;
    expect(createdReminder.status()).toBe(201);
    const refreshedDashboard = await dashboardRefresh;
    expect(refreshedDashboard.status()).toBe(200);
    await expect(page.getByText(reminderTitle)).toBeVisible();

    await page.getByRole("button", { name: "Tambah catatan" }).click();
    await page.getByLabel("Judul catatan").fill(noteTitle);
    await page.getByLabel("Catatan singkat").fill("Koordinasikan daftar pertanyaan untuk kunjungan berikutnya.");
    const noteDashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const noteResponse = page.waitForResponse((response) =>
      response.url().endsWith("/health-notes") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    const createdNote = await noteResponse;
    expect(createdNote.status()).toBe(201);
    expect((await noteDashboardRefresh).status()).toBe(200);
    await expect(page.getByText(noteTitle)).toBeVisible();

    await page.getByRole("button", { name: "Catat obat" }).click();
    await page.getByLabel("Nama obat").fill(medicationName);
    await page.getByLabel("Dosis sesuai catatan").fill("1 unit sesuai catatan sintetis");
    await page.getByLabel("Jadwal sesuai catatan").fill("Pagi sesuai catatan caregiver");
    const medicationDashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const medicationResponse = page.waitForResponse((response) =>
      response.url().endsWith("/medications") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    const createdMedication = await medicationResponse;
    expect(createdMedication.status()).toBe(201);
    expect((await medicationDashboardRefresh).status()).toBe(200);

    const medicationRow = page.getByRole("listitem").filter({ hasText: medicationName });
    await expect(medicationRow).toBeVisible();
    const logDashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const logResponse = page.waitForResponse((response) =>
      /\/medications\/[^/]+\/logs$/.test(new URL(response.url()).pathname) && response.request().method() === "POST",
    );
    await medicationRow.getByRole("button", { name: "Catat diminum" }).click();
    const createdLog = await logResponse;
    expect(createdLog.status()).toBe(201);
    expect((await logDashboardRefresh).status()).toBe(200);
    await expect(page.getByRole("status")).toContainText("Log obat tersimpan");

    const pauseDashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const pauseResponse = page.waitForResponse((response) =>
      /\/medications\/[^/]+$/.test(new URL(response.url()).pathname) && response.request().method() === "PATCH",
    );
    await medicationRow.getByRole("button", { name: "Jeda" }).click();
    expect((await pauseResponse).status()).toBe(200);
    expect((await pauseDashboardRefresh).status()).toBe(200);
    await expect(page.getByText(medicationName)).toHaveCount(0);

    const reminderRow = page.getByRole("listitem").filter({ hasText: reminderTitle });
    const completeDashboardRefresh = page.waitForResponse((response) =>
      response.url().endsWith("/dashboard") && response.request().method() === "GET",
    );
    const completeResponse = page.waitForResponse((response) =>
      response.url().includes("/reminders/") && response.request().method() === "PATCH",
    );
    await reminderRow.getByRole("button", { name: "Tandai selesai" }).click();
    expect((await completeResponse).status()).toBe(200);
    expect((await completeDashboardRefresh).status()).toBe(200);
    await expect(page.getByText(reminderTitle)).toHaveCount(0);

    await profileSelector.selectOption({ label: "Raka Pratama" });
    await expect(page.getByText("Berikut konteks perawatan Raka Pratama sesuai informasi yang dicatat.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Belum diketahui" })).toBeVisible();
    await expect(page.getByText(noteTitle)).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("navigation", { name: "Navigasi caregiver mobile" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  } finally {
    await cleanupSyntheticDailyCare({ medicationName, reminderTitle, noteTitle });
  }
});

async function cleanupSyntheticDailyCare({
  medicationName,
  reminderTitle,
  noteTitle,
}: {
  medicationName: string;
  reminderTitle: string;
  noteTitle: string;
}) {
  if (!process.env.DIRECT_URL) return;
  const database = new Client({ connectionString: process.env.DIRECT_URL });
  await database.connect();
  try {
    await database.query("BEGIN");
    await database.query(
      `DELETE FROM audit_events
       WHERE target_id IN (SELECT id FROM medications WHERE name = $1)
          OR target_id IN (SELECT id FROM reminders WHERE title = $2)
          OR target_id IN (SELECT id FROM health_notes WHERE title = $3)
          OR target_id IN (
            SELECT ml.id FROM medication_logs ml
            JOIN medications m ON m.id = ml.medication_id
            WHERE m.name = $1
          )`,
      [medicationName, reminderTitle, noteTitle],
    );
    await database.query(
      "DELETE FROM medication_logs WHERE medication_id IN (SELECT id FROM medications WHERE name = $1)",
      [medicationName],
    );
    await database.query("DELETE FROM reminders WHERE title = $1", [reminderTitle]);
    await database.query("DELETE FROM health_notes WHERE title = $1", [noteTitle]);
    await database.query("DELETE FROM medications WHERE name = $1", [medicationName]);
    await database.query("COMMIT");
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  } finally {
    await database.end();
  }
}
