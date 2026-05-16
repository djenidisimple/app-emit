'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, BookOpen, GraduationCap, Building2, FolderTree, CalendarCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

const adminLinks = [
  { href: '/admin/salles', label: 'Salles', desc: 'Gérer les salles', icon: MapPin, color: 'text-emit-blue bg-emit-blue/10' },
  { href: '/admin/reservations', label: 'Réservations', desc: 'Valider les demandes', icon: CalendarCheck, color: 'text-emit-orange bg-emit-orange/10' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', desc: 'Gérer les comptes', icon: Users, color: 'text-green-600 bg-green-100' },
  { href: '/admin/matieres', label: 'Matières', desc: 'Gérer les matières', icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
  { href: '/admin/niveaux', label: 'Niveaux', desc: 'Gérer les niveaux', icon: GraduationCap, color: 'text-amber-600 bg-amber-100' },
  { href: '/admin/filieres', label: 'Filières', desc: 'Gérer les filières', icon: Building2, color: 'text-cyan-600 bg-cyan-100' },
  { href: '/admin/parcours', label: 'Parcours', desc: 'Gérer les parcours', icon: FolderTree, color: 'text-rose-600 bg-rose-100' },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-28 pb-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-poppins font-bold text-emit-blue">Administration</h1>
          <p className="text-emit-text/60 mt-1">Gérez l'ensemble des ressources de l'EMIT.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div key={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={link.href} className="block bg-white border border-emit-border rounded-md p-6 hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 ${link.color}`}>
                    <Icon size={24} />
                  </div>
                  <h2 className="text-lg font-poppins font-bold text-emit-blue group-hover:text-emit-orange transition-colors">{link.label}</h2>
                  <p className="text-sm text-emit-text/60 mt-1">{link.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
