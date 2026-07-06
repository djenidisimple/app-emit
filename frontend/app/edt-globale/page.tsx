'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { css } from 'styled-system/css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EdtGlobalePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlanning = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const response = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?StartDate=${startOfWeek.toISOString()}`);
      setSeances(response.seances || []);
    } catch { setError('Impossible de charger le planning.'); } finally { setLoading(false); }
  }, [currentDate]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const getPosition = (heureDebut: string, heureFin: string) => {
    const [startH, startM] = heureDebut.split(':').map(Number);
    const [endH, endM] = heureFin.split(':').map(Number);
    const top = ((startH + startM / 60 - 7) / 13) * 100;
    const height = ((endH + endM / 60 - startH - startM / 60) / 13) * 100;
    return { top: `${top}%`, height: `${Math.max(height, 3)}%` };
  };

  const navBtnCls = css({ w: '8', h: '8', rounded: 'lg', border: '1px solid', borderColor: 'border.default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'fg.muted', bg: 'bg.surface', _hover: { bg: 'bg.elevated', color: 'fg.default' }, transition: 'all 0.15s' });

  return (
    <ProtectedLayout pageTitle="EDT Globale">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))} className={navBtnCls}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className={css({ px: '3', py: '1.5', rounded: 'lg', border: '1px solid', borderColor: 'border.default', bg: 'white', fontSize: 'sm', fontWeight: 'medium', color: 'accent.default', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', _hover: { bg: 'bg.muted' }, transition: 'all 0.15s' })}>
            Aujourd&apos;hui
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))} className={navBtnCls}>
            <ChevronRight size={15} />
          </button>
        </div>
        {isAdmin && (
          <button onClick={() => router.push('/admin/generateur-seance')}
            className={css({ display: 'flex', alignItems: 'center', gap: '2', px: '4', py: '2', rounded: 'lg', bg: 'accent.default', color: 'white', fontSize: 'sm', fontWeight: 'semibold', boxShadow: '0 2px 8px rgba(59,130,246,0.3)', _hover: { bg: 'accent.emphasized' }, transition: 'all 0.15s' })}>
            <Plus size={15} /> Nouvelle séance
          </button>
        )}
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '2.5', rounded: 'lg', bg: 'rgba(239,68,68,0.08)', border: '1px solid', borderColor: 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', color: '#ef4444' })}>
          <AlertCircle size={15} />{error}
          <button onClick={fetchPlanning} className={css({ ml: 'auto', fontWeight: 'medium', _hover: { textDecoration: 'underline' } })}>Réessayer</button>
        </div>
      )}

      {loading ? (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', display: 'flex', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ w: '8', h: '8', border: '3px solid', borderColor: 'colorPalette.default', borderTopColor: 'accent.default', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : seances.length === 0 ? (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <RefreshCw size={32} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
          <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune séance</p>
          <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>Aucune séance planifiée cette semaine.</p>
        </div>
      ) : (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ overflowX: 'auto' })}>
            <div className={css({ minWidth: '750px' })}>
              <div className={css({ display: 'grid', gridTemplateColumns: '50px repeat(6, 1fr)', bg: 'bg.muted', borderBottom: '1px solid', borderColor: 'border.default' })}>
                <div className={css({ p: '2.5', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wide' })}>Horaire</div>
                {DAYS.map(day => (
                  <div key={day} className={css({ p: '2.5', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wide', textAlign: 'center', borderLeft: '1px solid', borderColor: 'border.subtle' })}>{day}</div>
                ))}
              </div>
              <div className={css({ position: 'relative' })} style={{ height: '600px' }}>
                <div className={css({ position: 'absolute', inset: '0', display: 'grid', gridTemplateColumns: '50px repeat(6, 1fr)' })}>
                  {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                      <div className={css({ borderBottom: '1px solid', borderColor: 'border.subtle', fontSize: '11px', color: 'fg.subtle', p: '1', textAlign: 'right', pr: '2' })}>{hour}h</div>
                      {DAYS.map(day => <div key={`${hour}-${day}`} className={css({ borderBottom: '1px solid', borderLeft: '1px solid', borderColor: 'border.subtle' })} />)}
                    </React.Fragment>
                  ))}
                </div>
                {seances.map(seance => {
                  const pos = getPosition(seance.heureDebut, seance.heureFin);
                  const dayIndex = DAYS.indexOf(seance.jour);
                  if (dayIndex === -1) return null;
                  const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                  const color = seance.couleurAffichage || 'var(--colors-accent-default)';
                  return (
                    <div key={seance.id}
                      className={css({ position: 'absolute', cursor: 'pointer', rounded: 'md', p: '1.5', overflow: 'hidden', transition: 'all 0.15s', _hover: { ring: '2px solid', ringColor: 'accent.default' } })}
                      style={{
                        left: `calc(50px + ${dayIndex} * (100% - 50px) / 6 + 2px)`,
                        width: `calc((100% - 50px) / 6 - 4px)`,
                        top: pos.top, height: pos.height, minHeight: '24px',
                        backgroundColor: isCancelled ? '#f1f5f9' : `${color}15`,
                        borderLeft: `3px solid ${isCancelled ? '#9ca3af' : color}`,
                      }}>
                      <p className={css({ fontSize: 'xs', fontWeight: 'medium', truncate: true, color: isCancelled ? '#9ca3af' : 'fg.default' })}>
                        {isCancelled ? <span className={css({ textDecoration: 'line-through' })}>{seance.matiereNom}</span> : seance.matiereNom}
                        {isCancelled && <span className={css({ ml: '1', fontSize: '9px', bg: '#ef444420', color: '#ef4444', px: '1', py: '0.5', rounded: 'sm', fontWeight: 'bold' })}>ANNULÉ</span>}
                      </p>
                      <p className={css({ fontSize: '9px', color: 'fg.subtle', truncate: true })}>{seance.professeurNomComplet}</p>
                      <p className={css({ fontSize: '9px', color: 'fg.subtle', truncate: true })}>{seance.salleNom}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
