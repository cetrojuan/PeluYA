import 'dotenv/config';
import { z } from 'zod';

// Variables de entorno validadas al arrancar. Si falta algo, el server no levanta a medias.
const schema = z.object({
  DATABASE_URL: z.string().min(1, 'Falta DATABASE_URL (copiá backend/.env.example a backend/.env)'),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_TIMEZONE: z.string().default('America/Argentina/Buenos_Aires'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Configuración inválida en backend/.env:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

export const env = { ...parsed.data, isProduction: parsed.data.NODE_ENV === 'production' };
