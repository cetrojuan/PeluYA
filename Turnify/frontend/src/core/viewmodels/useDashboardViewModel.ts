import { firstName, isActive, isUpcoming } from '../utils/format';
import { useApp } from './AppContext';

export function useDashboardViewModel() {
  const { user, profile, appointments, isProfessional, setPage } = useApp();
  const upcoming = appointments.filter(isUpcoming);

  return {
    isProfessional,
    greetingName: firstName(user?.name ?? ''),
    stats: {
      active: appointments.filter(isActive).length,
      pending: appointments.filter((a) => a.status === 'PENDING').length,
      third: isProfessional
        ? (profile?.professional?.services.length ?? 0)
        : appointments.filter((a) => a.status === 'COMPLETED').length,
    },
    upcoming: upcoming.slice(0, 4),
    goTo: setPage,
  };
}
