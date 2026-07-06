'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Calendar, Building2, Bookmark,
  ArrowLeftRight, Users, Bell, CalendarDays, FolderOpen, ChevronRight, FileText,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { css } from 'styled-system/css';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const adminLinks: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Planning', path: '/planning', icon: Calendar,
    children: [
      { name: 'EDT Globale', path: '/edt-globale', icon: Calendar },
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
    name: 'Référentiel', path: '/referentiel', icon: FolderOpen,
    children: [
      { name: 'Filières', path: '/referentiel/filieres', icon: FolderOpen },
      { name: 'Parcours', path: '/referentiel/parcours', icon: FolderOpen },
      { name: 'Niveaux', path: '/referentiel/niveaux', icon: FolderOpen },
      { name: 'Matières', path: '/referentiel/matieres', icon: FolderOpen },
    ],
  },
  { name: 'Utilisateurs', path: '/utilisateurs', icon: Users },
  { name: 'Examens', path: '/admin/examens', icon: FileText },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

const profLinks: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Planning', path: '/planning', icon: Calendar,
    children: [
      { name: 'EDT Globale', path: '/edt-globale', icon: Calendar },
      { name: 'Mes séances', path: '/mes-seances', icon: CalendarDays },
    ],
  },
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

const etudiantLinks: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Planning', path: '/planning', icon: Calendar },
  { name: 'Mes examens', path: '/mes-examens', icon: FileText },
  { name: 'Réservations', path: '/reservations', icon: Bookmark },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

function isActive(path: string, pathname: string): boolean {
  if (path === '/echanges') return pathname.startsWith('/echanges');
  if (path === '/referentiel') return pathname.startsWith('/referentiel');
  if (path === '/mes-seances') return pathname === '/mes-seances' || pathname === '/planning';
  return pathname === path || pathname.startsWith(path + '/');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const role = user?.role || user?.roles?.[0] || '';
  const navLinks = role === 'Admin' ? adminLinks : role === 'Professeur' ? profLinks : etudiantLinks;

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <aside className={css({
      bg: 'white', h: 'full', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid', borderColor: 'border.default',
      transition: 'width 300ms ease',
      width: sidebarCollapsed ? '14' : '60',
      flexShrink: '0', overflow: 'hidden',
      boxShadow: '0 0 20px rgba(0,0,0,0.03)',
    })}>
      <nav className={css({ flex: '1', py: '4', px: '3', overflowY: 'auto' })}>
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '0.5' })}>
          {navLinks.map((item) => {
            const active = isActive(item.path, pathname);
            const isExpanded = expandedGroups.includes(item.path);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.path}>
                {hasChildren ? (
                  <>
                    <button onClick={() => !sidebarCollapsed && toggleGroup(item.path)}
                      className={css({
                        display: 'flex', alignItems: 'center', gap: '3', w: 'full',
                        px: sidebarCollapsed ? '0' : '2.5', py: '2',
                        fontSize: 'sm', fontWeight: 'medium', rounded: 'xl',
                        transition: 'all 200ms',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        bg: active ? 'accent.default' : 'transparent',
                        color: active ? 'white' : 'fg.muted',
                        boxShadow: active ? '0 2px 8px rgba(59,130,246,0.25)' : 'none',
                        _hover: { bg: active ? 'accent.default' : 'bg.muted', color: active ? 'white' : 'fg.default' },
                      })}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon size={18} className={css({ flexShrink: '0' })} />
                      {!sidebarCollapsed && (
                        <>
                          <span className={css({ flex: '1', truncate: 'true', textAlign: 'left' })}>{item.name}</span>
                          <ChevronRight size={14} className={css({
                            color: active ? 'rgba(255,255,255,0.7)' : 'fg.subtle',
                            transition: 'transform 200ms',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          })} />
                        </>
                      )}
                    </button>
                    {!sidebarCollapsed && isExpanded && (
                      <div className={css({ ml: '7', mt: '1', display: 'flex', flexDirection: 'column', gap: '0.5', borderLeft: '2px solid', borderColor: 'border.default', pl: '3' })}>
                        {item.children!.map((child) => {
                          const childActive = isActive(child.path, pathname);
                          return (
                            <Link key={child.path} href={child.path}
                              className={css({
                                display: 'flex', alignItems: 'center', gap: '2', w: 'full',
                                px: '2.5', py: '1.5', fontSize: 'xs', fontWeight: 'medium',
                                rounded: 'lg', transition: 'all 150ms',
                                bg: childActive ? 'accent.light' : 'transparent',
                                color: childActive ? 'accent.default' : 'fg.muted',
                                _hover: { bg: childActive ? 'accent.light' : 'bg.muted', color: 'fg.default' },
                              })}
                            >
                              <child.icon size={14} className={css({ flexShrink: '0' })} />
                              <span className={css({ truncate: 'true' })}>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.path}
                    className={css({
                      display: 'flex', alignItems: 'center', gap: '3', w: 'full',
                      px: sidebarCollapsed ? '0' : '2.5', py: '2',
                      fontSize: 'sm', fontWeight: 'medium', rounded: 'xl',
                      transition: 'all 200ms',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      bg: active ? 'accent.default' : 'transparent',
                      color: active ? 'white' : 'fg.muted',
                      boxShadow: active ? '0 2px 8px rgba(59,130,246,0.25)' : 'none',
                      _hover: { bg: active ? 'accent.default' : 'bg.muted', color: active ? 'white' : 'fg.default' },
                    })}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon size={18} className={css({ flexShrink: '0' })} />
                    {!sidebarCollapsed && (
                      <span className={css({ flex: '1', truncate: 'true' })}>{item.name}</span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
