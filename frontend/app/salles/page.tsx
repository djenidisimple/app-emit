'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, Users, AlertCircle, Plus, Pencil, Trash2, X } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { CardSkeleton } from '@/components/global/LoadingSkeleton';
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

  const filtered = salles.filter((s) =>
    (s.nom || s.libelle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedLayout pageTitle="Salles">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-700"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] text-white shadow-sm text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Nouvelle salle
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Stats */}
      {!isLoading && salles.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-2">
            <span className="text-xl font-bold text-[#0052FF]">{salles.length}</span>
            <span className="text-xs font-semibold text-blue-500">Salles totales</span>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-600">
              {salles.filter((s) => s.estDisponible).length}
            </span>
            <span className="text-xs font-semibold text-blue-500">Disponibles</span>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune salle"
          description={searchTerm ? "Aucune salle ne correspond à votre recherche." : "Aucune salle enregistrée."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((salle) => (
            <div
              key={salle.id}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-lg transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-[#0052FF]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-blue-900 leading-tight truncate">
                      {salle.libelle || salle.nom}
                    </h3>
                    {salle.codeSalle && (
                      <p className="text-xs text-blue-400">{salle.codeSalle}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${
                    salle.estDisponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {salle.estDisponible ? 'Dispo' : 'Indispo'}
                </span>
              </div>

              {/* Info */}
              <div className="flex items-center gap-4 text-xs font-medium text-blue-500 mb-4">
                <span className="flex items-center gap-1.5 bg-blue-50 rounded-lg border border-blue-100 px-2.5 py-1">
                  <Users size={12} />
                  {salle.capacite} places
                </span>
                <span className="flex items-center gap-1.5 bg-blue-50 rounded-lg border border-blue-100 px-2.5 py-1 capitalize">
                  {salle.type}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center pt-3 border-t border-blue-100 gap-2">
                <button className="flex-1 text-left text-xs font-semibold text-[#0052FF] hover:underline">
                  Voir planning →
                </button>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button className="w-7 h-7 rounded-lg border border-blue-200 flex items-center justify-center text-blue-400 hover:text-[#0052FF] hover:bg-blue-50 transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button className="w-7 h-7 rounded-lg border border-blue-200 flex items-center justify-center text-blue-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={12} />
                    </button>
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
