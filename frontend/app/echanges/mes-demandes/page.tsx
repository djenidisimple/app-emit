'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Send } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import StatutBadge from '@/components/global/StatutBadge';
import Link from 'next/link';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { DemandeEchangeReadDto } from '@/types';
import { css } from 'styled-system/css';

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<DemandeEchangeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const data = await api.get<DemandeEchangeReadDto[]>(`/DemandeEchange?professeurId=${user.id}`);
        setDemandes(data.filter(d => d.demandeurId === user.id));
      } catch { /* noop */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  return (
    <ProtectedLayout pageTitle="Échange de créneaux">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6' })}>
        <div className={css({ display: 'flex', gap: '2' })}>
          <Link href="/echanges/mes-demandes">
            <button className={css({ px: '4', py: '2', rounded: 'lg', fontSize: 'sm', fontWeight: 'semibold', bg: 'accent.default', color: '#fff' })}>Mes demandes</button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className={css({ px: '4', py: '2', rounded: 'lg', fontSize: 'sm', fontWeight: 'semibold', border: '1px solid', borderColor: 'border.default', color: 'fg.muted', _hover: { bg: 'bg.muted' } })}>
              Demandes reçues
            </button>
          </Link>
        </div>
        <Link href="/echanges/nouvelle">
          <button className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
            <Plus className={css({ w: '4', h: '4' })} /> Nouvel échange
          </button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })} />
      ) : demandes.length === 0 ? (
        <EmptyState icon={Repeat} title="Aucune demande" description="Vous n'avez envoyé aucune demande d'échange." action={
          <Link href="/echanges/nouvelle">
            <button className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
              <Send className={css({ w: '4', h: '4' })} /> Nouvelle demande
            </button>
          </Link>
        } />
      ) : (
        <div className={css({ spaceY: '3' })}>
          {demandes.map(d => (
            <div key={d.id} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5', transition: 'box-shadow 0.15s', _hover: { shadow: 'md' } })}>
              <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <div className={css({ w: '9', h: '9', rounded: 'full', bg: 'bg.muted', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'accent.default', fontWeight: 'bold', fontSize: 'sm' })}>
                    {d.nomCible.charAt(0)}
                  </div>
                  <div>
                    <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>{d.nomCible}</p>
                    <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>Professeur cible</p>
                  </div>
                </div>
                <StatutBadge statut={d.statut === 'EnAttente' ? 'En_Attente' : d.statut === 'Acceptee' ? 'Valide' : 'Rejete'} />
              </div>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3', fontSize: 'sm', mb: '3' })}>
                <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '3' })}>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted', textTransform: 'uppercase', fontWeight: 'semibold', mb: '1' })}>Ma séance</p>
                  <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{d.seanceDemandeurMatiere}</p>
                </div>
                <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '3' })}>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted', textTransform: 'uppercase', fontWeight: 'semibold', mb: '1' })}>Séance proposée</p>
                  <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{d.seanceCibleMatiere}</p>
                </div>
              </div>
              {d.motif && <p className={css({ fontSize: 'sm', color: 'fg.muted', mb: '3' })}><strong>Motif :</strong> {d.motif}</p>}
              <div className={css({ display: 'flex', justifyContent: 'space-between', fontSize: 'xs', color: 'fg.subtle', pt: '3', borderTop: '1px solid', borderColor: 'border.default' })}>
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
