import { useAppointmentsViewModel, type StatusFilter } from '@/core/viewmodels';
import type { Appointment, RescheduleInput } from '@/core/models/types';
import { dateLabel, isClosed, money } from '@/core/utils/format';
import { Empty } from '@/web/components/Empty';
import { Field } from '@/web/components/Field';
import { StatusBadge } from '@/web/components/StatusBadge';
import { readForm } from '@/web/utils/formData';

type ViewModel = ReturnType<typeof useAppointmentsViewModel>;

export function AppointmentsPage() {
  const vm = useAppointmentsViewModel();
  return (
    <>
      <div className="tip">
        {vm.isProfessional
          ? 'Confirmá solicitudes, reprogramá o cancelá turnos.'
          : 'Revisá tus reservas y los datos de pago del profesional.'}
      </div>
      <label className="filter-label">
        Filtrar por estado
        <select value={vm.filter} onChange={(e) => vm.setFilter(e.target.value as StatusFilter)}>
          <option value="ALL">Todos los turnos</option>
          {Object.entries(vm.statusLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="appointment-list">
        {vm.shown.map((a) => (
          <AppointmentCard key={a.id} appointment={a} vm={vm} />
        ))}
      </div>
      {!vm.shown.length && <Empty text="No hay turnos con este estado." />}
    </>
  );
}

function AppointmentCard({ appointment: a, vm }: { appointment: Appointment; vm: ViewModel }) {
  const pro = vm.isProfessional;
  return (
    <section className="panel appointment">
      <div className="appointment-head">
        <div className="calendar-tile">
          <b>{new Date(a.date).getUTCDate()}</b>
          <small>{new Date(a.date).toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' })}</small>
        </div>
        <div className="appointment-title">
          <h3>{a.service.name}</h3>
          <p>
            {dateLabel(a.date)} · {a.startTime}–{a.endTime}
          </p>
          <small>
            {pro ? a.client.name : a.professional.businessName} · {money(a.service.price)}
          </small>
        </div>
        <StatusBadge status={a.status} />
      </div>
      {pro && (
        <p className="muted">
          {a.client.email} · {a.client.phone || 'Sin teléfono'}
        </p>
      )}
      {a.notes && <p className="notes">{a.notes}</p>}
      {!pro && (
        <details>
          <summary>Ver medios y datos de pago</summary>
          <p>{a.professional.paymentMethods}</p>
          {a.professional.paymentHolder && <p>Titular: {a.professional.paymentHolder}</p>}
          {a.professional.paymentAlias && <p>Alias: {a.professional.paymentAlias}</p>}
          {a.professional.paymentCBU && <p>CBU/CVU: {a.professional.paymentCBU}</p>}
          <p>{a.professional.paymentInstructions}</p>
        </details>
      )}
      {!isClosed(a) && (
        <div className="actions">
          {pro && (
            <>
              {a.status === 'PENDING' && (
                <button disabled={vm.pending} onClick={() => vm.confirm(a)}>
                  Confirmar
                </button>
              )}
              <button className="outline" onClick={() => vm.toggleEditing(a)}>
                Reprogramar
              </button>
              <button className="outline" disabled={vm.pending} onClick={() => vm.complete(a)}>
                Completar
              </button>
            </>
          )}
          <button
            className="danger"
            disabled={vm.pending}
            onClick={() => {
              if (confirm('¿Cancelar este turno?')) vm.cancel(a);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      {vm.editingId === a.id && (
        <form className="edit-appointment" onSubmit={(e) => vm.reschedule(a, readForm<RescheduleInput>(e))}>
          <div className="form-grid">
            <Field label="Nueva fecha" name="date" type="date" value={a.date.slice(0, 10)} required min={vm.minDate} />
            <Field label="Nueva hora" name="startTime" type="time" value={a.startTime} required />
          </div>
          <label>
            Aclaraciones
            <textarea name="notes" defaultValue={a.notes || ''} maxLength={1000} />
          </label>
          <button disabled={vm.pending}>Guardar turno</button>
        </form>
      )}
    </section>
  );
}
