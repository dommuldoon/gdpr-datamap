import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2etests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5177",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ],

  // Start the Vite dev server before running tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5177",
    reuseExistingServer: true,
    timeout: 30_000
  }
});
