'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, CheckCircle, AlertCircle,
  Upload, Download, FileSpreadsheet, FileText, Building2,
  Users, ChevronDown, ChevronUp, Filter, RefreshCw,
  Eye, EyeOff, ToggleLeft, ToggleRight, Calendar, BookMarked, FileDown,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { FiliereDto, Parcours, Niveau, ReservationReadDto } from '@/types';

interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
  type?: string;
}

interface SalleForm {
  codeSalle: string;
  libelle: string;
  capacite: string;
  equipements: string;
  estActive: boolean;
  type: string;
}

interface FormErrors {
  codeSalle?: string;
  libelle?: string;
  capacite?: string;
  type?: string;
}

interface ReservationForm {
  titre: string;
  type: string;
  datePrecise: string;
  session: string;
  filiereId: string;
  parcoursId: string;
  niveauId: string;
  heureDebut: string;
}

const TYPES_SALLE = ['Amphithéâtre', 'Laboratoire', 'Salle de cours', 'Salle informatique', 'Salle de TP', 'Autre'];
const TYPES_RESERVATION = ['Cours', 'TD', 'TP', 'Examen', 'Réunion', 'Soutenance', 'Autre'];
const SESSIONS = ['Matin', 'Après-midi'];

const EMPTY_RESERVATION: ReservationForm = {
  titre: '', type: '', datePrecise: '', session: '',
  filiereId: '', parcoursId: '', niveauId: '', heureDebut: '',
};

const EMPTY_FORM: SalleForm = {
  codeSalle: '', libelle: '', capacite: '', equipements: '', estActive: true, type: '',
};

function validateForm(form: SalleForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.codeSalle.trim()) errors.codeSalle = 'Le code est requis.';
  else if (form.codeSalle.trim().length > 20) errors.codeSalle = 'Max 20 caractères.';
  if (!form.libelle.trim()) errors.libelle = 'Le libellé est requis.';
  const cap = parseInt(form.capacite, 10);
  if (!form.capacite) errors.capacite = 'La capacité est requise.';
  else if (isNaN(cap) || cap < 1 || cap > 500) errors.capacite = 'Entre 1 et 500.';
  if (!form.type) errors.type = 'Le type est requis.';
  return errors;
}

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

const errorInputCls = 'w-full px-3 py-2.5 border border-[#ef4444] rounded-xl text-sm text-fg-default bg-white outline-none';

const labelCls = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

