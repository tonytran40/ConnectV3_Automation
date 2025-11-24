
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const TOKEN = process.env.MATRIX_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("❌ MATRIX_ACCESS_TOKEN missing in .env");
  process.exit(1);
}

const roomUrl = process.argv[2];
if (!roomUrl) {
  console.error("❌ Usage: node send_message.js \"https://connect.powerhrg.com/!room:domain\"");
  process.exit(1);
}

const match = roomUrl.match(/\/(![^/]+:[^/]+)/);
if (!match) {
  console.error("❌ Could not extract room ID from URL:", roomUrl);
  process.exit(1);
}

const ROOM_ID = match[1];

function getHomeserver(roomId) {
  if (roomId.endsWith(":staging.powerhrg.com")) {
    console.log("➡ Environment: STAGING");
    return "https://connect-server-staging.powerhrg.com";
  }
  if (roomId.endsWith(":powerhrg.com")) {
    console.log("➡ Environment: PRODUCTION");
    return "https://connect-server.powerhrg.com";
  }

  throw new Error("❌ Unknown environment — cannot determine homeserver for: " + roomId);
}

const HOMESERVER = getHomeserver(ROOM_ID);

const randomMessages = [
  "Automated QA message 🚀",
  "Testing message flow 💬",
  "Message from TonyBot 🤖",
  "@all",
  "Load test message " + Math.floor(Math.random() * 9999),
  "🔥 This is an automated stress test",
  "Matrix automation active",
  "Random QA ping " + Math.random().toString(36).substring(2, 7),
];

function getRandomMessage() {
  return randomMessages[Math.floor(Math.random() * randomMessages.length)];
}

async function sendMessage(text) {
  const txnId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const url = `${HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(
    ROOM_ID
  )}/send/m.room.message/${txnId}?access_token=${TOKEN}`;

  const payload = {
    msgtype: "m.text",
    body: text,
    format: "com.powerhrg.custom.markdown",
    formatted_body: text,
    "m.mentions": {
      room: false,
      user_ids: [],
    },
  };

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`❌ Error ${res.status}: ${txt}`);

      if (res.status === 401) {
        console.error("⚠️ Token invalid — rerun grab_matrix_info");
      }
      return;
    }

    console.log(`✅ Sent: "${text}"`);
  } catch (err) {
    console.error("❌ Network error:", err.message);
  }
}

(async () => {
  console.log("🚀 Sending messages...");
  console.log("➡ ROOM:", ROOM_ID);
  console.log("➡ Homeserver:", HOMESERVER);
  console.log("➡ Token preview:", TOKEN.slice(0, 10) + "...");

  const total = 50;

  for (let i = 0; i < total; i++) {
    await sendMessage(getRandomMessage());
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));
  }

  console.log("🎉 Done!");
})();
