import { api } from './api';
import { Notification } from '@/types';

export const getNotifications = async (utilisateurId: number, page = 1, pageSize = 20): Promise<Notification[]> =>
  api.get<Notification[]>(`/Notification/utilisateur/${utilisateurId}?page=${page}&pageSize=${pageSize}`);

export const marquerCommeLu = async (id: number): Promise<void> =>
  api.patch<void>(`/Notification/${id}/lu`);

export const marquerToutLu = async (utilisateurId: number): Promise<{ success: boolean }> =>
  api.patch<{ success: boolean }>(`/Notification/tout-lire?utilisateurId=${utilisateurId}`);
