'use client';

import { useState } from 'react';
import { AlertTriangle, X, Building2, ArrowRight } from 'lucide-react';
import { css } from 'styled-system/css';
import { api } from '@/services/api';
import { Salle } from '@/types';

export interface ConflictInfo {
  seanceId: number;
  matiereNom: string;
  salleNom: string;
  jour: string;
  creneauHoraire: string;
  conflitAvec: string;
}

interface ConflictBannerProps {
  conflicts: ConflictInfo[];
  onResolve?: (seanceId: number, nouvelleSalleId: number) => void;
}

export default function ConflictBanner({ conflicts, onResolve }: ConflictBannerProps) {
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [disponibles, setDisponibles] = useState<Salle[]>([]);
  const [loadingSalles, setLoadingSalles] = useState(false);

  if (!conflicts.length) return null;

  const handleResolve = async (conflict: ConflictInfo) => {
    setResolvingId(conflict.seanceId);
    setLoadingSalles(true);
    try {
      const salle = await api.get<Salle[]>(`/Salles/disponibles?date=&creneauId=`);
      setDisponibles(salle);
    } catch {
      setDisponibles([]);
    } finally {
      setLoadingSalles(false);
    }
  };

  const handleSelectSalle = async (salleId: number) => {
    if (resolvingId && onResolve) {
      onResolve(resolvingId, salleId);
    }
    setResolvingId(null);
    setDisponibles([]);
  };

  return (
    <div
      className={css({
        bg: 'rgba(239,68,68,0.08)',
        border: '1px solid',
        borderColor: 'rgba(239,68,68,0.25)',
        rounded: 'lg',
        p: '4',
        mb: '5',
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '3' })}>
        <AlertTriangle size={16} className={css({ color: '#ef4444', mt: '0.5', flexShrink: '0' })} />
        <div className={css({ flex: '1', spaceY: '2' })}>
          <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: '#ef4444' })}>
            {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
          </p>
          <div className={css({ spaceY: '1.5' })}>
            {conflicts.map((c) => (
              <div key={c.seanceId} className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2', flexWrap: 'wrap' })}>
                <div className={css({ fontSize: 'xs', color: '#ef4444' })}>
                  <span className={css({ fontWeight: 'medium' })}>{c.matiereNom}</span>
                  {' — salle '}
                  <strong>{c.salleNom}</strong>
                  {' double-réservée '}
                  {c.jour} {c.creneauHoraire}
                  {c.conflitAvec && <> avec <strong>{c.conflitAvec}</strong></>}
                </div>
                {resolvingId === c.seanceId ? (
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    {loadingSalles ? (
                      <span className={css({ fontSize: 'xs', color: 'fg.muted' })}>Recherche...</span>
                    ) : (
                      <select
                        onChange={(e) => { const v = e.target.value; if (v) handleSelectSalle(Number(v)); }}
                        className={css({
                          border: '1px solid', borderColor: 'border.default', rounded: 'md',
                          px: '2', py: '1', fontSize: 'xs', bg: 'white', outline: 'none',
                        })}
                      >
                        <option value="">Salle disponible...</option>
                        {disponibles.map((s) => (
                          <option key={s.id} value={s.id}>{s.libelle || s.nom} ({s.capacite} pl.)</option>
                        ))}
                      </select>
                    )}
                    <button onClick={() => setResolvingId(null)}
                      className={css({ color: 'fg.muted', _hover: { color: 'fg.default' } })}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleResolve(c)}
                    className={css({
                      display: 'inline-flex', alignItems: 'center', gap: '1',
                      px: '2.5', py: '1', rounded: 'md', fontSize: 'xs', fontWeight: 'medium',
                      bg: '#ef4444', color: 'white',
                      _hover: { bg: '#ef4444' },
                      transition: 'colors 0.15s', flexShrink: '0',
                    })}
                  >
                    <Building2 size={12} /> Résoudre <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
