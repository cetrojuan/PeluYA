# Turnify · Backend

API REST con Express 5 + TypeScript + Prisma (PostgreSQL).

## Arquitectura

Organizado **por módulos** (un módulo por tema del negocio) y, dentro de cada uno, **por capas**:

```
pedido HTTP → routes → controller → service → Prisma → PostgreSQL
```

| Capa | Archivo | Qué hace | Qué NO hace |
| --- | --- | --- | --- |
| routes | `x.routes.ts` | URL + middlewares (sesión, rol) → controller | lógica |
| controller | `x.controller.ts` | lee `req`, valida con el schema, llama al service, responde | reglas de negocio |
| service | `x.service.ts` | reglas del negocio y acceso a la base | saber de Express (`req`/`res`) |
| schemas | `x.schemas.ts` | forma de los datos que entran (zod) | — |

```
src/
├── server.ts           arranca el servidor
├── app.ts              arma Express y monta los módulos en /api/v1
├── config/env.ts       variables de entorno validadas
├── lib/                prisma, errores HTTP, validaciones comunes, horas/fechas
├── middlewares/        seguridad (helmet, rate limit, origen), sesión/CSRF, errores
└── modules/
    ├── auth/           registro, login, sesión, contraseña
    ├── profile/        datos del usuario logueado
    ├── professionals/  listado público y datos del negocio
    ├── services/       servicios del profesional
    ├── availability/   horarios de atención
    └── appointments/   turnos: reservar, reprogramar, cambiar estado
```

**Alias:** `@/` apunta a `src/`. Se importa `@/lib/errors.js` en vez de `../../lib/errors.js`.
Lo resuelven `tsx` en desarrollo y `tsc-alias` en el build.

## Convenciones

- Rutas en `/api/v1/...` (`/api/...` es un alias temporal para el front).
- Errores siempre como `{ code, message }`: `code` es estable (`SLOT_TAKEN`, `VALIDATION_ERROR`…)
  y es lo que usa el cliente para decidir; `message` es para mostrar.
- En un service, un error se lanza así: `throw notFound('Turno no encontrado', 'APPOINTMENT_NOT_FOUND')`.
  No hace falta `try/catch`: lo responde `middlewares/error.ts`.
- La sesión viaja en una cookie httpOnly; los pedidos que modifican datos llevan el header `X-CSRF-Token`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | servidor con recarga automática |
| `npm test` | tests unitarios (`src/**/*.test.ts`) |
| `npm run typecheck` | chequeo de tipos |
| `npm run build` / `npm start` | compilar y correr en producción |
| `npm run db:push` / `npm run db:seed` | crear tablas / cargar datos de prueba |
