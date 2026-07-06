'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { css } from 'styled-system/css';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';

const HOUR_RANGES = [
  { label: '8h00–10h00', start: '08:00', end: '10:00' },
  { label: '10h00–12h00', start: '10:00', end: '12:00' },
  { label: '14h00–16h00', start: '14:00', end: '16:00' },
  { label: '16h00–18h00', start: '16:00', end: '18:00' },
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
      const data = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${start.toISOString()}`);
      setSeances(data.seances || []);
    } catch { setError('Impossible de charger le planning.'); } finally { setIsLoading(false); }
  }, [currentDate]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const nextWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() + 7); setCurrentDate(n); };
  const prevWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() - 7); setCurrentDate(n); };
  const goToday = () => setCurrentDate(new Date());

  const getSeancesForSlot = (jour: string, rangeStart: string, rangeEnd: string) =>
    seances.filter((s) => s.jour === jour && s.heureDebut >= rangeStart && s.heureDebut < rangeEnd);

  const legendColors = Object.values(
    seances.filter((s) => s.couleurAffichage).reduce((acc, s) => {
      acc[s.couleurAffichage!] = { color: s.couleurAffichage!, name: s.matiereNom };
      return acc;
    }, {} as Record<string, { color: string; name: string }>)
  );

  const navBtnCls = css({ w: '8', h: '8', rounded: 'lg', border: '1px solid', borderColor: 'border.default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'fg.muted', bg: 'bg.surface', _hover: { bg: 'bg.elevated', color: 'fg.default' }, transition: 'all 0.15s' });

  return (
    <ProtectedLayout pageTitle="Planning de la semaine">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5', flexWrap: 'wrap', gap: '3' })}>
        <p className={css({ color: 'fg.muted', fontSize: 'sm', fontWeight: 'medium' })}>
          Semaine du <span className={css({ color: 'fg.default', fontWeight: 'semibold' })}>{weekRange.mon} — {weekRange.sat}</span>
        </p>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <button onClick={prevWeek} className={navBtnCls}><ChevronLeft size={15} /></button>
          <button onClick={goToday} className={css({ px: '3', py: '1.5', rounded: 'lg', border: '1px solid', borderColor: 'border.default', bg: 'white', fontSize: 'sm', fontWeight: 'medium', color: 'fg.default', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', _hover: { bg: 'bg.muted' }, transition: 'all 0.15s' })}>
            Aujourd&apos;hui
          </button>
          <button onClick={nextWeek} className={navBtnCls}><ChevronRight size={15} /></button>
          <button
            onClick={async () => {
              const payload = { AnneeUniversitaire: '2025-2026', Mention: 'INFORMATIQUE', ParcoursNom: 'TRONC COMMUN', NiveauCode: 'L3', DateDebut: weekRange.start.toISOString(), DateFin: weekRange.end.toISOString() };
              try {
                const blob = await api.postBlob('/Document/export/emploi-du-temps', payload);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'emploi_du_temps.pdf'; a.click();
                URL.revokeObjectURL(url);
              } catch (e) { console.error(e); }
            }}
            className={css({ display: 'flex', alignItems: 'center', gap: '1.5', px: '3', py: '1.5', rounded: 'lg', border: '1px solid', borderColor: 'border.default', bg: 'white', fontSize: 'sm', fontWeight: 'medium', color: 'fg.default', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', _hover: { bg: 'bg.muted' }, transition: 'all 0.15s' })}
          >
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.08)', border: '1px solid', borderColor: 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', fontWeight: 'medium', color: '#ef4444' })}>
          <AlertCircle size={15} />{error}
          <button onClick={fetchPlanning} className={css({ ml: 'auto', color: '#ef4444', _hover: { textDecoration: 'underline' } })}>Réessayer</button>
        </div>
      )}

      {isLoading ? (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', display: 'flex', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ w: '8', h: '8', border: '3px solid', borderColor: 'colorPalette.default', borderTopColor: 'accent.default', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ overflowX: 'auto' })}>
            <table className={css({ w: 'full', fontSize: 'sm' })}>
              <thead>
                <tr>
                  <th className={css({ px: '3', py: '2.5', textAlign: 'left', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wider', bg: 'bg.muted', w: '20' })}>Horaire</th>
                  {DAYS.map((day) => (
                    <th key={day} className={css({ px: '3', py: '2.5', textAlign: 'left', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wider', bg: 'bg.muted' })}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOUR_RANGES.map((range) => (
                  <tr key={range.start} className={css({ borderTop: '1px solid', borderColor: 'border.subtle' })}>
                    <td className={css({ px: '3', py: '3', fontSize: 'xs', fontWeight: 'medium', color: 'fg.subtle', verticalAlign: 'top', whiteSpace: 'nowrap' })}>{range.label}</td>
                    {DAYS.map((jour) => {
                      const slotSeances = getSeancesForSlot(jour, range.start, range.end);
                      return (
                        <td key={`${jour}-${range.start}`} className={css({ px: '2', py: '2', verticalAlign: 'top', minH: '60px' })}>
                          <div className={css({ display: 'flex', flexDirection: 'column', gap: '1' })}>
                            {slotSeances.map((seance) => {
                              const color = seance.couleurAffichage || 'var(--colors-accent-default)';
                              const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                              return (
                                <div key={seance.id}
                                  className={css({ px: '2.5', py: '1.5', rounded: 'md', borderLeft: '3px solid', border: '1px solid', borderColor: 'border.subtle', cursor: 'pointer', _hover: { shadow: 'sm' }, transition: 'all 0.15s' })}
                                  style={{ borderLeftColor: isCancelled ? '#9ca3af' : color, backgroundColor: isCancelled ? '#f1f5f9' : `${color}10` }}>
                                  <p className={css({ fontSize: 'xs', fontWeight: 'medium', lineHeight: 'tight', color: isCancelled ? '#9ca3af' : 'fg.default' })}>
                                    {isCancelled ? <span className={css({ textDecoration: 'line-through' })}>{seance.matiereNom}</span> : seance.matiereNom}
                                  </p>
                                  <p className={css({ fontSize: '10px', color: 'fg.subtle', mt: '0.5' })}>{seance.salleNom}</p>
                                  <p className={css({ fontSize: '10px', color: 'fg.subtle' })}>{seance.professeurNomComplet}</p>
                                  {seance.motifException && <p className={css({ fontSize: '10px', color: '#f59e0b', fontWeight: 'medium', mt: '0.5' })}>→ {seance.motifException}</p>}
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
        <div className={css({ mt: '4', display: 'flex', flexWrap: 'wrap', gap: '3', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>
          {legendColors.map((l, i) => (
            <div key={`${l.color}-${i}`} className={css({ display: 'flex', alignItems: 'center', gap: '2', rounded: 'md', border: '1px solid', borderColor: 'border.subtle', px: '2.5', py: '1', bg: 'white' })}>
              <span className={css({ w: '2.5', h: '2.5', rounded: 'sm', flexShrink: '0' })} style={{ backgroundColor: l.color }} />
              <span className={css({ color: 'fg.default' })}>{l.name}</span>
            </div>
          ))}
        </div>
      )}

      {seances.length === 0 && !isLoading && !error && (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center', mt: '4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <Calendar size={32} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
          <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune séance cette semaine</p>
          <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>Aucun cours n&apos;est planifié pour cette période.</p>
        </div>
      )}
    </ProtectedLayout>
  );
}
