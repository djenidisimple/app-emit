import { api } from './api';
import { CreerExceptionDto } from '@/types';

export interface ReponseException {
  id: number;
  seanceCoursId: number;
  dateDebut: string;
  dateFin?: string;
  typeException: string;
  motif?: string;
  nouvelleSalleId?: number;
  dateCreation: string;
}

export const annulerCours = async (dto: CreerExceptionDto): Promise<ReponseException> =>
  api.post('/Exception/annuler', dto);

export const reporterCours = async (dto: CreerExceptionDto): Promise<ReponseException> =>
  api.post('/Exception/reporter', dto);

export const rendreIndisponible = async (dto: CreerExceptionDto): Promise<ReponseException> =>
  api.post('/Exception/indisponible', dto);
