import { z } from 'zod';
import { email, reminder, text } from '@/lib/validation.js';

export const updateProfileSchema = z
  .object({
    name: text().min(2),
    email,
    phone: text(30).regex(/^[+\d ()-]*$/),
    reminderPreference: reminder,
  })
  .strict();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
