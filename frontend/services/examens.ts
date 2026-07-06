import { api } from './api';
import { ExamenReadDto, ExamenCreateDto, ExamenUpdateDto } from '@/types';

export const examenService = {
  getAll: () => api.get<ExamenReadDto[]>('/examens'),

  getById: (id: number) => api.get<ExamenReadDto>(`/examens/${id}`),

  getByNiveau: (niveauId: number) =>
    api.get<ExamenReadDto[]>(`/examens/niveau/${niveauId}`),

  getByParcours: (parcoursId: number) =>
    api.get<ExamenReadDto[]>(`/examens/parcours/${parcoursId}`),

  create: (dto: ExamenCreateDto) =>
    api.post<ExamenReadDto>('/examens', dto),

  update: (id: number, dto: ExamenUpdateDto) =>
    api.put<ExamenReadDto>(`/examens/${id}`, dto),

  delete: (id: number) =>
    api.delete<void>(`/examens/${id}`),
};
