'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, marquerCommeLu, marquerToutLu } from '@/services/notifications';
import { connectSignalR, disconnectSignalR } from '@/services/signalr';
import { Notification } from '@/types';
import useAuthStore from '@/store/authStore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuthStore();
  const userIdRef = useRef<number | undefined>(undefined);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.id, 1, 50);
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.estLu).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id || !token) return;
    if (user.id === userIdRef.current) return;
    userIdRef.current = user.id;

    fetchNotifications();

    connectSignalR(token, (data) => {
      const newNotif: Notification = {
        id: data.id,
        utilisateurId: data.utilisateurId,
        message: data.message,
        dateEnvoi: data.dateEnvoi,
        estLu: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      disconnectSignalR();
    };
  }, [user?.id, token, fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await marquerCommeLu(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estLu: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await marquerToutLu(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, estLu: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [user]);

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead };
}
