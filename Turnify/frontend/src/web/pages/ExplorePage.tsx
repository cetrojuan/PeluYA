import { useExploreViewModel } from '@/core/viewmodels';
import { money } from '@/core/utils/format';
import { Empty } from '@/web/components/Empty';
import { Pagination } from '@/web/components/Pagination';

export function ExplorePage() {
  const { search, setSearch, results, choose, canBook, loading, error, pagination, setListPage } = useExploreViewModel();
  return (
    <>
      <label className="search-label">
        Buscar por nombre o rubro
        <input
          value={search}
          maxLength={100}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Barbería, salud, uñas…"
        />
      </label>
      {loading && <p role="status">Buscando profesionales...</p>}
      {error && <p role="alert">{error}</p>}
      <div className="professionals-grid">
        {results.map((p) => (
          <section className="panel professional-card" key={p.id}>
            <div className="card-banner">
              <span className="avatar">{p.businessName[0]}</span>
              <span className="badge">{p.category}</span>
            </div>
            <h2>{p.businessName}</h2>
            <p className="muted">{p.description || 'Atención profesional con reserva online.'}</p>
            <small>{p.address}</small>
            <div className="service-summary">
              {p.services.map((s) => (
                <div key={s.id}>
                  <span>
                    {s.name}
                    <small>{s.duration} min</small>
                  </span>
                  <b>{money(s.price)}</b>
                </div>
              ))}
            </div>
            <p className="muted">Acepta: {p.paymentMethods}</p>
            <button disabled={!canBook(p)} onClick={() => choose(p)}>
              {canBook(p) ? 'Elegir turno →' : 'Sin horarios disponibles'}
            </button>
          </section>
        ))}
      </div>
      {!loading && !error && !results.length && <Empty text="No encontramos profesionales con esa búsqueda." />}
      <Pagination result={pagination} onChange={setListPage} disabled={loading} />
    </>
  );
}
