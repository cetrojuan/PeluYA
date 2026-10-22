import { prisma } from '@/lib/prisma.js';
import { conflict, notFound } from '@/lib/errors.js';
import { overlaps } from '@/lib/time.js';
import { getMyProfileOrFail } from '@/modules/professionals/professionals.service.js';
import type { AvailabilityInput } from './availability.schemas.js';

// TODO (Sebas): agregar `update(userId, id, input)` para PUT /availability/:id.
//  Misma receta que `create`: dentro de una transacción Serializable, traer las otras franjas
//  de ese día (excluyendo la que se edita) y frenar con conflict(...) si se superponen.
//  Ver la guía de tareas de Sebas en el README de backend.

/** Agrega una franja de atención si no se superpone con otra del mismo día. */
export async function create(userId: string, input: AvailabilityInput) {
  const profile = await getMyProfileOrFail(userId);
  await prisma.$transaction(
    async (tx) => {
      const sameDay = await tx.availability.findMany({
        where: { professionalId: profile.id, dayOfWeek: input.dayOfWeek },
      });
      if (sameDay.some((a) => overlaps(a.startTime, a.endTime, input.startTime, input.endTime))) {
        throw conflict('Ese horario se superpone con otro', 'AVAILABILITY_OVERLAP');
      }
      await tx.availability.create({ data: { ...input, professionalId: profile.id } });
    },
    { isolationLevel: 'Serializable' },
  );
}

export async function remove(userId: string, id: string) {
  const profile = await getMyProfileOrFail(userId);
  const result = await prisma.availability.deleteMany({ where: { id, professionalId: profile.id } });
  if (!result.count) throw notFound('Horario no encontrado', 'AVAILABILITY_NOT_FOUND');
}
