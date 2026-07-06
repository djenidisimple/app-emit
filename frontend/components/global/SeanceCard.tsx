'use client';

import { Calendar, Clock, MapPin, User, CheckCheck } from 'lucide-react';
import { css } from 'styled-system/css';
import { SeancePlanningDto } from '@/types';
import StatusBadge from './StatusBadge';

interface SeanceCardProps {
  seance: SeancePlanningDto;
  mode?: 'professeur' | 'etudiant';
  onTerminer?: (seance: SeancePlanningDto) => void;
  onClick?: (seance: SeancePlanningDto) => void;
}

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

export default function SeanceCard({ seance, mode = 'etudiant', onTerminer, onClick }: SeanceCardProps) {
  const isDone = seance.statut === 'Terminee' || seance.statut === 'Terminé';
  const isAnnule = seance.statut === 'Annule' || seance.statut === 'Annulé';
  const displayColor = seance.couleurAffichage || 'var(--colors-accent-default)';

  return (
    <div
      onClick={() => onClick?.(seance)}
      className={css({
        bg: isDone ? 'bg.muted' : 'bg.surface',
        border: '1px solid',
        borderColor: isAnnule ? 'rgba(239,68,68,0.25)' : 'border.default',
        rounded: 'lg',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isDone ? 0.55 : 1,
        transition: 'all 0.15s',
        _hover: onClick ? { borderColor: 'fg.subtle' } : {},
      })}
    >
      <div className={css({
        px: '4', py: '2.5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid', borderColor: 'border.subtle',
        bg: `${displayColor}08`,
      })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', minWidth: '0' })}>
          <span className={css({
            fontSize: 'xs', fontWeight: 'semibold', color: displayColor, truncate: 'true',
          })}>
            {seance.matiereNom}
          </span>
          {isAnnule && (
            <span className={css({
              fontSize: '9px', fontWeight: 'semibold', px: '1.5', py: '0.5',
              rounded: 'md', bg: 'rgba(239,68,68,0.15)', color: '#ef4444',
            })}>
              ANNULÉ
            </span>
          )}
        </div>
        <StatusBadge status={seance.statut === 'Normal' ? 'confirmee' : seance.statut} />
      </div>

      <div className={css({ p: '3', spaceY: '2' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
          <Calendar size={12} className={css({ color: 'fg.subtle', flexShrink: '0' })} />
          <span>{seance.jour}</span>
          <span className={css({ color: 'fg.subtle' })}>·</span>
          <span>{formatHeure(seance.heureDebut)} — {formatHeure(seance.heureFin)}</span>
        </div>

        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
          <MapPin size={12} className={css({ color: 'fg.subtle', flexShrink: '0' })} />
          <span>{seance.salleNom}</span>
        </div>

        {mode === 'etudiant' && seance.professeurNomComplet && (
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
            <User size={12} className={css({ color: 'fg.subtle', flexShrink: '0' })} />
            <span>{seance.professeurNomComplet}</span>
          </div>
        )}

        {mode === 'professeur' && onTerminer && !isDone && !isAnnule && (
          <div className={css({ pt: '2' })}>
            <button
              onClick={(e) => { e.stopPropagation(); onTerminer(seance); }}
              className={css({
                display: 'inline-flex', alignItems: 'center', gap: '1.5',
                px: '3', py: '1.5', rounded: 'md', fontSize: 'xs', fontWeight: 'medium',
                bg: '#10b981', color: 'white',
                _hover: { bg: '#059669' },
                transition: 'colors 0.15s',
              })}
            >
              <CheckCheck size={12} /> Terminer
            </button>
          </div>
        )}

        {seance.motifException && (
          <div className={css({
            fontSize: 'xs', color: '#f59e0b', fontStyle: 'italic',
            bg: 'rgba(245,158,11,0.08)', px: '2', py: '1', rounded: 'md',
          })}>
            {seance.motifException}
          </div>
        )}
      </div>
    </div>
  );
}
