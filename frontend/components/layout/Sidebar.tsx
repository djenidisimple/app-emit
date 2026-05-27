'use client';

import React from 'react';
import { Calendar, CheckSquare, Building2, BookOpen, Users, Bell, Repeat, DoorOpen, LogOut, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const adminLinks = [
  { name: 'Planning', path: '/planning', icon: Calendar },
  { name: 'Réservations', path: '/admin/reservations', icon: CheckSquare, badge: 'notifications' as const },
  { name: 'Salles', path: '/salles', icon: Building2 },
  { name: 'Référentiel', path: '/admin', icon: BookOpen },
  { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: 'notifications' as const },
];

const profLinks = [
  { name: 'Mon Planning', path: '/planning', icon: Calendar },
  { name: 'Échange de créneaux', path: '/echanges/mes-demandes', icon: Repeat },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: 'notifications' as const },
];

const etudiantLinks = [
  { name: 'Planning', path: '/planning', icon: Calendar },
  { name: 'Réserver une salle', path: '/reservations/nouvelle', icon: DoorOpen },
  { name: 'Mes réservations', path: '/reservations', icon: LayoutList },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: 'notifications' as const },
];

function NavItem({ icon: Icon, label, active = false, href, badge }: { icon: React.ElementType; label: string; active?: boolean; href?: string; badge?: string }) {
  const content = (
    <div className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
      active
        ? 'bg-white/15 text-white shadow-sm border-l-[3px] border-white'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`}>
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge && <span className="w-2 h-2 bg-[#C62828] rounded-full" />}
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function Sidebar({ notificationBadge = 0 }: { notificationBadge?: number }) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const role = user?.role || user?.roles?.[0] || '';

  const navLinks = role === 'Admin' ? adminLinks : role === 'Professeur' ? profLinks : etudiantLinks;

  const isActive = (path: string) => {
    if (path === '/admin') return pathname.startsWith('/admin') && pathname !== '/admin/reservations' && pathname !== '/admin/utilisateurs';
    if (path === '/admin/reservations') return pathname === '/admin/reservations';
    if (path === '/admin/utilisateurs') return pathname === '/admin/utilisateurs';
    if (path === '/echanges/mes-demandes') return pathname.startsWith('/echanges');
    if (path === '/reservations/nouvelle') return pathname === '/reservations/nouvelle';
    return pathname === path;
  };

  return (
    <aside className="w-64 bg-[#1B3A6B] h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <Link href="/planning" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <span className="text-white text-lg font-bold">G-Salles</span>
        </Link>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">
            {user?.nom?.charAt(0) || 'U'}{user?.prenom?.charAt(0) || ''}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user?.nom} {user?.prenom}</p>
            <p className="text-white/60 text-xs">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.name}
            active={isActive(item.path)}
            href={item.path}
            badge={item.badge}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 text-sm font-medium"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
