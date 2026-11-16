# Correcciones necesarias para PP2

Referencia: Guía del Proyecto Integrador PP2, versión 4.0, sección 4.1.
Base: recuperación local 59f02f6, cuyo contenido coincide con f3e8ca0.

## Alcance de esta corrección

1. Corregir las opciones de validación incompatibles con Zod 4.
2. Paginar turnos de ambos paneles y el directorio público de profesionales.
3. Aplicar filtros en la API antes del conteo y la paginación.
4. Mantener el aislamiento por usuario también en conteos y resúmenes.
5. Proveer datos ficticios suficientes para recorrer varias páginas.
6. Permitir servir el frontend compilado desde Express en producción.

## Aceptación

- Compilan backend y frontend.
- Página por defecto 1, tamaño por defecto 10 y máximo 50.
- Cero, negativos, decimales, parámetros repetidos o valores no numéricos: 400.
- Turnos: filtro por estado, siempre limitado al usuario autenticado.
- Profesionales: búsqueda por nombre del negocio o rubro, sin datos bancarios privados.
- Orden estable: cambiar de página no repite registros si los datos no cambiaron.
- Los totales y el resumen corresponden a todos los datos propios, no a una página.
- Volver a cargar el seed no duplica los registros de demostración.
- Login, cambios de estado, CSRF y permisos anteriores continúan funcionando.

No se agregan pagos reales, notificaciones, app nativa ni funciones de IA.
El relevamiento del cliente real, los acuerdos del equipo, el video y la URL pública
deben aportarse/verificarse por separado; no se inventan como documentación.
