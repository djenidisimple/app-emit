'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Send } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import StatutBadge from '@/components/global/StatutBadge';
import Link from 'next/link';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';
import { DemandeEchangeReadDto } from '@/types';

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<DemandeEchangeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const res = await api.get<DemandeEchangeReadDto[]>(`/DemandeEchange?professeurId=${user.id}`);
        setDemandes(res.data.filter(d => d.demandeurId === user.id));
      } catch {} finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  return (
    <ProtectedLayout pageTitle="Échange de créneaux">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Link href="/echanges/mes-demandes">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1B3A6B] text-white">Mes demandes</button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] transition-colors duration-150">
              Demandes reçues
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
        <EmptyState icon={Repeat} title="Aucune demande" description="Vous n'avez envoyé aucune demande d'échange." action={
          <Link href="/echanges/nouvelle">
            <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
              <Send className="w-4 h-4" /> Nouvelle demande
            </button>
          </Link>
        } />
      ) : (
        <div className="space-y-3">
          {demandes.map((d, i) => (
            <div key={d.id} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8EEF8] flex items-center justify-center text-[#1B3A6B] font-bold text-sm">
                    {d.nomCible.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#212529]">{d.nomCible}</p>
                    <p className="text-xs text-[#6C757D]">Professeur cible</p>
                  </div>
                </div>
                <StatutBadge statut={d.statut === 'EnAttente' ? 'En_Attente' : d.statut === 'Acceptee' ? 'Valide' : 'Rejete'} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-[#F8F9FA] rounded-lg p-3">
                  <p className="text-xs text-[#6C757D] uppercase font-semibold mb-1">Ma séance</p>
                  <p className="font-medium text-[#212529]">Séance #{d.seanceDemandeurId}</p>
                </div>
                <div className="bg-[#F8F9FA] rounded-lg p-3">
                  <p className="text-xs text-[#6C757D] uppercase font-semibold mb-1">Séance proposée</p>
                  <p className="font-medium text-[#212529]">Séance #{d.seanceCibleId}</p>
                </div>
              </div>
              {d.motif && <p className="text-sm text-[#6C757D] mb-3"><strong>Motif :</strong> {d.motif}</p>}
              <div className="flex justify-between text-xs text-[#ADB5BD] pt-3 border-t border-[#E9ECEF]">
                <span>Envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}</span>
                {d.dateReponse && <span>Réponse le {new Date(d.dateReponse).toLocaleDateString('fr-FR')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
