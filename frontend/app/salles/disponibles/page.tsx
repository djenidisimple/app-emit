'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, Users, ArrowRight, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { Salle, Creneau } from '@/types';
import { api } from '@/services/api';

export default function SallesDisponiblesPage() {
  const [date, setDate] = useState('');
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [creneauId, setCreneauId] = useState('');
  const [results, setResults] = useState<Salle[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<Creneau[]>('/creneaux').then(setCreneaux).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!date || !creneauId) return;
    setIsLoading(true);
    try {
      const data = await api.get<Salle[]>(`/Salles/disponibles?date=${date}&creneauId=${creneauId}`);
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
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-6">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-blue-200 bg-white text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Créneau horaire</label>
            <select
              value={creneauId}
              onChange={(e) => setCreneauId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-blue-200 bg-white text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150"
            >
              <option value="">Sélectionner...</option>
              {creneaux.map(c => (
                <option key={c.id} value={c.id}>
                  {c.jour} — {c.heureDebut.slice(0, 5)} - {c.heureFin.slice(0, 5)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={!date || !creneauId || isLoading}
            className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> Rechercher
          </button>
        </div>
      </div>

      {searched && (
        <>
          <p className="text-sm text-blue-500 mb-4">{results.length} salle{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''} pour ce créneau</p>
          {results.length === 0 ? (
            <EmptyState icon={Calendar} title="Aucune salle disponible" description="Aucune salle disponible pour ce créneau. Essayez un autre horaire." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(salle => (
                <div key={salle.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#0052FF]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-blue-900">{salle.libelle || salle.nom}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-blue-500 mb-4">
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" />{salle.capacite} places</div>
                    <span>|</span>
                    <span>{salle.type}</span>
                  </div>
                  <button className="w-full bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2">
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
