import { prisma } from '@/lib/prisma.js';
import { notFound } from '@/lib/errors.js';
import type { BusinessInput } from './professionals.schemas.js';

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

export const listPublic = () => prisma.professionalProfile.findMany({ select: publicProfessionalSelect });

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
