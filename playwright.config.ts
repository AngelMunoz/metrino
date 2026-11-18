import { defineConfig, devices } from "@playwright/test";

// DEMO_PORT lets a verification run start its own server beside a dev server the
// owner is watching on the default port.
const port = Number(process.env.DEMO_PORT ?? 5173);

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command: `pnpm exec vite --mode demo --strictPort --no-open --port ${port}`,
    url: `http://localhost:${port}`,
    // Never reuse a server this run did not start: a leftover server from another
    // session can die mid-run and every later test then fails with connection refused.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
