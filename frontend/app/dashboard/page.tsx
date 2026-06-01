'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle, AlertCircle, X, CheckCheck, BookOpen,
  MapPin, Filter, RefreshCw, List, CalendarDays, Eye, EyeOff,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import CalendarWeek from '@/components/CalendarWeek';
import ExceptionModal from '@/components/ExceptionModal';
import { SeancePlanningDto, Notification, Salle, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';

type ViewMode = 'calendar' | 'list';
interface Toast { id: number; type: 'success' | 'error'; message: string }

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

function getStatutConfig(statut: string, estTerminee?: boolean) {
  if (estTerminee || statut === 'Terminé' || statut === 'Terminee')
    return { label: 'Terminée', bgClass: 'bg-slate-100 text-slate-600 rounded-lg px-2.5 py-1', dot: 'bg-slate-400' };
  switch (statut) {
    case 'Annule': case 'Annulé':
      return { label: 'Annulée', bgClass: 'bg-red-50 text-red-700 rounded-lg px-2.5 py-1', dot: 'bg-red-500' };
    case 'Reporte': case 'Reporté':
      return { label: 'Reportée', bgClass: 'bg-amber-50 text-amber-700 rounded-lg px-2.5 py-1', dot: 'bg-amber-500' };
    default:
      return { label: 'Confirmée', bgClass: 'bg-blue-50 text-blue-700 rounded-lg px-2.5 py-1', dot: 'bg-[#0052FF]' };
  }
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold min-w-[280px] rounded-xl shadow-lg ${
        toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {toast.type === 'success'
        ? <CheckCircle size={16} className="shrink-0" />
        : <AlertCircle size={16} className="shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function ConfirmTermineeModal({
  seance, isLoading, onConfirm, onCancel,
}: { seance: SeancePlanningDto | null; isLoading: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {seance && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-sm p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCheck size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 text-center mb-1">
                Marquer comme terminée ?
              </h3>
              <p className="text-sm text-blue-400 text-center mb-5">
                La séance sera marquée comme terminée.
              </p>
              <div className="bg-blue-50 rounded-xl p-3.5 mb-5">
                <p className="text-sm font-bold text-[#0052FF]">{seance.matiereNom}</p>
                <p className="text-xs text-blue-400 mt-1">
                  {seance.jour} · {formatHeure(seance.heureDebut)} — {formatHeure(seance.heureFin)} · {seance.salleNom}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 py-3 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl shadow-sm text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCheck size={14} /> Confirmer</>}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, color, accent }: { label: string; value: number | string; color: string; accent: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-blue-100 shadow-sm p-5 ${accent}`}>
      <div className={`text-3xl font-bold ${color} leading-none`}>{value}</div>
      <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [seances, setSeances] = useState<(SeancePlanningDto & { estTerminee?: boolean })[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [filterJour, setFilterJour] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTerminees, setShowTerminees] = useState(true);
  const [sortField, setSortField] = useState<'jour' | 'heureDebut' | 'matiereNom'>('jour');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedSeance, setSelectedSeance] = useState<SeancePlanningDto | null>(null);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [termineeTarget, setTermineeTarget] = useState<SeancePlanningDto | null>(null);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((p) => [...p, { id: ++toastIdRef.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);
  const isProf = user?.role === 'Professeur' || user?.roles?.[0] === 'Professeur';

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const sallesRes = await api.get<Record<string, unknown>[]>('/Salles');
      const mappedSalles = sallesRes.map((s) => ({
        id: s.id, nom: s.nom || s.libelle || '', libelle: s.libelle || s.nom || '',
        capacite: s.capacite, type: s.type || '', estDisponible: s.estDisponible ?? s.estActive ?? true,
      }));
      setSalles(mappedSalles as Salle[]);
      const today = new Date().toISOString().split('T')[0];
      let url = `/Planning/hebdo?startDate=${today}`;
      const role = user.role || user.roles?.[0];
      if (role === 'Etudiant' && user.niveauId) url += `&niveauId=${user.niveauId}`;
      else if (role === 'Professeur' && user.id) url += `&professeurId=${user.id}`;
      const res = await api.get<PlanningHebdoResponse>(url);
      if (res?.seances) setSeances(res.seances);
      if (user.id) {
        try {
          const notifRes = await api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=50`);
          if (notifRes) setNotifications(notifRes);
        } catch {}
      }
    } catch { addToast('error', 'Impossible de charger le planning.'); }
    finally { setIsLoading(false); }
  }, [user, addToast]);

  const fetchStarted = useRef(false);
  useEffect(() => {
    if (!fetchStarted.current) { fetchStarted.current = true; fetchData(); }
  }, [fetchData]);

  const handleTerminer = async () => {
    if (!termineeTarget) return;
    setIsMarkingDone(true);
    try {
      await api.patch(`/SeanceCours/${termineeTarget.id}/terminer`);
      setSeances((prev) =>
        prev.map((s) => s.id === termineeTarget.id ? { ...s, estTerminee: true, statut: 'Terminee' } : s)
      );
      addToast('success', `Séance "${termineeTarget.matiereNom}" marquée comme terminée.`);
      setTermineeTarget(null);
    } catch { addToast('error', 'Impossible de marquer cette séance.'); }
    finally { setIsMarkingDone(false); }
  };

  const filtered = seances
    .filter((s) => {
      const done = s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé';
      if (!showTerminees && done) return false;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.matiereNom.toLowerCase().includes(q) ||
        s.matiereCode.toLowerCase().includes(q) ||
        s.professeurNomComplet.toLowerCase().includes(q) ||
        s.salleNom.toLowerCase().includes(q) ||
        s.jour.toLowerCase().includes(q);
      const matchJour = !filterJour || s.jour === filterJour;
      const matchStatut =
        !filterStatut ||
        (filterStatut === 'Terminee' ? done : filterStatut === 'Normal' ? !done && (s.statut === 'Normal' || s.statut === '') : s.statut === filterStatut);
      return matchSearch && matchJour && matchStatut;
    })
    .sort((a, b) => {
      if (sortField === 'jour') {
        const ia = JOURS_ORDER.indexOf(a.jour), ib = JOURS_ORDER.indexOf(b.jour);
        const diff = ia - ib;
        if (diff !== 0) return sortDir === 'asc' ? diff : -diff;
        return sortDir === 'asc' ? a.heureDebut.localeCompare(b.heureDebut) : b.heureDebut.localeCompare(a.heureDebut);
      }
      const va = String(a[sortField] ?? ''), vb = String(b[sortField] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const totalSeances = seances.length;
  const totalTerminees = seances.filter((s) => s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé').length;
  const totalAnnulees = seances.filter((s) => s.statut === 'Annule' || s.statut === 'Annulé').length;
  const totalConfirmees = totalSeances - totalTerminees - totalAnnulees;

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('asc'); } }}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ${sortField === field ? 'text-[#0052FF]' : 'text-blue-500 hover:text-blue-700'}`}
    >
      {label}
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null}
    </button>
  );

  return (
    <ProtectedLayout pageTitle="Tableau de bord">
      {/* Search + view toggle */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher matière, prof, salle..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-900 placeholder:text-blue-300 focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-blue-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors duration-150 ${viewMode === 'list' ? 'bg-[#0052FF] text-white' : 'text-blue-500 hover:bg-blue-50'}`}
            >
              <List size={13} /> Liste
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors duration-150 border-l border-blue-200 ${viewMode === 'calendar' ? 'bg-[#0052FF] text-white' : 'text-blue-500 hover:bg-blue-50'}`}
            >
              <CalendarDays size={13} /> Calendrier
            </button>
          </div>
          <button
            onClick={fetchData}
            title="Rafraîchir"
            className="w-9 h-9 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total séances" value={totalSeances} color="text-[#0052FF]" accent="border-l-[#0052FF] border-l-4" />
        <StatCard label="Confirmées" value={totalConfirmees} color="text-emerald-600" accent="border-l-emerald-500 border-l-4" />
        <StatCard label="Terminées" value={totalTerminees} color="text-slate-600" accent="border-l-slate-400 border-l-4" />
        <StatCard label="Annulées" value={totalAnnulees} color="text-red-600" accent="border-l-red-500 border-l-4" />
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 rounded-2xl">
              <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CalendarWeek
              seances={seances}
              onSeanceClick={(s) => { setSelectedSeance(s); setIsExceptionOpen(true); }}
            />
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <>
          {/* Filters bar */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  showFilters || filterJour || filterStatut
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'bg-white text-blue-500 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Filter size={13} /> Filtres
                {(filterJour || filterStatut) && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
              </button>
              <button
                onClick={() => setShowTerminees((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 text-sm font-semibold transition-all duration-150"
              >
                {showTerminees ? <EyeOff size={13} /> : <Eye size={13} />}
                {showTerminees ? 'Masquer terminées' : 'Afficher terminées'}
              </button>
              <div className="ml-auto text-xs font-semibold text-blue-400">
                {filtered.length} séance{filtered.length !== 1 ? 's' : ''}
                {seances.length !== filtered.length && ` / ${seances.length}`}
              </div>
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 flex-wrap pt-3 border-t border-blue-100 items-center mt-3"
                >
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-blue-500">Jour :</label>
                    <select
                      value={filterJour}
                      onChange={(e) => setFilterJour(e.target.value)}
                      className="border border-blue-200 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-900 bg-white focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                    >
                      <option value="">Tous</option>
                      {JOURS_ORDER.map((j) => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-blue-500">Statut :</label>
                    <select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="border border-blue-200 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-900 bg-white focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                    >
                      <option value="">Tous</option>
                      <option value="Normal">Confirmées</option>
                      <option value="Terminee">Terminées</option>
                      <option value="Annule">Annulées</option>
                      <option value="Reporte">Reportées</option>
                    </select>
                  </div>
                  {(filterJour || filterStatut) && (
                    <button
                      onClick={() => { setFilterJour(''); setFilterStatut(''); }}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-blue-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-blue-100 shadow-sm text-center">
              <CalendarDays size={36} className="text-blue-300 mb-3" />
              <p className="text-lg font-bold text-blue-900">Aucune séance</p>
              <p className="text-sm text-blue-400 mt-1">
                {seances.length === 0 ? 'Aucune séance planifiée cette semaine.' : 'Aucune séance ne correspond.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left"><SortBtn field="matiereNom" label="Matière" /></th>
                    <th className="px-4 py-3 text-left"><SortBtn field="jour" label="Jour / Horaire" /></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wider">Professeur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wider">Salle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {filtered.map((seance) => {
                    const cfg = getStatutConfig(seance.statut, seance.estTerminee);
                    const done = seance.estTerminee || seance.statut === 'Terminé' || seance.statut === 'Terminee';
                    return (
                      <tr
                        key={seance.id}
                        className={`hover:bg-blue-50/50 transition-colors duration-150 ${done ? 'opacity-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-blue-900">{seance.matiereNom}</p>
                          <p className="text-[11px] text-blue-400 mt-0.5">{seance.matiereCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-blue-900">{seance.jour}</p>
                          <p className="text-xs text-blue-400">{formatHeure(seance.heureDebut)} – {formatHeure(seance.heureFin)}</p>
                        </td>
                        <td className="px-4 py-3 text-blue-400 text-xs">{seance.professeurNomComplet}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-[#0052FF] text-xs font-semibold">
                            <MapPin size={11} />
                            {seance.salleNom}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs font-semibold ${cfg.bgClass}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => { setSelectedSeance(seance); setIsExceptionOpen(true); }}
                            className="p-1.5 rounded-lg border border-blue-200 text-blue-400 hover:text-[#0052FF] hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          {isProf && !done && seance.statut !== 'Annule' && seance.statut !== 'Annulé' && (
                            <button
                              onClick={() => setTermineeTarget(seance)}
                              className="ml-1.5 inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                            >
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
          )}
        </>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
        </AnimatePresence>
      </div>

      <ExceptionModal
        isOpen={isExceptionOpen}
        onClose={() => setIsExceptionOpen(false)}
        seance={selectedSeance}
        salles={salles}
      />
      <ConfirmTermineeModal
        seance={termineeTarget}
        isLoading={isMarkingDone}
        onConfirm={handleTerminer}
        onCancel={() => setTermineeTarget(null)}
      />
    </ProtectedLayout>
  );
}
