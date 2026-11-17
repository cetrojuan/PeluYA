import { useServicesViewModel } from '@/core/viewmodels';
import { money } from '@/core/utils/format';
import { Empty } from '@/web/components/Empty';
import { Field } from '@/web/components/Field';
import { readForm } from '@/web/utils/formData';

export function ServicesPage() {
  const vm = useServicesViewModel();
  const { editing } = vm;

  return (
    <div className="dashboard-grid">
      <section className="panel">
        <h2>{editing ? 'Editar servicio' : 'Crear servicio'}</h2>
        <form
          key={editing?.id || 'new'}
          onSubmit={(e) => {
            const values = readForm(e);
            vm.save({
              name: values.name,
              description: values.description,
              duration: Number(values.duration),
              price: Number(values.price),
            });
          }}
        >
          <Field label="Nombre del servicio" name="name" value={editing?.name} required minLength={2} />
          <label>
            Descripción
            <textarea name="description" defaultValue={editing?.description || ''} maxLength={1000} />
          </label>
          <div className="form-grid">
            <Field label="Duración (minutos)" name="duration" type="number" value={editing?.duration || 30} required min={5} max={480} step={1} />
            <Field label="Precio (ARS)" name="price" type="number" value={editing?.price ?? 0} required min={0} max={100000000} step="0.01" />
          </div>
          <button disabled={vm.pending}>{editing ? 'Guardar cambios' : 'Agregar servicio'}</button>
          {editing && (
            <button type="button" className="ghost" onClick={vm.cancelEditing}>
              Cancelar edición
            </button>
          )}
        </form>
      </section>
      <section className="panel">
        <h2>Mis servicios</h2>
        {!vm.services.length && <Empty text="Agregá tu primer servicio para recibir reservas." />}
        {vm.services.map((s) => (
          <div className="service-row" key={s.id}>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <small>
              {s.duration} min · {money(s.price)}
            </small>
            <div className="actions">
              <button className="outline" onClick={() => vm.startEditing(s)}>
                Editar
              </button>
              <button
                className="danger"
                disabled={vm.pending}
                onClick={() => {
                  if (confirm('¿Retirar este servicio? Los turnos existentes se conservan.')) vm.remove(s.id);
                }}
              >
                Retirar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
