import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const BASE_URL = process.env.BASE_URL || "https://connect.powerhrg.com/";

  const hasAuth = fs.existsSync("auth.json");
  const browser = await chromium.launch({ headless: false });
  const context = hasAuth
    ? await browser.newContext({ storageState: "auth.json" })
    : await browser.newContext(); 

  const page = await context.newPage();

  console.log("🌐 Opening Connect...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // ---------- first-time login flow ----------
  if (!hasAuth) {
    console.log("⚠️ No saved login found. Please log in manually...");
    await page.waitForTimeout(60000); // wait up to 1 min for manual login
    console.log("💾 Saving your login session to auth.json...");
    await context.storageState({ path: "auth.json" });
  }

  // ---------- after login: grab tokens ----------
  await page.waitForTimeout(4000);
  const matrixAccessToken = await page.evaluate(() =>
    localStorage.getItem("access_token")
  );
  const roomId =
    (await page.evaluate(() => localStorage.getItem("active_room_id"))) ||
    (await page.evaluate(() => localStorage.getItem("room_id")));

  if (!matrixAccessToken) {
    console.log("❌ Still no token. Make sure you’re fully logged in, then rerun.");
    await browser.close();
    process.exit(1);
  }

  console.log("✅ Found matrix_access_token:", matrixAccessToken.slice(0, 20) + "...");
  console.log("✅ Found roomId:", roomId || "(none)");

  // ---------- update .env ----------
  const envPath = ".env";
  let env = fs.readFileSync(envPath, "utf8");
  env = env.match(/MATRIX_ACCESS_TOKEN=/)
    ? env.replace(/MATRIX_ACCESS_TOKEN=.*/g, `MATRIX_ACCESS_TOKEN=${matrixAccessToken}`)
    : env + `\nMATRIX_ACCESS_TOKEN=${matrixAccessToken}`;
  env = env.match(/ROOM_ID=/)
    ? env.replace(/ROOM_ID=.*/g, `ROOM_ID=${roomId || ""}`)
    : env + `\nROOM_ID=${roomId || ""}`;
  fs.writeFileSync(envPath, env, "utf8");

  console.log("💾 .env updated successfully.");
  await browser.close();
})();
