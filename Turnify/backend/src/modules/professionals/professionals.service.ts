import { prisma } from '@/lib/prisma.js';
import { notFound } from '@/lib/errors.js';
import type { BusinessInput, ListProfessionalsQuery } from './professionals.schemas.js';
import type { Prisma } from '@prisma/client';
import { pageResult } from '@/lib/pagination.js';

/** Lo que cualquiera puede ver de un profesional (sin CBU, alias ni titular). */
const publicProfessionalSelect = {
  id: true,
  businessName: true,
  category: true,
  description: true,
  address: true,
  paymentMethods: true,
  paymentInstructions: true,
  services: { where: { active: true } },
  availability: true,
} as const;

export async function listPublic(query: ListProfessionalsQuery) {
  const where: Prisma.ProfessionalProfileWhereInput = query.q ? { OR: [
    { businessName: { contains: query.q, mode: 'insensitive' } },
    { category: { contains: query.q, mode: 'insensitive' } },
  ] } : {};
  const [total, items] = await prisma.$transaction([
    prisma.professionalProfile.count({ where }),
    prisma.professionalProfile.findMany({ where, select: publicProfessionalSelect,
      orderBy: [{ businessName: 'asc' }, { id: 'asc' }],
      skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
  ], { isolationLevel: 'RepeatableRead' });
  return pageResult(items, total, query);
}

/** Perfil profesional del usuario logueado. Lo usan servicios, horarios y turnos. */
export async function getMyProfileOrFail(userId: string) {
  const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
  if (!profile) throw notFound('Perfil profesional inexistente', 'PROFESSIONAL_NOT_FOUND');
  return profile;
}

export const updateBusiness = (userId: string, input: BusinessInput) =>
  prisma.professionalProfile.update({
    where: { userId },
    data: { ...input, paymentMethods: input.paymentMethods.join(',') },
  });
