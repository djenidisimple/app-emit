// services/matieres.ts
import { api } from './api';
import { Matiere } from '@/types';

export const matiereService = {
  getAll: () => api.get<Matiere[]>('/matieres'),
};