import { expect, test } from "@playwright/test";

test.describe("shell routes", () => {
  test("root page renders ChroniCare positioning and shell links", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "ChroniCare" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Buka area caregiver" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Buka halaman masuk Patient" }),
    ).toBeVisible();
  });

  test("caregiver login renders without blank page", async ({ page }) => {
    await page.goto("/caregiver");

    await expect(
      page.getByRole("heading", { level: 1, name: "Area Caregiver" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email caregiver")).toBeVisible();
    await expect(page.getByLabel("Kata sandi")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Masuk sebagai caregiver" }),
    ).toBeVisible();
  });

  test("patient login shell renders inactive form", async ({ page }) => {
    await page.goto("/patient/login");

    await expect(
      page.getByRole("heading", { level: 1, name: "Masuk sebagai Patient" }),
    ).toBeVisible();
    await expect(page.getByLabel("Kode akses Patient")).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Masuk (belum aktif)" }),
    ).toBeDisabled();
  });
});
