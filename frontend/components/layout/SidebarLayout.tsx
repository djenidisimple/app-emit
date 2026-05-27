'use client';

import React from 'react';
import {
  LayoutDashboard, Calendar, MapPin, LogOut,
  CalendarRange, CalendarCheck, Repeat, Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { useNotificationStore, marquerCommeLu, marquerToutLu } from '@/components/NotificationProvider';
import NotificationBell from '@/components/NotificationBell';

function NavItem({ icon: Icon, label, active = false, href }: { icon: React.ElementType; label: string; active?: boolean; href?: string }) {
  const content = (
    <div className={`flex items-center gap-3 w-full p-2.5 rounded-md transition-all font-poppins text-sm ${
      active ? 'bg-emit-blue text-white shadow-sm' : 'text-emit-text/70 hover:bg-gray-50 hover:text-emit-blue'
    }`}>
      <Icon size={19} />{label}
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function SidebarLayout({ children }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { notifications, markAllAsRead } = useNotificationStore();
  const role = user?.role || user?.roles?.[0] || '';
  const isAdmin = role === 'Admin';
  const isProf = role === 'Professeur' || isAdmin;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Planning', path: '/planning', icon: Calendar },
    { name: 'EDT Globale', path: '/edt-globale', icon: CalendarRange },
    { name: 'Salles', path: '/salles', icon: MapPin },
    { name: 'Réservations', path: '/reservations', icon: CalendarCheck },
    ...(isProf ? [{ name: 'Échanges', path: '/echanges/mes-demandes', icon: Repeat }] : []),
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/echanges/mes-demandes') {
      return pathname.startsWith('/echanges');
    }
    return pathname === path;
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await marquerCommeLu(id);
      useNotificationStore.getState().markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await marquerToutLu(user.id);
      markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-emit-border flex flex-col fixed h-screen z-30">
        <div className="p-6">
          <h1 className="text-xl font-poppins font-bold tracking-tight text-emit-blue">G-SALLES</h1>
          <p className="text-[10px] text-emit-text/40 uppercase tracking-widest mt-1">EMIT Fianarantsoa</p>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.name}
              active={isActive(item.path)}
              href={item.path}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-emit-border">
          <div className="flex items-center gap-3 mb-3 px-2.5">
            <div className="w-8 h-8 rounded-full bg-emit-orange text-white flex items-center justify-center font-bold font-poppins text-xs">
              {user?.nom?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emit-blue truncate">{user?.nom} {user?.prenom}</p>
              <p className="text-[10px] text-emit-text/50 uppercase font-semibold">{role || 'Utilisateur'}</p>
            </div>
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-2.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-poppins text-emit-text/70"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
