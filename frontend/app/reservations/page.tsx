'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Clock, Plus, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import Link from 'next/link';

interface Reservation {
  id: number; titre: string; type: string; datePrecise: string; session: string; statut: string;
  demandeurId: number; demandeurNom: string; salleId: number; salleLibelle: string;
}

const TABS = ['Toutes', 'En attente', 'Validées', 'Rejetées', 'Annulées'];

export default function ReservationsPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Toutes');
  const userIdRef = useRef<number | undefined>(undefined);

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setError('');
    try {
      const url = user.role === 'Admin' ? '/Reservation' : `/Reservation/utilisateur/${user.id}`;
      const response = await api.get<Reservation[]>(url);
      setReservations(response);
    } catch { setError('Impossible de charger les réservations.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!user?.id || user.id === userIdRef.current) return;
    userIdRef.current = user.id;
    fetchReservations();
  }, [fetchReservations, user?.id]);

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
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${activeTab === tab ? 'bg-accent text-white border-none' : 'bg-surface text-fg-muted border border-border'}`}>
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1.5 px-1 py-0.5 text-[9px] font-semibold rounded-sm ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-bg-muted text-fg-default'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="my-4">
        <Link href="/reservations/nouvelle"
          className="inline-flex items-center gap-1 border border-accent text-accent text-xs font-medium py-2 px-4 rounded-lg hover:bg-accent hover:text-white transition-all duration-150">
          <Plus size={14} /> Nouvelle réservation
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-sm font-medium text-[#ef4444] flex items-center gap-2 rounded-lg">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="bg-surface border border-border rounded-lg p-5">
          <LoadingSkeleton lines={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description="Vous n'avez pas encore de réservations." />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-5">
          {filtered.map((res) => (
            <div key={res.id} className="bg-surface border border-border rounded-lg p-5">
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-fg-muted">{res.titre}</span>
                    <span className="text-fg-subtle">·</span>
                    <span className="text-fg-muted">{res.salleLibelle}</span>
                  </div>
                  <StatutBadge statut={res.statut} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-fg-subtle">
                  <Calendar size={12} />
                  <span>{new Date(res.datePrecise).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {res.session && (
                  <div className="flex items-center gap-2 text-xs text-fg-subtle">
                    <Clock size={12} />
                    <span>{res.session}</span>
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
