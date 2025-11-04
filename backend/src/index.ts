// @ts-nocheck
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

console.log('Environment variables after dotenv.config():');
console.log('PORT:', process.env.PORT);
console.log('COGNITO_REGION:', process.env.COGNITO_REGION);
console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID);
console.log('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID);

const app = require('./app');

// Use port from environment or default to 3005
const PORT = process.env.PORT || 3005;
console.log('Final PORT value:', PORT);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});