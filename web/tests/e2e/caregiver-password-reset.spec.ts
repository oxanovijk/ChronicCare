import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`caregiver can request password recovery at ${viewport.name}`, async ({
    page,
  }) => {
    const unexpectedErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") unexpectedErrors.push(message.text());
    });
    page.on("pageerror", (error) => unexpectedErrors.push(error.message));
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });
    await page.setViewportSize(viewport);

    await page.goto("/caregiver");
    const emailInput = page.getByLabel("Email caregiver");
    const passwordInput = page.getByLabel("Kata sandi");
    const forgotPasswordLink = page.getByRole("link", { name: "Lupa kata sandi?" });
    await emailInput.focus();
    await page.keyboard.press("Tab");
    await expect(passwordInput).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(forgotPasswordLink).toBeFocused();
    await forgotPasswordLink.click();

    await expect(
      page.getByRole("heading", { name: "Kembali ke Care Circle" }),
    ).toBeVisible();
    await page.getByLabel("Email caregiver").fill("synthetic@example.com");
    await page.getByRole("button", { name: "Kirim tautan pemulihan" }).click();
    await expect(page.getByText("Periksa email Anda")).toBeVisible();
    await expect(
      page.getByText(/Jika email tersebut terdaftar/),
    ).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    expect(unexpectedErrors).toEqual([]);
  });
}

test("an invalid recovery session cannot set a password", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/caregiver/reset-password");

  await expect(page.getByText("Tautan tidak dapat digunakan")).toBeVisible();
  await expect(page.getByLabel("Kata sandi baru")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Minta tautan baru" })).toHaveAttribute(
    "href",
    "/caregiver/forgot-password",
  );
});
