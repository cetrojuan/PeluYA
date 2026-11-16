import { navigationFor, useApp } from '@/core/viewmodels';
import { dateLabel, firstName, today } from '@/core/utils/format';

export function PageHeading() {
  const { user, isProfessional, page } = useApp();
  const title =
    page === 'dashboard'
      ? `Hola, ${firstName(user!.name)} 👋`
      : page === 'booking'
        ? 'Reservá tu turno'
        : navigationFor(user!.role).find((item) => item.page === page)?.label;

  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{isProfessional ? 'PANEL PROFESIONAL' : 'PANEL DE CLIENTE'}</span>
        <h1>{title}</h1>
        <p className="muted">
          {page === 'dashboard'
            ? 'Un vistazo a tu actividad y a lo que viene.'
            : 'Administrá tu información desde un solo lugar.'}
        </p>
      </div>
      <span className="date-chip">{dateLabel(today())}</span>
    </div>
  );
}
