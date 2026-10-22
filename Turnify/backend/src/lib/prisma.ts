import { PrismaClient } from '@prisma/client';

// Una sola conexión a la base para toda la app.
export const prisma = new PrismaClient();

/** Cliente dentro de una transacción (prisma.$transaction(async tx => ...)). */
export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
