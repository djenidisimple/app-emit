import { api } from './api';
import { DemandeEchangeReadDto, DemandeEchangeCreateDto } from '@/types';

export const creerDemande = async (dto: DemandeEchangeCreateDto): Promise<DemandeEchangeReadDto> =>
  api.post('/DemandeEchange', dto);

export const getDemandes = async (professeurId?: number): Promise<DemandeEchangeReadDto[]> => {
  let url = '/DemandeEchange';
  if (professeurId) url += `?professeurId=${professeurId}`;
  return api.get(url);
};

export const getDemandeById = async (id: number): Promise<DemandeEchangeReadDto> =>
  api.get(`/DemandeEchange/${id}`);

export const updateStatut = async (id: number, statut: string): Promise<DemandeEchangeReadDto> =>
  api.patch(`/DemandeEchange/${id}/statut`, { statut });
