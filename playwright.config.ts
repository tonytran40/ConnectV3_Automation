import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Global test timeout (default is 30s → bumping to 60s for CI slowness)
  timeout: 60_000,

  // Directory where your tests live
  testDir: './tests',

  // Run tests in parallel locally
  fullyParallel: true,

  // Fail CI if test.only is committed
  forbidOnly: !!process.env.CI,

  // Retry failing tests only on CI
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI (GitHub runners are slower)
  workers: process.env.CI ? 1 : undefined,

  // Reporters (list in terminal + html results)
  reporter: [['list'], ['html']],

  use: {
    // ✅ Headless only on CI
    headless: !!process.env.CI,

    // Longer per-action and navigation timeouts
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Collect artifacts
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],

  // Optional: start your dev server before tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
