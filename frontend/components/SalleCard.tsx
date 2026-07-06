'use client';

import React from 'react';
import { MapPin, Users, Monitor, ShieldCheck } from 'lucide-react';
import { Salle } from '@/types';
import { Button } from '@/components/ui/button';
import { css } from 'styled-system/css';

interface SalleCardProps {
  salle: Salle;
  onReserve?: (id: number) => void;
}

const SalleCard: React.FC<SalleCardProps> = ({ salle, onReserve }) => {
  const estDisponible = salle.estDisponible;

  return (
    <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', display: 'flex', flexDirection: 'column', h: '100%', _hover: { borderColor: 'fg.subtle' }, transition: 'colors' })}>
      <div style={{ flex: 1 }}>
        <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '3' })}>
          <div className={css({ p: '2', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: estDisponible ? 'rgba(79,94,255,0.1)' : 'rgba(239,68,68,0.1)', color: estDisponible ? 'accent.default' : '#ef4444' })}>
            <MapPin size={16} />
          </div>
          <span className={css({ fontSize: 'xs', fontWeight: 'medium', px: '2', py: '0.5', rounded: 'md', bg: estDisponible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: estDisponible ? '#10b981' : '#ef4444' })}>
            {estDisponible ? 'Disponible' : 'Occupée'}
          </span>
        </div>

        <h3 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default', mb: '2', _hover: { color: 'accent.default' }, transition: 'colors' })}>
          {salle.libelle}
        </h3>

        <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5', mb: '4' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', color: 'fg.muted' })}>
            <Users size={14} className={css({ color: 'fg.subtle' })} />
            <span>{salle.capacite} places</span>
          </div>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', color: 'fg.muted' })}>
            <Monitor size={14} className={css({ color: 'fg.subtle' })} />
            <span>Type : {salle.type}</span>
          </div>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', color: 'fg.muted' })}>
            <ShieldCheck size={14} className={css({ color: 'fg.subtle' })} />
            <span>Code : {salle.codeSalle}</span>
          </div>
        </div>
      </div>

      <Button
        variant={estDisponible ? 'solid' : 'outline'}
        disabled={!estDisponible}
        onClick={() => onReserve?.(salle.id)}
        className={css({ w: '100%' })}
      >
        {estDisponible ? 'Réserver la salle' : 'Bientôt disponible'}
      </Button>
    </div>
  );
};

export default SalleCard;
