# Tareas para Sebas

Dos tareas del back, independientes entre sí. Cada una lleva su rama, sus commits y su pull request.
Antes de arrancar, leé `Turnify/backend/README.md` (arquitectura en 5 minutos).

En el código ya hay comentarios `TODO (Sebas)` en los lugares exactos.

---

## Tarea 1 · Horarios libres: `GET /api/v1/professionals/:id/slots`

**Para qué:** hoy, al reservar, el cliente escribe la hora a mano y recién al enviar se entera si está ocupada.
Con este endpoint el front puede mostrar solo los horarios libres.

**Pedido:** `GET /api/v1/professionals/abc123/slots?date=2026-10-26&serviceId=xyz` (público, sin sesión)

**Respuesta:**

```json
{ "date": "2026-10-26", "serviceId": "xyz", "duration": 30, "slots": ["09:00", "09:30", "10:30"] }
```

**Reglas** (las mismas que ya usa la reserva en `appointments.service.ts → validateBooking`):

- El servicio tiene que ser de ese profesional y estar activo; si no → `notFound('…', 'SERVICE_NOT_FOUND')`.
- Se ofrecen inicios cada 30 minutos dentro de cada franja de `Availability` de ese día de la semana.
- El servicio tiene que entrar completo antes del fin de la franja.
- No puede pisarse con un turno no cancelado (`overlaps` de `@/lib/time.js`).
- No se ofrecen horarios que ya pasaron (`hasArrived` de `@/lib/clock.js`).
- Sin franjas ese día → `slots: []`.

**Dónde va cada cosa:**

| Archivo | Qué agregar |
| --- | --- |
| `modules/appointments/appointments.schemas.ts` | `slotsQuerySchema` con `date` (`isoDate`) y `serviceId` |
| `modules/appointments/appointments.service.ts` | `getAvailableSlots(professionalId, date, serviceId)` |
| `modules/appointments/appointments.controller.ts` | `getSlots(req, res)`: valida `req.params` y `req.query`, llama al service |
| `modules/professionals/professionals.routes.ts` | `professionalsRouter.get('/:id/slots', appointmentsController.getSlots)` |

**Consejo:** separá el cálculo en una función pura, sin base de datos, y testeala:

```ts
// Recibe las franjas, los turnos ocupados y la duración; devuelve ["09:00", ...]
export function computeSlots(windows: Range[], taken: Range[], duration: number): string[]
```

**Listo cuando:**

- [ ] `npm test` pasa, con al menos 3 tests nuevos de `computeSlots` (día libre, turno en el medio, servicio que no entra al final).
- [ ] `npm run typecheck` sin errores.
- [ ] Probado con Thunder Client: el profesional de prueba un lunes devuelve horarios; después de reservar 10:00, ese horario desaparece.
- [ ] `node tests/api-integration.mjs` sigue pasando (38 comprobaciones).

**Bonus (front):** en `core/viewmodels/useBookingViewModel.ts` hay un `TODO`: cargar los slots al elegir fecha y servicio,
y en `web/pages/BookingPage.tsx` mostrarlos como botones en lugar del campo de hora.

---

## Tarea 2 · Editar un horario de atención: `PUT /api/v1/availability/:id`

**Para qué:** hoy un horario solo se puede agregar o quitar. Para cambiar "09:00–18:00" a "10:00–18:00" hay que borrarlo y crearlo de nuevo.

**Pedido:** `PUT /api/v1/availability/:id` con `{ "dayOfWeek": 1, "startTime": "10:00", "endTime": "18:00" }`
(solo profesionales, con sesión).

**Reglas:**

- Mismo schema que crear (`availabilitySchema`).
- Solo se puede editar una franja propia; si no existe o es de otro → `notFound('Horario no encontrado', 'AVAILABILITY_NOT_FOUND')`.
- No se puede pisar con **otras** franjas del mismo día (excluí la que estás editando) → `conflict(..., 'AVAILABILITY_OVERLAP')`.
- Todo dentro de `prisma.$transaction(..., { isolationLevel: 'Serializable' })`, igual que `create`.

**Dónde va:** `availability.service.ts` (`update`), `availability.controller.ts` (`update`), `availability.routes.ts` (la línea comentada).

**Listo cuando:**

- [ ] Probado con Thunder Client: editar propio → 200; editar uno de otro profesional → 404; pisar otra franja → 409.
- [ ] `npm test`, `npm run typecheck` y `node tests/api-integration.mjs` pasan.

**Bonus (front):** en `web/pages/AvailabilityPage.tsx` hay un `TODO` para el botón "Editar". Sumá `update` en
`core/api/availability.api.ts` y en `useAvailabilityViewModel`.

---

## Cómo trabajar con git

```bash
git checkout refactor/arquitectura      # o main, cuando esté mergeado
git pull
git checkout -b feat/horarios-libres    # tarea 1 (tarea 2: feat/editar-horarios)
# ...trabajás y vas guardando de a poco:
git add -A
git commit -m "Agregar cálculo de horarios libres"
git push -u origin feat/horarios-libres
```

Después abrís el pull request en GitHub y pedís revisión a Pablo.
Commits chicos y con mensajes que digan qué cambia: mejor 4 commits claros que uno gigante.
