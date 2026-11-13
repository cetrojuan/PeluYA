import { useCallback, useEffect, useRef, useState } from 'react';
import { appointmentsApi, authApi, onSessionExpired, profileApi, setCsrfToken } from '../api';
import type { AppointmentSummary, Profile, PublicProfessional, SessionData, User } from '../models/types';
import type { Page } from './navigation';

/**
 * ViewModel raíz: sesión, navegación, avisos y los datos que comparten las pantallas.
 * Las pantallas lo leen con `useApp()` (ver AppContext) a través de su propio ViewModel.
 */
export function useAppViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('home');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedProfessional, setSelectedProfessional] = useState<PublicProfessional | null>(null);
  const pendingRef = useRef(false);
  const sessionEpoch = useRef(0);

  const isProfessional = user?.role === 'PROFESSIONAL';

  const startSession = useCallback((session: SessionData) => {
    sessionEpoch.current += 1;
    setProfile(null);
    setSummary(null);
    setCsrfToken(session.csrf);
    setUser(session.user);
    setPage('dashboard');
    setNotice('');
  }, []);

  const endSession = useCallback(() => {
    sessionEpoch.current += 1;
    setCsrfToken('');
    setUser(null);
    setProfile(null);
    setSummary(null);
    setSelectedProfessional(null);
    setPage('login');
  }, []);

  /** Recarga perfil y resumen. Invalida los listados después de cada cambio. */
  const refresh = useCallback(async () => {
    const epoch = sessionEpoch.current;
    const [nextProfile, nextSummary] = await Promise.all([
      profileApi.get(),
      appointmentsApi.summary(),
    ]);
    if (epoch !== sessionEpoch.current) return;
    setProfile(nextProfile);
    setUser(nextProfile);
    setSummary(nextSummary);
    setDataVersion((version) => version + 1);
  }, []);

  // Al abrir la app: ¿hay una sesión activa?
  useEffect(() => {
    authApi.me().then(startSession).catch(() => {}).finally(() => setLoading(false));
    return onSessionExpired(() => {
      endSession();
      setNotice('Tu sesión venció. Ingresá nuevamente.');
    });
  }, [startSession, endSession]);

  // Los datos privados solo se cargan con sesión. Cada listado carga su propia página.
  useEffect(() => {
    if (user) refresh().catch((e: Error) => setNotice(e.message));
  }, [user?.id, refresh]);

  // Al cambiar de pantalla se limpia el aviso.
  useEffect(() => setNotice(''), [page]);

  /** Ejecuta una acción mostrando "procesando" y un aviso de éxito o error. Evita dobles clics. */
  const run = useCallback(async (action: () => Promise<unknown>, success = 'Cambios guardados') => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setNotice('');
    try {
      await action();
      setNotice(success);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, []);

  /** Ejecuta un cambio en la API y recarga los datos. Pensado para usar dentro de `run`. */
  const mutate = useCallback(
    async (change: () => Promise<unknown>) => {
      await change();
      await refresh();
    },
    [refresh],
  );

  const logout = () =>
    run(async () => {
      await authApi.logout();
      endSession();
    }, 'Sesión cerrada');

  return {
    user, loading, page, setPage, notice, setNotice, pending, isProfessional,
    profile, summary, dataVersion, selectedProfessional, setSelectedProfessional,
    startSession, endSession, run, mutate, logout,
  };
}

export type AppViewModel = ReturnType<typeof useAppViewModel>;
