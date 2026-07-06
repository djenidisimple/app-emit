'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SeancePlanningDto } from '@/types';
import { css, cx } from 'styled-system/css';

interface CalendarWeekProps {
  seances: SeancePlanningDto[];
  onSeanceClick: (seance: SeancePlanningDto) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const CalendarWeek: React.FC<CalendarWeekProps> = ({ seances, onSeanceClick }) => {
  const getPosition = (heureDebut: string, heureFin: string) => {
    const start = parseInt(heureDebut.split(':')[0]) + parseInt(heureDebut.split(':')[1]) / 60;
    const end = parseInt(heureFin.split(':')[0]) + parseInt(heureFin.split(':')[1]) / 60;
    const top = ((start - 8) / 12) * 100;
    const height = ((end - start) / 12) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className={css({ w: '100%', overflowX: 'auto', rounded: 'lg', border: '1px solid', borderColor: 'border.default', bg: 'bg.surface' })}>
      <div className={css({ display: 'grid', gridTemplateColumns: '70px repeat(6, 1fr)', minW: '750px' })}>
        <div className={css({ h: '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'xs', fontWeight: 'semibold', color: 'fg.muted', borderBottom: '1px solid', borderRight: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })} />

        {DAYS.map((day, i) => (
          <div key={day} className={css({ h: '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'xs', fontWeight: 'semibold', color: 'fg.muted', borderBottom: '1px solid', borderColor: 'border.default', bg: 'bg.muted', borderRight: i < 5 ? '1px solid' : 'none' })}>
            {day}
          </div>
        ))}

        <div className={css({ bg: 'bg.muted', borderRight: '1px solid', borderColor: 'border.default' })}>
          {HOURS.map((hour) => (
            <div key={hour} className={css({ h: '12', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '1', fontSize: '11px', color: 'fg.subtle', borderBottom: '1px solid', borderColor: 'bg.muted' })}>
              {hour.toString().padStart(2, '0')}h
            </div>
          ))}
        </div>

        {DAYS.map((day, di) => (
          <div key={day} className={css({ position: 'relative', h: 'calc(48px * 12)', borderRight: di < 5 ? '1px solid' : 'none', borderColor: 'border.default' })}>
            {HOURS.map((hour) => (
              <div key={hour} className={css({ h: '12', borderBottom: '1px solid', borderColor: 'bg.muted' })}></div>
            ))}

            {seances
              .filter((s) => s.jour === day)
              .map((seance) => {
                const pos = getPosition(seance.heureDebut, seance.heureFin);
                const color = seance.couleurAffichage || '#3B82F6';
                const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                return (
                  <motion.div
                    key={seance.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    onClick={() => onSeanceClick(seance)}
                    className={css({ position: 'absolute', insetInline: '0.5', p: '1.5', rounded: 'md', cursor: 'pointer', overflow: 'hidden', transition: 'shadow', _hover: { shadow: 'sm' } })}
                    style={{
                      ...pos,
                      backgroundColor: `${color}12`,
                      borderLeft: `3px solid ${isCancelled ? '#9CA3AF' : color}`,
                    }}
                  >
                    <div className={css({ display: 'flex', flexDirection: 'column', h: '100%', justifyContent: 'space-between' })}>
                      <div>
                        <p className={css({ fontSize: '10px', fontWeight: 'semibold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })} style={{ color }}>
                          {seance.matiereNom}
                        </p>
                        <p className={css({ fontSize: '9px', color: 'fg.muted', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
                          {seance.professeurNomComplet}
                        </p>
                      </div>
                      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '0.5' })}>
                        <span className={css({ fontSize: '8px', fontWeight: 'medium', color: 'fg.subtle' })}>
                          {seance.salleNom}
                        </span>
                        {isCancelled && (
                          <span className={css({ fontSize: '8px', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', px: '1', py: '0.5', rounded: 'sm', fontWeight: 'semibold' })}>ANNULÉ</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWeek;
