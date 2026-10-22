import { useState } from 'react';
import { appointmentsApi } from '../api';
import type { Appointment, AppointmentStatus, RescheduleInput } from '../models/types';
import { STATUS_LABELS, today } from '../utils/format';
import { useApp } from './AppContext';

export type StatusFilter = AppointmentStatus | 'ALL';

export function useAppointmentsViewModel() {
  const { appointments, isProfessional, pending, run, mutate } = useApp();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  const shown = appointments.filter((a) => filter === 'ALL' || a.status === filter);
  const setStatus = (a: Appointment, status: Exclude<AppointmentStatus, 'PENDING'>, success: string) =>
    run(() => mutate(() => appointmentsApi.setStatus(a.id, status)), success);

  return {
    isProfessional,
    pending,
    filter,
    setFilter,
    statusLabels: STATUS_LABELS,
    shown,
    minDate: today(),
    editingId,
    toggleEditing: (a: Appointment) => setEditingId(editingId === a.id ? null : a.id),
    confirm: (a: Appointment) => setStatus(a, 'CONFIRMED', 'Turno confirmado'),
    complete: (a: Appointment) => setStatus(a, 'COMPLETED', 'Turno completado'),
    cancel: (a: Appointment) => setStatus(a, 'CANCELLED', 'Turno cancelado'),
    reschedule: (a: Appointment, input: RescheduleInput) =>
      run(async () => {
        await mutate(() => appointmentsApi.reschedule(a.id, input));
        setEditingId(null);
      }, 'Turno reprogramado'),
  };
}
