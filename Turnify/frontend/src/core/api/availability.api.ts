import { request } from './http';
import type { AvailabilityInput } from '../models/types';

export const availabilityApi = {
  create: (input: AvailabilityInput) => request<{ ok: true }>('/availability', 'POST', input),
  remove: (id: string) => request<{ ok: true }>(`/availability/${id}`, 'DELETE', {}),
};
