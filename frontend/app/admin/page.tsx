'use client';

import React from 'react';
import { Building2, CalendarCheck, Users, BookOpen, GraduationCap, FolderTree, CalendarPlus, BookMarked } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import Link from 'next/link';

const adminLinks = [
  { href: '/admin/filieres', label: 'Filières', icon: BookMarked },
  { href: '/admin/parcours', label: 'Parcours', icon: FolderTree },
  { href: '/admin/niveaux', label: 'Niveaux', icon: GraduationCap },
  { href: '/admin/matieres', label: 'Matières', icon: BookOpen },
  { href: '/admin/salles', label: 'Salles', icon: Building2 },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarCheck },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/generateur-seance', label: 'Séances', icon: CalendarPlus },
];

export default function AdminPage() {
  return (
    <ProtectedLayout pageTitle="Référentiel">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adminLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 hover:shadow-md hover:border-l-[#1B3A6B] hover:border-l-4 transition-all duration-200">
                <div className="w-10 h-10 bg-[#E8EEF8] rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#1B3A6B]" />
                </div>
                <h3 className="text-sm font-semibold text-[#212529]">{link.label}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}
