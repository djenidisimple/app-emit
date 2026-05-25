'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Calendar, MapPin, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            G-Salles EMIT
          </h1>
          <p className="text-xl text-gray-400">
            Système de gestion des salles et emplois du temps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <GraduationCap size={32} className="text-blue-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Pour l'EMIT</h2>
            <p className="text-gray-400 text-sm">
              Plateforme conçue pour l'École Marocaine d'Ingénierie et de Technologie, 
              facilitant la gestion des plannings, des salles et des ressources pédagogiques.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <Calendar size={32} className="text-purple-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Planning intelligent</h2>
            <p className="text-gray-400 text-sm">
              Visualisation hebdomadaire des cours avec filtres par salle, professeur et niveau.
              Gérez les exceptions, annulations et reports en temps réel.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <MapPin size={32} className="text-green-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Gestion des salles</h2>
            <p className="text-gray-400 text-sm">
              Réservez des salles selon leur type (TP, TD, Amphi) et consultez leur disponibilité
              en temps réel.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <Users size={32} className="text-orange-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Collaboration</h2>
            <p className="text-gray-400 text-sm">
              Échanges de créneaux entre professeurs, notifications en temps réel,
              et validation centralisée des réservations par l'administration.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Commencer
          </Link>
        </div>
      </div>
    </div>
  );
}
