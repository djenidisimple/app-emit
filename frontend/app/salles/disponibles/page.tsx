'use client';

import React, { useState } from 'react';
import { Search, Building2, Users, ArrowRight, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { Salle } from '@/types';
import { api } from '@/services/api';

export default function SallesDisponiblesPage() {
  const [date, setDate] = useState('');
  const [creneau, setCreneau] = useState('');
  const [results, setResults] = useState<Salle[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!date || !creneau) return;
    setIsLoading(true);
    try {
      const data = await api.get<Salle[]>(`/Salles/disponibles?date=${date}&creneau=${creneau}`);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearched(true);
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout pageTitle="Chercher une salle disponible">
      <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 mb-6">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Créneau horaire</label>
            <select
              value={creneau}
              onChange={(e) => setCreneau(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150"
            >
              <option value="">Sélectionner...</option>
              <option value="Matin">Matin (07h30 - 11h30)</option>
              <option value="Apres-midi">Après-midi (14h00 - 16h00)</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={!date || !creneau || isLoading}
            className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> Rechercher
          </button>
        </div>
      </div>

      {searched && (
        <>
          <p className="text-sm text-[#6C757D] mb-4">{results.length} salle{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''} pour ce créneau</p>
          {results.length === 0 ? (
            <EmptyState icon={Calendar} title="Aucune salle disponible" description="Aucune salle disponible pour ce créneau. Essayez un autre horaire." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(salle => (
                <div key={salle.id} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#E8EEF8] rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#1B3A6B]" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#212529]">{salle.libelle || salle.nom}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#6C757D] mb-4">
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" />{salle.capacite} places</div>
                    <span>|</span>
                    <span>{salle.type}</span>
                  </div>
                  <button className="w-full bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2">
                    Réserver cette salle <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ProtectedLayout>
  );
}
