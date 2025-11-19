import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const BASE_URL = process.env.BASE_URL_CONNECT;
  if (!BASE_URL) {
    console.error("❌ BASE_URL missing in .env");
    process.exit(1);
  }

  console.log("🌐 Opening:", BASE_URL);

  // ❗ ALWAYS start with a CLEAN context
  // (prevents localhost session restoring)
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(); 
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // ---------- login flow ----------
  console.log("⚠️ Please log in manually...");
  await page.waitForTimeout(60000);

  // ---------- grab tokens ----------
  const matrixAccessToken = await page.evaluate(() =>
    localStorage.getItem("access_token")
  );

  const roomId =
    (await page.evaluate(() => localStorage.getItem("active_room_id"))) ||
    (await page.evaluate(() => localStorage.getItem("room_id")));

  if (!matrixAccessToken) {
    console.log("❌ No access token found. Log in fully, then rerun.");
    await browser.close();
    process.exit(1);
  }

  console.log("✅ matrix_access_token:", matrixAccessToken.slice(0, 20) + "...");
  console.log("✅ roomId:", roomId || "(none)");

  // ---------- update .env ----------
  const envPath = ".env";
  let env = fs.readFileSync(envPath, "utf8");

  env = env.replace(/MATRIX_ACCESS_TOKEN=.*/g, "");
  env += `\nMATRIX_ACCESS_TOKEN=${matrixAccessToken}`;

  if (roomId) {
    env = env.replace(/ROOM_ID=.*/g, "");
    env += `\nROOM_ID=${roomId}`;
  }

  fs.writeFileSync(envPath, env, "utf8");

  console.log("💾 .env updated successfully.");
  await browser.close();
})();
