import { z } from 'zod';

// Piezas de validación reutilizables por todos los módulos.
export const text = (max = 120) => z.string().trim().max(max);
export const time = z.string({ required_error: 'La hora es obligatoria' }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora tiene que tener formato HH:mm');
export const isoDate = z.string({ required_error: 'La fecha es obligatoria' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha tiene que tener formato AAAA-MM-DD');
export const reminder = z.enum(['NONE', 'EMAIL', 'WHATSAPP', 'BOTH']);
export const email = z.email().max(254).transform((value) => value.toLowerCase());

export const password = z
  .string()
  .min(12, 'Usá al menos 12 caracteres')
  .max(72)
  .regex(/[a-z]/, 'Incluí minúsculas')
  .regex(/[A-Z]/, 'Incluí mayúsculas')
  .regex(/[0-9]/, 'Incluí un número')
  .refine((s) => Buffer.byteLength(s, 'utf8') <= 72, 'La contraseña es demasiado larga en UTF-8');

/** Parámetro `:id` de las rutas. */
export const idParam = z.object({ id: z.string().min(1).max(64) });
