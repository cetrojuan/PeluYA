import { request } from './http';
import type { Profile, ProfileInput, User } from '../models/types';

export const profileApi = {
  get: () => request<Profile>('/profile'),
  update: (input: ProfileInput) => request<User>('/profile', 'PUT', input),
};
