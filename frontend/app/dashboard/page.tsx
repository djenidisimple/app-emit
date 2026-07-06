'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { css } from 'styled-system/css';
import { Search, CheckCheck, CalendarDays, X, MapPin } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

function getStatutBadge(statut: string, estTerminee?: boolean) {
  if (estTerminee || statut === 'Terminé' || statut === 'Terminee')
    return { label: 'Terminée', bg: '#8b5cf620', color: '#8b5cf6', border: '#8b5cf640' };
  switch (statut) {
    case 'Annule': case 'Annulé':
      return { label: 'Annulée', bg: '#ef444420', color: '#ef4444', border: '#ef444440' };
    case 'Reporte': case 'Reporté':
      return { label: 'Reportée', bg: '#f59e0b20', color: '#f59e0b', border: '#f59e0b40' };
    default:
      return { label: 'Confirmée', bg: '#10b98120', color: '#10b981', border: '#10b98140' };
  }
}

export default function DashboardPage() {
  const [seances, setSeances] = useState<(SeancePlanningDto & { estTerminee?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJour, setFilterJour] = useState('');
  const { user } = useAuthStore();
  const isProf = user?.role === 'Professeur' || user?.roles?.[0] === 'Professeur';

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let url = `/Planning/hebdo?startDate=${today}`;
      const role = user.role || user.roles?.[0];
      if (role === 'Etudiant' && user.niveauId) url += `&niveauId=${user.niveauId}`;
      else if (role === 'Professeur' && user.id) url += `&professeurId=${user.id}`;
      const res = await api.get<PlanningHebdoResponse>(url);
      if (res?.seances) setSeances(res.seances);
    } catch { /* ignore */ } finally { setIsLoading(false); }
  }, [user]);

  const fetchStarted = useRef(false);
  useEffect(() => { if (!fetchStarted.current) { fetchStarted.current = true; fetchData(); } }, [fetchData]);

  const handleTerminer = async (seance: SeancePlanningDto) => {
    try {
      await api.patch(`/SeanceCours/${seance.id}/terminer`);
      setSeances((prev) => prev.map((s) => s.id === seance.id ? { ...s, estTerminee: true, statut: 'Terminee' } : s));
    } catch { /* ignore */ }
  };

  const filtered = seances
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.matiereNom.toLowerCase().includes(q) || s.professeurNomComplet.toLowerCase().includes(q) || s.salleNom.toLowerCase().includes(q);
      const matchJour = !filterJour || s.jour === filterJour;
      return matchSearch && matchJour;
    })
    .sort((a, b) => {
      const ia = JOURS_ORDER.indexOf(a.jour), ib = JOURS_ORDER.indexOf(b.jour);
      if (ia !== ib) return ia - ib;
      return a.heureDebut.localeCompare(b.heureDebut);
    });

  const totalSeances = seances.length;
  const enCours = seances.filter((s) => !s.estTerminee && s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé').length;
  const terminees = seances.filter((s) => s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé').length;
  const annulees = seances.filter((s) => s.statut === 'Annule' || s.statut === 'Annulé').length;

  const statCard = (label: string, value: number | string, accent: string) => (
    <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '4', borderLeft: '3px solid', borderLeftColor: accent, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
      <div className={css({ color: accent, fontSize: '2xl', fontWeight: 'bold', lineHeight: 'none' })}>{value}</div>
      <div className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium', mt: '1' })}>{label}</div>
    </div>
  );

  return (
    <ProtectedLayout pageTitle="Tableau de bord">
      <div className={css({ display: 'grid', gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: '3', mb: '6' })}>
        {statCard('Total séances', totalSeances, 'accent.default')}
        {statCard('En cours', enCours, '#10b981')}
        {statCard('Terminées', terminees, '#8b5cf6')}
        {statCard('Annulées', annulees, '#ef4444')}
      </div>

      <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '5', flexWrap: 'wrap' })}>
        <div className={css({ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' })}>
          <Search size={14} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', pointerEvents: 'none' })} />
          <Input
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Rechercher matière, prof, salle..."
            className={css({ pl: '9', pr: '8', bg: 'bg.surface', borderColor: 'border.default', color: 'fg.default', _placeholder: { color: 'fg.subtle' }, _focus: { borderColor: 'accent.default' } })}
          />
          {search && (
            <button onClick={() => setSearch('')} className={css({ position: 'absolute', right: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', _hover: { color: 'fg.muted' } })}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className={css({ display: 'flex', gap: '1.5', flexWrap: 'wrap' })}>
          {JOURS_ORDER.map((j) => (
            <button
              key={j}
              onClick={() => setFilterJour(filterJour === j ? '' : j)}
              className={css({
                px: '2.5', py: '1', rounded: 'md', fontSize: 'xs', fontWeight: 'medium',
                bg: filterJour === j ? 'accent.default' : 'bg.surface',
                color: filterJour === j ? 'white' : 'fg.muted',
                border: '1px solid',
                borderColor: filterJour === j ? 'accent.default' : 'border.default',
                _hover: { bg: filterJour === j ? 'accent.emphasized' : 'bg.elevated' },
                transition: 'all 0.15s',
              })}
            >
              {j.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', display: 'flex', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ w: '8', h: '8', border: '3px solid', borderColor: 'colorPalette.default', borderTopColor: 'accent.default', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <CalendarDays size={32} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
          <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune séance</p>
          <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>{seances.length === 0 ? 'Aucune séance planifiée cette semaine.' : 'Aucune séance ne correspond.'}</p>
        </div>
      ) : (
        <div className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
          <div className={css({ overflowX: 'auto' })}>
            <table className={css({ w: 'full', fontSize: 'sm' })}>
              <thead>
                <tr className={css({ bg: 'bg.muted' })}>
                  {['Matière', 'Professeur', 'Salle', 'Jour', 'Horaire', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className={css({ px: '4', py: '2.5', textAlign: 'left', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wider' })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((seance) => {
                  const badge = getStatutBadge(seance.statut, seance.estTerminee);
                  const done = seance.estTerminee || seance.statut === 'Terminee' || seance.statut === 'Terminé';
                  return (
                    <tr key={seance.id} className={css({ borderTop: '1px solid', borderColor: 'border.subtle', _hover: { bg: 'bg.muted' }, transition: 'colors 0.15s', opacity: done ? 0.5 : 1 })}>
                      <td className={css({ px: '4', py: '3' })}>
                        <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{seance.matiereNom}</p>
                        <p className={css({ fontSize: '11px', color: 'fg.subtle', mt: '0.5' })}>{seance.matiereCode}</p>
                      </td>
                      <td className={css({ px: '4', py: '3', color: 'fg.muted', fontSize: 'xs' })}>{seance.professeurNomComplet}</td>
                      <td className={css({ px: '4', py: '3' })}>
                        <span className={css({ display: 'flex', alignItems: 'center', gap: '1', color: 'accent.default', fontSize: 'xs', fontWeight: 'medium' })}>
                          <MapPin size={11} />{seance.salleNom}
                        </span>
                      </td>
                      <td className={css({ px: '4', py: '3', color: 'fg.default', fontSize: 'xs', fontWeight: 'medium' })}>{seance.jour}</td>
                      <td className={css({ px: '4', py: '3', color: 'fg.muted', fontSize: 'xs' })}>{formatHeure(seance.heureDebut)} – {formatHeure(seance.heureFin)}</td>
                      <td className={css({ px: '4', py: '3' })}>
                        <span className={css({ display: 'inline-flex', alignItems: 'center', fontSize: 'xs', fontWeight: 'medium', px: '2', py: '0.5', rounded: 'md', bg: badge.bg, color: badge.color, border: '1px solid', borderColor: badge.border })}>
                          {badge.label}
                        </span>
                      </td>
                      <td className={css({ px: '4', py: '3', textAlign: 'right' })}>
                        {isProf && !done && seance.statut !== 'Annule' && seance.statut !== 'Annulé' && (
                          <button onClick={() => handleTerminer(seance)}
                            className={css({ display: 'inline-flex', alignItems: 'center', gap: '1', px: '2.5', py: '1.5', bg: '#10b981', color: 'white', rounded: 'md', fontSize: 'xs', fontWeight: 'medium', _hover: { bg: '#059669' }, transition: 'colors 0.15s' })}>
                            <CheckCheck size={12} /> Terminée
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
