import { z } from 'zod';
import { isoDate, reminder, text, time } from '@/lib/validation.js';
import { paginationShape } from '@/lib/pagination.js';

export const listAppointmentsSchema = z.object({
  ...paginationShape,
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
}).strict();
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsSchema>;

export const createAppointmentSchema = z
  .object({
    professionalId: z.string().min(1),
    serviceId: z.string().min(1),
    date: isoDate,
    startTime: time,
    notes: text(1000),
    reminder,
  })
  .strict();
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const rescheduleSchema = z.object({ date: isoDate, startTime: time, notes: text(1000) }).strict();

export const updateStatusSchema = z
  .object({ status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']) })
  .strict();

export const slotsQuerySchema = z.object({
  date: isoDate,
  serviceId: z.string().min(1),
}).strict();
export type SlotsQuery = z.infer<typeof slotsQuerySchema>;
