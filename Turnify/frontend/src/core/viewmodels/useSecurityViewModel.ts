import { authApi } from '../api';
import type { PasswordInput } from '../models/types';
import { useApp } from './AppContext';

export function useSecurityViewModel() {
  const { pending, run, setNotice, endSession } = useApp();

  function changePassword({ confirm, ...input }: PasswordInput & { confirm: string }) {
    if (input.newPassword !== confirm) return setNotice('Las contraseñas no coinciden');
    return run(async () => {
      await authApi.changePassword(input);
      endSession();
    }, 'Contraseña actualizada. Ingresá nuevamente.');
  }

  const revokeOtherSessions = () => run(() => authApi.revokeOtherSessions(), 'Otras sesiones cerradas');

  return { pending, changePassword, revokeOtherSessions };
}
