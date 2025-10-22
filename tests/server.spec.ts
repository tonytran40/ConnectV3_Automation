import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('Double Click the Connect logo', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const hiddenServerButton = page.locator('[data-cy="hidden-server-button"]');
  await expect(hiddenServerButton).toBeVisible(); // sanity check
  await hiddenServerButton.scrollIntoViewIfNeeded();

  await hiddenServerButton.dispatchEvent('dblclick');

  // Wait for server modal trigger; if not visible, fall back
  const modalButton = page.locator('[data-cy="server-modal-button"]');
  if (!(await modalButton.isVisible())) {
    // 2) Fallback: two single clicks with a tiny gap (works in WebKit headless)
    await hiddenServerButton.click({ timeout: 2000 });
    await page.waitForTimeout(80);
    await hiddenServerButton.click({ timeout: 2000 });
  }

  // Ensure the server modal trigger is visible, then click it
  await expect(modalButton).toBeVisible({ timeout: 5000 });
  await modalButton.click();

  // click all servers (your original logic)
  const options = ['Production', 'Staging', 'Local Host', 'Custom'];
  for (const label of options) {
    const radio = page.getByLabel(label);
    // (left as-is; this block doesn't do anything functional)
    const radioButtons = page.locator('.pb_radio_button');
  }
  const radioButtons = page.locator('.pb_radio_button');
  const count = await radioButtons.count();

  for (let i = 0; i < count; i++) {
    await radioButtons.nth(i).click();
    await page.waitForTimeout(1000); // 1 sec between selections
  }

  // Click the Save button
  await page.locator('[data-cy="save-server-choice"]').click();
});
