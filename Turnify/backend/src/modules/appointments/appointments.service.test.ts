import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeSlots } from './appointments.service.js';

describe('computeSlots', () => {
    it('día libre sin turnos ocupados devuelve todos los slots', () => {
        const windows = [{ startTime: '09:00', endTime: '11:00' }];
        const slots = computeSlots(windows, [], 30);
        assert.deepEqual(slots, ['09:00', '09:30', '10:00', '10:30']);
    });

    it('turno ocupado en el medio quita ese slot', () => {
        const windows = [{ startTime: '09:00', endTime: '11:00' }];
        const taken = [{ startTime: '09:30', endTime: '10:00' }];
        const slots = computeSlots(windows, taken, 30);
        assert.deepEqual(slots, ['09:00', '10:00', '10:30']);
    });

    it('servicio que no entra al final no se ofrece', () => {
        const windows = [{ startTime: '09:00', endTime: '10:00' }];
        const slots = computeSlots(windows, [], 45);
        assert.deepEqual(slots, ['09:00']);
    });
});