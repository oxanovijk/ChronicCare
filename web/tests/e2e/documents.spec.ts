import "dotenv/config";

import { readFileSync } from "node:fs";
import { basename } from "node:path";

import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const email = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const password = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;
/**
 * Path to a synthetic PDF/JPEG/PNG supplied by the operator. The happy path
 * costs one Document Intelligence call and one Azure OpenAI call per run, so
 * it only runs when this is set deliberately.
 */
const syntheticDocument = process.env.E2E_SYNTHETIC_DOCUMENT;

async function signInToDocuments(page: import("@playwright/test").Page) {
  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(email ?? "");
  await page.getByLabel("Kata sandi").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  await expect(page.getByText("Dokumen & OCR")).toBeVisible({
    timeout: 15_000,
  });
}

test("documents panel shows private-storage and no-KTP guidance", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  await signInToDocuments(page);

  await expect(page.getByText(/Jangan unggah KTP/)).toBeVisible();
  await expect(page.getByText(/File tersimpan privat/)).toBeVisible();
  await expect(page.getByText(/Maksimum 5 MB dan 3 halaman/)).toBeVisible();
});

test("unsupported file type is rejected in place with no document created", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  await signInToDocuments(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: "catatan.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bukan dokumen kesehatan"),
  });

  await expect(page.getByText("Gunakan file PDF, JPG, atau PNG.")).toBeVisible();
  await expect(page.getByText("catatan.txt")).toHaveCount(0);
});

test("upload, review, edit one field, and confirm the extraction", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  test.skip(
    !syntheticDocument,
    "Set E2E_SYNTHETIC_DOCUMENT to a synthetic file to run the live path.",
  );
  await signInToDocuments(page);

  const filePath = syntheticDocument as string;
  await page.locator('input[type="file"]').setInputFiles({
    name: basename(filePath),
    mimeType: filePath.endsWith(".pdf")
      ? "application/pdf"
      : filePath.endsWith(".png")
        ? "image/png"
        : "image/jpeg",
    buffer: readFileSync(filePath),
  });

  // OCR + mapping is synchronous on the server; allow the provider round trip.
  await expect(page.getByText("Review hasil ekstraksi")).toBeVisible({
    timeout: 90_000,
  });

  const nameField = page.getByLabel("Nama pasien (tertulis)");
  await nameField.fill("Maya Puspita (dikoreksi)");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("Perubahan tersimpan")).toBeVisible();

  await page.getByRole("button", { name: "Konfirmasi ekstraksi" }).click();
  await expect(page.getByText("Ekstraksi dikonfirmasi")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Dikonfirmasi").first()).toBeVisible();
});
