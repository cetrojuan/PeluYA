import type { ReminderType } from '@/core/models/types';

export function ReminderSelect({ value = 'NONE' }: { value?: ReminderType }) {
  return (
    <label>
      Preferencia de recordatorio
      <select name="reminderPreference" defaultValue={value}>
        <option value="NONE">Sin recordatorio</option>
        <option value="EMAIL">Email</option>
        <option value="WHATSAPP">WhatsApp</option>
        <option value="BOTH">Email y WhatsApp</option>
      </select>
      <small>Se guarda tu preferencia. El envío automático requiere conectar un proveedor.</small>
    </label>
  );
}
