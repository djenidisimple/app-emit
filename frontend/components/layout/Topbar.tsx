'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/components/NotificationProvider';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { Notification } from '@/types';
import Link from 'next/link';

export default function Topbar({ pageTitle }: { pageTitle: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    if (!user?.id) return;
    api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=5`).then(setNotifications).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.estLu).length;

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLu: true } : n));
      markAsRead(id);
    } catch {}
  };

  return (
    <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-[22px] font-bold text-[#1B3A6B]">{pageTitle}</h1>
      <div className="flex items-center gap-4" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-2 rounded-lg hover:bg-[#E8EEF8] transition-colors duration-150"
          >
            <Bell className="w-5 h-5 text-[#6C757D]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#C62828] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E9ECEF] overflow-hidden z-50">
              <div className="p-3 border-b border-[#E9ECEF]">
                <p className="text-sm font-semibold text-[#212529]">Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#6C757D]">Aucune notification</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`w-full text-left px-4 py-3 text-sm border-b border-[#F1F3F5] hover:bg-[#F8F9FA] transition-colors ${!n.estLu ? 'bg-[#E8EEF8]' : ''}`}
                    >
                      <p className="text-[#212529]">{n.message}</p>
                      <p className="text-xs text-[#6C757D] mt-1">{new Date(n.dateEnvoi).toLocaleDateString('fr-FR')}</p>
                    </button>
                  ))
                )}
              </div>
              <Link
                href="/notifications"
                onClick={() => setDropdownOpen(false)}
                className="block p-3 text-center text-sm font-semibold text-[#1B3A6B] hover:bg-[#E8EEF8] transition-colors border-t border-[#E9ECEF]"
              >
                Voir toutes
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold text-xs">
            {user?.nom?.charAt(0) || 'U'}{user?.prenom?.charAt(0) || ''}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#212529]">{user?.nom} {user?.prenom}</p>
            <p className="text-[10px] text-[#6C757D] uppercase font-semibold tracking-wide">{user?.role || 'Utilisateur'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
