import { prisma } from '@/lib/prisma.js';
import { notFound } from '@/lib/errors.js';
import { getMyProfileOrFail } from '@/modules/professionals/professionals.service.js';
import type { ServiceInput } from './services.schemas.js';

export async function create(userId: string, input: ServiceInput) {
  const profile = await getMyProfileOrFail(userId);
  return prisma.service.create({ data: { ...input, professionalId: profile.id } });
}

/** Solo modifica servicios activos del propio profesional. */
export async function update(userId: string, id: string, input: ServiceInput) {
  const profile = await getMyProfileOrFail(userId);
  const result = await prisma.service.updateMany({
    where: { id, professionalId: profile.id, active: true },
    data: input,
  });
  if (!result.count) throw notFound('Servicio no encontrado', 'SERVICE_NOT_FOUND');
}

/** Baja lógica: el servicio deja de ofrecerse pero los turnos viejos lo siguen mostrando. */
export async function deactivate(userId: string, id: string) {
  const profile = await getMyProfileOrFail(userId);
  const result = await prisma.service.updateMany({
    where: { id, professionalId: profile.id },
    data: { active: false },
  });
  if (!result.count) throw notFound('Servicio no encontrado', 'SERVICE_NOT_FOUND');
}
