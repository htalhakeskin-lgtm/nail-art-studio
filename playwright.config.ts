import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Same .env files as Next.js: the panel specs sign in with DEMO_ADMIN_* (tests/e2e/auth.setup.ts).
loadEnvConfig(process.cwd());

// End-to-end tests (14-test §2): mobile first, Turkish locale, Istanbul time zone.
const CI = Boolean(process.env.CI);
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

const shared = { locale: "tr-TR", timezoneId: "Europe/Istanbul" } as const;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0, // one retry for browser flakiness; a retried pass is reported as flaky (14-test §7)
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", ...shared },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts$/ },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], ...shared },
      testIgnore: /ekran-goruntusu/,
      dependencies: ["setup"],
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, ...shared },
      testIgnore: /ekran-goruntusu/,
      dependencies: ["setup"],
    },
    // Weekly / before release: WebKit (iPhone).
    {
      name: "iphone",
      use: { ...devices["iPhone 14"], ...shared },
      testIgnore: /ekran-goruntusu/,
      dependencies: ["setup"],
    },
    // pnpm screenshots (19-portfolyo §3)
    { name: "portfolyo", testMatch: /ekran-goruntusu\.spec\.ts/, use: { ...shared } },
  ],
  webServer: {
    command: CI ? "pnpm start" : "pnpm dev",
    url: baseURL,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
