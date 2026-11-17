import type { Paginated } from '@/core/models/types';

export function Pagination({ result, onChange, disabled = false }: {
  result: Paginated<unknown> | null;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (!result) return null;
  const { page, totalPages, total } = result;
  return (
    <nav className="pagination" aria-label="Páginas del listado">
      <button className="outline" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>Anterior</button>
      <span aria-live="polite">Página {page} de {totalPages} · {total} resultados</span>
      <button className="outline" disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)}>Siguiente</button>
    </nav>
  );
}
