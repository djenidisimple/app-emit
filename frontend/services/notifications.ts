import { api } from './api';
import { Notification } from '@/types';

export const getNotifications = async (utilisateurId: number, page = 1, pageSize = 20): Promise<Notification[]> =>
  api.get(`/Notification/utilisateur/${utilisateurId}?page=${page}&pageSize=${pageSize}`);

export const marquerCommeLu = async (id: number): Promise<boolean> =>
  api.patch(`/Notification/${id}/marquer-lu`);
