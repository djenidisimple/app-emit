'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, Users, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { Salle } from '@/types';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';

export default function SallesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<Salle[]>('/Salles');
        setSalles(data);
      } catch {
        setError('Impossible de charger les salles.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = salles.filter(s => (s.nom || s.libelle || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ProtectedLayout pageTitle="Salles">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150"
          />
        </div>
        {isAdmin && (
          <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle salle
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mb-4" />
              <div className="h-4 bg-[#E9ECEF] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[#E9ECEF] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Aucune salle trouvée" description={searchTerm ? "Aucune salle ne correspond à votre recherche." : "Aucune salle enregistrée."} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(salle => (
            <div key={salle.id} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8EEF8] rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#1B3A6B]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#212529]">{salle.libelle || salle.nom}</h3>
                    <p className="text-xs text-[#6C757D]">{salle.codeSalle}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${salle.estDisponible ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  {salle.estDisponible ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#6C757D] mb-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{salle.capacite} places</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B]/30" />
                  <span>{salle.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-[#E9ECEF]">
                <button className="text-[#1B3A6B] font-medium text-sm hover:underline transition-all flex-1 text-left">Voir planning</button>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button className="p-1.5 text-[#6C757D] hover:text-[#1B3A6B] hover:bg-[#E8EEF8] rounded-lg transition-colors duration-150"><Pencil className="w-4 h-4" /></button>
                    <button className="p-1.5 text-[#6C757D] hover:text-[#C62828] hover:bg-red-50 rounded-lg transition-colors duration-150"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
