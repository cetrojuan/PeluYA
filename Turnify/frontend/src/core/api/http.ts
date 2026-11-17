// Cliente HTTP de la API. No usa nada del navegador (window, document): sirve igual en React Native.

export class ApiError extends Error {
  constructor(
    message: string,
    /** Código estable del back, ej: "SLOT_TAKEN". Usarlo para decidir, no el texto. */
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface HttpConfig {
  /** Web: "/api/v1" (mismo dominio). Móvil: la URL pública del back. */
  baseUrl: string;
  credentials: RequestCredentials;
}

let config: HttpConfig = { baseUrl: '/api/v1', credentials: 'same-origin' };
let csrfToken = '';
const sessionExpiredListeners = new Set<() => void>();

/** Cada plataforma lo llama una vez al arrancar (web: main.tsx). */
export const configureHttp = (overrides: Partial<HttpConfig>) => {
  config = { ...config, ...overrides };
};

// La contraseña y la sesión nunca se guardan: la sesión viaja en una cookie httpOnly
// y el token CSRF solo vive en memoria.
export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

/** Avisa cuando la sesión venció (401 fuera de /auth). Devuelve la función para desuscribirse. */
export function onSessionExpired(listener: () => void) {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function request<T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(config.baseUrl + path, {
    method,
    credentials: config.credentials,
    headers: { 'Content-Type': 'application/json', 'X-Turnify-Request': '1', 'X-CSRF-Token': csrfToken },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) sessionExpiredListeners.forEach((fn) => fn());
    throw new ApiError(
      data?.message || 'No se pudo completar la solicitud',
      data?.code || 'UNKNOWN',
      response.status,
    );
  }
  return data as T;
}
