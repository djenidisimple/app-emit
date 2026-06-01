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
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Notification[]>(
        `/Notification/utilisateur/${user.id}?page=1&pageSize=50`
      );
      setNotifications(data);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNotifications(); }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
      markAsRead(id);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.patch(`/Notification/utilisateur/${user.id}/read-all`, {});
      setNotifications((prev) => prev.map((n) => ({ ...n, estLu: true })));
      markAllAsRead();
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.estLu).length;

  return (
    <ProtectedLayout pageTitle="Notifications">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-900">{unreadCount}</span>
            <span className="text-xs font-semibold text-blue-500">
              non lue{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold text-[#0052FF]">
              {notifications.length}
            </span>
            <span className="text-xs font-semibold text-blue-500">totales</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 border border-blue-200 shadow-sm text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <LoadingSkeleton lines={6} />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous n'avez pas encore de notifications."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all duration-150 group ${
                !n.estLu
                  ? 'bg-blue-50 border-blue-200 border-l-[4px] border-l-[#0052FF]'
                  : 'bg-white border-blue-100 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    !n.estLu ? 'bg-[#0052FF]' : 'bg-blue-50'
                  }`}
                >
                  <Bell size={14} className={!n.estLu ? 'text-white' : 'text-blue-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      !n.estLu ? 'text-blue-900 font-semibold' : 'text-blue-500 font-normal'
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="text-xs text-blue-400 font-medium mt-1">
                    {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.estLu && (
                  <span className="w-2.5 h-2.5 bg-[#0052FF] rounded-full shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
