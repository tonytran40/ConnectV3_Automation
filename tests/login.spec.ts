import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test('Log in through Nitro login screen', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Open server picker
  await page.locator('[data-cy="hidden-server-button"]').dblclick();
  await page.locator('[data-cy="server-modal-button"]').click();

  // Pick Staging and save
  await page.locator('label:has-text("Staging")').click();
  await page.getByRole('button', { name: /^Save$/i }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  // Nitro login
  await page.getByRole('button', { name: /log in with nitro/i }).click();
  await page.waitForURL(/\/login(\?|$)/, { timeout: 60_000 });

  const email = page.getByPlaceholder(/email address/i);
  const pass  = page.getByPlaceholder(/passphrase/i);

  const USER = process.env.USER_EMAIL ?? process.env.USERNAME;
  const PASS = process.env.USER_PASSWORD ?? process.env.PASSWORD;
  if (!USER || !PASS) throw new Error('Missing login credentials in env');

  await email.fill(USER);
  await pass.fill(PASS);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Basic post-login wait
  await page.waitForLoadState('domcontentloaded');
});
