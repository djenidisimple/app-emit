'use client';

import React from 'react';
import {
  Building2, CalendarCheck, Users, BookOpen,
  GraduationCap, FolderTree, CalendarPlus, BookMarked, ArrowRight,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import Link from 'next/link';

const adminLinks = [
  { href: '/admin/filieres', label: 'Filières', icon: BookMarked, desc: 'Gérer les filières' },
  { href: '/admin/parcours', label: 'Parcours', icon: FolderTree, desc: 'Gérer les parcours' },
  { href: '/admin/niveaux', label: 'Niveaux', icon: GraduationCap, desc: 'L1, L2, L3, M1, M2' },
  { href: '/admin/matieres', label: 'Matières', icon: BookOpen, desc: 'Gérer les matières' },
  { href: '/admin/salles', label: 'Salles', icon: Building2, desc: 'Espaces disponibles' },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarCheck, desc: 'Valider les demandes' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, desc: 'Gérer les comptes' },
  { href: '/admin/generateur-seance', label: 'Séances', icon: CalendarPlus, desc: 'Générer des séances' },
];

const accentColors = [
  'border-l-[#0052FF]',
  'border-l-amber-500',
  'border-l-emerald-500',
  'border-l-red-500',
  'border-l-[#0052FF]',
  'border-l-amber-500',
  'border-l-emerald-500',
  'border-l-red-500',
];

export default function AdminPage() {
  return (
    <ProtectedLayout pageTitle="Référentiel">
      <div className="mb-6">
        <p className="text-blue-500 text-sm font-medium">
          Gérez l&apos;ensemble des données de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adminLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`bg-white rounded-2xl border border-l-[6px] border-blue-100 shadow-sm p-5 hover:shadow-lg transition-all duration-200 group cursor-pointer ${accentColors[i]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#0052FF]" />
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-blue-300 group-hover:text-[#0052FF] transition-colors duration-150 mt-1"
                  />
                </div>
                <h3 className="text-xl font-bold text-blue-900 leading-none">
                  {link.label}
                </h3>
                <p className="text-xs text-blue-500 mt-1 font-medium">{link.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}
