import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('Log in through Nitro login screen', async ({ page }) => {
  await page.goto('/');

  // Open server picker
  const hiddenServerButton = page.locator('[data-cy="hidden-server-button"]');
  await expect(hiddenServerButton).toBeVisible();
  await hiddenServerButton.dblclick();

  const modalButton = page.locator('[data-cy="server-modal-button"]');
  await expect(modalButton).toBeVisible();
  await modalButton.click();

  // Be tolerant about roles: some UIs don't expose role/name on the container
  const panel = page.getByRole('dialog'); // (kept) generic dialog role
  // Wait for either the dialog container OR the visible heading “Servers”
  await Promise.any([
    panel.waitFor({ state: 'visible', timeout: 5000 }),
    page.getByRole('heading', { name: /^Servers$/i }).waitFor({ state: 'visible', timeout: 5000 }),
    page.getByRole('button', { name: /^Save$/i }).waitFor({ state: 'visible', timeout: 5000 }),
  ]).catch(() => { throw new Error('Server selector did not appear'); });

  // Click the visible "Staging" option (label/container), not the hidden input
  const stagingOption = page.locator('label:has-text("Staging")');
  await stagingOption.scrollIntoViewIfNeeded();
  await stagingOption.click();

  // Save and wait for the switch/navigation to settle
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /^Save$/i }).click(),
  ]);
  await page.waitForLoadState('networkidle');

  // Continue with Nitro login
  await page.getByRole('button', { name: /log in with nitro/i }).click();
  await page.waitForURL(/\/login(\?|$)/, { timeout: 30_000 });

  const email = page.getByPlaceholder(/email address/i);
  const pass  = page.getByPlaceholder(/passphrase/i);
  await expect(email).toBeVisible();

  // Support either USER_EMAIL/USER_PASSWORD or USERNAME/PASSWORD
  const USER = process.env.USER_EMAIL ?? process.env.USERNAME;
  const PASS = process.env.USER_PASSWORD ?? process.env.PASSWORD;
  if (!USER || !PASS) throw new Error('Missing USER_EMAIL/USER_PASSWORD (or USERNAME/PASSWORD) in .env');

  await email.fill(USER);
  await pass.fill(PASS);

  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForLoadState('networkidle');
});
