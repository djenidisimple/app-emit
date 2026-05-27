'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import EmptyState from '@/components/global/EmptyState';
import { api } from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';

const HOURS = ['07h30', '09h30', '11h30', '14h00', '16h00'];
const HOUR_RANGES = [
  { start: '07:30', end: '09:30' },
  { start: '09:30', end: '11:30' },
  { start: '11:30', end: '13:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setDate(d.getDate() + 5);
  return { start: d, end, mon: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }), sat: end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) };
}

function getSeanceStyle(seance: SeancePlanningDto) {
  if (seance.statut === 'Annule' || seance.statut === 'Annulé') {
    return { bg: 'bg-[#F1F3F5]', border: 'border-l-[#ADB5BD]', label: 'ANNULÉ', labelClass: 'bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold' };
  }
  if (seance.statut === 'Reporte' || seance.statut === 'Reporté') {
    return { bg: 'bg-[#FFF3E0]', border: 'border-l-[#FF8F00]', label: null, labelClass: '' };
  }
  const color = seance.couleurAffichage || '#1B3A6B';
  return {
    bg: '',
    border: `border-l-[${color}]`,
    label: null,
    labelClass: '',
    customBg: { backgroundColor: `${color}26` },
    customBorder: { borderLeftColor: color },
  };
}

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');

  const weekRange = getWeekRange(currentDate);

  const fetchPlanning = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const startOfWeek = weekRange.start;
      const data = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${startOfWeek.toISOString()}`);
      setSeances(data.seances || []);
    } catch {
      setError('Impossible de charger le planning.');
    } finally {
      setIsLoading(false);
    }
  }, [weekRange.start]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const nextWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() + 7); setCurrentDate(n); };
  const prevWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() - 7); setCurrentDate(n); };
  const today = () => setCurrentDate(new Date());

  const getSeancesForSlot = (jour: string, rangeStart: string, rangeEnd: string) => {
    return seances.filter(s => {
      if (s.jour !== jour) return false;
      return s.heureDebut >= rangeStart && s.heureDebut < rangeEnd;
    });
  };

  const legendColors = [...new Set(seances.filter(s => s.couleurAffichage).map(s => ({ color: s.couleurAffichage, name: s.matiereNom })))];

  return (
    <ProtectedLayout pageTitle="Planning de la semaine">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#6C757D]">Semaine du {weekRange.mon} au {weekRange.sat}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-lg border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] hover:text-[#1B3A6B] transition-colors duration-150">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={today} className="px-3 py-1.5 text-sm font-medium text-[#1B3A6B] border border-[#1B3A6B] rounded-lg hover:bg-[#E8EEF8] transition-colors duration-150">
            Aujourd&apos;hui
          </button>
          <div className="text-sm font-semibold text-[#212529] min-w-[140px] text-center">
            {weekRange.mon} — {weekRange.sat}
          </div>
          <button onClick={nextWeek} className="p-2 rounded-lg border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] hover:text-[#1B3A6B] transition-colors duration-150">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={fetchPlanning} className="ml-auto text-red-600 font-semibold hover:underline">Réessayer</button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-6">
          <LoadingSkeleton lines={8} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide w-20">Horaire</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-3 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide border-l border-[#E9ECEF]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5]">
                {HOUR_RANGES.map((range, ri) => (
                  <tr key={ri} className="hover:bg-[#F8F9FA]/50 transition-colors">
                    <td className="px-3 py-4 text-xs font-medium text-[#6C757D] align-top whitespace-nowrap">{HOURS[ri]}</td>
                    {DAYS.map(jour => {
                      const slotSeances = getSeancesForSlot(jour, range.start, range.end);
                      return (
                        <td key={`${jour}-${ri}`} className="px-2 py-2 align-top border-l border-[#E9ECEF] min-h-[80px]">
                          <div className="flex flex-col gap-1.5">
                            {slotSeances.map(seance => {
                              const style = getSeanceStyle(seance);
                              const color = seance.couleurAffichage || '#1B3A6B';
                              return (
                                <div
                                  key={seance.id}
                                  className={`rounded-lg px-2.5 py-2 border-l-[3px] transition-shadow hover:shadow-sm cursor-pointer ${style.bg || ''}`}
                                  style={{ borderLeftColor: color, backgroundColor: `${color}15` }}
                                >
                                  <p className="text-xs font-bold" style={{ color }}>{seance.matiereNom}</p>
                                  {style.label && <span className={style.labelClass}>{style.label}</span>}
                                  <p className="text-[11px] text-[#6C757D]">{seance.salleNom}</p>
                                  <p className="text-[11px] text-[#6C757D]">{seance.professeurNomComplet}</p>
                                  {seance.motifException && <p className="text-[11px] text-[#FF8F00]">→ {seance.motifException}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {legendColors.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#6C757D]">
          {legendColors.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span>{l.name}</span>
            </div>
          ))}
        </div>
      )}

      {seances.length === 0 && !isLoading && !error && (
        <EmptyState
          icon={Calendar}
          title="Aucune séance cette semaine"
          description="Aucun cours n'est planifié pour cette période."
          action={isAdmin ? <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle séance
          </button> : undefined}
        />
      )}
    </ProtectedLayout>
  );
}
