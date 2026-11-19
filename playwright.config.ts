import { defineConfig, devices } from "@playwright/test";

// DEMO_PORT lets a verification run start its own server beside a dev server the
// owner is watching on the default port.
const port = Number(process.env.DEMO_PORT ?? 5173);

export default defineConfig({
  testDir: "./e2e",
  // Default (half the cores) oversubscribes two real browsers on this demo:
  // animation-heavy pages starve and clicks land late. Four workers keep
  // both engines fed without starving frames.
  workers: 4,
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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: `pnpm exec vite --mode demo --strictPort --no-open --port ${port}`,
    url: `http://localhost:${port}`,
    // One demo server serves every run: if one is already listening on the
    // port, reuse it (Playwright leaves a reused server running afterwards);
    // otherwise Playwright starts it for this run.
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
