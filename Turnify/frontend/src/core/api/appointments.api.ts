import { request } from './http';
import type { Appointment, AppointmentStatus, BookingInput, RescheduleInput } from '../models/types';

export const appointmentsApi = {
  listMine: () => request<Appointment[]>('/appointments'),
  book: (input: BookingInput) => request<Appointment>('/appointments', 'POST', input),
  reschedule: (id: string, input: RescheduleInput) => request<Appointment>(`/appointments/${id}`, 'PUT', input),
  setStatus: (id: string, status: Exclude<AppointmentStatus, 'PENDING'>) =>
    request<{ ok: true }>(`/appointments/${id}/status`, 'PATCH', { status }),
};
