import { useState } from 'react';
import type { PublicProfessional } from '../models/types';
import { useApp } from './AppContext';

export const canBook = (p: PublicProfessional) => p.services.length > 0 && p.availability.length > 0;

export function useExploreViewModel() {
  const { professionals, setSelectedProfessional, setPage } = useApp();
  const [search, setSearch] = useState('');

  const query = search.toLowerCase();
  const results = professionals.filter((p) => `${p.businessName} ${p.category}`.toLowerCase().includes(query));

  function choose(professional: PublicProfessional) {
    setSelectedProfessional(professional);
    setPage('booking');
  }

  return { search, setSearch, results, choose, canBook };
}
