import { z } from 'zod';
import { email, password, text } from '@/lib/validation.js';

export const registerSchema = z
  .object({
    name: text().min(2),
    email,
    phone: text(30).regex(/^[+\d ()-]*$/),
    password,
    role: z.enum(['CLIENT', 'PROFESSIONAL']),
  })
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) }).strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({ currentPassword: z.string().max(72), newPassword: password })
  .strict();
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
