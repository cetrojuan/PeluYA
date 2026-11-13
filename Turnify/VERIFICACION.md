# Verificacion actual - preparacion de la auditoria PP2

Revision del 13/11/2026 (Argentina), sobre la recuperacion local y las correcciones
de compilacion, paginacion, filtros y resumen. No certifica una version publicada.

## Comprobado en la corrida del usuario (13/11)

- Backend: `npm --prefix backend run build`, correcto.
- Frontend: `npm --prefix frontend run build`, correcto; incluye `check:core`.
- Unitarias: `npm --prefix backend test`, 10 PASS, 0 FAIL.
- PostgreSQL temporal `pp2_review`: esquema creado correctamente en puerto 55432.
- Seed ejecutado dos veces: volumen ficticio y hashes bcrypt verificados.
- Pruebas de API, volumen, filtros, paginacion y aislamiento: 120 comprobaciones
  completadas correctamente (el mensaje de 80 es un subtotal de esas 120).
- La corrida completa termino con PASS de builds, unitarias, seed repetible,
  API, paginacion y aislamiento, segun la salida aportada por el usuario.

## Comprobado durante la correccion del arnes (13/11)

- Cuatro regresiones del lanzador Node: 4 PASS, 0 FAIL. Comprueban arranque
  propio, puerto ocupado sin tocar el otro servidor, cierre ante errores y
  rechazo de configuracion ajena al entorno de prueba.
- Sintaxis de los scripts de integracion JS y del arnes PowerShell: correcta.

## Revision previa de codigo (11/11)

- Revision de codigo: sesion y rol en servidor, filtros por propietario,
  bcrypt (12 rondas), consultas Prisma y respuestas sin passwordHash.
- Busqueda acotada en el historial disponible: no aparecieron `.env` privados ni
  archivos PEM entre los nombres rastreados. No es un escaneo exhaustivo de secretos.

## Correccion del lanzador comprobada

- La primera corrida se detuvo en la consulta CIM `Get-NetTCPConnection`.
  Se reemplazo por `run-api-isolated.mjs`: el mismo proceso abre el servidor
  e inicia las pruebas tras obtener el puerto. Ante EADDRINUSE aborta sin
  dirigir escrituras a otra API. La corrida posterior completa paso.
- Las 120 comprobaciones incluyen roles, propiedad, origen, CSRF, paginacion,
  filtros, resumen y sesiones. Son comprobaciones acotadas; no certifican
  seguridad absoluta ni sustituyen el checklist de la catedra.

## Pendiente de ejecutar

- Prueba especifica de reservas simultaneas: la integracion actual comprueba
  rechazo de superposicion en pedidos secuenciales, no una carrera concurrente.
- Prueba del servidor de produccion desde HTTP local: la conexion a
  `127.0.0.1:4402` fue rechazada por el entorno con `EACCES`.
- Prueba visual automatica: Edge no pudo iniciar correctamente en esta sesion;
  la prueba no llego a ejecutar el recorrido de pantallas.
- Publicacion y auditoria desde otra computadora: URL HTTPS, cookies Secure,
  configuracion de proxy, datos ficticios y demo simultanea con ambos roles.
- Integracion con la rama del equipo y revision del Anexo 4 completo.

## Como repetir la integracion

Abrir Docker Desktop en la PC y ejecutar desde Turnify:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/verify-local.ps1
```

El script crea su propio PostgreSQL temporal, no usa el DATABASE_URL del `.env`
del desarrollador y elimina su contenedor al terminar. Los accesos de demostracion
y las instrucciones de produccion estan en README.md.

El panel de gestion corresponde al rol PROFESSIONAL: administra su negocio, no
todos los negocios. Validar esa interpretacion del rol administrador con el equipo.
Las notificaciones y los pagos en linea no estan implementados.

