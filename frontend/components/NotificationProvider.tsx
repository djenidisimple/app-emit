'use client';

import React, { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { getNotifications, marquerCommeLu, marquerToutLu } from '@/services/notifications';
import { connectSignalR, disconnectSignalR } from '@/services/signalr';
import useAuthStore from '@/store/authStore';
import { Notification } from '@/types';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user?.id || !token || initialized.current) return;
    initialized.current = true;

    getNotifications(user.id, 1, 50)
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => {});

    connectSignalR(token, (data) => {
      addNotification({
        id: data.id,
        utilisateurId: data.utilisateurId,
        message: data.message,
        dateEnvoi: data.dateEnvoi,
        estLu: false,
      });
    });

    return () => {
      disconnectSignalR();
    };
  }, [user?.id, token, setNotifications, addNotification]);

  return <>{children}</>;
}

export { useNotificationStore, marquerCommeLu, marquerToutLu };
