/**
 * tests/e2e/wishlist.spec.js
 * Guest wishlist: heart a product on the shop grid, see the navbar count,
 * find it on /wishlist, and confirm it survives a reload (localStorage).
 */
import { test, expect } from "@playwright/test";

test.describe("Wishlist", () => {
  test("guest can save a piece and finds it on /wishlist after reload", async ({ page }) => {
    await page.goto("/shop");

    // Heart the first product card.
    const heart = page.getByRole("button", { name: /add to wishlist/i }).first();
    await heart.click();
    await expect(
      page.getByRole("button", { name: /remove from wishlist/i }).first()
    ).toBeVisible();

    // Navbar heart shows a count and links to the wishlist page.
    const navHeart = page.getByRole("link", { name: /wishlist \(1 saved\)/i });
    await expect(navHeart).toBeVisible();
    await navHeart.click();
    await expect(page).toHaveURL(/\/wishlist/);
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

    // Survives a reload — persisted, not ephemeral state.
    await page.reload();
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("se_wishlist") || "[]")
    );
    expect(stored.length).toBe(1);
  });

  test("empty wishlist shows the empty state", async ({ page }) => {
    await page.goto("/wishlist");
    await expect(page.getByText(/tap the heart on any product/i)).toBeVisible();
  });
});
