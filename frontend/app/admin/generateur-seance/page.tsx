'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import GenerateurSeanceForm from '@/components/GenerateurSeanceForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GenerateurSeancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Retour à l'administration
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
            Génération de séances
          </h1>
          <p className="text-gray-400 mt-1">Créer des séances de cours pour une matière sur une période donnée</p>
        </div>
        <GenerateurSeanceForm />
      </main>
    </div>
  );
}
