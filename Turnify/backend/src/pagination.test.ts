import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listAppointmentsSchema } from '@/modules/appointments/appointments.schemas.js';
import { listProfessionalsSchema } from '@/modules/professionals/professionals.schemas.js';
import { pageResult } from '@/lib/pagination.js';

test('paginación: defaults y valores límite', () => {
  assert.deepEqual(listAppointmentsSchema.parse({}), { page: 1, pageSize: 10 });
  assert.deepEqual(listAppointmentsSchema.parse({ page: '1000000', pageSize: '50', status: 'PENDING' }),
    { page: 1000000, pageSize: 50, status: 'PENDING' });
  for (const page of ['0', '-1', '1.5', 'NaN', '', '1e3', '1000001', ['1', '2'], {}]) {
    assert.equal(listAppointmentsSchema.safeParse({ page }).success, false, JSON.stringify(page));
  }
  for (const pageSize of ['0', '-1', '51', '2.5', ['10']]) {
    assert.equal(listAppointmentsSchema.safeParse({ pageSize }).success, false);
  }
});

test('filtros: no aceptan IDs ajenos ni estados o estructuras inválidos', () => {
  for (const input of [{ clientId: 'otro' }, { professionalId: 'otro' }, { status: 'ALL' },
    { status: ['PENDING', 'COMPLETED'] }, { page: { gt: 0 } }]) {
    assert.equal(listAppointmentsSchema.safeParse(input).success, false);
  }
  assert.equal(listProfessionalsSchema.parse({ q: '  Barbería  ' }).q, 'Barbería');
  assert.equal(listProfessionalsSchema.safeParse({ q: 'x'.repeat(101) }).success, false);
  assert.equal(listProfessionalsSchema.safeParse({ q: ['a', 'b'] }).success, false);
});

test('metadatos de páginas vacías, completas y parciales', () => {
  assert.equal(pageResult([], 0, { page: 1, pageSize: 10 }).totalPages, 1);
  assert.equal(pageResult([], 20, { page: 2, pageSize: 10 }).totalPages, 2);
  assert.equal(pageResult(['último'], 21, { page: 3, pageSize: 10 }).totalPages, 3);
});
