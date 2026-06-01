'use client';

import React from 'react';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { SeancePlanningDto } from '@/types';
import StatutBadge from './global/StatutBadge';

interface SeanceCardProps {
  seance: SeancePlanningDto;
  onClick?: (seance: SeancePlanningDto) => void;
}

const SeanceCard: React.FC<SeanceCardProps> = ({ seance, onClick }) => {
  const isAnnule = seance.statut === 'Annule' || seance.statut === 'Annulé';
  const displayColor = seance.couleurAffichage || '#0052FF';

  return (
    <div
      onClick={() => onClick?.(seance)}
      className="bg-white border border-blue-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Bloc visuel supérieur */}
      <div className="p-4" style={{ backgroundColor: `${displayColor}15` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: displayColor }}>
              {seance.matiereCode}
            </span>
            <span className="text-xs text-blue-500">{seance.salleNom}</span>
          </div>
          {isAnnule && (
            <span className="text-[9px] font-semibold uppercase tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded-md">
              ANNULÉ
            </span>
          )}
        </div>
      </div>

      {/* Bloc infos inférieur */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-blue-900 text-sm leading-tight">{seance.matiereNom}</h3>
          <p className="text-xs text-blue-500 mt-1">{seance.professeurNomComplet}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-blue-500">
            <Calendar size={12} className="text-blue-400" />
            <span>{seance.jour}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-500">
            <Clock size={12} className="text-blue-400" />
            <span>
              {seance.heureDebut.slice(0, 5)} — {seance.heureFin.slice(0, 5)}
            </span>
          </div>
          {seance.motifException && (
            <div className="flex items-start gap-2 text-xs text-amber-600">
              <AlertCircle size={12} className="text-amber-500 mt-0.5" />
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