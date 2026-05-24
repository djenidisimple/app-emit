'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';
import { DemandeEchangeReadDto } from '@/types';

const StatutBadge = ({ statut }: { statut: string }) => {
  if (statut === 'EnAttente') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock size={12} /> En attente
    </span>
  );
  if (statut === 'Acceptee') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
      <CheckCircle2 size={12} /> Acceptée
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <XCircle size={12} /> Refusée
    </span>
  );
};

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<DemandeEchangeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) fetchDemandes();
  }, [user]);

  const fetchDemandes = async () => {
    try {
      const res = await api.get<DemandeEchangeReadDto[]>(
        `/DemandeEchange?professeurId=${user?.id}`
      );
      // Filtrer uniquement les demandes envoyées par moi
      setDemandes(res.data.filter(d => d.demandeurId === user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-28 pb-10 px-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-emit-blue">
              Mes demandes d'échange
            </h1>
            <p className="text-emit-text/60 mt-1">
              Demandes que vous avez envoyées à d'autres professeurs.
            </p>
          </div>
          <Link href="/echanges/nouvelle">
            <Button variant="orange" icon={Plus}>Nouvelle demande</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/echanges/mes-demandes">
            <button className="px-4 py-2 rounded-md text-sm font-semibold bg-emit-blue text-white">
              Mes demandes
            </button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className="px-4 py-2 rounded-md text-sm font-semibold border border-emit-border text-emit-text/60 hover:bg-emit-bg">
              Demandes reçues
            </button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
          </div>
        ) : demandes.length === 0 ? (
          <div className="text-center py-20 bg-white border border-emit-border rounded-md">
            <ArrowLeftRight size={48} className="mx-auto text-emit-text/20 mb-4" />
            <p className="text-emit-text/50 font-medium">Aucune demande envoyée</p>
            <p className="text-emit-text/40 text-sm mt-1">
              Cliquez sur "Nouvelle demande" pour commencer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {demandes.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-emit-border rounded-md p-5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emit-blue/10 text-emit-blue flex items-center justify-center font-bold font-poppins">
                      {d.nomCible.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-emit-blue">{d.nomCible}</p>
                      <p className="text-xs text-emit-text/50">Professeur cible</p>
                    </div>
                  </div>
                  <StatutBadge statut={d.statut} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-emit-bg rounded-md p-3">
                    <p className="text-xs font-semibold text-emit-text/50 uppercase mb-1">
                      Votre séance
                    </p>
                    <p className="font-medium text-emit-blue">Séance #{d.seanceDemandeurId}</p>
                  </div>
                  <div className="bg-emit-bg rounded-md p-3">
                    <p className="text-xs font-semibold text-emit-text/50 uppercase mb-1">
                      Séance proposée
                    </p>
                    <p className="font-medium text-emit-blue">Séance #{d.seanceCibleId}</p>
                  </div>
                </div>

                {d.motif && (
                  <div className="mt-3 text-sm text-emit-text/60 bg-emit-bg rounded-md p-3">
                    <span className="font-semibold">Motif : </span>{d.motif}
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center text-xs text-emit-text/40">
                  <span>Envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}</span>
                  {d.dateReponse && (
                    <span>Réponse le {new Date(d.dateReponse).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}