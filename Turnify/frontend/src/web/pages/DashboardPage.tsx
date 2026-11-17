import { useDashboardViewModel } from '@/core/viewmodels';
import { dateLabel } from '@/core/utils/format';
import { Empty } from '@/web/components/Empty';
import { Stat } from '@/web/components/Stat';
import { StatusBadge } from '@/web/components/StatusBadge';

export function DashboardPage() {
  const vm = useDashboardViewModel();
  const pro = vm.isProfessional;

  return (
    <>
      <div className="stats">
        <Stat title="Turnos activos" value={vm.stats.active} icon="▦" />
        <Stat title="Pendientes" value={vm.stats.pending} icon="◷" />
        <Stat title={pro ? 'Servicios publicados' : 'Turnos completados'} value={vm.stats.third} icon="◇" />
      </div>
      <div className="dashboard-grid">
        <section className="panel highlight">
          <span className="eyebrow">{pro ? 'HACÉ CRECER TU NEGOCIO' : 'ENCONTRÁ TU PRÓXIMO TURNO'}</span>
          <h2>{pro ? 'Tu agenda empieza con una buena configuración.' : 'Una reserva. Un momento para vos.'}</h2>
          <p>
            {pro
              ? 'Publicá servicios, definí tus horarios y elegí cómo cobrar.'
              : 'Descubrí profesionales y elegí el servicio que necesitás.'}
          </p>
          <button onClick={() => vm.goTo(pro ? 'business' : 'explore')}>
            {pro ? 'Configurar mi negocio' : 'Buscar profesionales'} →
          </button>
        </section>
        <section className="panel">
          <h3>Accesos rápidos</h3>
          <div className="quick-links">
            <button className="outline" onClick={() => vm.goTo('appointments')}>
              ▦ Ver mis turnos
            </button>
            <button className="outline" onClick={() => vm.goTo('profile')}>
              ◎ Editar mi perfil
            </button>
            <button className="outline" onClick={() => vm.goTo(pro ? 'availability' : 'security')}>
              {pro ? '◷ Configurar horarios' : '♧ Configurar seguridad'}
            </button>
          </div>
        </section>
      </div>
      <section className="panel">
        <h3>Próximos turnos</h3>
        {vm.upcoming.map((a) => (
          <div className="preview-row" key={a.id}>
            <span className="mini-avatar">{a.service.name[0]}</span>
            <div>
              <b>{a.service.name}</b>
              <small>
                {dateLabel(a.date)} · {a.startTime} · {pro ? a.client.name : a.professional.businessName}
              </small>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
        {!vm.upcoming.length && <Empty text="Todavía no tenés próximos turnos." />}
      </section>
    </>
  );
}
