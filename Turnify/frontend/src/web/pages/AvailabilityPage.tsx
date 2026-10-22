import { useAvailabilityViewModel } from '@/core/viewmodels';
import { Empty } from '@/web/components/Empty';
import { Field } from '@/web/components/Field';
import { readForm } from '@/web/utils/formData';

export function AvailabilityPage() {
  const { days, slots, pending, add, remove } = useAvailabilityViewModel();
  return (
    <div className="dashboard-grid">
      <section className="panel">
        <h2>Horario de atención</h2>
        <p className="muted">Los horarios son de Argentina (UTC−3). Podés agregar varios bloques por día.</p>
        <form
          onSubmit={(e) => {
            const values = readForm(e);
            add({ dayOfWeek: Number(values.dayOfWeek), startTime: values.startTime, endTime: values.endTime });
          }}
        >
          <label>
            Día
            <select name="dayOfWeek" defaultValue="1">
              {days.map((day, i) => (
                <option value={i} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <Field label="Desde" name="startTime" type="time" value="09:00" required />
            <Field label="Hasta" name="endTime" type="time" value="18:00" required />
          </div>
          <button disabled={pending}>Agregar horario</button>
        </form>
      </section>
      <section className="panel">
        <h2>Horarios publicados</h2>
        {!slots.length && <Empty text="Definí tus horarios para habilitar las reservas." />}
        {slots.map((s) => (
          <div className="preview-row" key={s.id}>
            <div>
              <b>{days[s.dayOfWeek]}</b>
              <small>
                {s.startTime} a {s.endTime}
              </small>
            </div>
            {/* TODO (Sebas): botón "Editar" cuando exista PUT /availability/:id */}
            <button className="danger" disabled={pending} onClick={() => remove(s.id)}>
              Quitar
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
