'use client';

import { Calendar, Clock, MapPin, User, CheckCheck } from 'lucide-react';
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
      className={`${isDone ? 'bg-bg-muted' : 'bg-surface'} border ${isAnnule ? 'border-[rgba(239,68,68,0.25)]' : 'border-border'} rounded-lg overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'} ${isDone ? 'opacity-55' : 'opacity-100'} transition-all duration-150 ${onClick ? 'hover:border-fg-subtle' : ''}`}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b border-[var(--colors-border-subtle)]"
        style={{ backgroundColor: `${displayColor}08` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold truncate" style={{ color: displayColor }}>
            {seance.matiereNom}
          </span>
          {isAnnule && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(239,68,68,0.15)] text-[#ef4444]">
              ANNULÉ
            </span>
          )}
        </div>
        <StatusBadge status={seance.statut === 'Normal' ? 'confirmee' : seance.statut} />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <Calendar size={12} className="text-fg-subtle shrink-0" />
          <span>{seance.jour}</span>
          <span className="text-fg-subtle">·</span>
          <span>{formatHeure(seance.heureDebut)} — {formatHeure(seance.heureFin)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <MapPin size={12} className="text-fg-subtle shrink-0" />
          <span>{seance.salleNom}</span>
        </div>

        {mode === 'etudiant' && seance.professeurNomComplet && (
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <User size={12} className="text-fg-subtle shrink-0" />
            <span>{seance.professeurNomComplet}</span>
          </div>
        )}

        {mode === 'professeur' && onTerminer && !isDone && !isAnnule && (
          <div className="pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onTerminer(seance); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#10b981] text-white hover:bg-[#059669] transition-colors duration-150"
            >
              <CheckCheck size={12} /> Terminer
            </button>
          </div>
        )}

        {seance.motifException && (
          <div className="text-xs text-[#f59e0b] italic bg-[rgba(245,158,11,0.08)] px-2 py-1 rounded-md">
            {seance.motifException}
          </div>
        )}
      </div>
    </div>
  );
}
