import { loginUser } from './authApi';

const DEFAULT_DEMO_STUDENT_EMAIL = 'student@test.com';
const DEFAULT_DEMO_STUDENT_PASSWORD = 'password123';

// Simple in-memory cache to avoid re-logging in on every request
let cachedToken: string | null = null;
let tokenFetchedAt: number | null = null;
const TOKEN_TTL_MS = 55 * 60 * 1000; // 55 minutes

function getDemoStudentCredentials() {
  return {
    email: process.env.DEMO_STUDENT_EMAIL ?? DEFAULT_DEMO_STUDENT_EMAIL,
    password: process.env.DEMO_STUDENT_PASSWORD ?? DEFAULT_DEMO_STUDENT_PASSWORD,
  };
}

export async function getDemoStudentAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenFetchedAt && now - tokenFetchedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  const credentials = getDemoStudentCredentials();
  const response = await loginUser(credentials);

  cachedToken = response.access_token;
  tokenFetchedAt = now;

  return cachedToken;
}
