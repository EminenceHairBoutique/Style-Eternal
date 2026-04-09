/**
 * tests/e2e/partners.spec.js
 * Validates the /partners page and application pages.
 */
import { test, expect } from "@playwright/test";

test.describe("Partners page", () => {
  test("loads /partners page", async ({ page }) => {
    await page.goto("/partners");
    await expect(page).toHaveTitle(/Partner/i);
    // Page should have programme overview content
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("/partners/stylists loads the stylist application form", async ({ page }) => {
    await page.goto("/partners/stylists");
    // Should have a form or application content
    await expect(page.locator("form, [data-testid='application-form'], h1, h2").first()).toBeVisible();
  });

  test("/partners/creators loads the creator application form", async ({ page }) => {
    await page.goto("/partners/creators");
    await expect(page.locator("form, [data-testid='application-form'], h1, h2").first()).toBeVisible();
  });

  test("/installers loads the certified stylist directory page", async ({ page }) => {
    await page.goto("/installers");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
