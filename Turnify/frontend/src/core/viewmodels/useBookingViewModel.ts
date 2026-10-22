import { appointmentsApi } from '../api';
import type { BookingInput } from '../models/types';
import { DAYS, today } from '../utils/format';
import { canBook } from './useExploreViewModel';
import { useApp } from './AppContext';

// TODO (Sebas, cuando exista GET /professionals/:id/slots): cargar acá los horarios libres
// del día y servicio elegidos, para que la vista muestre botones en vez de una hora libre.

export function useBookingViewModel() {
  const { user, selectedProfessional, pending, run, mutate, setPage } = useApp();
  const professional = selectedProfessional!;

  const book = (input: Omit<BookingInput, 'professionalId'>) =>
    run(async () => {
      await mutate(() => appointmentsApi.book({ ...input, professionalId: professional.id }));
      setPage('appointments');
    }, 'Turno reservado correctamente');

  return {
    professional,
    reminderDefault: user!.reminderPreference,
    minDate: today(),
    days: DAYS,
    canBook: canBook(professional),
    pending,
    book,
    back: () => setPage('explore'),
  };
}
