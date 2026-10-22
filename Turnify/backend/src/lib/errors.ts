// Error HTTP con un `code` estable para que el cliente (web o móvil) decida qué hacer
// sin depender del texto. Se lanza con `throw notFound('...', 'SERVICE_NOT_FOUND')` y el
// middleware de errores responde { code, message }.

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = DEFAULT_CODES[status] ?? 'ERROR',
  ) {
    super(message);
  }
}

export const badRequest = (message: string, code?: string) => new HttpError(400, message, code);
export const unauthorized = (message: string, code?: string) => new HttpError(401, message, code);
export const forbidden = (message: string, code?: string) => new HttpError(403, message, code);
export const notFound = (message: string, code?: string) => new HttpError(404, message, code);
export const conflict = (message: string, code?: string) => new HttpError(409, message, code);
