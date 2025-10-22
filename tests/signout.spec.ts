import { test, expect } from '@playwright/test';
import { login } from '../login_flow/login.spec.ts';

test('open user menu and sign out', async ({ page }) => {
  await login(page);

  
  const youRow = page.locator('div:has-text("(You)")').first();
  const chevronInRow = youRow.locator('svg[aria-label*="chevron"], [class*="chevron"]').first();
  await expect(chevronInRow).toBeVisible({ timeout: 10_000 });
  await chevronInRow.click();

  // Sign out
  const signOutBtn = page.locator('[data-cy="sign-out"], button:has-text("Sign Out")').first();
  await expect(signOutBtn).toBeVisible({ timeout: 10_000 });
  await signOutBtn.click();

  // Verify back on login screen
  await page.waitForSelector('img[src="/connect-name-logo.svg"]', { timeout: 60_000 });
});
