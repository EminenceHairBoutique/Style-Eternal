/**
 * tests/e2e/home.spec.js
 * Validates the homepage loads correctly.
 */
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and renders the hero section", async ({ page }) => {
    await page.goto("/");
    // Page title should include brand name
    await expect(page).toHaveTitle(/Eminence/i);
    // Navbar should be visible
    await expect(page.locator("nav")).toBeVisible();
  });

  test("has no broken page structure (no error boundary fallback shown)", async ({ page }) => {
    await page.goto("/");
    // ErrorBoundary fallback should NOT appear
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("captures referral code from query string and stores in localStorage", async ({ page }) => {
    await page.goto("/?ref=TESTREF123");
    // Check localStorage after navigation (key is eminence_referral, stored as JSON)
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("eminence_referral");
      if (!raw) return null;
      try { return JSON.parse(raw).code; } catch { return null; }
    });
    expect(stored).toBe("TESTREF123");
  });
});
