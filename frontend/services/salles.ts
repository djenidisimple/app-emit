// services/salles.ts
import { api } from './api';
import { Salle } from '@/types';

export const salleService = {
  getAll: () => api.get<Salle[]>('/Salles'),
  getDisponibles: (date: string, creneauId: number) =>
    api.get<Salle[]>(`/Salles/disponibles?date=${encodeURIComponent(date)}&creneauId=${creneauId}`),
};