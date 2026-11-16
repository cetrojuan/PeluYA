import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma.js';
import { badRequest } from '@/lib/errors.js';
import { safeUserSelect } from '@/modules/auth/auth.service.js';
import type { UpdateProfileInput } from './profile.schemas.js';

export const getProfile = (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...safeUserSelect,
      professional: { include: { services: { where: { active: true } }, availability: true } },
    },
  });

export function updateProfile(user: User, input: UpdateProfileInput) {
  if (input.email !== user.email) {
    throw badRequest('El email se mantiene como identificador de acceso', 'EMAIL_IMMUTABLE');
  }
  return prisma.user.update({ where: { id: user.id }, data: input, select: safeUserSelect });
}
