'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, CheckCircle, XCircle, Plus } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import Link from 'next/link';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { DemandeEchangeReadDto } from '@/types';

export default function DemandesRecuesPage() {
  const [demandes, setDemandes] = useState<DemandeEchangeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const data = await api.get<DemandeEchangeReadDto[]>(`/DemandeEchange?professeurId=${user.id}`);
        setDemandes(data.filter(d => d.cibleId === user.id && d.statut === 'EnAttente'));
      } catch { setError('Erreur lors du chargement des demandes.'); } finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const handleAction = async (id: number, action: 'accepter' | 'refuser') => {
    setActionId(id);
    try {
      await api.patch(`/DemandeEchange/${id}/statut`, { statut: action === 'accepter' ? 'Acceptee' : 'Refusee' });
      setDemandes(demandes.filter(d => d.id !== id));
    } catch { setError('Erreur lors du traitement.'); } finally { setActionId(null); }
  };

  return (
    <ProtectedLayout pageTitle="Échange de créneaux">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Link href="/echanges/mes-demandes">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors duration-150">
              Mes demandes
            </button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#0052FF] text-white flex items-center gap-2">
              Demandes reçues
              {demandes.length > 0 && (
                <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">{demandes.length}</span>
              )}
            </button>
          </Link>
        </div>
        <Link href="/echanges/nouvelle">
          <button className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel échange
          </button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5" />
      ) : demandes.length === 0 ? (
        <EmptyState icon={Repeat} title="Aucune demande en attente" description="Vous n'avez pas de demandes d'échange à traiter." />
      ) : (
        <div className="space-y-3">
          {demandes.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#0052FF] font-bold text-sm">
                  {d.nomDemandeur.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">{d.nomDemandeur}</p>
                  <p className="text-xs text-blue-500">Demande envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Sa séance</p>
                  <p className="font-medium text-blue-900">Séance #{d.seanceDemandeurId}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Ma séance</p>
                  <p className="font-medium text-blue-900">Séance #{d.seanceCibleId}</p>
                </div>
              </div>
              {d.motif && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-700 mb-4">
                  <strong>Motif :</strong> {d.motif}
                </div>
              )}
              <div className="flex gap-3 pt-3 border-t border-blue-100">
                <button onClick={() => handleAction(d.id, 'accepter')} disabled={actionId === d.id}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> {actionId === d.id ? 'Traitement...' : 'Accepter'}
                </button>
                <button onClick={() => handleAction(d.id, 'refuser')} disabled={actionId === d.id}
                  className="flex-1 border border-red-400 text-red-600 hover:bg-red-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> {actionId === d.id ? 'Traitement...' : 'Refuser'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
