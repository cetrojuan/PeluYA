import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma.js';
import { badRequest, unauthorized } from '@/lib/errors.js';
import type { ChangePasswordInput, LoginInput, RegisterInput } from './auth.schemas.js';

const BCRYPT_ROUNDS = 12;

/** Campos del usuario que se pueden mostrar (nunca el hash de la contraseña). */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  reminderPreference: true,
  createdAt: true,
} as const;

// Hash de relleno: si el email no existe igual se compara una contraseña,
// así el tiempo de respuesta no revela qué emails están registrados.
const dummyPasswordHash = bcrypt.hashSync('DummyTurnify2026!', BCRYPT_ROUNDS);

export async function register(input: RegisterInput) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      ...(input.role === 'PROFESSIONAL'
        ? { professional: { create: { businessName: input.name, category: 'Otro' } } }
        : {}),
    },
    select: safeUserSelect,
  });
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? dummyPasswordHash);
  if (!user || !valid) throw unauthorized('Email o contraseña incorrectos', 'INVALID_CREDENTIALS');
  return prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: safeUserSelect });
}

export async function getSessionUser(userId: string, sessionId: string) {
  const [user, session] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect }),
    prisma.session.findUniqueOrThrow({ where: { id: sessionId } }),
  ]);
  return { user, csrf: session.csrf };
}

export const logout = (sessionId: string) => prisma.session.deleteMany({ where: { id: sessionId } });

/** Cambia la contraseña y cierra todas las sesiones del usuario. */
export async function changePassword(user: User, input: ChangePasswordInput) {
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw badRequest('Contraseña actual incorrecta', 'WRONG_PASSWORD');
  }
  if (input.currentPassword === input.newPassword) {
    throw badRequest('Elegí una contraseña diferente', 'SAME_PASSWORD');
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS) },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
}

/** Cierra las sesiones del usuario en otros dispositivos. */
export const revokeOtherSessions = (userId: string, currentSessionId: string) =>
  prisma.session.deleteMany({ where: { userId, id: { not: currentSessionId } } });
