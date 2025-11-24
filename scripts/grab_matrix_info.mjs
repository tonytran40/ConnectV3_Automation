import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const BASE_URL = process.env.BASE_URL_CONNECT;
  if (!BASE_URL) {
    console.error("❌ BASE_URL_CONNECT missing in .env");
    process.exit(1);
  }

  const hasAuth = fs.existsSync("auth.json");

  const browser = await chromium.launch({ headless: false });
  const context = hasAuth
    ? await browser.newContext({ storageState: "auth.json" })
    : await browser.newContext();

  const page = await context.newPage();

  console.log("🌐 Opening Connect...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  if (!hasAuth) {
    console.log("⚠️ No saved login found. Please log in manually...");
    await page.waitForTimeout(60000); // user logs in manually
    console.log("💾 Saving your login session to auth.json...");
    await context.storageState({ path: "auth.json" });
  }

  // Wait a bit for Connect to finish loading
  await page.waitForTimeout(3000);

  // Extract access token
  const matrixAccessToken = await page.evaluate(() =>
    localStorage.getItem("access_token")
  );

  // Try to get room id (only if user is inside a room UI)
  const roomId =
    (await page.evaluate(() => localStorage.getItem("active_room_id"))) ||
    (await page.evaluate(() => localStorage.getItem("room_id")));

  if (!matrixAccessToken) {
    console.log("❌ Still no token. Make sure you are fully logged in.");
    await browser.close();
    process.exit(1);
  }

  console.log("✅ Found matrix_access_token:", matrixAccessToken.slice(0, 20) + "...");
  console.log("✅ Found roomId:", roomId || "(none)");

  // Update .env file
  const envPath = ".env";
  let envContent = fs.readFileSync(envPath, "utf8");

  // Write/replace TOKEN
  if (envContent.includes("MATRIX_ACCESS_TOKEN=")) {
    envContent = envContent.replace(
      /MATRIX_ACCESS_TOKEN=.*/g,
      `MATRIX_ACCESS_TOKEN=${matrixAccessToken}`
    );
  } else {
    envContent += `\nMATRIX_ACCESS_TOKEN=${matrixAccessToken}`;
  }

  // Write/replace ROOM_ID
  if (envContent.includes("ROOM_ID=")) {
    envContent = envContent.replace(/ROOM_ID=.*/g, `ROOM_ID=${roomId || ""}`);
  } else {
    envContent += `\nROOM_ID=${roomId || ""}`;
  }

  fs.writeFileSync(envPath, envContent, "utf8");

  console.log("💾 .env updated successfully.");
  await browser.close();
})();
