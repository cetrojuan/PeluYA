import { useProfileViewModel } from '@/core/viewmodels';
import type { ProfileInput } from '@/core/models/types';
import { Field } from '@/web/components/Field';
import { ReminderSelect } from '@/web/components/ReminderSelect';
import { readForm } from '@/web/utils/formData';

export function ProfilePage() {
  const { user, profile, isProfessional, pending, save } = useProfileViewModel();
  return (
    <section className="panel form-panel">
      <div className="profile-top">
        <span className="avatar">{user.name[0]}</span>
        <div>
          <h2>{user.name}</h2>
          <span className="badge">{isProfessional ? 'Cuenta profesional' : 'Cuenta de cliente'}</span>
        </div>
      </div>
      <form onSubmit={(e) => save(readForm<ProfileInput>(e))}>
        <div className="form-grid">
          <Field label="Nombre completo" name="name" value={profile.name} required minLength={2} autoComplete="name" />
          <Field label="Teléfono" name="phone" type="tel" value={profile.phone} maxLength={30} autoComplete="tel" />
          <Field label="Email de acceso" name="email" type="email" value={profile.email} readOnly maxLength={254} />
          <label>
            Tipo de cuenta
            <input readOnly value={isProfessional ? 'Profesional' : 'Cliente'} />
          </label>
        </div>
        <small>El email y el rol quedan vinculados a esta cuenta. Para cambiar de rol, creá otra cuenta.</small>
        <ReminderSelect value={profile.reminderPreference} />
        <button disabled={pending}>Guardar perfil</button>
      </form>
    </section>
  );
}
