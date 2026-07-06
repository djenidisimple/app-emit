'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, X, Bell, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { css } from 'styled-system/css';
import { useNotificationStore } from '@/components/NotificationProvider';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { api } from '@/services/api';
import { Notification } from '@/types';

export default function TopNavbar({ pageTitle }: { pageTitle: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const role = user?.role || user?.roles?.[0] || '';
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    if (!user?.id) return;
    api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=5`)
      .then(setNotifications).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.estLu).length;

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/Notification/${id}/lu`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
      markAsRead(id);
    } catch {}
  };

  const initials =
    `${user?.nom?.charAt(0) ?? 'U'}${user?.prenom?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <header
      className={css({
        h: '14',
        bg: 'white',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: '5',
        flexShrink: '0',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '50',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
        <button
          onClick={toggleSidebar}
          className={css({
            w: '8', h: '8', rounded: 'lg',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'fg.muted',
            _hover: { color: 'fg.default', bg: 'bg.muted' },
            transition: 'colors 150ms',
          })}
        >
          <Menu size={18} />
        </button>

        <Link href="/" className={css({ display: 'flex', alignItems: 'center', gap: '2.5', mr: '4' })}>
          <div className={css({
            w: '7', h: '7', bg: 'accent.default', rounded: 'lg',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0',
            boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
          })}>
            <span className={css({ color: 'white', fontSize: '10px', fontWeight: 'bold' })}>GS</span>
          </div>
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>
            G-Salles
          </span>
        </Link>

        <div className={css({ h: '5', w: 'px', bg: 'border.default' })} />
        <h1 className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'fg.muted' })}>
          {pageTitle}
        </h1>
      </div>

      <div className={css({ display: 'flex', alignItems: 'center', gap: '0.5' })}>
        <div className={css({ position: 'relative' })} ref={searchRef}>
          <button onClick={() => setSearchOpen(!searchOpen)}
            className={css({
              w: '8', h: '8', rounded: 'lg',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'fg.muted',
              _hover: { color: 'fg.default', bg: 'bg.muted' },
              transition: 'colors 150ms',
            })}
          >
            <Search size={16} />
          </button>
          {searchOpen && (
            <div className={css({
              position: 'absolute', right: '0', top: '10', w: '64',
              bg: 'white', border: '1px solid', borderColor: 'border.default',
              rounded: 'xl', shadow: 'lg', p: '3', zIndex: '50',
            })}>
              <input type="text" placeholder="Rechercher..."
                className={css({
                  w: 'full', px: '3', py: '1.5', fontSize: 'sm',
                  border: '1px solid', borderColor: 'border.default', rounded: 'lg',
                  outline: 'none', bg: 'bg.muted', color: 'fg.default',
                  _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(59,130,246,0.15)' },
                })}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className={css({ position: 'relative' })} ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className={css({
              position: 'relative', w: '8', h: '8', rounded: 'lg',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'fg.muted',
              _hover: { color: 'fg.default', bg: 'bg.muted' },
              transition: 'colors 150ms',
            })}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className={css({
                position: 'absolute', top: '-0.5', right: '-0.5',
                w: '4', h: '4', bg: 'accent.default', color: 'white',
                fontSize: '9px', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', rounded: 'full',
              })}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={css({
              position: 'absolute', right: '0', mt: '2', w: '80',
              bg: 'white', border: '1px solid', borderColor: 'border.default',
              rounded: 'xl', shadow: 'lg', zIndex: '50', overflow: 'hidden',
            })}>
              <div className={css({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: '4', py: '3', borderBottom: '1px solid', borderColor: 'border.default',
              })}>
                <p className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.muted',
                  textTransform: 'uppercase', letterSpacing: 'wider' })}>
                  Notifications
                </p>
                <button onClick={() => setNotifOpen(false)}
                  className={css({ color: 'fg.muted', _hover: { color: 'fg.default' } })}>
                  <X size={14} />
                </button>
              </div>
              <div className={css({ maxH: '72', overflowY: 'auto' })}>
                {notifications.length === 0 ? (
                  <div className={css({ px: '4', py: '6', textAlign: 'center', fontSize: 'sm', color: 'fg.subtle' })}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <button key={n.id} onClick={() => handleMarkRead(n.id)}
                      className={css({
                        w: 'full', textAlign: 'left', px: '4', py: '3', fontSize: 'sm',
                        _hover: { bg: 'bg.muted' }, transition: 'colors 150ms',
                        borderBottom: '1px solid', borderColor: 'border.default',
                        bg: !n.estLu ? 'bg.muted' : 'transparent',
                        borderLeft: !n.estLu ? '3px solid' : '3px solid transparent',
                        borderLeftColor: !n.estLu ? 'accent.default' : 'transparent',
                      })}
                    >
                      <p className={css({
                        color: 'fg.default', fontSize: 'xs', lineHeight: 'relaxed',
                        fontWeight: !n.estLu ? 'semibold' : 'normal',
                      })}>
                        {n.message}
                      </p>
                      <p className={css({ fontSize: '11px', color: 'fg.subtle', mt: '1' })}>
                        {new Date(n.dateEnvoi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                  ))
                )}
              </div>
              <Link href="/notifications" onClick={() => setNotifOpen(false)}
                className={css({
                  display: 'block', px: '4', py: '2.5', textAlign: 'center',
                  fontSize: 'xs', fontWeight: 'semibold', color: 'accent.default',
                  _hover: { bg: 'bg.muted' }, borderTop: '1px solid', borderColor: 'border.default',
                  transition: 'colors 150ms',
                })}
              >
                Voir toutes →
              </Link>
            </div>
          )}
        </div>

        <div className={css({ position: 'relative' })} ref={accountRef}>
          <button onClick={() => setAccountOpen(!accountOpen)}
            className={css({
              display: 'flex', alignItems: 'center', gap: '2',
              pl: '2.5', ml: '1', borderLeft: '1px solid', borderColor: 'border.default',
              _hover: { bg: 'bg.muted' }, rounded: 'lg', py: '1', pr: '1.5',
              transition: 'colors 150ms',
            })}
          >
            <div className={css({ position: 'relative' })}>
              <div className={css({
                w: '8', h: '8', rounded: 'full', bg: 'accent.default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'semibold', fontSize: 'xs', flexShrink: '0',
              })}>
                {initials}
              </div>
              <span className={css({
                position: 'absolute', bottom: '-0.5', right: '-0.5',
                w: '2.5', h: '2.5', bg: 'green.500', border: '2px solid',
                borderColor: 'white', rounded: 'full',
              })} />
            </div>
            <div className={css({ hideBelow: 'md', textAlign: 'left' })}>
              <p className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.default', lineHeight: 'tight' })}>
                {user?.nom} {user?.prenom}
              </p>
              <p className={css({ fontSize: '10px', color: 'fg.subtle', fontWeight: 'medium' })}>
                {role || 'Utilisateur'}
              </p>
            </div>
            <ChevronDown size={12}
              className={css({
                color: 'fg.subtle', transition: 'transform 150ms',
                transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              })}
            />
          </button>

          {accountOpen && (
            <div className={css({
              position: 'absolute', right: '0', mt: '2', w: '56',
              bg: 'white', border: '1px solid', borderColor: 'border.default',
              rounded: 'xl', shadow: 'lg', zIndex: '50', overflow: 'hidden',
            })}>
              <div className={css({ px: '4', py: '3', borderBottom: '1px solid', borderColor: 'border.default' })}>
                <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default', truncate: 'true' })}>
                  {user?.nom} {user?.prenom}
                </p>
                <p className={css({ fontSize: 'xs', color: 'fg.muted', fontWeight: 'medium' })}>
                  {role || 'Utilisateur'}
                </p>
              </div>
              <button onClick={() => { setAccountOpen(false); logout(); }}
                className={css({
                  display: 'flex', alignItems: 'center', gap: '3', w: 'full',
                  px: '4', py: '2.5', fontSize: 'sm', fontWeight: 'medium',
                  color: 'fg.muted',
                  _hover: { color: 'red.500', bg: 'red.50' },
                  transition: 'colors 150ms',
                })}
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
