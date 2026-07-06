'use client';

import React from 'react';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { SeancePlanningDto } from '@/types';
import StatutBadge from './global/StatutBadge';
import { css } from 'styled-system/css';

interface SeanceCardProps {
  seance: SeancePlanningDto;
  onClick?: (seance: SeancePlanningDto) => void;
}

const SeanceCard: React.FC<SeanceCardProps> = ({ seance, onClick }) => {
  const isAnnule = seance.statut === 'Annule' || seance.statut === 'Annulé';
  const displayColor = seance.couleurAffichage || '#3B82F6';

  const card = css({
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    rounded: 'lg',
    overflow: 'hidden',
    cursor: 'pointer',
    _hover: { borderColor: 'fg.subtle' },
    transition: 'colors',
  });

  const headerBar = css({
    p: '3',
    bg: `${displayColor}08`,
  });

  const body = css({
    p: '3',
    spaceY: '2.5',
  });

  return (
    <div
      onClick={() => onClick?.(seance)}
      className={card}
    >
      <div className={headerBar}>
        <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <span className={css({ fontSize: 'xs', fontWeight: 'semibold', color: displayColor })}>
              {seance.matiereCode}
            </span>
            <span className={css({ fontSize: 'xs', color: 'fg.muted' })}>{seance.salleNom}</span>
          </div>
          {isAnnule && (
            <span className={css({ fontSize: '9px', fontWeight: 'semibold', textTransform: 'uppercase', letterSpacing: 'wider', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', px: '1.5', py: '0.5', rounded: 'md' })}>
              ANNULÉ
            </span>
          )}
        </div>
      </div>

      <div className={body}>
        <div>
          <h3 className={css({ fontWeight: 'semibold', color: 'fg.default', fontSize: 'sm', lineHeight: 'tight' })}>{seance.matiereNom}</h3>
          <p className={css({ fontSize: 'xs', color: 'fg.muted', mt: '0.5' })}>{seance.professeurNomComplet}</p>
        </div>

        <div className={css({ spaceY: '1.5' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
            <Calendar size={11} className={css({ color: 'fg.subtle' })} />
            <span>{seance.jour}</span>
          </div>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
            <Clock size={11} className={css({ color: 'fg.subtle' })} />
            <span>
              {seance.heureDebut.slice(0, 5)} — {seance.heureFin.slice(0, 5)}
            </span>
          </div>
          {seance.motifException && (
            <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '2', fontSize: 'xs', color: '#f59e0b' })}>
              <AlertCircle size={11} className={css({ color: '#f59e0b', mt: '0.5' })} />
              <span>{seance.motifException}</span>
            </div>
          )}
        </div>

        <StatutBadge statut={seance.statut === 'Normal' ? 'Valide' : seance.statut} />
      </div>
    </div>
  );
};

export default SeanceCard;
