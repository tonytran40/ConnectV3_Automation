import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL; // set via .env locally, Secrets in CI
if (process.env.CI && !baseURL) {
  throw new Error('BASE_URL is required in CI (set it in GitHub Secrets).');
}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ Always generate an HTML report; keep list for readable logs
  reporter: [['list'], ['html']],

  use: {
    headless: !!process.env.CI,
    baseURL,

    // ✅ Keep artifacts so failing runs still have files to upload
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    // Add webkit back later when you want
    // { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
