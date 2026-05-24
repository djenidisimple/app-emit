// services/parcours.ts
import { api } from './api';
import { Parcours } from '@/types';

export const parcoursService = {
  getAll: () => api.get<Parcours[]>('/parcours'),
  update: (id: number, data: Partial<Parcours>) =>
    api.put<Parcours>(`/parcours/${id}`, data),
};