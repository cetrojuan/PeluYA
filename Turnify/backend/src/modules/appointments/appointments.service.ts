import type { User } from '@prisma/client';
import { prisma, type Tx } from '@/lib/prisma.js';
import { badRequest, conflict, forbidden, notFound } from '@/lib/errors.js';
import { dayToDb, overlaps, toHHMM, toMinutes } from '@/lib/time.js';
import { hasArrived } from '@/lib/clock.js';
import type { CreateAppointmentInput } from './appointments.schemas.js';

const MAX_DAYS_AHEAD = 366;
const CLOSED_STATUSES = ['CANCELLED', 'COMPLETED'];

/** Función pura: dado las franjas, los turnos ocupados y la duración, devuelve los horarios libres */
export function computeSlots(
  windows: { startTime: string; endTime: string }[],
  taken: { startTime: string; endTime: string }[],
  duration: number,
): string[] {
  const slots: string[] = [];
  for (const w of windows) {
    let current = toMinutes(w.startTime);
    const windowEnd = toMinutes(w.endTime);
    while (current + duration <= windowEnd) {
      const start = toHHMM(current);
      const end = toHHMM(current + duration);
      // Verifica que no se pise con ningún turno ocupado
      const isTaken = taken.some((t) => overlaps(start, end, t.startTime, t.endTime));
      if (!isTaken) slots.push(start);
      current += 30;
    }
  }
  return slots;
}

/** Devuelve los horarios de inicio libres para un profesional en una fecha dada */
export async function getAvailableSlots(professionalId: string, date: string, serviceId: string) {
  const dbDate = dayToDb(date);
  if (isNaN(+dbDate)) throw badRequest('Fecha inválida', 'INVALID_DATE');
  const dayOfWeek = dbDate.getUTCDay();

  // Verifica que el servicio sea de ese profesional y esté activo
  const service = await prisma.service.findFirst({
    where: { id: serviceId, professionalId, active: true },
  });
  if (!service) throw notFound('Servicio no encontrado', 'SERVICE_NOT_FOUND');

  // Busca las franjas horarias del profesional para ese día
  const windows = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek },
    orderBy: { startTime: 'asc' },
  });
  if (!windows.length) return { date, serviceId, duration: service.duration, slots: [] };

  // Busca los turnos ya ocupados ese día
  const taken = await prisma.appointment.findMany({
    where: { professionalId, date: dbDate, status: { notIn: ['CANCELLED'] } },
    select: { startTime: true, endTime: true },
  });

  // Filtra los horarios que ya pasaron
  const allSlots = computeSlots(windows, taken, service.duration);
  const slots = allSlots.filter((s) => !hasArrived(date, s));

  return { date, serviceId, duration: service.duration, slots };
}

/**
 * Valida una reserva (nueva o reprogramada) y devuelve los datos listos para guardar.
 * Corre dentro de una transacción Serializable, así dos personas no pueden tomar el mismo horario.
 * `ignoreAppointmentId`: al reprogramar, el propio turno no cuenta como "ocupado".
 */

