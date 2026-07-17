import "dotenv/config";

import { expect, test } from "@playwright/test";
import { Client } from "pg";

const mayaCode = process.env.PATIENT_DEMO_MAYA_CODE;
const coreServerConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DIRECT_URL &&
    process.env.PATIENT_SESSION_SECRET,
);
const mayaProfileId = "10000000-0000-4000-8000-000000000004";
const rakaProfileId = "10000000-0000-4000-8000-000000000005";

async function removeSyntheticCheckIn(checkInId: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM audit_events
       WHERE action = 'CHECK_IN_CREATED' AND target_type = 'CHECK_IN' AND target_id = $1::uuid`,
      [checkInId],
    );
    await client.query("DELETE FROM check_ins WHERE id = $1::uuid", [checkInId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

test("Maya completes an isolated Patient check-in at mobile and desktop", async ({
  page,
}) => {
  test.setTimeout(60_000);
  test.skip(!mayaCode, "Local synthetic Maya Patient code is unavailable.");
  test.skip(!coreServerConfigured, "Local core server env is unavailable.");

  let createdCheckInId: string | null = null;
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/patient/login");
    await page.getByLabel("Kode akses Patient").fill(mayaCode ?? "");
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Halo, Maya Pratama" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Maya Pratama · Maya", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    const okayMood = page.getByRole("radio", { name: "Biasa saja" });
    await okayMood.focus();
    await page.keyboard.press("Space");
    await expect(okayMood).toBeChecked();
    await page
      .getByLabel("Kondisi hari ini (opsional)")
      .fill("Check-in sintetis P7 untuk verifikasi QA.");
    await page.getByText("Biasa saja", { exact: true }).click();
    await expect(okayMood).toBeChecked();
    const createResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/patient-profiles/${mayaProfileId}/check-ins`) &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Simpan check-in" }).click();
    const response = await createResponse;
    expect(response.status()).toBe(201);
    const body = await response.json();
    createdCheckInId = body.data.id;
    await expect(page.getByText("Check-in berhasil disimpan")).toBeVisible();
    await expect(
      page.getByText("Check-in sintetis P7 untuk verifikasi QA."),
    ).toBeVisible();

    const crossProfile = await page.request.post(
      `/api/v1/patient-profiles/${rakaProfileId}/check-ins`,
      {
        headers: { Origin: new URL(page.url()).origin },
        data: { mood: "GOOD" },
      },
    );
    expect(crossProfile.status()).toBe(403);
    expect(JSON.stringify(await crossProfile.json())).not.toContain("Raka Pratama");

    await page.getByText("Tambahkan detail lain (opsional)").click();
    await page
      .getByLabel("Keluhan (opsional)")
      .fill("Saya sulit bernapas dan nyeri dada");
    await expect(page.getByText("Cari bantuan sekarang")).toBeVisible();
    await expect(
      page.getByText(/Segera hubungi keluarga, caregiver, atau layanan medis\/IGD/),
    ).toBeVisible();
    await expect(page.getByText(/Jangan menunggu balasan dari aplikasi ini/)).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole("button", { name: "Simpan check-in" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Check-in terbaru" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  } finally {
    if (createdCheckInId) await removeSyntheticCheckIn(createdCheckInId);
  }
});
