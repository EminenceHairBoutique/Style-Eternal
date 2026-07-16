/**
 * tests/e2e/admin.spec.js
 * The admin panel must never render for unauthenticated visitors.
 */
import { test, expect } from "@playwright/test";

test.describe("Admin access control", () => {
  test("/admin gates unauthenticated users behind the login screen", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      try { localStorage.clear(); } catch { /* ignore */ }
    });

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const bodyText = await page.locator("body").innerText();

    const isRedirectedToLogin = url.includes("/admin/login") || !url.includes("/admin");
    const showsGate =
      /sign.?in|log.?in|access.?denied|unauthorized|admin.?only|not.?authorized/i.test(bodyText);

    expect(isRedirectedToLogin || showsGate).toBe(true);
  });

  test("admin dashboard content is not exposed on /admin/orders without auth", async ({
    page,
  }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const bodyText = await page.locator("body").innerText();

    const gated =
      url.includes("/admin/login") ||
      !url.includes("/admin") ||
      /sign.?in|log.?in|access.?denied|unauthorized/i.test(bodyText);

    expect(gated).toBe(true);
  });
});
