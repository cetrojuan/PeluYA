import { request } from './http';
import type { Appointment, AppointmentStatus, AppointmentSummary, BookingInput, Paginated, RescheduleInput } from '../models/types';

export const appointmentsApi = {
  listMine: (page = 1, status?: AppointmentStatus) => request<Paginated<Appointment>>(
    `/appointments?page=${page}${status ? `&status=${status}` : ''}`),
  summary: () => request<AppointmentSummary>('/appointments/summary'),
  book: (input: BookingInput) => request<Appointment>('/appointments', 'POST', input),
  reschedule: (id: string, input: RescheduleInput) => request<Appointment>(`/appointments/${id}`, 'PUT', input),
  setStatus: (id: string, status: Exclude<AppointmentStatus, 'PENDING'>) =>
    request<{ ok: true }>(`/appointments/${id}/status`, 'PATCH', { status }),
};
