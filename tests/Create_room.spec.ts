import { test, expect } from '@playwright/test';
import { login } from '../login_flow/login.spec.ts';

test('open user menu and create a room', async ({ page }) => {
  await login(page);

  const plusButton = page.locator('[data-cy="plus-sign"]');
    await expect(plusButton).toBeVisible();
    await plusButton.click();
    await page.waitForTimeout(3000);
    await page.locator('[data-cy="rooms-popup"]').click();
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Enter Room Name').fill('QA Automation Test Room');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /^Create$/ }).click();

    await page.waitForTimeout(3000);
    


    




});