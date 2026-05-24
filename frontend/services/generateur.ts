// services/generateur.ts
import { api } from './api';
import { GenerationSeancePayload, SeanceCours } from '@/types';

export const generateurService = {
  generer: (payload: GenerationSeancePayload) =>
    api.post<SeanceCours[]>('/seances/generer', payload),
};