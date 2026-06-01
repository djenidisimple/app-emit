'use client';

import React from 'react';
import {
  Calendar,
  CheckSquare,
  Building2,
  BookOpen,
  Users,
  Bell,
  Repeat,
  DoorOpen,
  LayoutList,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const adminLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Planning', path: '/planning', icon: Calendar },
  { name: 'Réservations', path: '/admin/reservations', icon: CheckSquare },
  { name: 'Salles', path: '/salles', icon: Building2 },
  { name: 'Référentiel', path: '/admin', icon: BookOpen },
  { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

const profLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Mon Planning', path: '/planning', icon: Calendar },
  { name: 'Échanges', path: '/echanges/mes-demandes', icon: Repeat },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

const etudiantLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Planning', path: '/planning', icon: Calendar },
  { name: 'Réserver', path: '/reservations/nouvelle', icon: DoorOpen },
  { name: 'Mes réservations', path: '/reservations', icon: LayoutList },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const role = user?.role || user?.roles?.[0] || '';

  const navLinks =
    role === 'Admin' ? adminLinks : role === 'Professeur' ? profLinks : etudiantLinks;

  const isActive = (path: string) => {
    if (path === '/admin')
      return pathname.startsWith('/admin') && pathname !== '/admin/reservations' && pathname !== '/admin/utilisateurs';
    if (path === '/admin/reservations') return pathname === '/admin/reservations';
    if (path === '/admin/utilisateurs') return pathname === '/admin/utilisateurs';
    if (path === '/echanges/mes-demandes') return pathname.startsWith('/echanges');
    if (path === '/reservations/nouvelle') return pathname === '/reservations/nouvelle';
    return pathname === path;
  };

  const initials =
    `${user?.nom?.charAt(0) ?? 'U'}${user?.prenom?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <aside className="w-60 bg-white h-screen flex flex-col shrink-0 border-r border-blue-100">
      <div className="px-5 pt-5 pb-4 border-b border-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052FF] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <div>
            <span className="text-base font-bold text-blue-900 leading-none block">G-Salles</span>
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">EMIT</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-900 truncate">
              {user?.nom} {user?.prenom}
            </p>
            <p className="text-[11px] text-blue-400 font-medium">
              {role || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <p className="px-2 pb-2 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
          Navigation
        </p>
        <div className="space-y-0.5">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-[#0052FF]'
                }`}
              >
                <item.icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-blue-50">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
