// services/utilisateurs.ts
import { api } from './api';
import { Utilisateur } from '@/types';

export const utilisateurService = {
  getEnseignants: () =>
    api.get<Utilisateur[]>('/utilisateurs?role=Professeur'),
};