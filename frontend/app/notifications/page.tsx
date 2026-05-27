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
      const data = await api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=50`);
      setNotifications(data);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLu: true } : n));
      markAsRead(id);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.patch(`/Notification/utilisateur/${user.id}/read-all`, {});
      setNotifications(prev => prev.map(n => ({ ...n, estLu: true })));
      markAllAsRead();
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.estLu).length;

  return (
    <ProtectedLayout pageTitle="Notifications">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#6C757D]">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="border border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#E8EEF8] font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton lines={6} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5" />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez pas encore de notifications." />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              className={`w-full text-left rounded-xl border shadow-sm p-4 transition-shadow duration-200 hover:shadow-md ${
                !n.estLu
                  ? 'bg-[#E8EEF8] border-[#E9ECEF] border-l-[3px] border-l-[#1B3A6B]'
                  : 'bg-white border-[#E9ECEF]'
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className={`w-5 h-5 mt-0.5 ${!n.estLu ? 'text-[#1B3A6B]' : 'text-[#ADB5BD]'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${!n.estLu ? 'text-[#212529] font-medium' : 'text-[#6C757D]'}`}>{n.message}</p>
                  <p className="text-xs text-[#ADB5BD] mt-1">
                    {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.estLu && <span className="w-2 h-2 bg-[#1B3A6B] rounded-full mt-2" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
