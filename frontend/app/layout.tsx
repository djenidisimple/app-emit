// app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/filieres', label: 'Filières' },
    { href: '/admin/parcours', label: 'Parcours' },
    { href: '/admin/niveaux', label: 'Niveaux' },
    { href: '/admin/matieres', label: 'Matières' },
    { href: '/admin/salles', label: 'Salles' },
    { href: '/admin/utilisateurs', label: 'Utilisateurs' },
    { href: '/admin/generateur-seance', label: 'Générateur de séances' },
    { href: '/admin/reservations', label: 'Réservations' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation horizontale */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">G-Salles Admin</span>
            </div>
            <div className="hidden md:flex space-x-4 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Menu mobile (burger) - optionnel, non détaillé ici */}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}