import { test, expect } from '@playwright/test';
import { login } from '../login_flow/login.spec.ts';

test('open user menu and create a room', async ({ page }) => {
  await login(page);

  const plusButton = page.locator('[data-cy="plus-sign"]');
    await expect(plusButton).toBeVisible();
    await plusButton.click();
    await page.waitForTimeout(3000);
    // Click new room
    await page.locator('[data-cy="rooms-popup"]').click();
    await page.waitForTimeout(3000);
    // Enter room name
    await page.getByPlaceholder('Enter Room Name').fill('QA Automation Test Room 3 ');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /^Create$/ }).click();
    await page.waitForTimeout(3000);

  const messageInput = page.locator('p.is-editor-empty');
    await messageInput.click();
    await messageInput.fill('Test from tony');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

});