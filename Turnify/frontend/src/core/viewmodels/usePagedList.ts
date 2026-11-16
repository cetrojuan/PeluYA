import { useEffect, useState } from 'react';
import type { Paginated } from '../models/types';

/** Ignora respuestas viejas al cambiar de filtro/página o salir de la pantalla. */
export function usePagedList<T>(load: (page: number) => Promise<Paginated<T>>, version: number) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setLoading(true);
    setResult(null);
    setError('');
    load(page).then((next) => {
      if (!current) return;
      // Si una cancelación elimina la última página del filtro, volvemos a una válida.
      if (page > next.totalPages) setPage(next.totalPages);
      else setResult(next);
    }).catch((e: Error) => {
      if (current) setError(e.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [page, load, version]);
  return { page, setPage, result, items: result?.items ?? [], loading, error };
}
