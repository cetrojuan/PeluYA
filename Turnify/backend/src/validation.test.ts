import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema } from '@/modules/auth/auth.schemas.js';
import { serviceSchema } from '@/modules/services/services.schemas.js';
import { availabilitySchema } from '@/modules/availability/availability.schemas.js';
import { businessSchema } from '@/modules/professionals/professionals.schemas.js';
import { overlaps } from '@/lib/time.js';

test('registro exige rol válido, contraseña fuerte y campos permitidos', () => {
  const valid = { name: 'Cliente', email: 'USER@example.com', phone: '', password: 'TurnifyPrueba2026', role: 'CLIENT' };
  assert.equal(registerSchema.parse(valid).email, 'user@example.com');
  for (const extra of [{ password: '123456' }, { role: 'ADMIN' }, { passwordHash: 'x' }]) {
    assert.equal(registerSchema.safeParse({ ...valid, ...extra }).success, false);
  }
});

test('servicios rechazan precios negativos y duraciones inválidas', () => {
  assert.equal(serviceSchema.safeParse({ name: 'Corte', description: '', duration: 30, price: -1 }).success, false);
  assert.equal(serviceSchema.safeParse({ name: 'Corte', description: '', duration: 0, price: 10 }).success, false);
});

test('horarios y superposición parcial', () => {
  assert.equal(availabilitySchema.safeParse({ dayOfWeek: 1, startTime: '18:00', endTime: '09:00' }).success, false);
  assert.equal(overlaps('09:00', '10:00', '09:30', '10:30'), true);
  assert.equal(overlaps('09:00', '10:00', '10:00', '11:00'), false);
});

test('transferencia exige datos de cobro y CBU válido', () => {
  const b = {
    businessName: 'Negocio', category: 'Barbería', description: '', address: '',
    paymentMethods: ['Transferencia'], paymentAlias: '', paymentCBU: '', paymentHolder: '', paymentInstructions: '',
  };
  assert.equal(businessSchema.safeParse(b).success, false);
  assert.equal(businessSchema.safeParse({ ...b, paymentAlias: 'mi.alias', paymentHolder: 'Titular' }).success, true);
  assert.equal(businessSchema.safeParse({ ...b, paymentCBU: '123', paymentHolder: 'Titular' }).success, false);
});
