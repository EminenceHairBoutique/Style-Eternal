import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

/**
 * Playwright E2E configuration.
 * Tests run against the built dist/ served with `vite preview`.
 *
 * Env vars:
 *   E2E_BASE_URL — override the base URL (default: http://localhost:4173)
 *
 * Sandboxed environments may provide a system Chromium at a fixed path
 * (PLAYWRIGHT_BROWSERS_PATH images) whose build number doesn't match this
 * @playwright/test version — use it directly when present instead of
 * downloading a new browser.
 */

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:4173";
const SYSTEM_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(SYSTEM_CHROMIUM)
  ? { executablePath: SYSTEM_CHROMIUM }
  : {};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
  ],

  /* Start vite preview server before tests */
  webServer: {
    command: "npm run preview -- --port 4173",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
