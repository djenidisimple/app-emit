// services/creneaux.ts
import { api } from './api';
import { Creneau } from '@/types';

export const creneauService = {
  getAll: () => api.get<Creneau[]>('/creneaux'),
};