async function validateBooking(
  tx: Tx,
  input: CreateAppointmentInput,
  clientId: string,
  ignoreAppointmentId?: string,
) {
  const date = dayToDb(input.date);
  if (isNaN(+date) || date.toISOString().slice(0, 10) !== input.date) {
    throw badRequest('Fecha inválida', 'INVALID_DATE');
  }
  if (hasArrived(input.date, input.startTime)) throw badRequest('Elegí un horario futuro', 'SLOT_IN_PAST');
  if (+date > Date.now() + MAX_DAYS_AHEAD * 86_400_000) {
    throw badRequest('Reservá dentro del próximo año', 'TOO_FAR_AHEAD');
  }

  const service = await tx.service.findFirst({
    where: { id: input.serviceId, professionalId: input.professionalId, active: true },
  });
  if (!service) throw badRequest('Servicio inválido', 'INVALID_SERVICE');

  const endMinutes = toMinutes(input.startTime) + service.duration;
  if (endMinutes >= 1440) throw badRequest('El turno no puede terminar al día siguiente', 'ENDS_NEXT_DAY');
  const endTime = toHHMM(endMinutes);

  const windows = await tx.availability.findMany({
    where: { professionalId: input.professionalId, dayOfWeek: date.getUTCDay() },
  });
  if (!windows.some((w) => w.startTime <= input.startTime && w.endTime >= endTime)) {
    throw badRequest('El turno está fuera del horario de atención', 'OUTSIDE_WORKING_HOURS');
  }

  const busy = await tx.appointment.findFirst({
    where: {
      professionalId: input.professionalId,
      date,
      status: { not: 'CANCELLED' },
      ...(ignoreAppointmentId ? { id: { not: ignoreAppointmentId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: input.startTime },
    },
  });
  if (busy) throw conflict('El horario ya está ocupado', 'SLOT_TAKEN');

  return { ...input, date, endTime, clientId };
}

/** El profesional ve los turnos que le reservaron; el cliente, los que reservó. */
export function listMine(user: User) {
  return prisma.appointment.findMany({
    where: user.role === 'PROFESSIONAL' ? { professional: { userId: user.id } } : { clientId: user.id },
    include: {
      service: true,
      client: { select: { name: true, email: true, phone: true } },
      professional: {
        select: {
          id: true,
          businessName: true,
          paymentMethods: true,
          paymentAlias: true,
          paymentCBU: true,
          paymentHolder: true,
          paymentInstructions: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export function create(clientId: string, input: CreateAppointmentInput) {
  return prisma.$transaction(
    async (tx) => tx.appointment.create({ data: await validateBooking(tx, input, clientId) }),
    { isolationLevel: 'Serializable' },
  );
}

/** El profesional mueve un turno propio, todavía abierto, a otra fecha u hora. */
export function reschedule(
  professionalUserId: string,
  id: string,
  input: { date: string; startTime: string; notes: string },
) {
  return prisma.$transaction(
    async (tx) => {
      const appointment = await tx.appointment.findFirst({
        where: { id, professional: { userId: professionalUserId } },
      });
      if (!appointment) throw notFound('Turno no encontrado', 'APPOINTMENT_NOT_FOUND');
      if (CLOSED_STATUSES.includes(appointment.status)) {
        throw badRequest('Ese turno ya está cerrado', 'APPOINTMENT_CLOSED');
      }
      const data = await validateBooking(
        tx,
        {
          ...input,
          serviceId: appointment.serviceId,
          professionalId: appointment.professionalId,
          reminder: appointment.reminder,
        },
        appointment.clientId,
        appointment.id,
      );
      return tx.appointment.update({ where: { id: appointment.id }, data });
    },
    { isolationLevel: 'Serializable' },
  );
}

/**
 * Reglas de estado:
 * - cliente: solo cancela turnos propios;
 * - profesional: confirma, cancela o completa turnos propios (completar, solo si ya terminó);
 * - un turno cancelado o completado ya no cambia.
 */
export async function updateStatus(user: User, id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      ...(user.role === 'PROFESSIONAL' ? { professional: { userId: user.id } } : { clientId: user.id }),
    },
  });
  if (!appointment) throw notFound('Turno no encontrado', 'APPOINTMENT_NOT_FOUND');
  if (user.role === 'CLIENT' && status !== 'CANCELLED') {
    throw forbidden('Solo podés cancelar tus turnos', 'CLIENT_CAN_ONLY_CANCEL');
  }
  if (CLOSED_STATUSES.includes(appointment.status)) {
    throw badRequest('Ese turno ya está cerrado', 'APPOINTMENT_CLOSED');
  }
  if (status === 'COMPLETED' && !hasArrived(appointment.date.toISOString().slice(0, 10), appointment.endTime)) {
    throw badRequest('El turno todavía no terminó', 'APPOINTMENT_NOT_FINISHED');
  }
  // Solo actualiza si nadie lo cambió en el medio (control optimista).
  const result = await prisma.appointment.updateMany({
    where: { id: appointment.id, status: appointment.status },
    data: { status },
  });
  if (!result.count) throw conflict('El turno cambió. Actualizá la página', 'APPOINTMENT_CHANGED');
}
