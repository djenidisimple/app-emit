'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, CheckCircle, XCircle, Plus } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import Link from 'next/link';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';
import { DemandeEchangeReadDto } from '@/types';

export default function DemandesRecuesPage() {
  const [demandes, setDemandes] = useState<DemandeEchangeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const res = await api.get<DemandeEchangeReadDto[]>(`/DemandeEchange?professeurId=${user.id}`);
        setDemandes(res.data.filter(d => d.cibleId === user.id && d.statut === 'EnAttente'));
      } catch {} finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const handleAction = async (id: number, action: 'accepter' | 'refuser') => {
    setActionId(id);
    try {
      await api.patch(`/DemandeEchange/${id}/statut`, { statut: action === 'accepter' ? 'Acceptee' : 'Refusee' });
      setDemandes(demandes.filter(d => d.id !== id));
    } catch {} finally { setActionId(null); }
  };

  return (
    <ProtectedLayout pageTitle="Échange de créneaux">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Link href="/echanges/mes-demandes">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] transition-colors duration-150">
              Mes demandes
            </button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1B3A6B] text-white flex items-center gap-2">
              Demandes reçues
              {demandes.length > 0 && (
                <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">{demandes.length}</span>
              )}
            </button>
          </Link>
        </div>
        <Link href="/echanges/nouvelle">
          <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel échange
          </button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5" />
      ) : demandes.length === 0 ? (
        <EmptyState icon={Repeat} title="Aucune demande en attente" description="Vous n'avez pas de demandes d'échange à traiter." />
      ) : (
        <div className="space-y-3">
          {demandes.map((d, i) => (
            <div key={d.id} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#E8EEF8] flex items-center justify-center text-[#1B3A6B] font-bold text-sm">
                  {d.nomDemandeur.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#212529]">{d.nomDemandeur}</p>
                  <p className="text-xs text-[#6C757D]">Demande envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-[#F8F9FA] rounded-lg p-3 border border-[#E9ECEF]">
                  <p className="text-xs text-[#6C757D] uppercase font-semibold mb-1">Sa séance</p>
                  <p className="font-medium text-[#212529]">Séance #{d.seanceDemandeurId}</p>
                </div>
                <div className="bg-[#F8F9FA] rounded-lg p-3 border border-[#E9ECEF]">
                  <p className="text-xs text-[#6C757D] uppercase font-semibold mb-1">Ma séance</p>
                  <p className="font-medium text-[#212529]">Séance #{d.seanceCibleId}</p>
                </div>
              </div>
              {d.motif && (
                <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-lg px-3 py-2 text-sm text-[#E65100] mb-4">
                  <strong>Motif :</strong> {d.motif}
                </div>
              )}
              <div className="flex gap-3 pt-3 border-t border-[#E9ECEF]">
                <button onClick={() => handleAction(d.id, 'accepter')} disabled={actionId === d.id}
                  className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> {actionId === d.id ? 'Traitement...' : 'Accepter'}
                </button>
                <button onClick={() => handleAction(d.id, 'refuser')} disabled={actionId === d.id}
                  className="flex-1 border border-[#C62828] text-[#C62828] hover:bg-red-50 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
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
