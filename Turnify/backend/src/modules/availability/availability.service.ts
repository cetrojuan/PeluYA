import { prisma } from '@/lib/prisma.js';
import { conflict, notFound } from '@/lib/errors.js';
import { overlaps } from '@/lib/time.js';
import { getMyProfileOrFail } from '@/modules/professionals/professionals.service.js';
import type { AvailabilityInput } from './availability.schemas.js';

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

/** Edita una franja de atención, verificando que sea del profesional y que no se superponga */
export async function update(userId: string, id: string, input: AvailabilityInput) {
  const profile = await getMyProfileOrFail(userId);
  return prisma.$transaction(
    async (tx) => {
      // Verifica que la franja exista y sea del profesional logueado
      const existing = await tx.availability.findFirst({
        where: { id, professionalId: profile.id },
      });
      if (!existing) throw notFound('Horario no encontrado', 'AVAILABILITY_NOT_FOUND');

      // Busca otras franjas del mismo día, excluyendo la que se está editando
      const sameDay = await tx.availability.findMany({
        where: { professionalId: profile.id, dayOfWeek: input.dayOfWeek, id: { not: id } },
      });

      // Verifica que no se superponga con otra franja
      if (sameDay.some((a) => overlaps(a.startTime, a.endTime, input.startTime, input.endTime))) {
        throw conflict('Ese horario se superpone con otro', 'AVAILABILITY_OVERLAP');
      }

      return tx.availability.update({ where: { id }, data: input });
    },
    { isolationLevel: 'Serializable' },
  );
}