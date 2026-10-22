import { useBookingViewModel } from '@/core/viewmodels';
import type { ReminderType } from '@/core/models/types';
import { money } from '@/core/utils/format';
import { Field } from '@/web/components/Field';
import { ReminderSelect } from '@/web/components/ReminderSelect';
import { readForm } from '@/web/utils/formData';

export function BookingPage() {
  const vm = useBookingViewModel();
  const p = vm.professional;

  return (
    <section className="panel form-panel">
      <button className="link" onClick={vm.back}>
        ← Volver a profesionales
      </button>
      <h2>{p.businessName}</h2>
      <p>{p.description}</p>
      <div className="tip">
        {p.address || 'Consultá con el profesional la modalidad de atención.'}
        <br />
        Medios de pago: {p.paymentMethods}
        <br />
        {p.paymentInstructions}
      </div>
      <form
        onSubmit={(e) => {
          const values = readForm(e);
          vm.book({
            serviceId: values.serviceId,
            date: values.date,
            startTime: values.startTime,
            notes: values.notes,
            reminder: values.reminderPreference as ReminderType,
          });
        }}
      >
        <label>
          Servicio
          <select name="serviceId" required>
            {p.services.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name} · {s.duration} min · {money(s.price)}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <Field label="Fecha" name="date" type="date" required min={vm.minDate} />
          <Field label="Hora (Argentina)" name="startTime" type="time" required />
        </div>
        <div className="schedule-chips">
          {p.availability.map((s) => (
            <span key={s.id}>
              {vm.days[s.dayOfWeek]} {s.startTime}–{s.endTime}
            </span>
          ))}
        </div>
        <label>
          Aclaraciones
          <textarea name="notes" maxLength={1000} placeholder="Contale al profesional lo que necesita saber." />
        </label>
        <ReminderSelect value={vm.reminderDefault} />
        <button disabled={vm.pending || !vm.canBook}>Reservar turno →</button>
      </form>
    </section>
  );
}
