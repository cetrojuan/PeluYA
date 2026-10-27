# PeluYA · Turnify

App de turnos para profesionales de cualquier rubro: el cliente busca un profesional, elige servicio, día y horario, y reserva; el profesional gestiona su agenda, servicios, horarios y cobros.

Proyecto integrador de la tecnicatura. El código está en la carpeta [`Turnify/`](Turnify).

## Stack

| Parte | Tecnologías |
| --- | --- |
| Front | React 19 + TypeScript + Vite |
| Back | Node.js + Express 5 + TypeScript |
| Base de datos | PostgreSQL + Prisma / Migrada a Supabase
| Validación | Zod |
| Seguridad | Sesión en cookie httpOnly, CSRF, rate limit, Helmet, bcrypt |

## Cómo levantarlo

Requisitos: **Node.js 22+** y **Docker Desktop** (abierto).

En Windows: doble clic en `Turnify/start-windows.bat`.

A mano, desde la carpeta `Turnify`:

```bash
docker compose up -d                       # PostgreSQL
cp backend/.env.example backend/.env       # en Windows: copy backend\.env.example backend\.env
npm install && npm run install:all         # dependencias
npm run db:push                            # crea las tablas
npm run db:seed                            # datos de prueba
npm run dev                                # back :4000 + front :5173
```

Abrí http://localhost:5173. Usuarios de prueba (contraseña `TurnifyDemo2026!`):

- Profesional: `profesional@turnify.local`
- Cliente: `cliente@turnify.local`

## Tests

```bash
npm --prefix backend test                  # tests unitarios
node tests/api-integration.mjs             # pruebas de la API (con el back corriendo)
```

## Equipo

Juan · Ignacio · Pablo Luna · Sebastián