function ToastItem({ toast, onRemove }: { toast: { id: number; type: string; message: string }; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium min-w-[280px] bg-surface border ${toast.type === 'success' ? 'border-[#10b981] text-[#10b981]' : 'border-[#ef4444] text-[#ef4444]'}`}>
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

function SalleModal({
  isOpen, mode, form, errors, isSubmitting, onClose, onChange, onSubmit,
}: {
  isOpen: boolean; mode: 'create' | 'edit'; form: SalleForm; errors: FormErrors; isSubmitting: boolean;
  onClose: () => void; onChange: (field: keyof SalleForm, value: string | boolean) => void; onSubmit: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-muted rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-accent" />
            </div>
            <h2 className="text-base font-bold text-accent">
              {mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Code salle *</label>
              <input type="text" placeholder="Ex: A101" value={form.codeSalle}
                onChange={(e) => onChange('codeSalle', e.target.value.toUpperCase())} maxLength={20}
                className={errors.codeSalle ? errorInputCls : inputCls} />
              {errors.codeSalle && <p className="text-xs text-[#ef4444] mt-1">{errors.codeSalle}</p>}
            </div>
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.type} onChange={(e) => onChange('type', e.target.value)} className={errors.type ? errorInputCls : inputCls}>
                <option value="">Choisir...</option>
                {TYPES_SALLE.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-xs text-[#ef4444] mt-1">{errors.type}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Libellé *</label>
            <input type="text" placeholder="Ex: Salle A" value={form.libelle}
              onChange={(e) => onChange('libelle', e.target.value)} maxLength={100}
              className={errors.libelle ? errorInputCls : inputCls} />
            {errors.libelle && <p className="text-xs text-[#ef4444] mt-1">{errors.libelle}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Capacité *</label>
              <input type="number" placeholder="30" value={form.capacite}
                onChange={(e) => onChange('capacite', e.target.value)} min={1} max={500}
                className={errors.capacite ? errorInputCls : inputCls} />
              {errors.capacite && <p className="text-xs text-[#ef4444] mt-1">{errors.capacite}</p>}
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <button type="button" onClick={() => onChange('estActive', !form.estActive)}
                className={`w-full flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium ${
                  form.estActive ? 'border-[#10b981] bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'border-[#ef4444] bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                }`}>
                {form.estActive ? <><ToggleRight size={18} /> Active</> : <><ToggleLeft size={18} /> Inactive</>}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Équipements (optionnel)</label>
            <textarea placeholder="Projecteur, tableau blanc..." value={form.equipements}
              onChange={(e) => onChange('equipements', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Créer la salle' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  salle, isDeleting, onConfirm, onCancel,
}: { salle: Salle | null; isDeleting: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!salle) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl w-full max-w-sm shadow-xl border border-[#ef4444] p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-[rgba(239,68,68,0.1)] rounded-full mx-auto mb-4">
          <Trash2 size={22} className="text-[#ef4444]" />
        </div>
        <h3 className="text-base font-bold text-fg-default text-center mb-1">Supprimer la salle ?</h3>
        <p className="text-sm text-fg-muted text-center mb-5">
          La salle <strong>{salle.codeSalle} — {salle.libelle}</strong> sera définitivement supprimée.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-fg-default hover:bg-bg-muted transition-colors">
            Annuler
          </button>
          <Button onClick={onConfirm} loading={isDeleting} className="bg-[#ef4444] text-white hover:bg-[#dc2626]">Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

function ReservationModal({
  isOpen, form, filieres, parcoursList, niveaux, isSubmitting, onClose, onChange, onSubmit, salleName,
}: {
  isOpen: boolean; form: ReservationForm; filieres: FiliereDto[]; parcoursList: Parcours[]; niveaux: Niveau[];
  isSubmitting: boolean; onClose: () => void; onChange: (field: keyof ReservationForm, value: string) => void; onSubmit: () => void; salleName: string;
}) {
  const filteredParcours = useMemo(() =>
    parcoursList.filter(p => !form.filiereId || p.filiereId === parseInt(form.filiereId)),
    [parcoursList, form.filiereId]
  );
  const filteredNiveaux = useMemo(() =>
    niveaux.filter(n => !form.parcoursId || n.parcoursId === parseInt(form.parcoursId)),
    [niveaux, form.parcoursId]
  );

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-muted rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-accent" />
            </div>
            <h2 className="text-base font-bold text-accent">Réserver — {salleName}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Motif / Titre *</label>
              <input type="text" placeholder="Ex: Cours de maths" value={form.titre}
                onChange={(e) => onChange('titre', e.target.value)}
                className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Type *</label>
              <select value={form.type} onChange={(e) => onChange('type', e.target.value)} className={inputCls}>
                <option value="">Choisir...</option>
                {TYPES_RESERVATION.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Date *</label>
              <input type="date" value={form.datePrecise}
                onChange={(e) => onChange('datePrecise', e.target.value)}
                className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Session *</label>
              <select value={form.session} onChange={(e) => onChange('session', e.target.value)} className={inputCls}>
                <option value="">Choisir...</option>
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {form.type === 'Examen' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Heure de début *</label>
                <input type="time" value={form.heureDebut}
                  onChange={(e) => onChange('heureDebut', e.target.value)}
                  className={inputCls} required />
              </div>
            </div>
          )}
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <BookMarked className="w-3.5 h-3.5" /> Contexte pédagogique (optionnel)
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Filière</label>
                <select value={form.filiereId} onChange={(e) => { onChange('filiereId', e.target.value); onChange('parcoursId', ''); onChange('niveauId', ''); }} className={inputCls}>
                  <option value="">Non spécifié</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Parcours</label>
                <select value={form.parcoursId} onChange={(e) => { onChange('parcoursId', e.target.value); onChange('niveauId', ''); }}
                  className={inputCls} disabled={!form.filiereId}>
                  <option value="">Non spécifié</option>
                  {filteredParcours.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Niveau</label>
                <select value={form.niveauId} onChange={(e) => onChange('niveauId', e.target.value)}
                  className={inputCls} disabled={!form.parcoursId}>
                  <option value="">Non spécifié</option>
                  {filteredNiveaux.map(n => <option key={n.id} value={n.id}>{n.code}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            <Calendar size={14} className="mr-1" /> Réserver
          </Button>
        </div>
      </div>
    </div>
  );
}

function ViewReservationsModal({
  salle, reservations, onClose, onExportPdf,
}: {
  salle: Salle | null; reservations: ReservationReadDto[]; onClose: () => void; onExportPdf: (id: number) => void;
}) {
  if (!salle) return null;
  const salleReservations = reservations.filter(r => r.salleId === salle.id);
  const statutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'En attente': 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]',
      'Confirmée': 'bg-[rgba(16,185,129,0.1)] text-[#10b981]',
      'Annulée': 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
    };
    return colors[statut] || 'bg-[rgba(107,114,128,0.1)] text-[#6B7280]';
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-xl border border-border max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-muted rounded-lg flex items-center justify-center">
              <BookMarked size={16} className="text-accent" />
            </div>
            <h2 className="text-base font-bold text-accent">Réservations — {salle.codeSalle} {salle.libelle}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
        {salleReservations.length === 0 ? (
          <div className="px-6 py-12 text-center text-fg-muted text-sm">
            <Calendar size={32} className="mx-auto mb-2 opacity-30" />
            <p>Aucune réservation pour cette salle.</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {salleReservations.map((r) => (
              <div key={r.id} className="bg-white border border-border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fg-default">{r.titre}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statutBadge(r.statut)}`}>{r.statut}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
                    <span>{new Date(r.datePrecise).toLocaleDateString('fr-FR')}</span>
                    <span>{r.session}</span>
                    {r.type && <span className="font-medium text-accent">{r.type}</span>}
                    {r.heureDebut && <span>Début: {r.heureDebut}</span>}
                    {r.parcoursNom && <span>{r.parcoursNom}</span>}
                    {r.niveauCode && <span>{r.niveauCode}</span>}
                  </div>
                  <div className="text-[11px] text-fg-subtle">Par {r.demandeurNom}</div>
                </div>
                <button onClick={() => onExportPdf(r.id)} title="Télécharger le PDF"
                  className="p-1.5 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)] transition-colors duration-150 shrink-0">
                  <FileDown size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [filieres, setFilieres] = useState<FiliereDto[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<SalleForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Salle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; type: string; message: string }[]>([]);
  const toastId = useRef(0);

  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationSalle, setReservationSalle] = useState<Salle | null>(null);
  const [reservationForm, setReservationForm] = useState<ReservationForm>(EMPTY_RESERVATION);
  const [isReserving, setIsReserving] = useState(false);

  const [allReservations, setAllReservations] = useState<ReservationReadDto[]>([]);
  const [viewResSalle, setViewResSalle] = useState<Salle | null>(null);

  const addToast = useCallback((type: string, message: string) => {
    setToasts((prev) => [...prev, { id: ++toastId.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sallesRes, filieresRes, parcoursRes, niveauxRes, reservationsRes] = await Promise.all([
        api.get<Salle[]>('/Salles'),
        api.get<FiliereDto[]>('/filieres'),
        api.get<Parcours[]>('/parcours'),
        api.get<Niveau[]>('/niveaux'),
        api.get<ReservationReadDto[]>('/Reservation'),
      ]);
      setSalles(sallesRes);
      setFilieres(filieresRes || []);
      setParcoursList(parcoursRes || []);
      setNiveaux(niveauxRes || []);
      setAllReservations(reservationsRes || []);
    } catch {
      addToast('error', 'Impossible de charger les données.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openReservation = (salle: Salle) => {
    setReservationSalle(salle);
    setReservationForm(EMPTY_RESERVATION);
    setReservationOpen(true);
  };

  const handleReservation = async () => {
    if (!reservationSalle) return;
    if (!reservationForm.titre.trim() || !reservationForm.type || !reservationForm.datePrecise || !reservationForm.session) {
      addToast('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (reservationForm.type === 'Examen' && !reservationForm.heureDebut) {
      addToast('error', 'Veuillez remplir l\'heure de début pour un examen.');
      return;
    }
    setIsReserving(true);
    try {
      const payload = {
        titre: reservationForm.titre.trim(),
        type: reservationForm.type,
        datePrecise: reservationForm.datePrecise,
        session: reservationForm.session,
        salleId: reservationSalle.id,
        parcoursId: reservationForm.parcoursId ? parseInt(reservationForm.parcoursId) : undefined,
        niveauId: reservationForm.niveauId ? parseInt(reservationForm.niveauId) : undefined,
        heureDebut: reservationForm.heureDebut || undefined,
      };
      const created = await api.post<ReservationReadDto>('/Reservation', payload);
      addToast('success', `Salle "${reservationSalle.codeSalle}" réservée avec succès.`);
      setAllReservations((prev) => [...prev, created]);
      setReservationOpen(false);
      setReservationSalle(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la réservation.';
      addToast('error', msg);
    } finally {
      setIsReserving(false);
    }
  };

  const filtered = salles.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.codeSalle.toLowerCase().includes(q) || s.libelle.toLowerCase().includes(q) || (s.type || '').toLowerCase().includes(q);
    const matchType = !filterType || s.type === filterType;
    const matchStatus = filterStatus === '' || (filterStatus === 'active' && s.estActive) || (filterStatus === 'inactive' && !s.estActive);
    return matchSearch && matchType && matchStatus;
  });

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setEditId(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (salle: Salle) => {
    setForm({ codeSalle: salle.codeSalle, libelle: salle.libelle, capacite: String(salle.capacite), equipements: salle.equipements || '', estActive: salle.estActive, type: salle.type || '' });
    setErrors({}); setEditId(salle.id); setModalMode('edit'); setModalOpen(true);
  };

  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    const payload = { codeSalle: form.codeSalle.trim(), libelle: form.libelle.trim(), capacite: parseInt(form.capacite, 10), equipements: form.equipements.trim() || undefined, estActive: form.estActive, type: form.type };
    try {
      if (modalMode === 'create') { await api.post('/Salles', payload); addToast('success', `Salle "${payload.codeSalle}" créée.`); }
      else { await api.put(`/Salles/${editId}`, { ...payload, id: editId }); addToast('success', `Salle "${payload.codeSalle}" modifiée.`); }
      setModalOpen(false); fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      addToast('error', msg);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Salles/${deleteTarget.id}`);
      addToast('success', `Salle "${deleteTarget.codeSalle}" supprimée.`);
      setSalles((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { addToast('error', 'Impossible de supprimer cette salle.'); }
    finally { setIsDeleting(false); }
  };

  const exportCSV = () => {
    const header = 'CodeSalle,Libelle,Capacite,Type,EstActive';
    const rows = filtered.map((s) => `"${s.codeSalle}","${s.libelle}",${s.capacite},"${s.type || ''}",${s.estActive}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'salles_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportReservationsPdf = async () => {
    try {
      const blob = await api.postBlob('/Document/export/reservations', {});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `reservations_${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('error', 'Erreur lors de l\'export PDF.');
    }
  };

  const exportSingleReservationPdf = async (id: number) => {
    try {
      const blob = await api.get(`/Document/export/reservation/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a'); a.href = url; a.download = `reservation_${id}_${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('error', 'Erreur lors de l\'export PDF de la réservation.');
    }
  };

  const totalActive = salles.filter((s) => s.estActive).length;
  const totalCapacity = salles.reduce((sum, s) => sum + s.capacite, 0);

  return (
    <ProtectedLayout pageTitle="Gestion des Salles">
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-accent">Gestion des Salles</h1>
          <p className="text-fg-muted mt-1 text-sm">Configurez et gérez les ressources physiques.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-md text-xs font-semibold text-fg-default hover:bg-bg-muted">
            <FileSpreadsheet size={14} className="text-[#10b981]" /> CSV
          </button>
          <button onClick={exportReservationsPdf}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-md text-xs font-semibold text-fg-default hover:bg-bg-muted">
            <FileText size={14} className="text-[#ef4444]" /> PDF
          </button>
          <Button onClick={openCreate}>
            <Plus size={14} className="mr-1" /> Ajouter une salle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total salles', value: salles.length, color: 'text-accent' },
          { label: 'Actives', value: totalActive, color: 'text-[#10b981]' },
          { label: 'Inactives', value: salles.length - totalActive, color: 'text-[#ef4444]' },
          { label: 'Capacité totale', value: `${totalCapacity}`, color: 'text-accent' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-3">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-fg-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-4 shadow-sm mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par code, libellé, type..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="border border-border rounded-xl px-3 py-2.5 text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors">
              <option value="">Tous types</option>
              {TYPES_SALLE.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-border rounded-xl px-3 py-2.5 text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors">
              <option value="">Tous statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fg-subtle">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {salles.length === 0 ? 'Aucune salle enregistrée.' : 'Aucun résultat pour cette recherche.'}
          </p>
          {salles.length === 0 && (
            <button onClick={openCreate} className="mt-3 text-sm text-accent font-semibold hover:underline">
              + Ajouter la première salle
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#F7F7FA]">
                {['Code', 'Libellé', 'Type', 'Capacité', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="p-3 pl-4 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((salle) => (
                <tr key={salle.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA] transition-colors duration-150">
                  <td className="p-3 pl-4">
                    <span className="font-mono text-[12px] font-bold text-[#5A55F2] bg-[#F7F7FA] px-2 py-0.5 rounded-sm">
                      {salle.codeSalle}
                    </span>
                  </td>
                  <td className="p-3 text-[13px] font-medium text-[#111827]">{salle.libelle}</td>
                  <td className="p-3 text-[12px] text-[#555A6E]">{salle.type || '—'}</td>
                  <td className="p-3 flex items-center gap-1.5">
                    <Users size={13} className="text-[#8A8FA3]" />
                    <span className="font-semibold text-[13px] text-[#111827]">{salle.capacite}</span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      salle.estActive ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                    }`}>
                      {salle.estActive ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Inactive</>}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setViewResSalle(salle); }} title="Voir réservations"
                        className="p-1.5 text-[#3b82f6] rounded-md hover:bg-[rgba(59,130,246,0.1)] transition-colors duration-150 relative">
                        <BookMarked size={15} />
                        {allReservations.filter(r => r.salleId === salle.id).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {allReservations.filter(r => r.salleId === salle.id).length}
                          </span>
                        )}
                      </button>
                      <button onClick={() => openReservation(salle)} title="Réserver"
                        className="p-1.5 text-[#10b981] rounded-md hover:bg-[rgba(16,185,129,0.1)] transition-colors duration-150">
                        <Calendar size={15} />
                      </button>
                      <button onClick={() => openEdit(salle)} title="Modifier"
                        className="p-1.5 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA] transition-colors duration-150">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(salle)} title="Supprimer"
                        className="p-1.5 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)] transition-colors duration-150">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SalleModal isOpen={modalOpen} mode={modalMode} form={form} errors={errors} isSubmitting={isSubmitting}
        onClose={() => setModalOpen(false)} onChange={(field, value) => { setForm((prev) => ({ ...prev, [field]: value })); if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined })); }}
        onSubmit={handleSubmit} />
      <DeleteModal salle={deleteTarget} isDeleting={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ReservationModal
        isOpen={reservationOpen}
        form={reservationForm}
        filieres={filieres}
        parcoursList={parcoursList}
        niveaux={niveaux}
        isSubmitting={isReserving}
        onClose={() => { setReservationOpen(false); setReservationSalle(null); }}
        onChange={(field, value) => setReservationForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleReservation}
        salleName={reservationSalle ? `${reservationSalle.codeSalle} — ${reservationSalle.libelle}` : ''}
      />
      <ViewReservationsModal
        salle={viewResSalle}
        reservations={allReservations}
        onClose={() => setViewResSalle(null)}
        onExportPdf={exportSingleReservationPdf}
      />
    </ProtectedLayout>
  );
}
