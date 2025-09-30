// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from repo root
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // HTML + list reporter is nice locally; keep just 'html' if you prefer
  reporter: [['list'], ['html']],

  use: {
    // Use env with a safe default
    baseURL: process.env.BASE_URL || 'http://localhost:3001/',

    // Show the browser window by default (you can still override with --headless)
    headless: false,

    // Helpful for visual debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Keep traces on retries
    trace: 'on-first-retry',

    // Optional: slow things down a touch so you can see steps
    // slowMo: 100,
  },

  // Global test timeout (ms)
  timeout: 30_000,

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    // Mobile examples (uncomment if needed)
    // { name: 'iPhone 14', use: { ...devices['iPhone 14'] } },
    // { name: 'Pixel 7',   use: { ...devices['Pixel 7'] } },
  ],

  // If you need to boot a dev server first, uncomment:
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
