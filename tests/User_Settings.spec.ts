import { test, expect } from '@playwright/test';
import { login } from '../login_flow/login.spec.ts';

test('Navigate through user settings', async ({ page }) => {
  await login(page);

    const youRow = page.locator('div:has-text("(You)")').first();
    const chevronInRow = youRow.locator('svg[aria-label*="chevron"], [class*="chevron"]').first();
    await expect(chevronInRow).toBeVisible({ timeout: 10_000 });
    await chevronInRow.click();

    //Conversation Layout
    await page.locator('[data-cy="conversation-layout"]').click();
    await page.waitForTimeout(1000)
    //Conversation Sorting
    await page.locator('[data-cy="conversation-sorting"]').click();
    await page.waitForTimeout(1000)
    // Recent Activity
    await page.getByText('Recent Activity').click();
    await page.waitForTimeout(1000)
    // Alphabetically
    await page.getByText('Alphabetically').click();
    await page.waitForTimeout(1000)
    //Self-Managed
    await page.getByText('Self-Managed').click();
    await page.waitForTimeout(1000)

    //Notification toggle
    await page.locator('[data-cy="notification-toggle"]').click();
    await page.waitForTimeout(1000)

    //Help & Diagnostic
    await page.locator('[data-cy="help-diagnostic"]').click();
    await page.waitForTimeout(1000)

    const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByText('Connect Guides').click()

    ]);
    await newPage.waitForTimeout(2000)
    await newPage.close();
    await page.waitForTimeout(1000)

    //close User setting
    await chevronInRow.click();
    await page.waitForTimeout(1000)



});