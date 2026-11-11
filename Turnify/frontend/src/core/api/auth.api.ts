import { request } from './http';
import type { LoginInput, PasswordInput, RegisterInput, SessionData } from '../models/types';

export const authApi = {
  me: () => request<SessionData>('/auth/me'),
  login: (input: LoginInput) => request<SessionData>('/auth/login', 'POST', input),
  register: (input: RegisterInput) => request<SessionData>('/auth/register', 'POST', input),
  logout: () => request<{ ok: true }>('/auth/logout', 'POST', {}),
  changePassword: (input: PasswordInput) => request<{ ok: true }>('/auth/password', 'PUT', input),
  revokeOtherSessions: () => request<{ ok: true }>('/auth/revoke-sessions', 'POST', {}),
};
