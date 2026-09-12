import { expect, test } from "@playwright/test";

test("public home renders without a fatal page error", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Application error");
});

test("client portal login renders", async ({ page }) => {
  await page.goto("/portal/login");
  await expect(page.getByRole("heading", { name: "تسجيل دخول العميل" })).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور")).toBeVisible();
});

test("unknown route is handled by the SPA", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.locator("body")).toBeVisible();
});
