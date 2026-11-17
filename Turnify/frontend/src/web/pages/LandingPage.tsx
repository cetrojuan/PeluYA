import { useApp } from '@/core/viewmodels';

export function LandingPage() {
  const { setPage } = useApp();
  return (
    <main className="landing">
      <section className="landing-hero">
        <span className="eyebrow">TU PRÓXIMO TURNO EMPIEZA ACÁ</span>
        <h1>
          Menos vueltas.
          <br />
          <em>Más tiempo para vos.</em>
        </h1>
        <p>
          Conectá con profesionales y reservá en minutos.
          <br />
          Si tenés un negocio, organizá todo desde tu panel.
        </p>
        <div className="actions">
          <button onClick={() => setPage('register')}>Empezar ahora →</button>
          <button className="outline" onClick={() => setPage('login')}>
            Ya tengo una cuenta
          </button>
        </div>
        <div className="benefits">
          <span>✓ Simple y rápido</span>
          <span>✓ Desde tu celular</span>
          <span>✓ Para cada rubro</span>
        </div>
      </section>
      <section className="landing-card panel">
        <span className="eyebrow">TODO EN UN MISMO LUGAR</span>
        <h2>Tu agenda, en orden.</h2>
        <div className="mock-slot">
          <span>09:00</span>
          <div>
            <b>Consultas y bienestar</b>
            <small>Salud · Atención personalizada</small>
          </div>
          <span className="badge">◷</span>
        </div>
        <div className="mock-slot">
          <span>11:30</span>
          <div>
            <b>Un momento para vos</b>
            <small>Barbería · Belleza · Uñas</small>
          </div>
          <span className="badge">◇</span>
        </div>
        <div className="tip">Elegí tu servicio, tu día y tu horario.</div>
      </section>
    </main>
  );
}
