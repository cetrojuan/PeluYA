import { AppProvider, useApp } from '@/core/viewmodels';
import { Header } from '@/web/layout/Header';
import { Notice } from '@/web/layout/Notice';
import { PageHeading } from '@/web/layout/PageHeading';
import { Sidebar } from '@/web/layout/Sidebar';
import { AppointmentsPage } from '@/web/pages/AppointmentsPage';
import { AuthPage } from '@/web/pages/AuthPage';
import { AvailabilityPage } from '@/web/pages/AvailabilityPage';
import { BookingPage } from '@/web/pages/BookingPage';
import { BusinessPage } from '@/web/pages/BusinessPage';
import { DashboardPage } from '@/web/pages/DashboardPage';
import { ExplorePage } from '@/web/pages/ExplorePage';
import { LandingPage } from '@/web/pages/LandingPage';
import { ProfilePage } from '@/web/pages/ProfilePage';
import { SecurityPage } from '@/web/pages/SecurityPage';
import { ServicesPage } from '@/web/pages/ServicesPage';

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { user, loading } = useApp();
  if (loading) return <div className="loading">Cargando Turnify…</div>;
  return (
    <>
      <div className="background" aria-hidden="true" />
      <Header />
      <Notice />
      {user ? <Workspace /> : <PublicArea />}
      <footer>Turnify · Tu tiempo, mejor organizado.</footer>
    </>
  );
}

function PublicArea() {
  const { page } = useApp();
  if (page === 'login' || page === 'register') return <AuthPage mode={page} />;
  return <LandingPage />;
}

function Workspace() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="workspace">
        <PageHeading />
        <CurrentPage />
      </main>
    </div>
  );
}

/** Elige la pantalla según `page` y el rol. */
function CurrentPage() {
  const { page, profile, isProfessional, selectedProfessional } = useApp();
  if (!profile) return <div className="panel">Cargando tu panel…</div>;

  switch (page) {
    case 'dashboard': return <DashboardPage />;
    case 'profile': return <ProfilePage />;
    case 'security': return <SecurityPage />;
    case 'appointments': return <AppointmentsPage />;
    case 'business': return isProfessional ? <BusinessPage /> : null;
    case 'services': return isProfessional ? <ServicesPage /> : null;
    case 'availability': return isProfessional ? <AvailabilityPage /> : null;
    case 'explore': return !isProfessional ? <ExplorePage /> : null;
    case 'booking': return !isProfessional && selectedProfessional ? <BookingPage /> : null;
    default: return null;
  }
}
