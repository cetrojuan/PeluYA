import { useSecurityViewModel } from '@/core/viewmodels';
import type { PasswordInput } from '@/core/models/types';
import { Field } from '@/web/components/Field';
import { readForm } from '@/web/utils/formData';

export function SecurityPage() {
  const { pending, changePassword, revokeOtherSessions } = useSecurityViewModel();
  return (
    <div className="dashboard-grid">
      <section className="panel">
        <h2>Cambiar contraseña</h2>
        <p className="muted">Al cambiarla se cierran todas tus sesiones.</p>
        <form onSubmit={(e) => changePassword(readForm<PasswordInput & { confirm: string }>(e))}>
          <Field label="Contraseña actual" name="currentPassword" type="password" required maxLength={72} autoComplete="current-password" />
          <Field label="Nueva contraseña" name="newPassword" type="password" required minLength={12} maxLength={72} autoComplete="new-password" />
          <small>12 caracteres o más, mayúscula, minúscula y número.</small>
          <Field label="Repetir nueva contraseña" name="confirm" type="password" required minLength={12} maxLength={72} autoComplete="new-password" />
          <button disabled={pending}>Actualizar contraseña</button>
        </form>
      </section>
      <section className="panel">
        <h2>Sesiones y privacidad</h2>
        <p>Tu sesión dura hasta 8 horas. Podés cerrar los accesos de otros dispositivos.</p>
        <button className="outline" disabled={pending} onClick={revokeOtherSessions}>
          Cerrar otras sesiones
        </button>
        <hr />
        <p className="muted">
          Tus datos de contacto se comparten con el profesional cuando reservás. Los datos bancarios del negocio se
          muestran a sus clientes con turnos.
        </p>
      </section>
    </div>
  );
}
