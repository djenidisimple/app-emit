'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Calendar, User, MapPin, Clock, Download } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatutBadge from '@/components/global/StatutBadge';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { ReservationReadDto } from '@/types';
import { api } from '@/services/api';

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
      <div className="flex gap-2 mb-5">
        {['En attente', 'Confirmée', 'Annulée'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              filter === s
                ? 'bg-accent text-white border-none'
                : 'bg-surface text-fg-muted border border-border'
            }`}>{s}</button>
        ))}
      </div>

      {error && <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-2.5 text-sm text-[#ef4444] flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      {isLoading ? (
        <LoadingSkeleton lines={5} className="bg-surface rounded-lg border border-border p-5" />
      ) : reservations.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description={`Aucune réservation ${filter.toLowerCase()}.`} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7FA] border-b border-neutral-200">
              <tr>
                {['Demandeur', 'Salle', 'Date', 'Créneau', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8A8FA3]" />
                      <span className="text-[13px] font-medium text-[#111827]">{r.demandeurNom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8A8FA3]" />
                      <span className="text-[13px] text-[#555A6E]">{r.salleLibelle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8A8FA3]" />
                      <span className="text-[13px] text-[#555A6E]">{formatDate(r.datePrecise)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8A8FA3]" />
                      <span className="text-[13px] text-[#555A6E]">{r.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={r.statut} />
                  </td>
                   <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {r.statut === 'En attente' && (
                          <>
                            <button onClick={() => setConfirmAction({ id: r.id, action: 'Confirmée' })}
                              className="bg-[#10b981] text-white text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90">
                              <Check className="w-3 h-3" /> Valider
                            </button>
                            <button onClick={() => setConfirmAction({ id: r.id, action: 'Annulée' })}
                              className="bg-[#ef4444] text-white text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90">
                              <X className="w-3 h-3" /> Rejeter
                            </button>
                          </>
                        )}
                        <button onClick={async () => {
                          try {
                            const blob = await api.get(`/Document/export/reservation/${r.id}`, { responseType: 'blob' });
                            const url = URL.createObjectURL(blob as Blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `reservation_${r.id}.pdf`; a.click();
                            URL.revokeObjectURL(url);
                          } catch (e) { console.error(e); }
                        }}
                        className="bg-[#F7F7FA] text-[#111827] text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#EEF0F4]">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur flex items-center justify-center z-50">
          <div className="bg-elevated rounded-lg p-6 max-w-sm w-full mx-4 border border-border">
            <h3 className="text-base font-semibold text-fg-default mb-2">Confirmer</h3>
            <p className="text-sm text-fg-muted mb-4">
              Voulez-vous {confirmAction.action === 'Confirmée' ? 'valider' : 'rejeter'} cette réservation ?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 border border-border text-fg-muted font-medium text-sm px-4 py-2 rounded-md hover:bg-bg-muted">
                Annuler
              </button>
              <button onClick={() => handleStatus(confirmAction.id, confirmAction.action)}
                className={`flex-1 text-white font-medium text-sm px-4 py-2 rounded-md hover:opacity-90 ${
                  confirmAction.action === 'Confirmée' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                }`}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
