import { profileApi } from '../api';
import type { ProfileInput } from '../models/types';
import { useApp } from './AppContext';

export function useProfileViewModel() {
  const { user, profile, isProfessional, pending, run, mutate } = useApp();
  const save = (input: ProfileInput) => run(() => mutate(() => profileApi.update(input)));
  return { user: user!, profile: profile!, isProfessional, pending, save };
}
