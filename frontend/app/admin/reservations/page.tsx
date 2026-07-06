'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Calendar, User, MapPin, Clock } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { ReservationReadDto } from '@/types';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('En attente');
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError('');
      try {
        const response = await api.get<ReservationReadDto[]>(`/Reservation/statut/${encodeURIComponent(filter)}`);
        setReservations(response);
      } catch { setError('Impossible de charger les réservations.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [filter]);

  const handleStatus = async (id: number, statut: string) => {
    try {
      await api.patch(`/Reservation/${id}/statut`, { statut });
      setReservations(reservations.filter(r => r.id !== id));
      setConfirmAction(null);
    } catch { /* noop */ }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ProtectedLayout pageTitle="Demandes de réservation">
      <div className={css({ display: 'flex', gap: '2', mb: '5' })}>
        {['En attente', 'Confirmée', 'Annulée'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={css({
              px: '4', py: '1.5', rounded: 'md', fontSize: 'sm', fontWeight: 'medium', transition: 'all 0.15s',
              bg: filter === s ? 'accent.default' : 'bg.surface',
              color: filter === s ? '#fff' : 'fg.muted',
              border: filter === s ? 'none' : '1px solid',
              borderColor: 'border.default',
            })}>{s}</button>
        ))}
      </div>

      {error && <div className={css({ mb: '4', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', rounded: 'lg', px: '4', py: '2.5', fontSize: 'sm', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2' })}><AlertCircle className={css({ w: '4', h: '4' })} />{error}</div>}

      {isLoading ? (
        <LoadingSkeleton lines={5} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })} />
      ) : reservations.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description={`Aucune réservation ${filter.toLowerCase()}.`} />
      ) : (
        <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', overflow: 'hidden' })}>
          <table className={css({ w: 'full', fontSize: 'sm' })}>
            <thead className={css({ bg: 'bg.muted', borderBottom: '1px solid', borderColor: 'border.default' })}>
              <tr>
                {['Demandeur', 'Salle', 'Date', 'Créneau', 'Statut', 'Actions'].map(h => (
                  <th key={h} className={css({ px: '4', py: '2.5', textAlign: 'left', fontSize: 'xs', fontWeight: 'medium', color: 'fg.subtle', textTransform: 'uppercase', letterSpacing: 'wide' })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id} className={css({ borderBottom: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.muted' } })}>
                  <td className={css({ px: '4', py: '3' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <User className={css({ w: '4', h: '4', color: 'fg.subtle' })} />
                      <span className={css({ color: 'fg.default', fontWeight: 'medium' })}>{r.demandeurNom}</span>
                    </div>
                  </td>
                  <td className={css({ px: '4', py: '3' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <MapPin className={css({ w: '4', h: '4', color: 'fg.subtle' })} />
                      <span>{r.salleLibelle}</span>
                    </div>
                  </td>
                  <td className={css({ px: '4', py: '3' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <Calendar className={css({ w: '4', h: '4', color: 'fg.subtle' })} />
                      <span>{formatDate(r.datePrecise)}</span>
                    </div>
                  </td>
                  <td className={css({ px: '4', py: '3' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <Clock className={css({ w: '4', h: '4', color: 'fg.subtle' })} />
                      <span>{r.type}</span>
                    </div>
                  </td>
                  <td className={css({ px: '4', py: '3' })}>
                    <StatutBadge statut={r.statut} />
                  </td>
                  <td className={css({ px: '4', py: '3' })}>
                    <div className={css({ display: 'flex', gap: '2' })}>
                      {r.statut === 'En attente' && (
                        <>
                          <button onClick={() => setConfirmAction({ id: r.id, action: 'Confirmée' })}
                            className={css({ bg: '#10b981', color: '#fff', fontSize: 'xs', fontWeight: 'medium', px: '3', py: '1.5', rounded: 'md', display: 'flex', alignItems: 'center', gap: '1', _hover: { opacity: 0.9 } })}>
                            <Check className={css({ w: '3', h: '3' })} /> Valider
                          </button>
                          <button onClick={() => setConfirmAction({ id: r.id, action: 'Annulée' })}
                            className={css({ bg: '#ef4444', color: '#fff', fontSize: 'xs', fontWeight: 'medium', px: '3', py: '1.5', rounded: 'md', display: 'flex', alignItems: 'center', gap: '1', _hover: { opacity: 0.9 } })}>
                            <X className={css({ w: '3', h: '3' })} /> Rejeter
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && (
        <div className={css({ position: 'fixed', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 })}>
          <div className={css({ bg: 'bg.elevated', rounded: 'lg', shadow: 'lg', p: '6', maxW: 'sm', w: 'full', mx: '4', border: '1px solid', borderColor: 'border.default' })}>
            <h3 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default', mb: '2' })}>Confirmer</h3>
            <p className={css({ fontSize: 'sm', color: 'fg.muted', mb: '4' })}>
              Voulez-vous {confirmAction.action === 'Confirmée' ? 'valider' : 'rejeter'} cette réservation ?
            </p>
            <div className={css({ display: 'flex', gap: '2' })}>
              <button onClick={() => setConfirmAction(null)}
                className={css({ flex: '1', border: '1px solid', borderColor: 'border.default', color: 'fg.muted', fontWeight: 'medium', fontSize: 'sm', px: '4', py: '2', rounded: 'md', _hover: { bg: 'bg.muted' } })}>
                Annuler
              </button>
              <button onClick={() => handleStatus(confirmAction.id, confirmAction.action)}
                className={css({ flex: '1', color: '#fff', fontWeight: 'medium', fontSize: 'sm', px: '4', py: '2', rounded: 'md',
                  bg: confirmAction.action === 'Confirmée' ? '#10b981' : '#ef4444', _hover: { opacity: 0.9 } })}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
