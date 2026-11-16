import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Solo la base temporal del arnes; nunca cargar el .env del desarrollador.
const url = new URL(process.env.DATABASE_URL || '');
assert.equal(process.env.NODE_ENV, 'test');
assert.equal(url.hostname, '127.0.0.1');
assert.equal(url.pathname, '/pp2_review');
const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany({ select: { email: true, passwordHash: true } });
  assert.equal(users.length, 14, 'El segundo seed no debe duplicar cuentas');
  assert.ok(users.every(user => /^\$2[aby]\$12\$/.test(user.passwordHash)));
  const demo = users.find(user => user.email === 'cliente@turnify.local');
  assert.ok(demo);
  assert.ok(await bcrypt.compare('TurnifyDemo2026!', demo.passwordHash));
  assert.notEqual(demo.passwordHash, 'TurnifyDemo2026!');
  assert.equal(await prisma.professionalProfile.count(), 12);
  assert.equal(await prisma.service.count(), 12);
  assert.equal(await prisma.availability.count(), 60);
  assert.equal(await prisma.appointment.count(), 48);
  console.log('PASS: seed repetible, volumen ficticio y contrasenas bcrypt (sin exponer hashes).');
} finally {
  await prisma.$disconnect();
}
