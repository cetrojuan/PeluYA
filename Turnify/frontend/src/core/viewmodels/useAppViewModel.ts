import { useCallback, useEffect, useRef, useState } from 'react';
import { appointmentsApi, authApi, onSessionExpired, professionalsApi, profileApi, setCsrfToken } from '../api';
import type { Appointment, Profile, PublicProfessional, SessionData, User } from '../models/types';
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<PublicProfessional | null>(null);
  const pendingRef = useRef(false);

  const isProfessional = user?.role === 'PROFESSIONAL';

  const startSession = useCallback((session: SessionData) => {
    setCsrfToken(session.csrf);
    setUser(session.user);
    setPage('dashboard');
    setNotice('');
  }, []);

  const endSession = useCallback(() => {
    setCsrfToken('');
    setUser(null);
    setProfile(null);
    setAppointments([]);
    setSelectedProfessional(null);
    setPage('login');
  }, []);

  /** Recarga perfil, turnos y profesionales (después de cada cambio). */
  const refresh = useCallback(async () => {
    const [nextProfile, nextAppointments, nextProfessionals] = await Promise.all([
      profileApi.get(),
      appointmentsApi.listMine(),
      professionalsApi.list(),
    ]);
    setProfile(nextProfile);
    setUser(nextProfile);
    setAppointments(nextAppointments);
    setProfessionals(nextProfessionals);
  }, []);

  // Al abrir la app: ¿hay una sesión activa?
  useEffect(() => {
    authApi.me().then(startSession).catch(() => {}).finally(() => setLoading(false));
    return onSessionExpired(() => {
      endSession();
      setNotice('Tu sesión venció. Ingresá nuevamente.');
    });
  }, [startSession, endSession]);

  // Con sesión: datos completos. Sin sesión: solo el listado público.
  useEffect(() => {
    if (user) refresh().catch((e: Error) => setNotice(e.message));
    else professionalsApi.list().then(setProfessionals).catch((e: Error) => setNotice(e.message));
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
    profile, appointments, professionals, selectedProfessional, setSelectedProfessional,
    startSession, endSession, run, mutate, logout,
  };
}

export type AppViewModel = ReturnType<typeof useAppViewModel>;
