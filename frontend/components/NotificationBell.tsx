'use client';

import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types';
import { css } from 'styled-system/css';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.estLu).length;

  const bellBtn = css({
    position: 'relative',
    p: '2',
    color: 'fg.muted',
    _hover: { bg: 'bg.muted' },
    rounded: 'lg',
    transition: 'colors',
  });

  const badge = css({
    position: 'absolute',
    top: '0',
    right: '0',
    w: '4',
    h: '4',
    bg: '#f59e0b',
    color: 'white',
    fontSize: '8px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    border: '2px solid',
    borderColor: 'bg.surface',
  });

  const dropdown = css({
    position: 'absolute',
    right: '0',
    mt: '2',
    w: '80',
    bg: 'bg.surface',
    rounded: 'lg',
    shadow: 'lg',
    border: '1px solid',
    borderColor: 'border.default',
    zIndex: '50',
    overflow: 'hidden',
  });

  return (
    <div className={css({ position: 'relative' })}>
      <button onClick={() => setIsOpen(!isOpen)} className={bellBtn}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={badge}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className={css({ position: 'fixed', inset: '0', zIndex: '40' })} onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={dropdown}
            >
              <div className={css({ p: '3', borderBottom: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })}>
                <h3 className={css({ fontWeight: 'semibold', color: 'fg.default', fontSize: 'sm' })}>Notifications</h3>
              </div>

              <div className={css({ maxH: '96', overflowY: 'auto' })}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={css({ p: '3', borderBottom: '1px solid', borderColor: 'bg.muted', _hover: { bg: 'bg.muted' }, cursor: 'pointer', transition: 'colors', display: 'flex', gap: '3', ...(notif.estLu ? {} : { bg: 'rgba(79,94,255,0.05)' }) })}
                    >
                      <div className={css({ mt: '1', w: '2', h: '2', rounded: 'full', flexShrink: '0', bg: notif.estLu ? 'transparent' : 'accent.default' })}></div>
                      <div className={css({ flex: '1' })}>
                        <p className={css({ fontSize: 'sm', ...(notif.estLu ? { color: 'fg.muted' } : { fontWeight: 'semibold', color: 'fg.default' }) })}>
                          {notif.message}
                        </p>
                        <p className={css({ fontSize: '10px', color: 'fg.subtle', mt: '1' })}>
                          {new Date(notif.dateEnvoi).toLocaleString()}
                        </p>
                      </div>
                      {!notif.estLu && (
                        <Check size={14} className={css({ color: 'accent.default' })} />
                      )}
                    </div>
                  ))
                ) : (
                  <div className={css({ p: '8', textAlign: 'center', color: 'fg.subtle', fontSize: 'sm', fontStyle: 'italic' })}>
                    Aucune notification
                  </div>
                )}
              </div>

              <div className={css({ p: '2.5', textAlign: 'center', borderTop: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })}>
                <button
                  onClick={() => { onMarkAllAsRead?.(); setIsOpen(false); }}
                  className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'accent.default', _hover: { textDecoration: 'underline' } })}
                >
                  Tout marquer comme lu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
