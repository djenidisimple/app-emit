'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid, Calendar, Building2, ArrowLeftRight,
  Settings, FileText, Bookmark, User, LogOut, ChevronDown, Bell
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNotificationStore } from '@/components/NotificationProvider';

const navPrincipal = [
  { name: 'Tableau de bord', path: '/dashboard', icon: LayoutGrid },
  { name: 'Mon planning', path: '/planning', icon: Calendar },
  { name: 'Mes examens', path: '/mes-examens', icon: FileText },
  { name: 'Salles', path: '/salles', icon: Building2 },
  {
    name: 'Échanges', path: '/echanges', icon: ArrowLeftRight,
    children: [
      { name: 'Mes demandes', path: '/echanges/mes-demandes' },
      { name: 'Demandes reçues', path: '/echanges/demandes-recues' },
      { name: 'Nouvelle', path: '/echanges/nouvelle' },
    ],
  },
  { name: 'Réservations', path: '/reservations', icon: Bookmark },
];

export default function ProfesseurSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const email = user?.email ?? 'prof@emit.mg';
  const displayName = user
    ? `${user.prenom ?? 'Professeur'} ${user.nom ?? 'User'}`
    : 'Professeur';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`shrink-0 h-full flex flex-col bg-white border-r border-neutral-200 transition-all duration-200 ${sidebarCollapsed ? 'w-14 px-0' : 'w-[280px] px-4 py-5'} relative`}>
      <div className={`flex flex-col h-full ${sidebarCollapsed ? 'items-center' : ''}`}>
        
        {/* Logo Row */}
        <div className={`flex items-center justify-between mb-5 ${sidebarCollapsed ? 'justify-center w-full py-2' : 'px-1'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-[22px] h-[22px] rounded-[6px] bg-[#5A55F2] relative shrink-0">
                <div className="absolute inset-[6px] bg-white rounded-[3px] opacity-90" />
              </div>
              <span className="font-bold text-base text-[#111827]">App-EMIT.</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className={`flex items-center justify-center transition-all duration-200 shrink-0 ${sidebarCollapsed ? 'w-8 h-8 rounded-full mx-auto' : 'w-[30px] h-[30px] rounded-[8px]'} text-[#6B7080] hover:bg-[#F0F0F4] hover:text-[#111827]`}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav area */}
        <div className={`flex-1 overflow-y-auto min-h-0 ${sidebarCollapsed ? 'py-0' : 'pr-1'}`} style={{ scrollbarWidth: 'thin' }}>
          {!sidebarCollapsed && (
            <div className="text-[10px] tracking-wide font-bold mx-1.5 mb-2 text-[#B4B8C6] uppercase">
              Main menu
            </div>
          )}

          <nav className={`flex flex-col gap-0.5 ${sidebarCollapsed ? 'items-center' : ''}`}>
            {navPrincipal.map((item) => {
              const active = isActive(item.path);
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = expandedMenus.has(item.path);

              if (hasChildren && !sidebarCollapsed) {
                return (
                  <div key={item.path} className="w-full">
                    <button
                      onClick={() => toggleMenu(item.path)}
                      className={`flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-[8px] transition-all duration-200 text-[14px] ${
                        active
                          ? 'text-white bg-[#5A55F2] font-medium'
                          : 'text-[#555A6E] bg-transparent font-medium hover:bg-[#F7F7FA] hover:text-[#111827]'
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`}
                      />
                      <span className="flex-1">{item.name}</span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'} ${active ? 'text-white/70' : 'text-[#8A8FA3]'}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.path);
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-[7px] text-xs font-medium no-underline transition-all duration-200 ml-5 ${
                                childActive ? 'text-[#5A55F2] bg-[#F0EFFE]' : 'text-[#555A6E] bg-transparent hover:bg-[#F7F7FA]'
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const linkHref = hasChildren && sidebarCollapsed ? item.children![0].path : item.path;
              return (
                <div key={item.path} className="w-full">
                  <Link
                    href={linkHref}
                    className={`flex items-center gap-2.5 px-3 py-2 no-underline transition-all duration-200 text-[14px] ${
                      sidebarCollapsed ? 'justify-center p-0 w-10 h-10 mx-auto rounded-full' : 'rounded-[8px]'
                    } ${
                      active
                        ? 'text-white bg-[#5A55F2] font-medium'
                        : 'text-[#555A6E] bg-transparent font-medium hover:bg-[#F7F7FA] hover:text-[#111827]'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`}
                    />
                    {!sidebarCollapsed && <span className="flex-1">{item.name}</span>}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className={`relative border-t border-neutral-200 -top-5 pt-3.5 ${sidebarCollapsed ? 'mt-0 flex flex-col items-center' : 'top-1 mt-2'}`}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2.5 px-1.5 cursor-pointer hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'justify-center pt-2' : 'pt-2.5'}`}
          >
            <div className="relative w-9 h-9 shrink-0">
              <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-md bg-[#5A55F2]">
                {initials}
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight">
                <div className="text-[12.5px] font-semibold text-[#111827]">
                  {displayName}
                </div>
                <div className="text-[10.5px] text-[#8A8FA3]">
                  {email}
                </div>
              </div>
            )}
          </div>

          {/* Profile Popup */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className={`absolute bg-white border border-neutral-200 rounded-[8px] py-2 w-56 z-20 ${
                sidebarCollapsed
                  ? 'bottom-0 left-full ml-3'
                  : 'right-0 bottom-full mb-2'
              }`}>
                <div className="px-3 py-2.5 border-b border-neutral-200">
                  <div className="text-xs font-bold text-[#111827] truncate">{displayName}</div>
                  <div className="text-[10px] text-[#8A8FA3] truncate">{email}</div>
                </div>

                <Link href="/notifications" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827] transition-colors relative">
                  <Bell size={15} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link href="/settings" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827] transition-colors">
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
                <Link href="/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827] transition-colors">
                  <User size={15} />
                  <span>Profile</span>
                </Link>
                <div className="border-t border-neutral-200 mt-1 pt-1">
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={15} />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
