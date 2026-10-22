import type { NextFunction, Request, Response } from 'express';
import type { Role, User } from '@prisma/client';
import { prisma } from '@/lib/prisma.js';
import { forbidden, unauthorized } from '@/lib/errors.js';
import { hashToken, isValidCsrf, readSessionCookie } from '@/modules/auth/session.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

/** Exige una sesión válida. En pedidos que modifican datos exige además el token CSRF. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const session = await prisma.session.findUnique({
    where: { id: hashToken(readSessionCookie(req)) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    throw unauthorized('Iniciá sesión nuevamente', 'SESSION_EXPIRED');
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    if (!isValidCsrf(String(req.headers['x-csrf-token'] ?? ''), session.csrf)) {
      throw forbidden('Sesión inválida. Recargá la página', 'INVALID_CSRF');
    }
  }
  req.user = session.user;
  req.sessionId = session.id;
  next();
}

/** Exige un rol. Usar siempre después de requireAuth. */
export const requireRole = (role: Role, message: string) => (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== role) throw forbidden(message, 'WRONG_ROLE');
  next();
};

export const requireProfessional = requireRole('PROFESSIONAL', 'Solo profesionales');
export const requireClient = requireRole('CLIENT', 'Reservá desde una cuenta de cliente');
