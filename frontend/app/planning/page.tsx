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
  return {
    start: d,
    end,
    mon: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
    sat: end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
  };
}

function getSeanceColors(seance: SeancePlanningDto) {
  if (seance.statut === 'Annule' || seance.statut === 'Annulé') {
    return { bg: 'bg-blue-50', borderColor: '#6B7280', label: 'ANNULÉ', labelClass: 'bg-red-500 text-white text-[9px] px-1.5 py-0.5 font-semibold uppercase rounded' };
  }
  if (seance.statut === 'Reporte' || seance.statut === 'Reporté') {
    return { bg: '', borderColor: '#F97316', label: null, labelClass: '' };
  }
  const color = seance.couleurAffichage || '#1D4ED8';
  return { bg: '', borderColor: color, label: null, labelClass: '' };
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
      const start = getWeekRange(currentDate).start;
      const data = await api.get<PlanningHebdoResponse>(
        `/Planning/hebdo?startDate=${start.toISOString()}`
      );
      setSeances(data.seances || []);
    } catch {
      setError('Impossible de charger le planning.');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const nextWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() + 7); setCurrentDate(n); };
  const prevWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() - 7); setCurrentDate(n); };
  const today = () => setCurrentDate(new Date());

  const getSeancesForSlot = (jour: string, rangeStart: string, rangeEnd: string) =>
    seances.filter((s) => s.jour === jour && s.heureDebut >= rangeStart && s.heureDebut < rangeEnd);

  const legendColors = [
    ...new Set(
      seances.filter((s) => s.couleurAffichage).map((s) => ({ color: s.couleurAffichage, name: s.matiereNom }))
    ),
  ];

  return (
    <ProtectedLayout pageTitle="Planning de la semaine">
      {/* Navigation bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-blue-500 font-medium">
          Semaine du{' '}
          <span className="text-blue-900 font-bold">
            {weekRange.mon} — {weekRange.sat}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="w-9 h-9 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={today}
            className="px-4 py-2 rounded-xl border border-blue-200 bg-white text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={nextWeek}
            className="w-9 h-9 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm font-semibold text-red-600">
          <AlertCircle size={15} />
          {error}
          <button
            onClick={fetchPlanning}
            className="ml-auto text-red-700 hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <LoadingSkeleton lines={8} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wider w-20">
                    Horaire
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOUR_RANGES.map((range, ri) => (
                  <tr key={ri} className="border-t border-blue-100 hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-3 py-3 text-xs font-semibold text-blue-400 align-top whitespace-nowrap">
                      {HOURS[ri]}
                    </td>
                    {DAYS.map((jour) => {
                      const slotSeances = getSeancesForSlot(jour, range.start, range.end);
                      return (
                        <td key={`${jour}-${ri}`} className="px-2 py-2 align-top min-h-[70px]">
                          <div className="flex flex-col gap-1.5">
                            {slotSeances.map((seance) => {
                              const style = getSeanceColors(seance);
                              const color = seance.couleurAffichage || '#1D4ED8';
                              return (
                                <div
                                  key={seance.id}
                                  className={`px-2.5 py-2 rounded-lg border-l-[4px] border border-blue-200 cursor-pointer hover:shadow-md transition-all duration-150 ${style.bg || ''}`}
                                  style={{
                                    borderLeftColor: style.borderColor,
                                    backgroundColor: style.bg ? undefined : `${color}18`,
                                  }}
                                >
                                  <p className="text-xs font-semibold leading-tight" style={{ color }}>
                                    {seance.matiereNom}
                                  </p>
                                  {style.label && (
                                    <span className={style.labelClass}>{style.label}</span>
                                  )}
                                  <p className="text-[10px] text-blue-400 mt-0.5">{seance.salleNom}</p>
                                  <p className="text-[10px] text-blue-400">{seance.professeurNomComplet}</p>
                                  {seance.motifException && (
                                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                      → {seance.motifException}
                                    </p>
                                  )}
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

      {/* Legend */}
      {legendColors.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-blue-500">
          {legendColors.map((l, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-1.5 bg-white shadow-sm">
              <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: l.color! }} />
              <span className="text-blue-900">{l.name}</span>
            </div>
          ))}
        </div>
      )}

      {seances.length === 0 && !isLoading && !error && (
        <EmptyState
          icon={Calendar}
          title="Aucune séance cette semaine"
          description="Aucun cours n'est planifié pour cette période."
          action={
            isAdmin ? (
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0052FF] text-white shadow-sm font-semibold text-sm hover:bg-blue-700 transition-colors">
                <Plus size={15} /> Nouvelle séance
              </button>
            ) : undefined
          }
        />
      )}
    </ProtectedLayout>
  );
}
