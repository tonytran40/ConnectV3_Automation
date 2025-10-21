// tests/login.connect-or-nitro.spec.ts
import { test, expect, Locator } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test('Log in via Connect (Username/Passphrase)', async ({ page }) => {
  // --- Go to app ---
  const BASE_URL = process.env.BASE_URL;
  if (!BASE_URL) throw new Error('Missing BASE_URL in env');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // --- (Optional) Pick server per your flow ---
  // Open server picker
  await page.locator('[data-cy="hidden-server-button"]').dblclick();
  await page.locator('[data-cy="server-modal-button"]').click();

  // Pick "localhost" and Save (adjust label if your env differs)
  await page.locator('label:has-text("localhost")').click();
  await page.getByRole('button', { name: /^Save$/i }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  // --- Credentials from env ---
  const USER = process.env.USER_EMAIL ?? process.env.USERNAME;
  const PASS = process.env.USER_PASSWORD ?? process.env.PASSWORD;
  if (!USER || !PASS) throw new Error('Missing login credentials in env');

  // --- Helper to check if a locator appears quickly ---
  const appears = async (loc: Locator, timeout = 2000) => {
    try {
      await loc.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  };

  // --- Try the Connect login screen first (matches your screenshot) ---
  const connectUser = page.getByPlaceholder('Username');
  const connectPass = page.getByPlaceholder('Nitro Passphrase');

  if (await appears(connectUser)) {
    // CONNECT FLOW: fill username + passphrase and log in
    await connectUser.fill(USER);
    await connectPass.fill(PASS);
    await page.getByRole('button', { name: /^Log in$/i }).click();
  } else {
    // NITRO SSO FLOW: click the Nitro button, then fill email/passphrase
    await page.getByRole('button', { name: /log in with nitro/i }).click();
    await page.waitForURL(/\/login(\?|$)/, { timeout: 60_000 });

    const ssoEmail = page.getByPlaceholder(/email address/i);
    const ssoPass  = page.getByPlaceholder(/passphrase/i);

    await ssoEmail.fill(USER);
    await ssoPass.fill(PASS);
    await page.getByRole('button', { name: /sign in/i }).click();
  }
  
  const homeLogo = page.locator(
    '#root-login-message, img[alt="connect home image"]'
  )
  await expect(homeLogo).toBeVisible({timeout:60_000})
  await expect(homeLogo).toHaveAttribute('src',/connect-home-logo\.svg$/);
});
