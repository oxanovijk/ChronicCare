import "dotenv/config";

import { randomBytes } from "node:crypto";

import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

test.describe.configure({ mode: "serial" });

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.DIRECT_URL,
);

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`Owner registration is responsive at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/caregiver/register");
    await expect(page.getByRole("heading", { name: "Mulai Care Circle" })).toBeVisible();
    await expect(page.getByLabel("Nama Care Circle")).toBeVisible();
    await expect(page.getByRole("button", { name: "Daftar sebagai Owner" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    const focusOrder = [
      page.getByLabel("Nama tampilan"),
      page.getByLabel("Nama Care Circle"),
      page.getByLabel("Email"),
      page.getByLabel("Kata sandi", { exact: true }),
      page.getByLabel("Ulangi kata sandi"),
      page.getByRole("button", { name: "Daftar sebagai Owner" }),
      page.getByRole("link", { name: "Sudah punya akun" }),
    ];
    await focusOrder[0].focus();
    for (const target of focusOrder) {
      await expect(target).toBeFocused();
      await page.keyboard.press("Tab");
    }
  });
}

test("Owner onboarding, Family invitation, and single-use enforcement work live", async ({
  page,
  browser,
}) => {
  expect(configured, "Synthetic Supabase and database E2E configuration must be available").toBe(true);

  const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const ownerEmail = `owner-${suffix}@chronicare.example`;
  const familyEmail = `family-${suffix}@chronicare.example`;
  const password = `Synthetic-${randomBytes(12).toString("base64url")}Aa1!`;
  const emails = [ownerEmail, familyEmail];
  const admin = createSyntheticAdminClient();
  let patientContext: Awaited<ReturnType<typeof browser.newContext>> | null = null;
  const freshErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") freshErrors.push(message.text());
  });
  page.on("pageerror", (error) => freshErrors.push(error.message));

  try {
    await createConfirmedSyntheticUser(admin, ownerEmail, password, {
      display_name: "Owner QA Sintetis",
      care_circle_name: "Care Circle QA Sintetis",
    });
    await createConfirmedSyntheticUser(admin, familyEmail, password);

    await page.goto("/caregiver");
    const ownerAuthResponse = await signInCaregiver(page, ownerEmail, password);
    expect(ownerAuthResponse.status()).toBe(409);
    await expect(
      page.getByRole("heading", { name: "Selesaikan pendaftaran Owner" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nama tampilan")).toHaveValue(
      "Owner QA Sintetis",
    );
    await expect(page.getByLabel("Nama Care Circle")).toHaveValue(
      "Care Circle QA Sintetis",
    );
    const onboardingResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/onboarding/owner") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Selesaikan pendaftaran" }).click();
    const onboardingResponse = await onboardingResponsePromise;
    expect(onboardingResponse.status()).toBe(201);

    await expect(page.getByText("Owner QA Sintetis")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Owner", { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByLabel("Nama tampilan").fill("Pasien QA Sintetis");
    await page.getByLabel("Label hubungan").fill("Diri sendiri");
    const createProfileResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/patient-profiles") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Tambahkan Patient" }).click();
    const createProfileResponse = await createProfileResponsePromise;
    expect(createProfileResponse.status()).toBe(201);
    const createdProfile = await createProfileResponse.json();
    const patientProfileId = createdProfile.data.id as string;
    await expect(
      page.getByRole("heading", { level: 3, name: "Pasien QA Sintetis" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    const firstCode = await issuePatientCode(page);
    const codeInputBounds = await page
      .getByLabel(/Kode akses Pasien QA Sintetis/)
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, viewport: window.innerWidth };
      });
    expect(codeInputBounds.left).toBeGreaterThanOrEqual(0);
    expect(codeInputBounds.right).toBeLessThanOrEqual(codeInputBounds.viewport);
    patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    patientPage.on("console", (message) => {
      if (message.type() === "error") freshErrors.push(message.text());
    });
    patientPage.on("pageerror", (error) => freshErrors.push(error.message));
    await patientPage.setViewportSize({ width: 390, height: 844 });
    await patientPage.goto("/patient/login");
    await patientPage.getByLabel("Kode akses Patient").fill(firstCode);
    await patientPage.getByRole("button", { name: "Masuk" }).click();
    await expect(
      patientPage.getByRole("heading", {
        level: 1,
        name: "Halo, Pasien QA Sintetis",
      }),
    ).toBeVisible({ timeout: 15_000 });
    const patientOwnerAction = await patientPage.request.post(
      `/api/v1/patient-profiles/${patientProfileId}/access-code`,
      { headers: { Origin: "http://localhost:3100" } },
    );
    expect(patientOwnerAction.status()).toBe(401);
    expect(
      await patientPage.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    await page.setViewportSize({ width: 1440, height: 900 });
    const secondCode = await issuePatientCode(page);
    expect(secondCode).not.toBe(firstCode);
    await patientPage.reload();
    await expect(
      patientPage.getByRole("heading", { name: "Masuk sebagai Patient" }),
    ).toBeVisible();
    await patientPage.getByLabel("Kode akses Patient").fill(firstCode);
    await patientPage.getByRole("button", { name: "Masuk" }).click();
    await expect(
      patientPage.getByText("Kode tidak valid atau sudah tidak berlaku."),
    ).toBeVisible();
    await patientPage.getByLabel("Kode akses Patient").fill(secondCode);
    await patientPage.getByRole("button", { name: "Masuk" }).click();
    await expect(
      patientPage.getByRole("heading", {
        level: 1,
        name: "Halo, Pasien QA Sintetis",
      }),
    ).toBeVisible({ timeout: 15_000 });
    await patientPage.setViewportSize({ width: 1440, height: 900 });
    expect(
      await patientPage.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    await page.getByRole("button", { name: "Buat tautan undangan" }).click();
    const inviteUrl = await page.getByLabel("Tautan undangan").inputValue();
    expect(new URL(inviteUrl).origin).toBe("http://localhost:3100");
    expect(new URL(inviteUrl).pathname).toMatch(/^\/caregiver\/invite\/[A-Za-z0-9_-]{43}$/);

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page.getByLabel("Email caregiver")).toBeVisible();
    await page.goto(inviteUrl);
    await expect(page.getByText("Gabung ke Care Circle QA Sintetis")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    await page.getByRole("tab", { name: "Sudah punya akun" }).click();
    await page.getByLabel("Nama tampilan").fill("Family QA Sintetis");
    await page.getByLabel("Email").fill(familyEmail);
    await page.getByLabel("Kata sandi", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Masuk dan bergabung" }).click();

    await expect(page.getByText("Family QA Sintetis")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Family Member", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buat tautan undangan" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Buat atau ganti kode Patient" }),
    ).toHaveCount(0);
    const familyOwnerAction = await page.request.post(
      `/api/v1/patient-profiles/${patientProfileId}/access-code`,
      { headers: { Origin: "http://localhost:3100" } },
    );
    expect(familyOwnerAction.status()).toBe(403);

    const meResponse = await page.request.get("/api/v1/auth/me");
    expect(meResponse.status()).toBe(200);
    const me = await meResponse.json();
    expect(me.data.membership.role).toBe("FAMILY_MEMBER");
    expect(me.data).not.toHaveProperty("token");
    expect(me.data).not.toHaveProperty("session");

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page.getByLabel("Email caregiver")).toBeVisible();
    await page.goto(inviteUrl);
    await expect(page.getByText("Undangan tidak tersedia")).toBeVisible();
    const expectedNegativeResponses = new Set([
      "Failed to load resource: the server responded with a status of 409 (Conflict)",
      "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
      "Failed to load resource: the server responded with a status of 403 (Forbidden)",
      "Failed to load resource: the server responded with a status of 404 (Not Found)",
    ]);
    expect(
      freshErrors.filter((message) => !expectedNegativeResponses.has(message)),
    ).toEqual([]);
    expect(freshErrors).toEqual(
      expect.arrayContaining([
        "Failed to load resource: the server responded with a status of 409 (Conflict)",
        "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
        "Failed to load resource: the server responded with a status of 404 (Not Found)",
      ]),
    );
  } finally {
    await patientContext?.close();
    await cleanupSyntheticRegistration(admin, emails);
  }
});

async function issuePatientCode(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", { name: "Buat atau ganti kode Patient" })
    .click();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/access-code") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Terbitkan kode baru" }).click();
  expect((await responsePromise).status()).toBe(201);
  return page.getByLabel(/Kode akses Pasien QA Sintetis/).inputValue();
}

async function signInCaregiver(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  const authResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/v1/auth/me"),
  );
  await page.getByLabel("Email caregiver").fill(email);
  await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  return authResponse;
}

async function createConfirmedSyntheticUser(
  admin: ReturnType<typeof createSyntheticAdminClient>,
  email: string,
  password: string,
  userMetadata?: Record<string, string>,
) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (created.error || !created.data.user) {
    throw new Error("Could not create confirmed synthetic Auth user");
  }
  return created.data.user.id;
}

async function cleanupSyntheticRegistration(
  admin: ReturnType<typeof createSyntheticAdminClient>,
  emails: string[],
) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1_000 });
  if (listed.error) throw new Error("Could not resolve synthetic Auth users for cleanup");
  const userIds = listed.data.users
    .filter((user) => user.email && emails.includes(user.email))
    .map((user) => user.id);

  if (userIds.length > 0) {
    const database = new Client({ connectionString: process.env.DIRECT_URL });
    await database.connect();
    try {
      await database.query("BEGIN");
      await database.query(
        `DELETE FROM audit_events
         WHERE actor_user_id = ANY($1::uuid[])
            OR care_circle_id IN (
              SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
            )`,
        [userIds],
      );
      await database.query(
        `DELETE FROM care_circle_invitations
         WHERE care_circle_id IN (
           SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
         )`,
        [userIds],
      );
      await database.query(
        `DELETE FROM patient_sessions
         WHERE patient_profile_id IN (
           SELECT id FROM patient_profiles
           WHERE care_circle_id IN (
             SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
           )
         )`,
        [userIds],
      );
      await database.query(
        `DELETE FROM patient_access_codes
         WHERE patient_profile_id IN (
           SELECT id FROM patient_profiles
           WHERE care_circle_id IN (
             SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
           )
         )`,
        [userIds],
      );
      await database.query(
        `DELETE FROM patient_profiles
         WHERE care_circle_id IN (
           SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
         )`,
        [userIds],
      );
      await database.query(
        `DELETE FROM care_circle_members
         WHERE user_id = ANY($1::uuid[])
            OR care_circle_id IN (
              SELECT id FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])
            )`,
        [userIds],
      );
      await database.query(
        "DELETE FROM care_circles WHERE created_by_user_id = ANY($1::uuid[])",
        [userIds],
      );
      await database.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [
        userIds,
      ]);
      await database.query("COMMIT");
    } catch (error) {
      await database.query("ROLLBACK");
      throw error;
    } finally {
      await database.end();
    }
  }

  for (const userId of userIds) {
    const deleted = await admin.auth.admin.deleteUser(userId);
    if (deleted.error) throw new Error("Could not delete synthetic Auth user");
  }
}

function createSyntheticAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
