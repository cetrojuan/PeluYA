import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '@/lib/errors.js';

const send = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ code, message });

export function notFoundHandler(req: Request, res: Response) {
  send(res, 404, 'ROUTE_NOT_FOUND', `No existe la ruta ${req.method} ${req.path}`);
}

// Todos los errores terminan acá (Express 5 también captura los de funciones async).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return send(res, err.status, err.code, err.message);
  if (err instanceof ZodError) {
    return send(res, 400, 'VALIDATION_ERROR', err.issues.map((issue) => issue.message).join('. '));
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return send(res, 409, 'EMAIL_TAKEN', 'Ese email ya está registrado');
    if (err.code === 'P2025') return send(res, 404, 'NOT_FOUND', 'Registro no encontrado');
    if (['P2034', 'P1008', 'P2028'].includes(err.code)) {
      return send(res, 409, 'CONCURRENT_UPDATE', 'Otra operación está en curso. Volvé a intentar');
    }
  }
  if ((err as { type?: string })?.type === 'entity.parse.failed') {
    return send(res, 400, 'INVALID_JSON', 'Solicitud inválida');
  }
  console.error('Error interno', (err as { code?: string; name?: string })?.code ?? (err as Error)?.name);
  send(res, 500, 'INTERNAL_ERROR', 'No se pudo completar la operación');
}
