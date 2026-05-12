'use client';

import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.estLu).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-emit-blue hover:bg-emit-bg rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-emit-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-emit-border z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-emit-border bg-emit-bg">
                <h3 className="font-poppins font-bold text-emit-blue">Notifications</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        onMarkAsRead(notif.id);
                        // Ne pas fermer forcément au clic
                      }}
                      className={`p-4 border-b border-emit-border/50 hover:bg-emit-bg cursor-pointer transition-colors flex gap-3 ${!notif.estLu ? 'bg-emit-orange/5' : ''}`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.estLu ? 'bg-emit-orange' : 'bg-transparent'}`}></div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.estLu ? 'font-semibold' : 'text-emit-text/80'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-emit-text/50 mt-1">
                          {new Date(notif.dateEnvoi).toLocaleString()}
                        </p>
                      </div>
                      {!notif.estLu && (
                        <Check size={14} className="text-emit-orange" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-emit-text/50 text-sm italic">
                    Aucune notification
                  </div>
                )}
              </div>

              <div className="p-3 text-center border-t border-emit-border bg-emit-bg">
                <button className="text-xs font-semibold text-emit-blue hover:underline">
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
