import { api } from './api';
import { PlanningHebdoResponse } from '@/types';

export const getPlanningHebdo = async (params?: {
  startDate?: string;
  professeurId?: number;
  salleId?: number;
  niveauId?: number;
}): Promise<PlanningHebdoResponse> => {
  let url = '/Planning/hebdo';
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('StartDate', params.startDate);
  if (params?.professeurId) searchParams.set('professeurId', String(params.professeurId));
  if (params?.salleId) searchParams.set('salleId', String(params.salleId));
  if (params?.niveauId) searchParams.set('niveauId', String(params.niveauId));
  const qs = searchParams.toString();
  if (qs) url += `?${qs}`;
  return api.get<PlanningHebdoResponse>(url);
};
