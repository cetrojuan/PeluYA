import { firstName } from '../utils/format';
import { useApp } from './AppContext';

export function useDashboardViewModel() {
  const { user, profile, summary, isProfessional, setPage } = useApp();

  return {
    isProfessional,
    greetingName: firstName(user?.name ?? ''),
    stats: {
      active: summary?.active ?? 0,
      pending: summary?.pending ?? 0,
      third: isProfessional
        ? (profile?.professional?.services.length ?? 0)
        : (summary?.completed ?? 0),
    },
    upcoming: summary?.upcoming ?? [],
    goTo: setPage,
  };
}
