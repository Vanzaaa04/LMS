import { apiRequest } from './httpClient';

export interface ApiAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  maxCredits?: number;
  usedCredits?: number;
  remainingCredits?: number;
}

export interface ApiLoginResponse {
  access_token: string;
  user: ApiAuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
