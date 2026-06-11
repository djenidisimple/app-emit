import { api } from './api';
import { DemandeEchangeReadDto, DemandeEchangeCreateDto } from '@/types';

export const creerDemande = async (dto: DemandeEchangeCreateDto): Promise<DemandeEchangeReadDto> =>
  api.post<DemandeEchangeReadDto>('/DemandeEchange', dto);

export const getDemandes = async (professeurId?: number): Promise<DemandeEchangeReadDto[]> => {
  let url = '/DemandeEchange';
  if (professeurId) url += `?professeurId=${professeurId}`;
  return api.get<DemandeEchangeReadDto[]>(url);
};

export const getDemandeById = async (id: number): Promise<DemandeEchangeReadDto> =>
  api.get<DemandeEchangeReadDto>(`/DemandeEchange/${id}`);

export const updateStatut = async (id: number, statut: string): Promise<DemandeEchangeReadDto> =>
  api.patch<DemandeEchangeReadDto>(`/DemandeEchange/${id}/statut`, { statut });
