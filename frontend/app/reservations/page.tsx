'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Clock, MapPin, Plus, AlertCircle, X, Check } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

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
      const response = await api.get(url);
      setReservations(response.data);
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

  const filtered = reservations.filter(r => {
    if (activeTab === 'Toutes') return true;
    if (activeTab === 'En attente') return r.statut === 'En attente';
    if (activeTab === 'Validées') return r.statut === 'Confirmée' || r.statut === 'Valide';
    if (activeTab === 'Rejetées') return r.statut === 'Annulée' || r.statut === 'Rejete';
    if (activeTab === 'Annulées') return r.statut === 'Annulée';
    return true;
  });

  const counts = {
    Toutes: reservations.length,
    'En attente': reservations.filter(r => r.statut === 'En attente').length,
    Validées: reservations.filter(r => r.statut === 'Confirmée' || r.statut === 'Valide').length,
    Rejetées: reservations.filter(r => r.statut === 'Annulée' || r.statut === 'Rejete').length,
    Annulées: reservations.filter(r => r.statut === 'Annulée').length,
  };

  return (
    <ProtectedLayout pageTitle="Mes réservations">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === tab
                  ? 'bg-[#1B3A6B] text-white'
                  : 'text-[#6C757D] hover:bg-[#E8EEF8] hover:text-[#1B3A6B]'
              }`}
            >
              {tab}
              {counts[tab as keyof typeof counts] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-[#E8EEF8] text-[#1B3A6B]'}`}>
                  {counts[tab as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={fetchReservations} className="ml-auto text-red-600 font-semibold hover:underline">Réessayer</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton lines={6} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description="Vous n'avez pas encore de réservations." />
      ) : (
        <div className="space-y-4">
          {filtered.map(res => (
            <div key={res.id} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#1B3A6B]" />
                    <span className="text-sm font-semibold text-[#212529]">
                      {new Date(res.datePrecise).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {res.session}
                    </span>
                  </div>
                  <StatutBadge statut={res.statut} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#6C757D] mb-3">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{res.salleLibelle}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{res.type}</div>
              </div>
              <p className="text-sm font-medium text-[#212529] mb-3">{res.titre}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[#E9ECEF]">
                <p className="text-xs text-[#6C757D]">Demandé le {new Date(res.datePrecise).toLocaleDateString('fr-FR')}</p>
                {res.statut === 'En attente' && (
                  <button className="text-[#C62828] font-medium text-sm hover:underline">Annuler</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
