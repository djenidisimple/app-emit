'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Search } from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/components/NotificationProvider';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { Notification } from '@/types';

export default function Topbar({ pageTitle }: { pageTitle: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    if (!user?.id) return;
    api
      .get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=5`)
      .then(setNotifications)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.estLu).length;

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
      markAsRead(id);
    } catch {}
  };

  const initials =
    `${user?.nom?.charAt(0) ?? 'U'}${user?.prenom?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-bold text-blue-900">{pageTitle}</h1>

      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Search size={16} />
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white border border-blue-200 rounded-xl shadow-lg p-3">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative w-9 h-9 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-blue-100 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-blue-50 bg-blue-50/50">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Notifications</p>
                <button onClick={() => setDropdownOpen(false)} className="text-blue-400 hover:text-blue-600">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-blue-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-blue-400">Aucune notification</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50/50 transition-colors ${
                        !n.estLu ? 'bg-blue-50 border-l-2 border-l-[#0052FF]' : ''
                      }`}
                    >
                      <p className={`text-blue-900 text-xs leading-relaxed ${!n.estLu ? 'font-semibold' : ''}`}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-blue-400 mt-1">
                        {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>

              <Link
                href="/notifications"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-center text-xs font-semibold text-[#0052FF] hover:bg-blue-50 border-t border-blue-50 transition-colors rounded-b-xl"
              >
                Voir toutes →
              </Link>
            </div>
          )}
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center text-white font-bold text-xs shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
