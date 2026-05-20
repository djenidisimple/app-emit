// services/filieres.ts
import { api } from './api';
import { Filiere } from '@/types';

export const filiereService = {
  getAll: () => api.get<Filiere[]>('/filieres'),
  update: (id: number, data: Partial<Filiere>) =>
    api.put<Filiere>(`/filieres/${id}`, data),
};