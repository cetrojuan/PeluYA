# Turnify - ejecución y validación

Aplicación web de turnos con panel de cliente y panel de profesional. El profesional
administra su propio negocio; no es un administrador global de todos los negocios.

## Desarrollo local

Requiere Node.js 22 o superior, Docker Desktop abierto y PostgreSQL.
Desde esta carpeta:

```powershell
docker compose up -d
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
npm ci
npm run install:all
npm run db:push
npm run db:seed
npm run dev
```

No reemplazar un `.env` existente. El frontend se abre en http://localhost:5173.
El archivo `start-windows.bat` también prepara el entorno local.

## Datos ficticios

El seed prepara 12 profesionales, dos clientes y hasta 48 turnos con distintos
estados. Usa IDs estables, conserva los registros existentes y se puede repetir.
En una base nueva, los accesos principales son:

| Rol | Email |
| --- | --- |
| Profesional | profesional@turnify.local |
| Cliente | cliente@turnify.local |
| Otro cliente | cliente2@turnify.local |

Contraseña de las cuentas creadas por el seed: `TurnifyDemo2026!`.
Las cuentas que ya existían mantienen su contraseña.

## Requisitos de seguridad y calidad de PP2

| Requisito | Implementación / comprobación |
| --- | --- |
| Datos propios | Los servicios consultan por el usuario de la sesión. Los listados, conteos y resumen aplican el mismo límite. |
| Panel de gestión protegido | `requireAuth` y `requireProfessional` en las rutas de negocio, servicios y horarios. |
| Seguridad en servidor | La API verifica sesión, rol, propiedad, origen y CSRF; ocultar botones no otorga permisos. |
| Contraseñas como hash | bcrypt con 12 rondas; la API selecciona campos públicos y omite el hash. |
| Secretos protegidos | `.env`, `.env.*` y `*.pem` ignorados; los ejemplos no contienen credenciales de producción. Revisar también el historial. |
| Validación / consultas | Schemas Zod estrictos y consultas Prisma; las vistas React presentan texto, sin HTML arbitrario. |
| Filtros y paginación | API y pantallas de turnos y profesionales; página/tamaño validados, tamaño máximo 50, orden estable. |
| Publicación | Frontend compilado servido por Express en un mismo dominio. Requiere configurar hosting, base ficticia y comprobar la URL pública. |

## Contrato de los listados

`GET /api/v1/appointments?page=1&pageSize=10&status=PENDING`

`GET /api/v1/professionals?page=1&pageSize=10&q=barberia`

Devuelven `{ items, total, page, pageSize, totalPages }`. Los filtros son opcionales.
La página vacía tiene `totalPages: 1`. Una página posterior a la última devuelve
`items: []`, manteniendo el total. Los parámetros inválidos devuelven 400.
El frontend vuelve a página 1 al cambiar el filtro.

`GET /api/v1/appointments/summary` requiere sesión y devuelve conteos propios y
hasta cuatro próximos turnos. No depende de la página ni del filtro abierto.
Estos cambios deben integrarse juntos en frontend y backend.

## Verificación

```powershell
npm --prefix backend test
npm --prefix backend run build
npm --prefix frontend run build
```

La integración escribe datos ficticios: ejecutar solamente contra una API con una
base de prueba separada, preparada con `db:push` y `db:seed`.

Con Docker Desktop abierto, este script prepara una base temporal nueva, ejecuta
el seed dos veces, comprueba volumen y hashes bcrypt, compila, prueba y elimina
solamente su propio contenedor:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/verify-local.ps1
```

No utiliza el `DATABASE_URL` de tu `.env` ni modifica bases existentes.
Por defecto usa los puertos 55432 y 4401; se pueden cambiar con `-DbPort` y `-ApiPort`.
El lanzador Node inicia las comprobaciones de API solo despues de obtener su
propio puerto y lo cierra al terminar. Si el puerto esta ocupado, aborta antes de
ejecutar las pruebas; no depende de `Get-NetTCPConnection` ni de consultas CIM.

```powershell
$env:TEST_API='http://localhost:4401/api/v1'
node tests/api-integration.mjs
```

El documento `VERIFICACION.md` distingue las comprobaciones ejecutadas de las
pendientes sobre esta revisión. Tener un script preparado no equivale a aprobarlo.

## Producción: un solo dominio

Construir ambos proyectos después de instalar las dependencias y generar Prisma:

```powershell
npm --prefix backend run db:generate
npm --prefix backend run build
npm --prefix frontend run build
```

Configurar `NODE_ENV=production`, `DATABASE_URL` de una base con datos ficticios,
`APP_ORIGIN` con la URL HTTPS pública exacta y `PORT` según el proveedor.
Iniciar con `npm --prefix backend start`. Express sirve `frontend/dist` y la API.
Si el proveedor usa un proxy inverso, configurar `TRUST_PROXY` con el número de
proxies confiables indicado por ese proveedor (por defecto 0).
Preparar las tablas y el seed en la base de demostración antes de la auditoría.
No usar el servidor de desarrollo de Vite como hosting definitivo.

## Alcance y uso de IA

Se conserva la arquitectura de la PR #2: backend modular y frontend MVVM.
Se usaron asistentes de IA para apoyar refactorización, revisión y correcciones;
los commits originales de esa PR incluyen la atribución correspondiente.
Cada integrante debe comprender y poder explicar los cambios que presenta.

El TP no procesa pagos ni envía notificaciones. El relevamiento de un negocio real,
el consentimiento para su nombre, el video y las participaciones individuales
se verifican con el equipo. No se consideran cumplidos por tener este README.
