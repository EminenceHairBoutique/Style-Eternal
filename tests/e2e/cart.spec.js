/**
 * tests/e2e/cart.spec.js
 * Cart drawer correctness — most importantly the two-sizes regression:
 * removing one size of a product must not remove the other size.
 */
import { test, expect } from "@playwright/test";

// Runs before any page script on every navigation, so the CartProvider's
// useState initializer sees the seeded storage.
const seedTwoSizes = () => {
  const line = (size) => ({
    id: "se-lnd-tee-black",
    slug: "love-never-dies-tee",
    name: "Love Never Dies Tee",
    price: 75,
    quantity: 1,
    size,
    colorway: null,
    cartKey: `se-lnd-tee-black::${size}::`,
    variant: `se-lnd-tee-black::${size}::`,
  });
  localStorage.setItem("se_cart", JSON.stringify([line("M"), line("L")]));
};

test.describe("Cart", () => {
  test("removing one size in the drawer keeps the other size", async ({ page }) => {
    await page.addInitScript(seedTwoSizes);
    await page.goto("/");

    // Open the cart drawer from the navbar.
    await page.getByRole("button", { name: /cart|bag/i }).first().click();

    const drawer = page.locator("aside");
    await expect(drawer.getByText("Size M", { exact: false })).toBeVisible();
    await expect(drawer.getByText("Size L", { exact: false })).toBeVisible();

    // Remove the first line (size M).
    await drawer.getByRole("button", { name: /^remove$/i }).first().click();

    // The L line must survive — this was the remove-all-variants bug.
    await expect(drawer.getByText("Size L", { exact: false })).toBeVisible();
    await expect(drawer.getByText("Size M", { exact: false })).toHaveCount(0);

    // And storage agrees.
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("se_cart") || "[]")
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].size).toBe("L");
  });

  test("free-shipping meter reflects the subtotal", async ({ page }) => {
    await page.addInitScript(seedTwoSizes); // 2 × $75 = $150 → threshold reached
    await page.goto("/");

    await page.getByRole("button", { name: /cart|bag/i }).first().click();
    const drawer = page.locator("aside");
    await expect(drawer.getByText(/free shipping unlocked/i)).toBeVisible();

    // Drop one line → $75 → below the threshold.
    await drawer.getByRole("button", { name: /^remove$/i }).first().click();
    await expect(drawer.getByText(/away from\s+free shipping/i)).toBeVisible();
  });

  test("quantity steppers update line totals in the cart page", async ({ page }) => {
    await page.addInitScript(seedTwoSizes);
    await page.goto("/cart");
    const increase = page.getByRole("button", { name: /increase quantity/i }).first();
    await increase.click();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("se_cart") || "[]")
    );
    expect(stored[0].quantity).toBe(2);
  });
});
