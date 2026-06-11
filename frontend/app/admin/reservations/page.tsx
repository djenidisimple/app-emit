'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Calendar, User, MapPin, Clock } from 'lucide-react';
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
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<ReservationReadDto[]>(`/Reservation/statut/${encodeURIComponent(filter)}`);
        setReservations(response);
      } catch {
        setError('Impossible de charger les réservations.');
      } finally { setIsLoading(false); }
    };
    load();
  }, [filter]);

  const handleStatus = async (id: number, statut: string) => {
    try {
      await api.patch(`/Reservation/${id}/statut`, { statut });
      setReservations(reservations.filter(r => r.id !== id));
      setConfirmAction(null);
    } catch {}
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ProtectedLayout pageTitle="Demandes de réservation">
      <div className="flex gap-2 mb-6">
        {['En attente', 'Confirmée', 'Annulée'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              filter === s ? 'bg-[#0052FF] text-white' : 'border border-blue-100 text-blue-500 hover:bg-blue-100'
            }`}>{s}</button>
        ))}
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      {isLoading ? (
        <LoadingSkeleton lines={5} className="bg-white rounded-xl border border-blue-100 shadow-sm p-5" />
      ) : reservations.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" description={`Aucune réservation ${filter.toLowerCase()}.`} />
      ) : (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                {['Demandeur', 'Salle', 'Date', 'Créneau', 'Type', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {reservations.map(r => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-900 font-medium">{r.demandeurNom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-300" />
                      <span>{r.salleLibelle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-300" />
                      <span>{formatDate(r.datePrecise)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-300" />
                      <span>{r.type}</span>
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
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valider
                          </button>
                          <button onClick={() => setConfirmAction({ id: r.id, action: 'Annulée' })}
                            className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1">
                            <X className="w-3 h-3" /> Rejeter
                          </button>
                        </>
                      )}
                      {(r.statut === 'Confirmée' || r.statut === 'Annulée') && (
                        <button onClick={() => setConfirmAction({ id: r.id, action: 'Annulée' })}
                          className="text-blue-600 hover:bg-blue-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150">
                          Annuler
                        </button>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Confirmer</h3>
            <p className="text-sm text-blue-500 mb-4">
              Êtes-vous sûr de vouloir {confirmAction.action === 'Confirmée' ? 'valider' : 'rejeter'} cette réservation ?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 border border-blue-100 text-blue-500 hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150">
                Annuler
              </button>
              <button onClick={() => handleStatus(confirmAction.id, confirmAction.action)}
                className={`flex-1 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 ${
                  confirmAction.action === 'Confirmée' ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : 'bg-[#C62828] hover:bg-[#B71C1C]'
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
