import { availabilityApi } from '../api';
import type { AvailabilityInput } from '../models/types';
import { DAYS } from '../utils/format';
import { useApp } from './AppContext';

export function useAvailabilityViewModel() {
  const { profile, pending, run, mutate } = useApp();
  const slots = [...profile!.professional!.availability].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
  );

  const add = (input: AvailabilityInput) => run(() => mutate(() => availabilityApi.create(input)));
  const remove = (id: string) => run(() => mutate(() => availabilityApi.remove(id)), 'Horario retirado');

  return { days: DAYS, slots, pending, add, remove };
}
