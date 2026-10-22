import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from '@/config/env.js';
import { prisma } from '@/lib/prisma.js';

// La cookie lleva un valor aleatorio; en la base solo guardamos su hash.
export const SESSION_COOKIE = 'turnify_session';
const SESSION_HOURS = 8;
const cookieOptions = { httpOnly: true, secure: env.isProduction, sameSite: 'strict', path: '/api' } as const;

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function readSessionCookie(req: Request) {
  return (
    req.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1) ?? ''
  );
}

/** Crea una sesión nueva (borra la anterior de este navegador y las vencidas) y setea la cookie. */
export async function startSession(req: Request, res: Response, userId: string) {
  const previous = readSessionCookie(req);
  if (previous) await prisma.session.deleteMany({ where: { id: hashToken(previous) } });
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(32).toString('hex');
  const maxAge = SESSION_HOURS * 3_600_000;
  await prisma.session.create({
    data: { id: hashToken(token), userId, csrf, expiresAt: new Date(Date.now() + maxAge) },
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge });
  return csrf;
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

/** Compara el token CSRF recibido con el de la sesión sin filtrar información por tiempos. */
export function isValidCsrf(received: string, expected: string) {
  return (
    /^[a-f0-9]{64}$/.test(received) &&
    received.length === expected.length &&
    timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  );
}
