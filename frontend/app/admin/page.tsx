'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, MapPin, AlertTriangle, CalendarPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import StatusBadge from '@/components/global/StatusBadge';
import StatCard from '@/components/global/StatCard';
import ConflictBanner, { ConflictInfo } from '@/components/global/ConflictBanner';
import AvailabilityCheck from '@/components/global/AvailabilityCheck';
import { SeancePlanningDto, PlanningHebdoResponse, Parcours, Niveau, Matiere, Salle, Creneau, GenerationSeancePayload } from '@/types';
import { api } from '@/services/api';
import { parcoursService } from '@/services/parcours';
import { niveauService } from '@/services/niveaux';
import { matiereService } from '@/services/matieres';
import { utilisateurService } from '@/services/utilisateurs';
import { salleService } from '@/services/salles';
import { creneauService } from '@/services/creneaux';
import { generateurService } from '@/services/generateur';

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

interface FilterValues {
  filiereId: string;
  parcoursId: string;
  niveauId: string;
  salleId: string;
  professeurId: string;
}

interface GenerateurFormValues {
  parcoursId: number;
  niveauId: number;
  matiereId: number;
  profId: number;
  salleId: number;
  creneauId: number;
  dateDebut: string;
  dateFin: string;
}

export default function AdminDashboardPage() {
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterValues>({ filiereId: '', parcoursId: '', niveauId: '', salleId: '', professeurId: '' });

  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [niveauxList, setNiveauxList] = useState<Niveau[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);

  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, reset: resetForm } = useForm<GenerateurFormValues>();
  const selectedParcoursId = watch('parcoursId');

  useEffect(() => {
    Promise.all([
      parcoursService.getAll(),
      matiereService.getAll(),
      utilisateurService.getEnseignants(),
      salleService.getAll(),
      creneauService.getAll(),
    ]).then(([parcours, mat, profs, sallesList, creneauxList]) => {
      setParcoursList(parcours);
      setMatieres(mat);
      setEnseignants(profs);
      setSalles(sallesList);
      setCreneaux(creneauxList);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedParcoursId) {
      niveauService.getAll().then((allNiveaux) => {
        const filtered = allNiveaux.filter((n) => n.parcoursId === Number(selectedParcoursId));
        setNiveauxList(filtered);
        setValue('niveauId', filtered.length ? filtered[0].id : 0);
      });
    } else {
      setNiveauxList([]);
    }
  }, [selectedParcoursId, setValue]);

  const fetchSeances = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${today}`);
      if (res?.seances) setSeances(res.seances);
    } catch { /* ignore */ } finally { setIsLoading(false); }
  }, []);

  const fetchStarted = useRef(false);
  useEffect(() => { if (!fetchStarted.current) { fetchStarted.current = true; fetchSeances(); } }, [fetchSeances]);

  const watchedSalleId = watch('salleId');
  const watchedCreneauId = watch('creneauId');

  const onGenerateSubmit = async (data: GenerateurFormValues) => {
    setGenLoading(true);
    setResultMsg(null);
    try {
      const payload: GenerationSeancePayload = {
        parcoursId: data.parcoursId, niveauId: data.niveauId,
        matiereId: data.matiereId, profId: data.profId,
        salleId: data.salleId, creneauId: data.creneauId,
        dateDebut: data.dateDebut, dateFin: data.dateFin,
      };
      const result = await generateurService.generer(payload);
      setResultMsg({ type: 'success', text: `${result.length} séance(s) générée(s).` });
      resetForm();
      fetchSeances();
    } catch (err: unknown) {
      setResultMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally { setGenLoading(false); }
  };

  const filtered = seances.filter((s) => {
    const q = search.toLowerCase();
    if (q && !s.matiereNom.toLowerCase().includes(q) && !s.professeurNomComplet.toLowerCase().includes(q) && !s.salleNom.toLowerCase().includes(q)) return false;
    if (filters.salleId && s.salleNom !== filters.salleId) return false;
    if (filters.professeurId && s.professeurId !== Number(filters.professeurId)) return false;
    return true;
  }).sort((a, b) => {
    const ia = JOURS_ORDER.indexOf(a.jour), ib = JOURS_ORDER.indexOf(b.jour);
    if (ia !== ib) return ia - ib;
    return a.heureDebut.localeCompare(b.heureDebut);
  });

  const conflicts: ConflictInfo[] = [];
  const seen = new Map<string, number[]>();
  seances.forEach((s) => {
    const key = `${s.salleNom}|${s.jour}|${s.heureDebut}`;
    if (seen.has(key)) { seen.get(key)!.push(s.id); } else { seen.set(key, [s.id]); }
  });
  seen.forEach((ids, key) => {
    if (ids.length > 1) {
      const seance = seances.find((s) => s.id === ids[0]);
      if (seance) {
        const [salleNom, jour, heure] = key.split('|');
        conflicts.push({
          seanceId: seance.id, matiereNom: seance.matiereNom,
          salleNom, jour, creneauHoraire: `${heure?.slice(0, 5)}`,
          conflitAvec: seance.professeurNomComplet,
        });
      }
    }
  });

  const total = seances.length;
  const enCours = seances.filter((s) => s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé').length;
  const terminees = seances.filter((s) => s.statut === 'Terminee' || s.statut === 'Terminé').length;
  const conflits = conflicts.length;

  const selectCls = 'w-full border border-border rounded-lg px-3 py-2 text-sm text-fg-default bg-surface outline-none focus:border-accent';
  const labelCls = 'block text-sm font-medium text-fg-muted mb-1';
  const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm text-fg-default bg-surface outline-none focus:border-accent';

  return (
    <ProtectedLayout pageTitle="Gestion des séances">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Séances totales" value={total} />
            <StatCard label="En cours" value={enCours} variant="success" />
            <StatCard label="Terminées" value={terminees} variant="warning" />
            <StatCard label="Conflits" value={conflits} variant={conflits > 0 ? 'danger' : 'default'} icon={AlertTriangle} />
          </div>

          <ConflictBanner conflicts={conflicts} />

          <div className="bg-surface border border-neutral-200 rounded-[8px] p-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher matière, professeur..."
                  className={inputCls} style={{ paddingLeft: '2.25rem' }} />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-muted">
                    <X size={13} />
                  </button>
                )}
              </div>
              <select value={filters.salleId} onChange={(e) => setFilters((f) => ({ ...f, salleId: e.target.value }))} className="w-auto min-w-32 border border-border rounded-lg px-3 py-2 text-sm text-fg-default bg-surface outline-none focus:border-accent">
                <option value="">Toutes les salles</option>
                {salles.map((s) => <option key={s.id} value={s.nom}>{s.nom}</option>)}
              </select>
              <select value={filters.professeurId} onChange={(e) => setFilters((f) => ({ ...f, professeurId: e.target.value }))} className="w-auto min-w-36 border border-border rounded-lg px-3 py-2 text-sm text-fg-default bg-surface outline-none focus:border-accent">
                <option value="">Tous les professeurs</option>
                {enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </div>

            {isLoading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-border border-t-accent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarPlus size={28} className="text-fg-subtle mx-auto mb-3" />
                <p className="text-fg-default font-semibold mb-1">Aucune séance</p>
                <p className="text-fg-muted text-sm">Aucune séance planifiée cette semaine.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F7FA]">
                      {['Matière', 'Professeur', 'Salle', 'Créneau', 'Statut'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((seance) => {
                      const isConflict = conflicts.some((c) => c.seanceId === seance.id);
                      return (
                        <tr key={seance.id}
                          className={`border-t border-neutral-200 ${
                            isConflict ? 'bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.1)]' : 'hover:bg-[#F7F7FA]'
                          }`}>
                          <td className="px-4 py-3 font-medium text-[13px] text-[#111827]">
                            {seance.matiereNom}
                          </td>
                          <td className="px-4 py-3 text-[#555A6E] text-[12px]">
                            {seance.professeurNomComplet}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-[#5A55F2] text-[12px] font-medium">
                              <MapPin size={11} />{seance.salleNom}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#111827] text-[12px] font-medium">
                            {seance.jour}<br />
                            <span className="text-[#555A6E] font-normal">
                              {formatHeure(seance.heureDebut)} – {formatHeure(seance.heureFin)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={isConflict ? 'conflit' : seance.statut === 'Normal' ? 'actif' : seance.statut} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 sticky top-6">
          <div className="bg-surface border border-neutral-200 rounded-[8px] p-5">
            <h2 className="text-base font-semibold text-fg-default mb-4">
              Générer une séance
            </h2>
            <form onSubmit={handleSubmit(onGenerateSubmit)} className="space-y-3.5">
              <div>
                <label className={labelCls}>Parcours</label>
                <select {...register('parcoursId', { required: true })} className={selectCls}>
                  <option value="">Sélectionner</option>
                  {parcoursList.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Niveau</label>
                <select {...register('niveauId', { required: true })} className={selectCls} disabled={!selectedParcoursId}>
                  {niveauxList.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Matière</label>
                <select {...register('matiereId', { required: true })} className={selectCls}>
                  <option value="">Choisir</option>
                  {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Professeur</label>
                <select {...register('profId', { required: true })} className={selectCls}>
                  <option value="">Choisir</option>
                  {enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Salle</label>
                <select {...register('salleId', { required: true })} className={selectCls}>
                  <option value="">Choisir</option>
                  {salles.map((s) => <option key={s.id} value={s.id}>{s.nom} ({s.type})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Créneau</label>
                <select {...register('creneauId', { required: true })} className={selectCls}>
                  <option value="">Choisir</option>
                  {creneaux.map((c) => <option key={c.id} value={c.id}>{c.jour} {c.heureDebut.slice(0, 5)}</option>)}
                </select>
                {(watchedSalleId && watchedCreneauId) ? (
                  <AvailabilityCheck salleId={Number(watchedSalleId)} creneauId={Number(watchedCreneauId)} />
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Début</label>
                  <input type="date" {...register('dateDebut', { required: true })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fin</label>
                  <input type="date" {...register('dateFin', { required: true })} className={inputCls} />
                </div>
              </div>

              {resultMsg && (
                <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                  resultMsg.type === 'success'
                    ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.2)]'
                    : 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.2)]'
                }`}>
                  {resultMsg.text}
                </div>
              )}

              <button type="submit" disabled={genLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-white border-none hover:opacity-90 disabled:opacity-50 transition-all duration-150">
                {genLoading ? 'Génération...' : 'Créer la séance'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
