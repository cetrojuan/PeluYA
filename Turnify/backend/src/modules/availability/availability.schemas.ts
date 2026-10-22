import { z } from 'zod';
import { time } from '@/lib/validation.js';

export const availabilitySchema = z
  .object({ dayOfWeek: z.number().int().min(0).max(6), startTime: time, endTime: time })
  .strict()
  .refine((a) => a.endTime > a.startTime, 'El fin debe ser posterior al inicio');
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
