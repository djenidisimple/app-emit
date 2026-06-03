'use client';

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { PlanningHebdoResponse, SeancePlanningDto } from '@/types';

interface PlanningFilters {
  startDate: string;
  professeurId?: number;
  salleId?: number;
  niveauId?: number;
}

export function usePlanning() {
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState<string>('');
  const [weekEnd, setWeekEnd] = useState<string>('');

  const fetchPlanning = useCallback(async (filters: PlanningFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('startDate', filters.startDate);
      if (filters.professeurId) params.set('professeurId', filters.professeurId.toString());
      if (filters.salleId) params.set('salleId', filters.salleId.toString());
      if (filters.niveauId) params.set('niveauId', filters.niveauId.toString());

      const response = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?${params}`);
      setSeances(response.seances || []);
      setWeekStart(response.lundi || '');
      setWeekEnd(response.samedi || '');
    } catch (err) {
      console.error('Error fetching planning:', err);
      setSeances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { seances, loading, weekStart, weekEnd, fetchPlanning };
}
