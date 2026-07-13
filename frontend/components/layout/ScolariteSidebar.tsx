'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Calendar, Building2, TriangleAlert,
  Users, BookOpen, Settings, Search, User, LogOut, GraduationCap, Layers
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const navPrincipal = [
  { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Emploi du temps', path: '/edt-globale', icon: Calendar },
  { name: 'Salles', path: '/admin/salles', icon: Building2 },
  { name: 'Exceptions', path: '/admin/exceptions', icon: TriangleAlert, count: 7 },
  { name: 'Professeurs', path: '/admin/professeurs', icon: GraduationCap },
  { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
  { name: 'Administration', path: '/admin/administration', icon: Layers },

];
export default function ScolariteSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const email = user?.email ?? 'admin@emit.mg';
  const displayName = user
    ? `${user.prenom ?? 'Admin'} ${user.nom ?? 'Scolarité'}`
    : 'Admin Scolarité';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`shrink-0 h-full flex flex-col bg-white border-r border-[#EEF0F4] transition-all duration-200 ${sidebarCollapsed ? 'w-14 px-0' : 'w-[280px] px-4 py-5'} relative`}>
      <div className={`flex flex-col h-full ${sidebarCollapsed ? 'items-center' : ''}`}>
        
        {/* Logo Row */}
        <div className={`flex items-center justify-between mb-5 ${sidebarCollapsed ? 'justify-center w-full py-5' : 'px-1'}`}>
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
        <div className={`flex-1 min-h-0 ${sidebarCollapsed ? '-top-20' : 'pr-1'}`} >
          {!sidebarCollapsed && (
            <div className="text-[10px] tracking-wide font-bold mx-1.5 mb-2 mt-4 text-[#B4B8C6] uppercase">
              PRINCIPAL
            </div>
          )}

          <nav className={`flex flex-col gap-0.5 ${sidebarCollapsed ? 'items-center' : ''}`}>
            {navPrincipal.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] no-underline transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto rounded-full' : ''
                  } ${
                    active
                      ? 'text-white bg-[#5A55F2] font-medium'
                      : 'text-[#555A6E] bg-transparent font-medium hover:bg-[#F7F7FA] hover:text-[#111827]'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="relative">
                    <item.icon
                      size={18}
                      className={`shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`}
                    />
                    {item.count != null && sidebarCollapsed && (
                      <span className="absolute -top-2.5 -right-3 flex items-center justify-center w-[18px] h-[18px] rounded-full text-[9px] font-bold leading-none text-white bg-[#E5484D] border-2 border-white">
                        {item.count}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex-1">{item.name}</span>
                  )}
                  {!sidebarCollapsed && item.count != null && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold leading-none text-white bg-[#E5484D]">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className={`relative border-t border-[#EEF0F4] pt-3.5 ${sidebarCollapsed ? 'flex flex-col items-center -top-5' : ''}`}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2.5 px-1.5 pt-2.5 cursor-pointer hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm bg-[#5A55F2]">
              {initials}
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
              <div className={`absolute bg-white border border-[#EEF0F4] rounded-[14px] py-2 w-48 z-20 ${sidebarCollapsed ? 'bottom-0 left-full ml-3' : 'right-0 bottom-full mb-2'}`}>
                <div className="px-3 py-2 border-b border-[#EEF0F4] mb-1">
                  <div className="text-xs font-bold text-[#111827] truncate">{displayName}</div>
                  <div className="text-[10px] text-[#8A8FA3] truncate">{email}</div>
                </div>
                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827] transition-colors" onClick={() => setProfileOpen(false)}>
                  <Settings size={14} />
                  <span>Settings</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#555A6E] hover:bg-[#F7F7FA] hover:text-[#111827] transition-colors" onClick={() => setProfileOpen(false)}>
                  <User size={14} />
                  <span>Profile</span>
                </Link>
                <div className="border-t border-[#EEF0F4] mt-1 pt-1">
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} />
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