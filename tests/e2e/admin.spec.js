/**
 * tests/e2e/admin.spec.js
 * Validates that /admin/partners redirects unauthenticated users.
 * Also verifies that the admin API endpoint rejects non-admin callers.
 */
import { test, expect } from "@playwright/test";

test.describe("Admin access control", () => {
  test("/admin/partners redirects or shows access denied for unauthenticated users", async ({
    page,
  }) => {
    // Clear any stored session first
    await page.goto("/");
    await page.evaluate(() => {
      try { localStorage.clear(); } catch (_) { /* ignore */ }
    });

    await page.goto("/admin/partners");

    // Should NOT show the admin dashboard content unguarded.
    // It should either redirect to / or show a 'sign in' / 'access denied' message.
    const url = page.url();
    const bodyText = await page.locator("body").innerText();

    const isRedirected = !url.includes("/admin/partners");
    const showsGate =
      /sign.?in|log.?in|access.?denied|unauthorized|admin.?only|not.?authorized/i.test(bodyText);

    expect(isRedirected || showsGate).toBe(true);
  });

  test("GET /api/admin/partner-applications returns 401 without auth", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/partner-applications");
    // Must not return 200 without valid admin token
    expect(res.status()).not.toBe(200);
    expect([401, 403, 405]).toContain(res.status());
  });

  test("POST /api/admin/partner-application-update returns 401 without auth", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/partner-application-update", {
      data: { id: "fake-id", status: "approved" },
    });
    expect(res.status()).not.toBe(200);
    expect([401, 403, 405]).toContain(res.status());
  });
});
