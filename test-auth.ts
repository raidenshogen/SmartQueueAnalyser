import { handleApiRequest } from './src/server/api.js';
import { initDb } from './src/server/db.js';

async function runTests() {
  console.log("Initializing DB...");
  initDb();
  
  console.log("--- Testing Signup ---");
  const signupRes = await handleApiRequest({
    type: 'auth',
    payload: { action: 'signup', email: 'test@example.com', password: 'password123', name: 'Test User' }
  });
  console.log(signupRes);

  console.log("--- Testing Login (Expecting 2FA) ---");
  const loginRes = await handleApiRequest({
    type: 'auth',
    payload: { action: 'login', email: 'test@example.com', password: 'password123' }
  });
  console.log(loginRes);

  console.log("--- Testing Verify 2FA ---");
  const verifyRes = await handleApiRequest({
    type: 'auth',
    payload: { action: 'verify-2fa', email: 'test@example.com', code: '123456' }
  });
  console.log(verifyRes);

  console.log("--- Testing Biometric ---");
  const bioRes = await handleApiRequest({
    type: 'auth',
    payload: { action: 'biometric', email: 'test@example.com' }
  });
  console.log(bioRes);

  console.log("--- Testing Google Login ---");
  const googleRes = await handleApiRequest({
    type: 'auth',
    payload: { action: 'google', email: 'google@example.com', name: 'Google User', avatarUrl: '' }
  });
  console.log(googleRes);
}

runTests().catch(console.error);
