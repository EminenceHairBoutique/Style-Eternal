/**
 * tests/e2e/search.spec.js
 * Keyword search: open the modal, type a query, navigate to a result.
 */
import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("finds a product by keyword and navigates to its page", async ({ page }) => {
    await page.goto("/");

    // Open the search modal from the navbar.
    const searchButton = page.getByRole("button", { name: /search/i }).first();
    await searchButton.click();

    const input = page.getByRole("dialog").locator("input").first();
    await expect(input).toBeVisible();
    await input.fill("hoodie");

    // A matching product link should appear.
    const result = page
      .getByRole("dialog")
      .locator('a[href^="/products/"]')
      .first();
    await expect(result).toBeVisible({ timeout: 5000 });

    const href = await result.getAttribute("href");
    await result.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  test("shows an empty state for a nonsense query", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();

    const input = page.getByRole("dialog").locator("input").first();
    await input.fill("zzzznotaproductzzzz");

    await expect(
      page.getByRole("dialog").getByText(/no results|nothing found|no matches|couldn.t find/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
