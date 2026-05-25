// services/salles.ts
import { api } from './api';
import { Salle } from '@/types';

export const salleService = {
  getAll: () => api.get<Salle[]>('/Salles'),
};