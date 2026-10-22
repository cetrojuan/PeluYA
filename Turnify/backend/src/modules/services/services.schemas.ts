import { z } from 'zod';
import { text } from '@/lib/validation.js';

export const serviceSchema = z
  .object({
    name: text().min(2),
    description: text(1000),
    duration: z.number().int().min(5).max(480),
    price: z.number().min(0).max(100_000_000),
  })
  .strict();
export type ServiceInput = z.infer<typeof serviceSchema>;
