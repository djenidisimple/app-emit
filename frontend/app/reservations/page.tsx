'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Clock, Plus, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { css } from 'styled-system/css';
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
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', mb: '4' })}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={css({
              px: '3', py: '1.5', fontSize: 'xs', fontWeight: 'medium', rounded: 'lg', transition: 'colors 0.15s',
              bg: activeTab === tab ? 'accent.default' : 'bg.surface',
              color: activeTab === tab ? '#fff' : 'fg.muted',
              border: activeTab === tab ? 'none' : '1px solid',
              borderColor: 'border.default',
            })}>
            {tab}
            {counts[tab] > 0 && (
              <span className={css({ ml: '1.5', px: '1', py: '0.5', fontSize: '9px', fontWeight: 'semibold', rounded: 'sm',
                bg: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'bg.muted',
                color: activeTab === tab ? '#fff' : 'fg.default',
              })}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={css({ my: '4' })}>
        <Link href="/reservations/nouvelle"
          className={css({
            display: 'inline-flex', alignItems: 'center', gap: '1',
            border: '1px solid', borderColor: 'accent.default', color: 'accent.default',
            fontSize: 'xs', fontWeight: 'medium', py: '2', px: '4', rounded: 'lg',
            _hover: { bg: 'accent.default', color: '#fff' }, transition: 'all 0.15s',
          })}>
          <Plus size={14} /> Nouvelle réservation
        </Link>
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '3', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', fontSize: 'sm', fontWeight: 'medium', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2', rounded: 'lg' })}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5' })}>
          <LoadingSkeleton lines={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description="Vous n'avez pas encore de réservations." />
      ) : (
        <div className={css({ display: 'grid', gap: '4', gridTemplateColumns: { base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, mt: '5' })}>
          {filtered.map((res) => (
            <div key={res.id} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', transition: 'box-shadow 0.15s', _hover: { shadow: 'md' } })}>
              <div className={css({ mb: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2' })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs' })}>
                    <span className={css({ fontWeight: 'medium', color: 'fg.muted' })}>{res.titre}</span>
                    <span className={css({ color: 'fg.subtle' })}>·</span>
                    <span className={css({ color: 'fg.muted' })}>{res.salleLibelle}</span>
                  </div>
                  <StatutBadge statut={res.statut} />
                </div>
              </div>
              <div className={css({ spaceY: '2' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.subtle' })}>
                  <Calendar size={12} />
                  <span>{new Date(res.datePrecise).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {res.session && (
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.subtle' })}>
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
