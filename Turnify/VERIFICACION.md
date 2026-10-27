# Verificación del proyecto

- Compilación TypeScript del backend: correcta.
- Compilación TypeScript y build Vite del frontend: correctos.
- Validación del esquema Prisma y creación de base SQLite: correctas.
- 4 pruebas unitarias de validación: correctas.
- 38 comprobaciones de API: correctas. Incluyen registro, login, sesiones, CSRF, propiedad de servicios/horarios/turnos, datos bancarios privados, reservas superpuestas y cierre de sesión/cambio de contraseña.
- Se verificó mediante API la confirmación y reprogramación de turnos.
- La comprobación visual automática no pudo ejecutarse: el entorno no disponía del navegador y su descarga falló. Revisá las pantallas en tu navegador al iniciar el proyecto.

Estas comprobaciones no constituyen una auditoría de seguridad ni una certificación de seguridad total. La entrega no incluye usuarios ni datos creados durante las pruebas.
