import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Global test timeout (60s instead of 30s default)
  timeout: 60_000,

  // Directory where your tests live
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporters: list in terminal + html output
  reporter: [['list'], ['html']],

  use: {
    // ✅ Run headed locally, headless on CI
    headless: !!process.env.CI,

    // Longer timeouts per action/navigation to handle CI slowness
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Optional: start a dev server before tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
