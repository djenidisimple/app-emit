'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SeancePlanningDto } from '@/types';
import Badge from './ui/Badge';

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

  const getBadgeStatus = (statut: string): 'Confirmé' | 'Annulé' | 'Reporté' | 'Terminé' => {
    switch (statut) {
      case 'Annule': return 'Annulé';
      case 'Reporte': return 'Reporté';
      case 'Normal': return 'Confirmé';
      default: return 'Confirmé';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="grid grid-cols-[80px_repeat(6,1fr)] min-w-[800px]">
        <div className="h-12 border-b border-r border-blue-100 bg-blue-50"></div>
        
        {DAYS.map((day) => (
          <div key={day} className="h-12 flex items-center justify-center font-semibold text-blue-900 border-b border-r border-blue-100 bg-blue-50 last:border-r-0">
            {day}
          </div>
        ))}

        <div className="bg-blue-50 border-r border-blue-100">
          {HOURS.map((hour) => (
            <div key={hour} className="h-16 flex items-start justify-center pt-2 text-xs text-blue-400 border-b border-blue-100/50">
              {hour.toString().padStart(2, '0')}h00
            </div>
          ))}
        </div>

        {DAYS.map((day) => (
          <div key={day} className="relative h-[calc(64px*12)] border-r border-blue-100 last:border-r-0">
            {HOURS.map((hour) => (
              <div key={hour} className="h-16 border-b border-blue-100/30"></div>
            ))}

            {seances
              .filter((s) => s.jour === day)
              .map((seance) => {
                const pos = getPosition(seance.heureDebut, seance.heureFin);
                return (
                  <motion.div
                    key={seance.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    onClick={() => onSeanceClick(seance)}
                    className="absolute inset-x-1 p-2 rounded-lg border cursor-pointer overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                    style={{
                      ...pos,
                      backgroundColor: `#0052FF15`,
                      borderLeft: `4px solid #0052FF`,
                      borderColor: `#0052FF30`,
                    }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-[#0052FF] uppercase truncate">
                          {seance.matiereNom}
                        </p>
                        <p className="text-[10px] text-blue-500 truncate">
                          {seance.professeurNomComplet}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-semibold text-amber-600">
                          {seance.salleNom}
                        </span>
                        <Badge status={getBadgeStatus(seance.statut ?? 'Normal')} />
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
