import { useApp } from '@/core/viewmodels';
import { firstName } from '@/core/utils/format';

export function Header() {
  const { user, isProfessional, pending, setPage, logout } = useApp();
  return (
    <header>
      <button className="brand" onClick={() => setPage(user ? 'dashboard' : 'home')}>
        <span className="brand-icon">T</span>Turnify<span className="brand-dot">.</span>
      </button>
      <nav>
        {user ? (
          <>
            <span className="user-chip">
              {isProfessional ? 'Profesional' : 'Cliente'} · {firstName(user.name)}
            </span>
            <button className="outline" disabled={pending} onClick={logout}>
              Cerrar sesión ↗
            </button>
          </>
        ) : (
          <>
            <button className="ghost" onClick={() => setPage('login')}>
              Ingresar
            </button>
            <button onClick={() => setPage('register')}>Crear cuenta</button>
          </>
        )}
      </nav>
    </header>
  );
}
