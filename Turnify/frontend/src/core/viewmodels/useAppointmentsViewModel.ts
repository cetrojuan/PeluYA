import { useCallback, useState } from 'react';
import { appointmentsApi } from '../api';
import type { Appointment, AppointmentStatus, RescheduleInput } from '../models/types';
import { STATUS_LABELS, today } from '../utils/format';
import { useApp } from './AppContext';
import { usePagedList } from './usePagedList';

export type StatusFilter = AppointmentStatus | 'ALL';

export function useAppointmentsViewModel() {
  const { dataVersion, isProfessional, pending, run, mutate } = useApp();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback((page: number) => appointmentsApi.listMine(page, filter === 'ALL' ? undefined : filter), [filter]);
  const list = usePagedList(load, dataVersion);
  const setStatus = (a: Appointment, status: Exclude<AppointmentStatus, 'PENDING'>, success: string) =>
    run(() => mutate(() => appointmentsApi.setStatus(a.id, status)), success);

  return {
    isProfessional,
    pending,
    filter,
    setFilter: (next: StatusFilter) => { setFilter(next); list.setPage(1); setEditingId(null); },
    statusLabels: STATUS_LABELS,
    shown: list.items,
    loading: list.loading,
    error: list.error,
    pagination: list.result,
    setListPage: (page: number) => { list.setPage(page); setEditingId(null); },
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
