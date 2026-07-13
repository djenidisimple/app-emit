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

  useEffect(() => { 
    setTimeout(() => { fetchNotifications(); }, 0); 
  }, [user]);

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
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-surface rounded-lg border border-border px-4 py-3 flex items-center gap-2">
            <span className="text-xl font-bold text-fg-default">{unreadCount}</span>
            <span className="text-xs font-medium text-fg-muted">non lue{unreadCount > 1 ? 's' : ''}</span>
          </div>
          <div className="bg-surface rounded-lg border border-border px-4 py-3 flex items-center gap-2">
            <span className="text-xl font-bold text-accent">{notifications.length}</span>
            <span className="text-xs font-medium text-fg-muted">totales</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface text-fg-muted border border-border text-sm font-medium hover:bg-bg-muted">
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-sm text-[#ef4444] flex items-center gap-2"><AlertCircle size={15} /> {error}</div>}

      {loading ? (
        <div className="bg-surface rounded-lg border border-border p-5"><LoadingSkeleton lines={6} /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez pas encore de notifications." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button key={n.id} onClick={() => handleMarkAsRead(n.id)}
              className={`w-full text-left rounded-lg border p-4 transition-all duration-150 ${!n.estLu ? 'bg-[rgba(109,93,255,0.05)] border-[rgba(109,93,255,0.2)] border-l-[3px] border-l-accent' : 'bg-surface border-border border-l'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${!n.estLu ? 'bg-accent' : 'bg-bg-muted'}`}>
                  <Bell size={13} className={!n.estLu ? 'text-white' : 'text-fg-subtle'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.estLu ? 'text-fg-default font-medium' : 'text-fg-muted font-normal'}`}>{n.message}</p>
                  <p className="text-xs text-fg-subtle mt-1">
                    {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.estLu && <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
