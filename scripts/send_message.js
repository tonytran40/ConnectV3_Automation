const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

// ---- Load from .env ----
const HOMESERVER = process.env.MATRIX_HOMESERVER || "https://connect.powerhrg.com";
const TOKEN = process.env.MATRIX_ACCESS_TOKEN;

// ---- Extract room URL from argument ----
const roomUrl = process.argv[2];
if (!roomUrl) {
  console.error("❌ Please pass the room URL as the first argument.");
  console.error("   Example: node send_message.js https://connect.powerhrg.com/!RoomID:powerhrg.com");
  process.exit(1);
}

const roomMatch = roomUrl.match(/\/(![^/]+:[^/]+)/);
if (!roomMatch) {
  console.error("❌ Could not extract room ID from URL:", roomUrl);
  process.exit(1);
}
const ROOM_ID = roomMatch[1];

// ---- Validate token ----
if (!TOKEN) {
  console.error("❌ MATRIX_ACCESS_TOKEN missing in .env");
  process.exit(1);
}

console.log("🚀 Sending messages");
console.log("➡ Room:", ROOM_ID);
console.log("➡ Token preview:", TOKEN.slice(0, 10) + "...");

// ---- Random message set ----
const randomMessages = [
  "Automated QA message 🚀",
  "Testing message flow 💬",
  "Message from TonyBot 🤖",
  "Hello QA team!",
  "Random test message " + Math.floor(Math.random() * 10000),
  "@mentions test @here @everyone",
  "🔥 Load testing message",
  "Matrix message automation",
];

function getRandomMessage() {
  return randomMessages[Math.floor(Math.random() * randomMessages.length)];
}

// ---- Send logic ----
async function sendMessage(bodyText) {
  const txnId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const url = `${HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(ROOM_ID)}/send/m.room.message/${txnId}?access_token=${TOKEN}`;

  const payload = {
    msgtype: "m.text",
    body: bodyText,
    format: "com.powerhrg.custom.markdown",
    formatted_body: bodyText,
    "m.mentions": {
      room: false,
      user_ids: [],
    },
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    console.log(`✅ Sent: "${bodyText}"`);
  } else {
    console.error(`❌ Error ${res.status}: ${await res.text()}`);
    if (res.status === 401) {
      console.error("⚠️ Unauthorized — token might have expired. Please rerun the grab-token script.");
    }
  }
}

// ---- Main loop ----
(async () => {
  const total = 50;
  for (let i = 1; i <= total; i++) {
    const message = getRandomMessage();
    await sendMessage(message);
    // small random delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
  }
  console.log("🎉 Done sending messages.");
})();
