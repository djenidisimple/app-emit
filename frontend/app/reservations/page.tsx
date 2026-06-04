'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Clock, MapPin, Plus, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';

interface Reservation {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  session: string;
  statut: string;
  demandeurId: number;
  demandeurNom: string;
  salleId: number;
  salleLibelle: string;
}

const TABS = ['Toutes', 'En attente', 'Validées', 'Rejetées', 'Annulées'];

export default function ReservationsPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Toutes');
  const initialized = useRef(false);

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const url = user.role === 'Admin' ? '/Reservation' : `/Reservation/utilisateur/${user.id}`;
      const response = await api.get<Reservation[]>(url);
      setReservations(response);
    } catch {
      setError('Impossible de charger les réservations.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchReservations();
    }
  }, [fetchReservations]);

  const filtered = reservations.filter((r) => {
    if (activeTab === 'Toutes') return true;
    if (activeTab === 'En attente') return r.statut === 'En attente';
    if (activeTab === 'Validées') return r.statut === 'Confirmée' || r.statut === 'Valide';
    if (activeTab === 'Rejetées') return r.statut === 'Annulée' || r.statut === 'Rejete';
    if (activeTab === 'Annulées') return r.statut === 'Annulée';
    return true;
  });

  const counts: Record<string, number> = {
    Toutes: reservations.length,
    'En attente': reservations.filter((r) => r.statut === 'En attente').length,
    Validées: reservations.filter((r) => r.statut === 'Confirmée' || r.statut === 'Valide').length,
    Rejetées: reservations.filter((r) => r.statut === 'Annulée' || r.statut === 'Rejete').length,
    Annulées: reservations.filter((r) => r.statut === 'Annulée').length,
  };

  return (
    <ProtectedLayout pageTitle="Mes réservations">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#0052FF] text-white'
                : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1.5 px-1 py-0.5 text-[9px] font-semibold rounded ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar
        itemCount={filtered.length}
        totalCount={reservations.length}
        showFilters={false}
        onToggleFilters={() => {}}
        sortOptions={[
          { value: 'recent', label: 'Date - les plus récentes' },
          { value: 'oldest', label: 'Date - les plus anciennes' },
        ]}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2 rounded-lg">
          <AlertCircle size={15} /> {error}
          <button onClick={fetchReservations} className="ml-auto font-semibold hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-blue-100 rounded-xl p-5">
          <LoadingSkeleton lines={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune réservation"
          description="Vous n'avez pas encore de réservations."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Bloc visuel - haut */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-blue-500">{res.titre}</span>
                    <span className="text-blue-300">·</span>
                    <span className="text-blue-600">{res.salleLibelle}</span>
                  </div>
                  <StatutBadge statut={res.statut} />
                </div>
              </div>

              {/* Bloc infos - bas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <Calendar size={12} className="text-blue-300" />
                  <span>
                    {new Date(res.datePrecise).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                {res.session && (
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <Clock size={12} className="text-blue-300" />
                    <span>{res.session}</span>
                    <span className="text-blue-300">·</span>
                    <span>{res.type}</span>
                  </div>
                )}
                <p className="text-[11px] text-blue-400 pt-2">
                  Demandé le{' '}
                  {new Date(res.datePrecise).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
