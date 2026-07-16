import "dotenv/config";

import { expect, test } from "@playwright/test";

const ownerEmail = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const ownerPassword = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;
const mayaCode = process.env.PATIENT_DEMO_MAYA_CODE;
const coreServerConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DIRECT_URL &&
    process.env.PATIENT_SESSION_SECRET,
);
const rakaProfileId = "10000000-0000-4000-8000-000000000005";

test.describe.configure({ mode: "serial" });

test("Patient login shows one generic wrong-code error", async ({ page }) => {
  test.skip(!coreServerConfigured, "Local core server env is unavailable.");

  await page.goto("/patient/login");
  await page.getByLabel("Kode akses Patient").fill("invalid-synthetic-code");
  const loginResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/auth/patient/login"),
  );
  await page.getByRole("button", { name: "Masuk" }).click();

  expect((await loginResponse).status()).toBe(401);
  await expect(
    page.getByText("Kode tidak valid atau sudah tidak berlaku."),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel("Kode akses Patient")).toHaveValue("");
});

test("Patient homepage redirects to login without a Patient session", async ({
  page,
}) => {
  await page.goto("/patient");
  await expect(page).toHaveURL(/\/patient\/login$/);
});

test("Maya Patient session cannot read Raka or open caregiver UI", async ({
  page,
}) => {
  test.skip(!mayaCode, "Local synthetic Maya Patient code is unavailable.");
  test.skip(!coreServerConfigured, "Local core server env is unavailable.");

  await page.goto("/patient/login");
  await page.getByLabel("Kode akses Patient").fill(mayaCode ?? "");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Halo, Maya Pratama" }),
  ).toBeVisible({ timeout: 15_000 });

  const meResponse = await page.request.get("/api/v1/auth/me");
  expect(meResponse.status()).toBe(200);
  const me = await meResponse.json();
  expect(me.data.actorType).toBe("PATIENT");
  expect(me.data.patientProfile.displayName).toBe("Maya Pratama");
  expect(me.data).not.toHaveProperty("membership");
  expect(me.data).not.toHaveProperty("session");

  const crossProfile = await page.request.get(
    `/api/v1/patient-profiles/${rakaProfileId}`,
  );
  expect(crossProfile.status()).toBe(403);
  expect(JSON.stringify(await crossProfile.json())).not.toContain("Raka Pratama");

  await page.goto("/caregiver");
  await expect(page).toHaveURL(/\/patient$/);
});

test("caregiver switches Maya and Raka without stale profile details", async ({
  page,
}) => {
  test.skip(
    !ownerEmail || !ownerPassword,
    "Local synthetic Owner credentials are unavailable.",
  );
  test.skip(!coreServerConfigured, "Local core server env is unavailable.");

  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(ownerEmail ?? "");
  await page.getByLabel("Kata sandi").fill(ownerPassword ?? "");
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();

  const selector = page.getByLabel("Patient Profile aktif");
  await expect(selector).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 3, name: "Maya Pratama" }),
  ).toBeVisible();

  await selector.selectOption({ label: "Raka Pratama" });
  await expect(
    page.getByRole("heading", { level: 3, name: "Raka Pratama" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Maya Pratama" }),
  ).toHaveCount(0);

  await selector.selectOption({ label: "Maya Pratama" });
  await expect(
    page.getByRole("heading", { level: 3, name: "Maya Pratama" }),
  ).toBeVisible();
});

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`Patient login is responsive at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/patient/login");
    await expect(page.getByLabel("Kode akses Patient")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  });
}
