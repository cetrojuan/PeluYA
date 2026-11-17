import { env } from '@/config/env.js';
import { app } from '@/app.js';

app.listen(env.PORT, env.isProduction ? '0.0.0.0' : '127.0.0.1', () =>
  console.log(`Turnify iniciado en el puerto ${env.PORT} (${env.NODE_ENV})`));
