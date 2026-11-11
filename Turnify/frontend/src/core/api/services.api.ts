import { request } from './http';
import type { Service, ServiceInput } from '../models/types';

export const servicesApi = {
  create: (input: ServiceInput) => request<Service>('/services', 'POST', input),
  update: (id: string, input: ServiceInput) => request<{ ok: true }>(`/services/${id}`, 'PUT', input),
  remove: (id: string) => request<{ ok: true }>(`/services/${id}`, 'DELETE', {}),
};
