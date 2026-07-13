'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Calendar, Building2, Bookmark,
  ArrowLeftRight, Users, Bell, CalendarDays,
  ChevronRight, FileText, GraduationCap, Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import useAuthStore from '@/store/authStore';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

interface RoleSidebarProps {
  links: NavItem[];
}

function isActive(path: string, pathname: string): boolean {
  if (path === '/echanges') return pathname.startsWith('/echanges');
  if (path === '/referentiel') return pathname.startsWith('/admin/');
  if (path === '/edt-globale') return pathname === '/edt-globale' || pathname === '/mes-seances' || pathname === '/planning';
  return pathname === path || pathname.startsWith(path + '/');
}

export const adminNav: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Planning', path: '/edt-globale', icon: Calendar,
    children: [
      { name: 'EDT globale', path: '/edt-globale', icon: Calendar },
      { name: 'Mes séances', path: '/mes-seances', icon: CalendarDays },
    ],
  },
  { name: 'Salles', path: '/salles', icon: Building2 },
  { name: 'Réservations', path: '/reservations', icon: Bookmark },
  {
    name: 'Échanges', path: '/echanges', icon: ArrowLeftRight,
    children: [
      { name: 'Mes demandes', path: '/echanges/mes-demandes', icon: ArrowLeftRight },
      { name: 'Demandes reçues', path: '/echanges/demandes-recues', icon: ArrowLeftRight },
      { name: 'Nouvelle', path: '/echanges/nouvelle', icon: ArrowLeftRight },
    ],
  },
  {
    name: 'Référentiel', path: '/referentiel', icon: GraduationCap,
    children: [
      { name: 'Parcours', path: '/admin/parcours', icon: GraduationCap },
      { name: 'Niveaux', path: '/admin/niveaux', icon: GraduationCap },
      { name: 'Matières', path: '/admin/matieres', icon: GraduationCap },
    ],
  },
  { name: 'Présences', path: '/admin/attendance', icon: CalendarDays },
  { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
  { name: 'Examens', path: '/admin/examens', icon: FileText },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export const professeurNav: NavItem[] = [
  { name: 'Mon planning', path: '/planning', icon: Calendar },
  { name: 'Mes séances', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Salles', path: '/salles', icon: Building2 },
  {
    name: 'Échanges', path: '/echanges', icon: ArrowLeftRight,
    children: [
      { name: 'Mes demandes', path: '/echanges/mes-demandes', icon: ArrowLeftRight },
      { name: 'Demandes reçues', path: '/echanges/demandes-recues', icon: ArrowLeftRight },
      { name: 'Nouvelle', path: '/echanges/nouvelle', icon: ArrowLeftRight },
    ],
  },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export const etudiantNav: NavItem[] = [
  { name: 'Mon planning', path: '/planning', icon: Calendar },
  { name: 'Mes examens', path: '/mes-examens', icon: FileText },
  { name: 'Réservations', path: '/reservations', icon: Bookmark },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export default function RoleSidebar({ links }: RoleSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const { user } = useAuthStore();

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const displayName = user ? `${user.prenom ?? ''} ${user.nom ?? ''}` : 'Utilisateur';
  const email = user?.email ?? 'user@emit.mg';

  return (
    <aside className={`bg-white h-full flex flex-col border-r border-[#EEF0F4] shrink-0 transition-[width] duration-300 ${sidebarCollapsed ? 'overflow-y-hidden w-14' : 'overflow-hidden w-[220px]'}`}>
      {!sidebarCollapsed && (
        <div className="px-4 pt-5 pb-2 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#5A55F2] relative shrink-0">
              <div className="absolute inset-[6px] bg-white rounded-[3px] opacity-90" />
            </div>
            <span className="font-bold text-base text-[#111827]">App-EMIT.</span>
          </div>

          {/* Workspace */}
          <div className="flex items-center gap-2.5 bg-[#F7F7FA] rounded-[10px] p-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#FF6A3D] shrink-0" />
            <div className="leading-tight">
              <div className="font-semibold text-[12px] text-[#111827]">Scolarité Workspace</div>
              <div className="text-[11px] text-[#8A8FA3]">Project Team</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F7F7FA] rounded-[10px] p-2 text-[#8A8FA3] text-[12px] mb-4.5">
            <Search size={15} className="shrink-0" />
            <span>Search</span>
            <span className="ml-auto text-[10px] text-[#B4B8C6] border border-[#E7E8EE] rounded-[4px] px-1 py-0.5">⌘F</span>
          </div>

          <div className="text-[10px] tracking-wide text-[#B4B8C6] font-bold uppercase mb-2 mx-1.5">Main menu</div>
          
          <nav className="flex-1 py-0 px-0 overflow-y-auto flex flex-col gap-0.5">
            {links.map((item) => {
              const active = isActive(item.path, pathname);
              const isExpanded = expandedGroups.includes(item.path);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.path}>
                  {hasChildren ? (
                    <>
                      <button onClick={() => !sidebarCollapsed && toggleGroup(item.path)}
                        className={`flex items-center gap-2.5 w-full text-[13px] font-medium rounded-[10px] transition-all duration-200 ${
                          sidebarCollapsed ? 'px-0 justify-center' : 'px-2.5 py-2 justify-start'
                        } ${
                          active
                            ? 'bg-[#5A55F2] text-white'
                            : 'bg-transparent text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827]'
                        }`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <item.icon size={17} className={`shrink-0 ${active ? 'opacity-100' : 'opacity-75'}`} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 truncate text-left">{item.name}</span>
                            <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 text-[#B4B8C6] ${isExpanded ? 'rotate-90' : ''}`} style={active ? { color: 'rgba(255,255,255,0.7)' } : undefined} />
                          </>
                        )}
                      </button>
                      {!sidebarCollapsed && isExpanded && (
                        <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l-2 border-[#EEF0F4] pl-3">
                          {item.children!.map((child) => {
                            const childActive = isActive(child.path, pathname);
                            return (
                              <Link key={child.path} href={child.path}
                               className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 ${
                                 childActive
                                   ? 'bg-[#F0EFFE] text-[#5A55F2]'
                                   : 'bg-transparent text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827]'
                               }`}
                              >
                                <child.icon size={14} className="shrink-0" />
                                <span className="truncate">{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={item.path}
                      className={`flex items-center gap-2.5 w-full text-[13px] font-medium rounded-[10px] transition-all duration-200 ${
                        sidebarCollapsed ? 'px-0 justify-center' : 'px-2.5 py-2 justify-start'
                      } ${
                        active
                          ? 'bg-[#5A55F2] text-white'
                          : 'bg-transparent text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827]'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon size={17} className={`shrink-0 ${active ? 'opacity-100' : 'opacity-75'}`} />
                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate">{item.name}</span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[#EEF0F4] pt-3.5 mt-2 flex flex-col gap-0.5">
            <Link href="/help" className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[#555A6E] rounded-[10px] transition-all duration-200 hover:bg-[#F7F7FA] hover:text-[#111827] ${
              sidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}>
              <span className="text-[14px]">?</span>
              {!sidebarCollapsed && <span>Help</span>}
            </Link>
            <Link href="/settings" className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[#555A6E] rounded-[10px] transition-all duration-200 hover:bg-[#F7F7FA] hover:text-[#111827] ${
              sidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}>
              <span className="text-[14px]">⚙</span>
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>
      )}

      {!sidebarCollapsed && (
        <div className="px-4 pb-5 pt-3 border-t border-[#EEF0F4] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#5A55F2] shrink-0" />
          <div className="leading-tight">
            <div className="font-semibold text-[12.5px] text-[#111827]">{displayName}</div>
            <div className="text-[10.5px] text-[#8A8FA3]">{email}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
