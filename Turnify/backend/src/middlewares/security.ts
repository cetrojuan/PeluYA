import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from '@/config/env.js';
import { forbidden } from '@/lib/errors.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/** Encabezados seguros, límite de tamaño del body y límite de pedidos por minuto. */
export function applySecurity(app: Express) {
  app.use(helmet());
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api', checkOrigin);
}

/**
 * Los pedidos que modifican datos solo se aceptan desde el front propio (APP_ORIGIN)
 * y con el encabezado X-Turnify-Request. Protege contra pedidos armados en otros sitios.
 */
function checkOrigin(req: Request, _res: Response, next: NextFunction) {
  const fromOurApp = req.headers.origin === env.APP_ORIGIN && req.headers['x-turnify-request'] === '1';
  if (!SAFE_METHODS.includes(req.method) && !fromOurApp) {
    return next(forbidden('Origen de solicitud no permitido', 'INVALID_ORIGIN'));
  }
  next();
}

/** Límite estricto para login, registro y cambio de contraseña. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  message: { code: 'TOO_MANY_ATTEMPTS', message: 'Demasiados intentos. Esperá 15 minutos.' },
});
