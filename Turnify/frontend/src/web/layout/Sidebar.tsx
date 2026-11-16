import { navigationFor, useApp } from '@/core/viewmodels';

export function Sidebar() {
  const { user, isProfessional, page, setPage } = useApp();
  return (
    <aside>
      <div className="sidebar-title">MI ESPACIO / {isProfessional ? 'PROFESIONAL' : 'CLIENTE'}</div>
      {navigationFor(user!.role).map(({ page: id, icon, label }) => (
        <button key={id} className={'nav-item ' + (page === id ? 'active' : '')} onClick={() => setPage(id)}>
          <span>{icon}</span>
          {label}
        </button>
      ))}
      <div className="sidebar-footer">
        <b>Todo bajo control.</b>
        <p>Configurá tu cuenta y organizá tus próximos turnos.</p>
      </div>
    </aside>
  );
}
