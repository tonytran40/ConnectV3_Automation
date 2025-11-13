const dotenv = require('dotenv');
dotenv.config(); // Load .env from project root

console.log('🧩 ENV TEST START');
console.log('BASE_URL:', process.env.BASE_URL);
console.log('USER_EMAIL:', process.env.USER_EMAIL);
console.log('USER_PASSWORD:', process.env.USER_PASSWORD);
console.log('MATRIX_HOMESERVER:', process.env.MATRIX_HOMESERVER);
console.log('MATRIX_ACCESS_TOKEN:', process.env.MATRIX_ACCESS_TOKEN || '(empty)');
console.log('ROOM_ID:', process.env.ROOM_ID || '(empty)');
console.log('🧩 ENV TEST COMPLETE');
