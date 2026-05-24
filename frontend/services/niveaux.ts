// services/niveaux.ts
import { api } from './api';
import { Niveau } from '@/types';

export const niveauService = {
  getAll: () => api.get<Niveau[]>('/niveaux'),
  update: (id: number, data: Partial<Niveau>) =>
    api.put<Niveau>(`/niveaux/${id}`, data),
};