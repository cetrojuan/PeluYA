import { authApi } from '../api';
import type { LoginInput, RegisterInput } from '../models/types';
import { useApp } from './AppContext';

export type AuthMode = 'login' | 'register';

export function useAuthViewModel(mode: AuthMode) {
  const { run, pending, startSession, setNotice, setPage } = useApp();

  function submit(values: LoginInput | (RegisterInput & { confirm: string })) {
    if (mode === 'register') {
      const { confirm, ...registration } = values as RegisterInput & { confirm: string };
      if (registration.password !== confirm) return setNotice('Las contraseñas no coinciden');
      return run(async () => startSession(await authApi.register(registration)), 'Bienvenido a tu panel');
    }
    return run(async () => startSession(await authApi.login(values as LoginInput)), 'Bienvenido a tu panel');
  }

  const switchMode = () => setPage(mode === 'login' ? 'register' : 'login');

  return { mode, pending, submit, switchMode };
}
