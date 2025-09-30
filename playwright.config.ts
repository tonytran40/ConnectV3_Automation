import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL; 

// Fail early if BASE_URL is missing in CI
if (process.env.CI && !baseURL) {
  throw new Error('BASE_URL is required in CI. Set it via GitHub Secrets.');
}

export default defineConfig({
  testDir: './tests',
  timeout: 30_000, // global test timeout
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html']],

  use: {
    baseURL,                           // enables page.goto('/')
    headless: !!process.env.CI,        // run headless in CI, headed locally
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
