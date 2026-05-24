'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Calendar as CalendarIcon, Settings, LogOut, Search,
  CheckCircle, AlertCircle, X, CheckCheck, Clock, BookOpen,
  MapPin, User, Filter, ChevronDown, ChevronUp, RefreshCw,
  List, CalendarDays, BadgeCheck, Ban, RotateCcw, Eye, EyeOff,
} from 'lucide-react';
import CalendarWeek from '@/components/CalendarWeek';
import ExceptionModal from '@/components/ExceptionModal';
import NotificationBell from '@/components/NotificationBell';
import { SeancePlanningDto, Notification, Salle, PlanningHebdoResponse } from '@/types';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = 'calendar' | 'list';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function formatHeure(h: string) {
  return h?.slice(0, 5) || '—';
}

function getStatutConfig(statut: string, estTerminee?: boolean) {
  if (estTerminee || statut === 'Terminé' || statut === 'Terminee') {
    return { label: 'Terminée', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', border: '#9CA3AF' };
  }
  switch (statut) {
    case 'Annule':
    case 'Annulé':
      return { label: 'Annulée', color: 'bg-red-100 text-red-600', dot: 'bg-red-500', border: '#EF4444' };
    case 'Reporte':
    case 'Reporté':
      return { label: 'Reportée', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', border: '#F59E0B' };
    default:
      return { label: 'Confirmée', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', border: '#10B981' };
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] border ${
        toast.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {toast.type === 'success'
        ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
        : <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Confirm Modal "Marquer terminée" ─────────────────────────────────────────
function ConfirmTermineeModal({
  seance,
  isLoading,
  onConfirm,
  onCancel,
}: {
  seance: SeancePlanningDto | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {seance && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-emit-border overflow-hidden">
              {/* Accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emit-blue to-emit-orange" />

              <div className="p-6">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 bg-green-50 border-2 border-green-100 rounded-full mx-auto mb-4">
                  <CheckCheck size={26} className="text-green-500" />
                </div>

                <h3 className="text-base font-bold text-emit-text text-center font-poppins mb-1">
                  Marquer comme terminée ?
                </h3>
                <p className="text-sm text-emit-text/55 text-center mb-5">
                  La séance suivante sera marquée comme terminée et ne pourra plus être modifiée.
                </p>

                {/* Séance card */}
                <div className="bg-emit-bg border border-emit-border rounded-lg p-3.5 mb-5 space-y-2">
                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-emit-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emit-blue leading-tight">{seance.matiereNom}</p>
                      <p className="text-xs text-emit-text/50 font-mono">{seance.matiereCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emit-text/60">
                    <User size={12} className="flex-shrink-0" />
                    <span>{seance.professeurNomComplet}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emit-text/60">
                      <CalendarDays size={12} />
                      <span>{seance.jour}</span>
                      <Clock size={11} />
                      <span className="font-semibold text-emit-text">
                        {formatHeure(seance.heureDebut)} — {formatHeure(seance.heureFin)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-emit-orange">
                      <MapPin size={11} />
                      <span className="font-semibold">{seance.salleNom}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 py-2.5 border border-emit-border rounded-md text-sm font-semibold text-emit-text hover:bg-emit-bg transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><CheckCheck size={16} /> Confirmer</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Séance List Row ──────────────────────────────────────────────────────────
function SeanceRow({
  seance,
  index,
  isProf,
  onTerminer,
  onDetail,
}: {
  seance: SeancePlanningDto & { estTerminee?: boolean };
  index: number;
  isProf: boolean;
  onTerminer: (s: SeancePlanningDto) => void;
  onDetail: (s: SeancePlanningDto) => void;
}) {
  const cfg = getStatutConfig(seance.statut, seance.estTerminee);
  const done = seance.estTerminee || seance.statut === 'Terminé' || seance.statut === 'Terminee';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className={`border-b border-emit-border/40 transition-colors group ${
        done ? 'bg-gray-50/70 opacity-60' : 'hover:bg-emit-bg/60'
      }`}
    >
      {/* Matière */}
      <td className="p-3 pl-4">
        <div className={done ? 'line-through text-emit-text/40' : ''}>
          <p className="font-bold text-emit-blue text-sm leading-tight">{seance.matiereNom}</p>
          <p className="text-xs font-mono text-emit-text/40">{seance.matiereCode}</p>
        </div>
      </td>

      {/* Horaire */}
      <td className="p-3">
        <div className="flex items-center gap-1.5 text-sm">
          <CalendarDays size={13} className="text-emit-text/30 flex-shrink-0" />
          <span className={`font-semibold ${done ? 'text-emit-text/40' : 'text-emit-text'}`}>
            {seance.jour}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={11} className="text-emit-text/25" />
          <span className={`text-xs font-mono ${done ? 'text-emit-text/30' : 'text-emit-text/60'}`}>
            {formatHeure(seance.heureDebut)} – {formatHeure(seance.heureFin)}
          </span>
        </div>
      </td>

      {/* Professeur */}
      <td className="p-3">
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-emit-text/30 flex-shrink-0" />
          <span className={`text-sm ${done ? 'text-emit-text/40' : 'text-emit-text/80'}`}>
            {seance.professeurNomComplet}
          </span>
        </div>
      </td>

      {/* Salle */}
      <td className="p-3">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-emit-orange/60 flex-shrink-0" />
          <span className={`text-sm font-semibold ${done ? 'text-emit-text/30' : 'text-emit-orange'}`}>
            {seance.salleNom}
          </span>
        </div>
      </td>

      {/* Statut */}
      <td className="p-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>

      {/* Actions */}
      <td className="p-3 pr-4">
        <div className="flex items-center gap-1.5 justify-end">
          {/* Détail */}
          <button
            onClick={() => onDetail(seance)}
            title="Voir détail / Exception"
            className="p-1.5 text-emit-blue hover:bg-emit-blue/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          >
            <Eye size={14} />
          </button>

          {/* Marquer terminée — visible seulement prof + séance active */}
          {isProf && !done && seance.statut !== 'Annule' && seance.statut !== 'Annulé' && (
            <button
              onClick={() => onTerminer(seance)}
              title="Marquer comme terminée"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 rounded-md text-xs font-bold transition-colors"
            >
              <CheckCheck size={13} /> Terminée
            </button>
          )}

          {done && (
            <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold px-2">
              <BadgeCheck size={13} /> Faite
            </span>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white border border-emit-border rounded-lg p-3">
      <div className={`text-2xl font-poppins font-bold ${color}`}>{value}</div>
      <div className="text-xs text-emit-text/50 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active = false }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full p-2.5 rounded-md transition-all font-poppins text-sm ${
      active ? 'bg-emit-blue text-white shadow-sm' : 'text-emit-text/70 hover:bg-gray-50 hover:text-emit-blue'
    }`}>
      <Icon size={19} />{label}
    </button>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [seances, setSeances] = useState<(SeancePlanningDto & { estTerminee?: boolean })[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, logout } = useAuthStore();

  // View
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Search & filters
  const [search, setSearch] = useState('');
  const [filterJour, setFilterJour] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTerminees, setShowTerminees] = useState(true);
  const [sortField, setSortField] = useState<'jour' | 'heureDebut' | 'matiereNom'>('jour');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Exception modal (existing)
  const [selectedSeance, setSelectedSeance] = useState<SeancePlanningDto | null>(null);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);

  // Marquer terminée
  const [termineeTarget, setTermineeTarget] = useState<SeancePlanningDto | null>(null);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((p) => [...p, { id: ++toastIdRef.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const isProf = user?.roles?.[0] === 'Professeur';

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const sallesRes = await api.get<Salle[]>('/Salles');
      setSalles(sallesRes.data);

      const today = new Date().toISOString().split('T')[0];
      let url = `/Planning/hebdo?startDate=${today}`;
      const role = user.roles?.[0];
      if (role === 'Etudiant' && user.niveauId) url += `&niveauId=${user.niveauId}`;
      else if (role === 'Professeur' && user.id) url += `&professeurId=${user.id}`;

      const res = await api.get<PlanningHebdoResponse>(url);
      if (res.data?.seances) setSeances(res.data.seances);
    } catch {
      addToast('error', 'Impossible de charger le planning.');
    } finally {
      setIsLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Marquer terminée ───────────────────────────────────────────────────────
  const handleTerminer = async () => {
    if (!termineeTarget) return;
    setIsMarkingDone(true);
    try {
      await api.patch(`/SeanceCours/${termineeTarget.id}/terminer`);
      setSeances((prev) =>
        prev.map((s) =>
          s.id === termineeTarget.id
            ? { ...s, estTerminee: true, statut: 'Terminee' }
            : s
        )
      );
      addToast('success', `Séance "${termineeTarget.matiereNom}" marquée comme terminée.`);
      setTermineeTarget(null);
    } catch {
      addToast('error', 'Impossible de marquer cette séance comme terminée.');
    } finally {
      setIsMarkingDone(false);
    }
  };

  // ── Filter + Sort ──────────────────────────────────────────────────────────
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
      const matchStatut = (() => {
        if (!filterStatut) return true;
        if (filterStatut === 'Terminee') return done;
        if (filterStatut === 'Normal') return !done && (s.statut === 'Normal' || s.statut === '');
        return s.statut === filterStatut;
      })();

      return matchSearch && matchJour && matchStatut;
    })
    .sort((a, b) => {
      const va = String(a[sortField] ?? '');
      const vb = String(b[sortField] ?? '');
      // Sort by jour order first if sorting by jour
      if (sortField === 'jour') {
        const ia = JOURS_ORDER.indexOf(a.jour);
        const ib = JOURS_ORDER.indexOf(b.jour);
        const diff = ia - ib;
        if (diff !== 0) return sortDir === 'asc' ? diff : -diff;
        return sortDir === 'asc'
          ? a.heureDebut.localeCompare(b.heureDebut)
          : b.heureDebut.localeCompare(a.heureDebut);
      }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <span className="w-3" />;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSeances = seances.length;
  const totalTerminees = seances.filter((s) => s.estTerminee || s.statut === 'Terminee' || s.statut === 'Terminé').length;
  const totalAnnulees = seances.filter((s) => s.statut === 'Annule' || s.statut === 'Annulé').length;
  const totalConfirmees = totalSeances - totalTerminees - totalAnnulees;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-emit-border hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-poppins font-bold tracking-tight text-emit-blue">G-SALLES</h1>
          <p className="text-[10px] text-emit-text/40 uppercase tracking-widest mt-1">EMIT Fianarantsoa</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={LayoutGrid} label="Dashboard" active />
          <NavItem icon={CalendarIcon} label="Plannings" />
          <NavItem icon={Settings} label="Administration" />
        </nav>
        <div className="p-4 border-t border-emit-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-poppins text-emit-text/70"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-emit-border flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emit-text/40" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher matière, prof, salle, jour..."
                className="w-full pl-9 pr-8 py-2 bg-emit-bg border border-emit-border rounded-lg outline-none focus:ring-2 focus:ring-emit-orange/20 focus:border-emit-orange transition-all text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emit-text/30 hover:text-emit-text"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell notifications={notifications} onMarkAsRead={markAsRead} />
            <div className="flex items-center gap-3 border-l pl-6 border-emit-border">
              <div className="text-right">
                <p className="text-sm font-bold text-emit-blue">{user?.nom} {user?.prenom}</p>
                <p className="text-[10px] text-emit-text/50 uppercase font-semibold">{user?.roles?.[0] || 'Utilisateur'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emit-orange text-white flex items-center justify-center font-bold font-poppins text-sm">
                {user?.nom?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* ── Page title & controls ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-poppins font-bold text-emit-blue">Tableau de bord</h2>
              <p className="text-emit-text/55 mt-1 text-sm">
                Planning hebdomadaire
                {isProf && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold bg-emit-blue/10 text-emit-blue px-2 py-0.5 rounded-full">
                    <BadgeCheck size={11} /> Vue Professeur
                  </span>
                )}
              </p>
            </motion.div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex border border-emit-border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                    viewMode === 'list' ? 'bg-emit-blue text-white' : 'text-emit-text/60 hover:bg-emit-bg'
                  }`}
                >
                  <List size={14} /> Liste
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                    viewMode === 'calendar' ? 'bg-emit-blue text-white' : 'text-emit-text/60 hover:bg-emit-bg'
                  }`}
                >
                  <CalendarDays size={14} /> Calendrier
                </button>
              </div>
              <button
                onClick={fetchData}
                title="Rafraîchir"
                className="p-2 border border-emit-border rounded-md text-emit-text/50 hover:text-emit-blue hover:bg-emit-bg transition-colors"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total séances" value={totalSeances} color="text-emit-blue" />
            <StatCard label="Confirmées" value={totalConfirmees} color="text-green-600" />
            <StatCard label="Terminées" value={totalTerminees} color="text-gray-500" />
            <StatCard label="Annulées" value={totalAnnulees} color="text-red-500" />
          </div>

          {/* ── Calendar view ── */}
          {viewMode === 'calendar' && (
            <div className="relative min-h-[400px]">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Hint for professors in calendar mode */}
                  {isProf && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-emit-blue bg-emit-blue/5 border border-emit-blue/15 rounded-lg px-3 py-2">
                      <AlertCircle size={13} />
                      En vue calendrier, cliquez sur une séance pour voir ses détails. Passez en <strong>vue Liste</strong> pour utiliser le bouton "Marquer terminée".
                    </div>
                  )}
                  <CalendarWeek seances={seances} onSeanceClick={(s) => { setSelectedSeance(s); setIsExceptionOpen(true); }} />
                </>
              )}
            </div>
          )}

          {/* ── List view ── */}
          {viewMode === 'list' && (
            <>
              {/* Search + filter bar */}
              <div className="bg-white border border-emit-border rounded-lg p-3 space-y-3">
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Filters toggle */}
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                      showFilters || filterJour || filterStatut
                        ? 'border-emit-orange bg-emit-orange/5 text-emit-orange'
                        : 'border-emit-border text-emit-text hover:bg-emit-bg'
                    }`}
                  >
                    <Filter size={14} /> Filtres
                    {(filterJour || filterStatut) && <span className="w-1.5 h-1.5 bg-emit-orange rounded-full" />}
                  </button>

                  {/* Toggle terminées */}
                  <button
                    onClick={() => setShowTerminees((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                      showTerminees
                        ? 'border-emit-border text-emit-text/70 hover:bg-emit-bg'
                        : 'border-gray-300 bg-gray-50 text-gray-500'
                    }`}
                  >
                    {showTerminees ? <Eye size={14} /> : <EyeOff size={14} />}
                    {showTerminees ? 'Masquer terminées' : 'Afficher terminées'}
                  </button>

                  <div className="ml-auto text-xs text-emit-text/40">
                    {filtered.length} séance{filtered.length !== 1 ? 's' : ''}
                    {seances.length !== filtered.length && ` sur ${seances.length}`}
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 flex-wrap pt-2 border-t border-emit-border items-center"
                    >
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Jour :</label>
                        <select
                          value={filterJour} onChange={(e) => setFilterJour(e.target.value)}
                          className="border border-emit-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-emit-orange"
                        >
                          <option value="">Tous</option>
                          {JOURS_ORDER.map((j) => <option key={j}>{j}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Statut :</label>
                        <select
                          value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
                          className="border border-emit-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-emit-orange"
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
                          className="text-xs text-emit-orange hover:underline font-medium"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Professor notice */}
              {isProf && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800"
                >
                  <CheckCheck size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Bouton "✓ Terminée" disponible</p>
                    <p className="text-xs text-green-700/70 mt-0.5">
                      Cliquez sur <strong>Terminée</strong> à droite de chaque séance active pour la marquer comme faite.
                      Une séance terminée est barrée et grisée.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-emit-text/40 bg-white border border-emit-border rounded-lg">
                  <CalendarDays size={40} className="mx-auto mb-3 opacity-25" />
                  <p className="font-medium text-sm">
                    {seances.length === 0
                      ? 'Aucune séance planifiée cette semaine.'
                      : 'Aucune séance ne correspond à cette recherche.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-emit-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emit-border bg-emit-bg">
                        {[
                          { key: 'matiereNom', label: 'Matière' },
                          { key: 'jour', label: 'Jour / Horaire' },
                          { key: null, label: 'Professeur' },
                          { key: null, label: 'Salle' },
                          { key: null, label: 'Statut' },
                        ].map(({ key, label }, i) => (
                          <th
                            key={i}
                            onClick={() => key && toggleSort(key as typeof sortField)}
                            className={`p-3 pl-4 text-left font-bold text-emit-blue uppercase tracking-wider text-xs ${
                              key ? 'cursor-pointer select-none hover:text-emit-orange transition-colors' : ''
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {label}
                              {key && <SortIcon field={key as typeof sortField} />}
                            </span>
                          </th>
                        ))}
                        <th className="p-3 pr-4 text-right font-bold text-emit-blue uppercase tracking-wider text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((seance, i) => (
                        <SeanceRow
                          key={seance.id}
                          seance={seance}
                          index={i}
                          isProf={isProf}
                          onTerminer={setTermineeTarget}
                          onDetail={(s) => { setSelectedSeance(s); setIsExceptionOpen(true); }}
                        />
                      ))}
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div className="border-t border-emit-border px-4 py-2.5 flex flex-wrap gap-4 bg-emit-bg/40">
                    {[
                      { label: 'Confirmée', dot: 'bg-green-500' },
                      { label: 'Terminée', dot: 'bg-gray-400' },
                      { label: 'Annulée', dot: 'bg-red-500' },
                      { label: 'Reportée', dot: 'bg-amber-500' },
                    ].map(({ label, dot }) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs text-emit-text/50">
                        <span className={`w-2 h-2 rounded-full ${dot}`} /> {label}
                      </div>
                    ))}
                    {isProf && (
                      <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                        <CheckCheck size={12} /> Cliquez sur "Terminée" pour valider une séance
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Toast stack ── */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
        </AnimatePresence>
      </div>

      {/* ── Exception modal (existing) ── */}
      <ExceptionModal
        isOpen={isExceptionOpen}
        onClose={() => setIsExceptionOpen(false)}
        seance={selectedSeance}
        salles={salles}
      />

      {/* ── Confirm Terminer modal ── */}
      <ConfirmTermineeModal
        seance={termineeTarget}
        isLoading={isMarkingDone}
        onConfirm={handleTerminer}
        onCancel={() => setTermineeTarget(null)}
      />
    </div>
  );
}
