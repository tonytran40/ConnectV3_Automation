import {test, expect} from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('Double Click the Connect logo', async ({ page }) => {
    await page.goto('/')

// double click Connect logo
  const hiddenServerButton = page.locator('[data-cy="hidden-server-button"]');
  await expect(hiddenServerButton).toBeVisible(); // Optional: sanity check
  await hiddenServerButton.dblclick();

// Wait for server modal to appear
  const modalButton = page.locator ('[data-cy="server-modal-button"]');
  await expect(modalButton).toBeVisible();
  await modalButton.click();

// click all servers
  const options = ['Production', 'Staging', 'Local Host','Custom'];
  for (const label of options) {
    const radio = page.getByLabel(label);

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