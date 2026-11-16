import { useCallback, useState } from 'react';
import { professionalsApi } from '../api';
import type { PublicProfessional } from '../models/types';
import { useApp } from './AppContext';
import { usePagedList } from './usePagedList';

export const canBook = (p: PublicProfessional) => p.services.length > 0 && p.availability.length > 0;

export function useExploreViewModel() {
  const { dataVersion, setSelectedProfessional, setPage } = useApp();
  const [search, setSearch] = useState('');

  const load = useCallback((page: number) => professionalsApi.list(page, search), [search]);
  const list = usePagedList(load, dataVersion);

  function choose(professional: PublicProfessional) {
    setSelectedProfessional(professional);
    setPage('booking');
  }

  return { search, setSearch: (value: string) => { setSearch(value); list.setPage(1); },
    results: list.items, choose, canBook, loading: list.loading, error: list.error,
    pagination: list.result, setListPage: list.setPage };
}
