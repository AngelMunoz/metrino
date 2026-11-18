import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command: "pnpm exec vite --mode demo --strictPort --no-open",
    url: "http://localhost:5173",
    // Never reuse a server this run did not start: a leftover server from another
    // session can die mid-run and every later test then fails with connection refused.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
