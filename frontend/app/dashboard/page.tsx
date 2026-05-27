'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, X, CheckCheck, Clock, BookOpen, MapPin, User, Filter, ChevronDown, ChevronUp, RefreshCw, List, CalendarDays, BadgeCheck, Eye, EyeOff } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import CalendarWeek from '@/components/CalendarWeek';
import ExceptionModal from '@/components/ExceptionModal';
import NotificationBell from '@/components/NotificationBell';
import { SeancePlanningDto, Notification, Salle, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';

type ViewMode = 'calendar' | 'list';
interface Toast { id: number; type: 'success' | 'error'; message: string; }

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

function getStatutConfig(statut: string, estTerminee?: boolean) {
  if (estTerminee || statut === 'Terminé' || statut === 'Terminee') return { label: 'Terminée', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', border: '#9CA3AF' };
  switch (statut) {
    case 'Annule': case 'Annulé': return { label: 'Annulée', color: 'bg-red-100 text-red-600', dot: 'bg-red-500', border: '#EF4444' };
    case 'Reporte': case 'Reporté': return { label: 'Reportée', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', border: '#F59E0B' };
    default: return { label: 'Confirmée', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', border: '#10B981' };
  }
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => { const t = setTimeout(() => onRemove(toast.id), 4500); return () => clearTimeout(t); }, [toast.id, onRemove]);
  return (
    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {toast.type === 'success' ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> : <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

function ConfirmTermineeModal({ seance, isLoading, onConfirm, onCancel }: { seance: SeancePlanningDto | null; isLoading: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {seance && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onCancel} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-[#E9ECEF] overflow-hidden p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-green-50 border-2 border-green-100 rounded-full mx-auto mb-4">
                <CheckCheck size={26} className="text-green-500" />
              </div>
              <h3 className="text-base font-bold text-[#212529] text-center mb-1">Marquer comme terminée ?</h3>
              <p className="text-sm text-[#6C757D] text-center mb-5">La séance sera marquée comme terminée.</p>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-3.5 mb-5 space-y-2">
                <p className="text-sm font-bold text-[#1B3A6B]">{seance.matiereNom}</p>
                <p className="text-xs text-[#6C757D]">{seance.jour} {formatHeure(seance.heureDebut)} — {formatHeure(seance.heureFin)} · {seance.salleNom}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 border border-[#E9ECEF] rounded-lg text-sm font-semibold text-[#6C757D] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50">Annuler</button>
                <button onClick={onConfirm} disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCheck size={16} /> Confirmer</>}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[#6C757D] mt-0.5">{label}</div>
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
  const addToast = useCallback((type: Toast['type'], message: string) => { setToasts(p => [...p, { id: ++toastIdRef.current, type, message }]); }, []);
  const removeToast = useCallback((id: number) => { setToasts(p => p.filter(t => t.id !== id)); }, []);
  const isProf = user?.role === 'Professeur' || user?.roles?.[0] === 'Professeur';

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const sallesRes = await api.get<Record<string, unknown>[]>('/Salles');
      const mappedSalles = sallesRes.map(s => ({ id: s.id, nom: s.nom || s.libelle || '', libelle: s.libelle || s.nom || '', capacite: s.capacite, type: s.type || '', estDisponible: s.estDisponible ?? s.estActive ?? true }));
      setSalles(mappedSalles as Salle[]);
      const today = new Date().toISOString().split('T')[0];
      let url = `/Planning/hebdo?startDate=${today}`;
      const role = user.role || user.roles?.[0];
      if (role === 'Etudiant' && user.niveauId) url += `&niveauId=${user.niveauId}`;
      else if (role === 'Professeur' && user.id) url += `&professeurId=${user.id}`;
      const res = await api.get<PlanningHebdoResponse>(url);
      if (res?.seances) setSeances(res.seances);
      if (user.id) { try { const notifRes = await api.get<Notification[]>(`/Notification/utilisateur/${user.id}?page=1&pageSize=50`); if (notifRes) setNotifications(notifRes); } catch {} }
    } catch { addToast('error', 'Impossible de charger le planning.'); }
    finally { setIsLoading(false); }
  }, [user, addToast]);

  const fetchStarted = useRef(false);
  useEffect(() => { if (!fetchStarted.current) { fetchStarted.current = true; fetchData(); } }, [fetchData]);

  const handleTerminer = async () => {
    if (!termineeTarget) return;
    setIsMarkingDone(true);
    try {
      await api.patch(`/SeanceCours/${termineeTarget.id}/terminer`);
      setSeances(prev => prev.map(s => s.id === termineeTarget.id ? { ...s, estTerminee: true, statut: 'Terminee' } : s));
      addToast('success', `Séance "${termineeTarget.matiereNom}" marquée comme terminée.`);
      setTermineeTarget(null);
    } catch { addToast('error', 'Impossible de marquer cette séance comme terminée.'); }
    finally { setIsMarkingDone(false); }
  };

  const filtered = seances.filter(s => {
    const done = s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé';
    if (!showTerminees && done) return false;
    const q = search.toLowerCase();
    const matchSearch = !q || s.matiereNom.toLowerCase().includes(q) || s.matiereCode.toLowerCase().includes(q) || s.professeurNomComplet.toLowerCase().includes(q) || s.salleNom.toLowerCase().includes(q) || s.jour.toLowerCase().includes(q);
    const matchJour = !filterJour || s.jour === filterJour;
    const matchStatut = !filterStatut || (filterStatut === 'Terminee' ? done : (filterStatut === 'Normal' ? !done && (s.statut === 'Normal' || s.statut === '') : s.statut === filterStatut));
    return matchSearch && matchJour && matchStatut;
  }).sort((a, b) => {
    if (sortField === 'jour') { const ia = JOURS_ORDER.indexOf(a.jour), ib = JOURS_ORDER.indexOf(b.jour); const diff = ia - ib; if (diff !== 0) return sortDir === 'asc' ? diff : -diff; return sortDir === 'asc' ? a.heureDebut.localeCompare(b.heureDebut) : b.heureDebut.localeCompare(a.heureDebut); }
    const va = String(a[sortField] ?? ''), vb = String(b[sortField] ?? '');
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const totalSeances = seances.length;
  const totalTerminees = seances.filter(s => s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé').length;
  const totalAnnulees = seances.filter(s => s.statut === 'Annule' || s.statut === 'Annulé').length;
  const totalConfirmees = totalSeances - totalTerminees - totalAnnulees;

  return (
    <ProtectedLayout pageTitle="Tableau de bord">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher matière, prof, salle..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#212529]"><X size={13} /></button>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#E9ECEF] rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'list' ? 'bg-[#1B3A6B] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'}`}><List size={14} /> Liste</button>
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'calendar' ? 'bg-[#1B3A6B] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'}`}><CalendarDays size={14} /> Calendrier</button>
          </div>
          <button onClick={fetchData} title="Rafraîchir" className="p-2 border border-[#E9ECEF] rounded-lg text-[#ADB5BD] hover:text-[#1B3A6B] hover:bg-[#F8F9FA] transition-colors"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total séances" value={totalSeances} color="text-[#1B3A6B]" />
        <StatCard label="Confirmées" value={totalConfirmees} color="text-[#2E7D32]" />
        <StatCard label="Terminées" value={totalTerminees} color="text-[#6C757D]" />
        <StatCard label="Annulées" value={totalAnnulees} color="text-[#C62828]" />
      </div>

      {viewMode === 'calendar' && (
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CalendarWeek seances={seances} onSeanceClick={s => { setSelectedSeance(s); setIsExceptionOpen(true); }} />
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-3 mb-4">
            <div className="flex gap-2 flex-wrap items-center">
              <button onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters || filterJour || filterStatut ? 'border-[#1B3A6B] bg-[#E8EEF8] text-[#1B3A6B]' : 'border-[#E9ECEF] text-[#6C757D] hover:bg-[#F8F9FA]'}`}>
                <Filter size={14} /> Filtres {(filterJour || filterStatut) && <span className="w-1.5 h-1.5 bg-[#1B3A6B] rounded-full" />}
              </button>
              <button onClick={() => setShowTerminees(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showTerminees ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                {showTerminees ? <Eye size={14} /> : <EyeOff size={14} />} {showTerminees ? 'Masquer terminées' : 'Afficher terminées'}
              </button>
              <div className="ml-auto text-xs text-[#ADB5BD]">{filtered.length} séance{filtered.length !== 1 ? 's' : ''}{seances.length !== filtered.length && ` sur ${seances.length}`}</div>
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-3 flex-wrap pt-2 border-t border-[#E9ECEF] items-center mt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">Jour :</label>
                    <select value={filterJour} onChange={e => setFilterJour(e.target.value)} className="border border-[#E9ECEF] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#1B3A6B]">
                      <option value="">Tous</option>
                      {JOURS_ORDER.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">Statut :</label>
                    <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="border border-[#E9ECEF] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#1B3A6B]">
                      <option value="">Tous</option>
                      <option value="Normal">Confirmées</option>
                      <option value="Terminee">Terminées</option>
                      <option value="Annule">Annulées</option>
                      <option value="Reporte">Reportées</option>
                    </select>
                  </div>
                  {(filterJour || filterStatut) && <button onClick={() => { setFilterJour(''); setFilterStatut(''); }} className="text-xs text-[#1B3A6B] hover:underline font-medium">Réinitialiser</button>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[#ADB5BD] bg-white rounded-xl border border-[#E9ECEF] shadow-sm">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-25" />
              <p className="font-medium text-sm">{seances.length === 0 ? 'Aucune séance planifiée cette semaine.' : 'Aucune séance ne correspond à cette recherche.'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Matière</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Jour / Horaire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Professeur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Salle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5]">
                  {filtered.map((seance, i) => {
                    const cfg = getStatutConfig(seance.statut, seance.estTerminee);
                    const done = seance.estTerminee || seance.statut === 'Terminé' || seance.statut === 'Terminee';
                    return (
                      <tr key={seance.id} className={`hover:bg-[#F8F9FA] transition-colors ${done ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3"><p className="font-medium text-[#212529]">{seance.matiereNom}</p><p className="text-xs text-[#ADB5BD] font-mono">{seance.matiereCode}</p></td>
                        <td className="px-4 py-3"><p className="font-medium text-[#212529]">{seance.jour}</p><p className="text-xs text-[#6C757D]">{formatHeure(seance.heureDebut)} – {formatHeure(seance.heureFin)}</p></td>
                        <td className="px-4 py-3 text-[#6C757D]">{seance.professeurNomComplet}</td>
                        <td className="px-4 py-3 font-medium text-[#1B3A6B]">{seance.salleNom}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}</span></td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setSelectedSeance(seance); setIsExceptionOpen(true); }} className="p-1.5 text-[#1B3A6B] hover:bg-[#E8EEF8] rounded-lg transition-colors"><Eye size={14} /></button>
                          {isProf && !done && seance.statut !== 'Annule' && seance.statut !== 'Annulé' && (
                            <button onClick={() => setTermineeTarget(seance)} className="ml-1 px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"><CheckCheck size={13} /> Terminée</button>
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

      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>{toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}</AnimatePresence>
      </div>

      <ExceptionModal isOpen={isExceptionOpen} onClose={() => setIsExceptionOpen(false)} seance={selectedSeance} salles={salles} />
      <ConfirmTermineeModal seance={termineeTarget} isLoading={isMarkingDone} onConfirm={handleTerminer} onCancel={() => setTermineeTarget(null)} />
    </ProtectedLayout>
  );
}
