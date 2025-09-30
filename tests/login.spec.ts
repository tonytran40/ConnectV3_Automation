import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test('Log in through Nitro login screen', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Open server picker (robust)
  const hiddenServerButton = page.locator('[data-cy="hidden-server-button"]');
  await hiddenServerButton.scrollIntoViewIfNeeded();
  await expect(hiddenServerButton).toBeVisible({ timeout: 10_000 });

  const modalButton = page.locator('[data-cy="server-modal-button"]');
  await hiddenServerButton.dispatchEvent('dblclick');

  if (!(await modalButton.isVisible())) {
    await hiddenServerButton.click({ timeout: 2_000 });
    await page.waitForTimeout(80);
    await hiddenServerButton.click({ timeout: 2_000 });

    if (!(await modalButton.isVisible())) {
      const box = await hiddenServerButton.boundingBox();
      if (box) {
        await page.mouse.click(
          box.x + box.width / 2,
          box.y + box.height / 2,
          { clickCount: 2, timeout: 2_000 }
        );
      } else {
        await hiddenServerButton.click({ clickCount: 2, timeout: 2_000 });
      }
    }
  }

  await expect(modalButton).toBeVisible({ timeout: 3_000 });
  await modalButton.click();

  // Wait for picker
  const panel = page.getByRole('dialog');
  await Promise.any([
    panel.waitFor({ state: 'visible', timeout: 5_000 }),
    page.getByRole('heading', { name: /^Servers$/i }).waitFor({ state: 'visible', timeout: 5_000 }),
    page.getByRole('button', { name: /^Save$/i }).waitFor({ state: 'visible', timeout: 5_000 }),
  ]).catch(() => { throw new Error('Server selector did not appear'); });

  // Choose Staging and save
  const stagingOption = page.locator('label:has-text("Staging")');
  await stagingOption.scrollIntoViewIfNeeded();
  await stagingOption.click();

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /^Save$/i }).click(),
  ]);
  await page.waitForLoadState('networkidle');

  // Nitro login
  await page.getByRole('button', { name: /log in with nitro/i }).click();
  await page.waitForURL(/\/login(\?|$)/, { timeout: 60_000 });

  const email = page.getByPlaceholder(/email address/i);
  const pass  = page.getByPlaceholder(/passphrase/i);
  await expect(email).toBeVisible();

  const USER = process.env.USER_EMAIL ?? process.env.USERNAME;
  const PASS = process.env.USER_PASSWORD ?? process.env.PASSWORD;
  if (!USER || !PASS) throw new Error('Missing USER_EMAIL/USER_PASSWORD (or USERNAME/PASSWORD) in environment.');

  await email.fill(USER);
  await pass.fill(PASS);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForLoadState('networkidle');
});
