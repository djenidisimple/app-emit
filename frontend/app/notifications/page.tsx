'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { Notification } from '@/types';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { useNotificationStore } from '@/components/NotificationProvider';
import { css } from 'styled-system/css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const { markAsRead, markAllAsRead } = useNotificationStore();

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true); setError('');
    try {
      const data = await api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=50`);
      setNotifications(data);
    } catch { setError('Impossible de charger les notifications.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/lu`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
      markAsRead(id);
    } catch { /* noop */ }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.put(`/Notification/tout-lire?utilisateurId=${user.id}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, estLu: true })));
      markAllAsRead();
    } catch { /* noop */ }
  };

  const unreadCount = notifications.filter((n) => !n.estLu).length;

  return (
    <ProtectedLayout pageTitle="Notifications">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5', flexWrap: 'wrap', gap: '3' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', px: '4', py: '3', display: 'flex', alignItems: 'center', gap: '2' })}>
            <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'fg.default' })}>{unreadCount}</span>
            <span className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>non lue{unreadCount > 1 ? 's' : ''}</span>
          </div>
          <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', px: '4', py: '3', display: 'flex', alignItems: 'center', gap: '2' })}>
            <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'accent.default' })}>{notifications.length}</span>
            <span className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>totales</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead}
            className={css({ display: 'flex', alignItems: 'center', gap: '2', px: '4', py: '2', rounded: 'lg', bg: 'bg.surface', color: 'fg.muted', border: '1px solid', borderColor: 'border.default', fontSize: 'sm', fontWeight: 'medium', _hover: { bg: 'bg.muted' } })}>
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {error && <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', fontSize: 'sm', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2' })}><AlertCircle size={15} /> {error}</div>}

      {loading ? (
        <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })}><LoadingSkeleton lines={6} /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez pas encore de notifications." />
      ) : (
        <div className={css({ spaceY: '2' })}>
          {notifications.map((n) => (
            <button key={n.id} onClick={() => handleMarkAsRead(n.id)}
              className={css({
                w: 'full', textAlign: 'left', rounded: 'lg', border: '1px solid', p: '4', transition: 'all 0.15s',
                bg: !n.estLu ? 'rgba(109,93,255,0.05)' : 'bg.surface',
                borderColor: !n.estLu ? 'rgba(109,93,255,0.2)' : 'border.default',
                borderLeftWidth: !n.estLu ? '3px' : '1px',
                borderLeftColor: !n.estLu ? 'accent.default' : 'border.default',
              })}>
              <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '3' })}>
                <div className={css({
                  w: '7', h: '7', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0',
                  bg: !n.estLu ? 'accent.default' : 'bg.muted',
                })}>
                  <Bell size={13} className={css({ color: !n.estLu ? '#fff' : 'fg.subtle' })} />
                </div>
                <div className={css({ flex: '1', minWidth: '0' })}>
                  <p className={css({ fontSize: 'sm', lineHeight: 'relaxed', color: !n.estLu ? 'fg.default' : 'fg.muted', fontWeight: !n.estLu ? 'medium' : 'normal' })}>{n.message}</p>
                  <p className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1' })}>
                    {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.estLu && <span className={css({ w: '2', h: '2', bg: 'accent.default', rounded: 'full', flexShrink: '0', mt: '1' })} />}
              </div>
            </button>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
