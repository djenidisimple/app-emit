'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, CheckCircle2, XCircle, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
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
    if (user?.id) fetchDemandes();
  }, [user]);

  const fetchDemandes = async () => {
    try {
      const res = await api.get<DemandeEchangeReadDto[]>(
        `/DemandeEchange?professeurId=${user?.id}`
      );
      // Filtrer uniquement les demandes reçues (je suis la cible)
      setDemandes(
        res.data.filter(d => d.cibleId === user?.id && d.statut === 'EnAttente')
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'accepter' | 'refuser') => {
    setActionId(id);
    try {
      await api.patch(`/DemandeEchange/${id}/statut`, {
        statut: action === 'accepter' ? 'Acceptee' : 'Refusee'
      });
      // Retirer la demande traitée de la liste
      setDemandes(demandes.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
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
              Demandes reçues
            </h1>
            <p className="text-emit-text/60 mt-1">
              Demandes d'échange envoyées par d'autres professeurs.
            </p>
          </div>
          <Link href="/echanges/nouvelle">
            <Button variant="orange" icon={Plus}>Nouvelle demande</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/echanges/mes-demandes">
            <button className="px-4 py-2 rounded-md text-sm font-semibold border border-emit-border text-emit-text/60 hover:bg-emit-bg">
              Mes demandes
            </button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className="px-4 py-2 rounded-md text-sm font-semibold bg-emit-blue text-white">
              Demandes reçues
              {demandes.length > 0 && (
                <span className="ml-2 bg-emit-orange text-white text-xs rounded-full px-1.5 py-0.5">
                  {demandes.length}
                </span>
              )}
            </button>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
          </div>
        ) : demandes.length === 0 ? (
          <div className="text-center py-20 bg-white border border-emit-border rounded-md">
            <ArrowLeftRight size={48} className="mx-auto text-emit-text/20 mb-4" />
            <p className="text-emit-text/50 font-medium">Aucune demande en attente</p>
            <p className="text-emit-text/40 text-sm mt-1">
              Vous n'avez pas de demandes d'échange à traiter.
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
                {/* Demandeur */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emit-orange/10 text-emit-orange flex items-center justify-center font-bold font-poppins">
                    {d.nomDemandeur.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-emit-blue">{d.nomDemandeur}</p>
                    <p className="text-xs text-emit-text/50">
                      Demande envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Séances */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-emit-bg rounded-md p-3 border border-emit-border">
                    <p className="text-xs font-semibold text-emit-text/50 uppercase mb-1">
                      Sa séance (à échanger)
                    </p>
                    <p className="font-medium text-emit-blue">Séance #{d.seanceDemandeurId}</p>
                  </div>
                  <div className="bg-emit-bg rounded-md p-3 border border-emit-border">
                    <p className="text-xs font-semibold text-emit-text/50 uppercase mb-1">
                      Votre séance (demandée)
                    </p>
                    <p className="font-medium text-emit-blue">Séance #{d.seanceCibleId}</p>
                  </div>
                </div>

                {/* Motif */}
                {d.motif && (
                  <div className="text-sm text-emit-text/60 bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-4">
                    <span className="font-semibold text-yellow-700">Motif : </span>
                    {d.motif}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-emit-border">
                  <button
                    onClick={() => handleAction(d.id, 'accepter')}
                    disabled={actionId === d.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {actionId === d.id ? 'Traitement...' : 'Accepter'}
                  </button>
                  <button
                    onClick={() => handleAction(d.id, 'refuser')}
                    disabled={actionId === d.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    {actionId === d.id ? 'Traitement...' : 'Refuser'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}