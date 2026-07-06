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
import { css } from 'styled-system/css';

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
      } catch { setError('Erreur lors du chargement des demandes.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const handleAction = async (id: number, action: 'accepter' | 'refuser') => {
    setActionId(id);
    try {
      await api.patch(`/DemandeEchange/${id}/statut`, { statut: action === 'accepter' ? 'Acceptee' : 'Refusee' });
      setDemandes(demandes.filter(d => d.id !== id));
    } catch { setError('Erreur lors du traitement.'); }
    finally { setActionId(null); }
  };

  return (
    <ProtectedLayout pageTitle="Échange de créneaux">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6' })}>
        <div className={css({ display: 'flex', gap: '2' })}>
          <Link href="/echanges/mes-demandes">
            <button className={css({ px: '4', py: '2', rounded: 'lg', fontSize: 'sm', fontWeight: 'semibold', border: '1px solid', borderColor: 'border.default', color: 'fg.muted', _hover: { bg: 'bg.muted' } })}>
              Mes demandes
            </button>
          </Link>
          <Link href="/echanges/demandes-recues">
            <button className={css({ px: '4', py: '2', rounded: 'lg', fontSize: 'sm', fontWeight: 'semibold', bg: 'accent.default', color: '#fff', display: 'flex', alignItems: 'center', gap: '2' })}>
              Demandes reçues
              {demandes.length > 0 && (
                <span className={css({ bg: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 'xs', rounded: 'full', px: '1.5', py: '0.5' })}>{demandes.length}</span>
              )}
            </button>
          </Link>
        </div>
        <Link href="/echanges/nouvelle">
          <button className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
            <Plus className={css({ w: '4', h: '4' })} /> Nouvel échange
          </button>
        </Link>
      </div>

      {error && <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', fontSize: 'sm', color: '#ef4444' })}>{error}</div>}

      {isLoading ? (
        <LoadingSkeleton lines={4} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })} />
      ) : demandes.length === 0 ? (
        <EmptyState icon={Repeat} title="Aucune demande en attente" description="Vous n'avez pas de demandes d'échange à traiter." />
      ) : (
        <div className={css({ spaceY: '3' })}>
          {demandes.map(d => (
            <div key={d.id} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '4' })}>
                <div className={css({ w: '9', h: '9', rounded: 'full', bg: 'bg.muted', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'accent.default', fontWeight: 'bold', fontSize: 'sm' })}>
                  {d.nomDemandeur.charAt(0)}
                </div>
                <div>
                  <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>{d.nomDemandeur}</p>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>Demande envoyée le {new Date(d.dateDemande).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3', fontSize: 'sm', mb: '4' })}>
                <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '3', border: '1px solid', borderColor: 'border.default' })}>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted', textTransform: 'uppercase', fontWeight: 'semibold', mb: '1' })}>Sa séance</p>
                  <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{d.seanceDemandeurMatiere}</p>
                </div>
                <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '3', border: '1px solid', borderColor: 'border.default' })}>
                  <p className={css({ fontSize: 'xs', color: 'fg.muted', textTransform: 'uppercase', fontWeight: 'semibold', mb: '1' })}>Ma séance</p>
                  <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{d.seanceCibleMatiere}</p>
                </div>
              </div>
              {d.motif && (
                <div className={css({ bg: 'rgba(245,158,11,0.1)', border: '1px solid', borderColor: '#f59e0b', rounded: 'lg', px: '3', py: '2', fontSize: 'sm', color: '#f59e0b', mb: '4' })}>
                  <strong>Motif :</strong> {d.motif}
                </div>
              )}
              <div className={css({ display: 'flex', gap: '3', pt: '3', borderTop: '1px solid', borderColor: 'border.default' })}>
                <button onClick={() => handleAction(d.id, 'accepter')} disabled={actionId === d.id}
                  className={css({ flex: '1', bg: '#10b981', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { opacity: 0.9 }, _disabled: { opacity: 0.5 } })}>
                  <CheckCircle className={css({ w: '4', h: '4' })} /> {actionId === d.id ? 'Traitement...' : 'Accepter'}
                </button>
                <button onClick={() => handleAction(d.id, 'refuser')} disabled={actionId === d.id}
                  className={css({ flex: '1', border: '1px solid', borderColor: '#ef4444', color: '#ef4444', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { bg: 'rgba(239,68,68,0.1)' }, _disabled: { opacity: 0.5 } })}>
                  <XCircle className={css({ w: '4', h: '4' })} /> {actionId === d.id ? 'Traitement...' : 'Refuser'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
