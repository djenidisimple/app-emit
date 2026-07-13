'use client';

import { useState } from 'react';
import { AlertTriangle, X, Building2, ArrowRight } from 'lucide-react';
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
    <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-lg p-4 mb-5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-[#ef4444] mt-0.5 shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-[#ef4444]">
            {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {conflicts.map((c) => (
              <div key={c.seanceId} className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs text-[#ef4444]">
                  <span className="font-medium">{c.matiereNom}</span>
                  {' — salle '}
                  <strong>{c.salleNom}</strong>
                  {' double-réservée '}
                  {c.jour} {c.creneauHoraire}
                  {c.conflitAvec && <> avec <strong>{c.conflitAvec}</strong></>}
                </div>
                {resolvingId === c.seanceId ? (
                  <div className="flex items-center gap-2">
                    {loadingSalles ? (
                      <span className="text-xs text-fg-muted">Recherche...</span>
                    ) : (
                      <select
                        onChange={(e) => { const v = e.target.value; if (v) handleSelectSalle(Number(v)); }}
                        className="border border-border rounded-md px-2 py-1 text-xs bg-white outline-none"
                      >
                        <option value="">Salle disponible...</option>
                        {disponibles.map((s) => (
                          <option key={s.id} value={s.id}>{s.libelle || s.nom} ({s.capacite} pl.)</option>
                        ))}
                      </select>
                    )}
                    <button onClick={() => setResolvingId(null)}
                      className="text-fg-muted hover:text-fg-default">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleResolve(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#ef4444] text-white hover:bg-[#ef4444] transition-colors duration-150 shrink-0"
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
