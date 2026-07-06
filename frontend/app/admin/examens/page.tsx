'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, CheckCircle, AlertCircle, Calendar, BookOpen } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { examenService } from '@/services/examens';
import { ExamenReadDto, ExamenCreateDto, ExamenUpdateDto, Matiere, Utilisateur, Salle, Niveau, Parcours } from '@/types';
import { css } from 'styled-system/css';

interface ExamenForm {
  matiereId: string;
  professeurId: string;
  salleId: string;
  niveauId: string;
  parcoursId: string;
  dateExamen: string;
  heureDebut: string;
  heureFin: string;
  description: string;
}

interface FormErrors {
  matiereId?: string;
  professeurId?: string;
  salleId?: string;
  dateExamen?: string;
  heureDebut?: string;
  heureFin?: string;
}

const EMPTY_FORM: ExamenForm = {
  matiereId: '', professeurId: '', salleId: '', niveauId: '', parcoursId: '',
  dateExamen: '', heureDebut: '08:00', heureFin: '10:00', description: '',
};

const inputCls = css({
  w: 'full', px: '3', py: '2', border: '1px solid', borderColor: 'border.default',
  rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none',
  _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(109,93,255,0.15)' },
});

const errorInputCls = css({
  w: 'full', px: '3', py: '2', border: '1px solid', borderColor: '#ef4444',
  rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none',
});

const labelCls = css({ fontSize: 'xs', fontWeight: 'bold', color: 'accent.default', textTransform: 'uppercase', letterSpacing: 'wide' });

function ToastItem({ toast, onRemove }: { toast: { id: number; type: string; message: string }; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div className={css({
      display: 'flex', alignItems: 'center', gap: '3', px: '4', py: '3', rounded: 'lg', shadow: 'lg',
      fontSize: 'sm', fontWeight: 'medium', minW: '280px',
      bg: 'bg.surface', border: '1px solid',
      borderColor: toast.type === 'success' ? '#10b981' : '#ef4444',
      color: toast.type === 'success' ? '#10b981' : '#ef4444',
    })}>
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className={css({ flex: '1' })}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className={css({ opacity: 0.5, _hover: { opacity: 1 } })}>
        <X size={14} />
      </button>
    </div>
  );
}

function ExamenModal({
  isOpen, mode, form, errors, matieres, professeurs, salles, niveaux, parcours,
  isSubmitting, filterNiveau, onClose, onChange, onSubmit,
}: {
  isOpen: boolean; mode: 'create' | 'edit'; form: ExamenForm; errors: FormErrors;
  matieres: Matiere[]; professeurs: Utilisateur[]; salles: Salle[]; niveaux: Niveau[]; parcours: Parcours[];
  isSubmitting: boolean; filterNiveau: string;
  onClose: () => void; onChange: (field: keyof ExamenForm, value: string) => void; onSubmit: () => void;
}) {
  if (!isOpen) return null;

  const niveauOptions = niveaux.filter(n =>
    !filterNiveau || n.id === parseInt(filterNiveau)
  );

  return (
    <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '4' })}>
      <div className={css({ position: 'absolute', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' })} onClick={onClose} />
      <div className={css({ position: 'relative', bg: 'bg.elevated', rounded: 'lg', shadow: '2xl', w: 'full', maxW: 'lg', border: '1px solid', borderColor: 'border.default' })}>
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '6', py: '4', borderBottom: '1px solid', borderColor: 'border.default' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <div className={css({ w: '8', h: '8', bg: 'bg.muted', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
              <BookOpen size={16} className={css({ color: 'accent.default' })} />
            </div>
            <h2 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'accent.default' })}>
              {mode === 'create' ? 'Planifier un examen' : 'Modifier l\'examen'}
            </h2>
          </div>
          <button onClick={onClose} className={css({ p: '1.5', color: 'fg.subtle', _hover: { color: 'fg.default', bg: 'bg.muted' }, rounded: 'md' })}>
            <X size={18} />
          </button>
        </div>
        <div className={css({ px: '6', py: '5', spaceY: '4' })}>
          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div>
              <label className={labelCls}>Matière *</label>
              <select value={form.matiereId} onChange={(e) => onChange('matiereId', e.target.value)}
                className={errors.matiereId ? errorInputCls : inputCls}>
                <option value="">Choisir...</option>
                {matieres.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.nom}</option>)}
              </select>
              {errors.matiereId && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.matiereId}</p>}
            </div>
            <div>
              <label className={labelCls}>Professeur *</label>
              <select value={form.professeurId} onChange={(e) => onChange('professeurId', e.target.value)}
                className={errors.professeurId ? errorInputCls : inputCls}>
                <option value="">Choisir...</option>
                {professeurs.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </select>
              {errors.professeurId && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.professeurId}</p>}
            </div>
          </div>
          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div>
              <label className={labelCls}>Niveau</label>
              <select value={form.niveauId} onChange={(e) => onChange('niveauId', e.target.value)}
                className={inputCls}>
                <option value="">Tous niveaux</option>
                {niveauOptions.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Parcours</label>
              <select value={form.parcoursId} onChange={(e) => onChange('parcoursId', e.target.value)}
                className={inputCls}>
                <option value="">Tous parcours</option>
                {parcours.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Salle *</label>
            <select value={form.salleId} onChange={(e) => onChange('salleId', e.target.value)}
              className={errors.salleId ? errorInputCls : inputCls}>
              <option value="">Choisir...</option>
              {salles.map((s) => <option key={s.id} value={s.id}>{s.libelle || s.nom} — {s.capacite} places</option>)}
            </select>
            {errors.salleId && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.salleId}</p>}
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" value={form.dateExamen} onChange={(e) => onChange('dateExamen', e.target.value)}
              className={errors.dateExamen ? errorInputCls : inputCls} />
            {errors.dateExamen && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.dateExamen}</p>}
          </div>
          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div>
              <label className={labelCls}>Heure début *</label>
              <input type="time" value={form.heureDebut} onChange={(e) => onChange('heureDebut', e.target.value)}
                className={errors.heureDebut ? errorInputCls : inputCls} />
              {errors.heureDebut && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.heureDebut}</p>}
            </div>
            <div>
              <label className={labelCls}>Heure fin *</label>
              <input type="time" value={form.heureFin} onChange={(e) => onChange('heureFin', e.target.value)}
                className={errors.heureFin ? errorInputCls : inputCls} />
              {errors.heureFin && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.heureFin}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Description (optionnelle)</label>
            <textarea value={form.description} onChange={(e) => onChange('description', e.target.value)}
              rows={2} placeholder="Informations supplémentaires..."
              className={css({ w: 'full', px: '3', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', resize: 'none', _focus: { borderColor: 'accent.default' } })} />
          </div>
        </div>
        <div className={css({ px: '6', py: '4', borderTop: '1px solid', borderColor: 'border.default', display: 'flex', justifyContent: 'flex-end', gap: '2' })}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Planifier l\'examen' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  examen, isDeleting, onConfirm, onCancel,
}: { examen: ExamenReadDto | null; isDeleting: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!examen) return null;
  return (
    <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '4' })}>
      <div className={css({ position: 'absolute', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' })} onClick={onCancel} />
      <div className={css({ position: 'relative', bg: 'bg.elevated', rounded: 'lg', shadow: '2xl', w: 'full', maxW: 'sm', border: '1px solid', borderColor: '#ef4444', p: '6' })}>
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', w: '12', h: '12', bg: 'rgba(239,68,68,0.1)', rounded: 'full', mx: 'auto', mb: '4' })}>
          <Trash2 size={22} className={css({ color: '#ef4444' })} />
        </div>
        <h3 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'fg.default', textAlign: 'center', mb: '1' })}>Supprimer l'examen ?</h3>
        <p className={css({ fontSize: 'sm', color: 'fg.muted', textAlign: 'center', mb: '5' })}>
          L'examen <strong>{examen.matiereNom}</strong> du {new Date(examen.dateExamen).toLocaleDateString('fr-FR')} sera supprimé.
        </p>
        <div className={css({ display: 'flex', gap: '2' })}>
          <button onClick={onCancel} disabled={isDeleting}
            className={css({ flex: '1', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default', _hover: { bg: 'bg.muted' } })}>
            Annuler
          </button>
          <Button onClick={onConfirm} loading={isDeleting} className={css({ bg: '#ef4444', color: 'white', _hover: { bg: '#dc2626' } })}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminExamensPage() {
  const [examens, setExamens] = useState<ExamenReadDto[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [professeurs, setProfesseurs] = useState<Utilisateur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ExamenForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamenReadDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; type: string; message: string }[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((type: string, message: string) => {
    setToasts((prev) => [...prev, { id: ++toastId.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [e, m, p, s, n, pr] = await Promise.all([
        examenService.getAll(),
        api.get<Matiere[]>('/matieres'),
        api.get<Utilisateur[]>('/utilisateurs?role=Professeur'),
        api.get<Salle[]>('/Salles'),
        api.get<Niveau[]>('/niveaux'),
        api.get<Parcours[]>('/parcours'),
      ]);
      setExamens(e);
      setMatieres(m);
      setProfesseurs(p);
      setSalles(s);
      setNiveaux(n);
      setParcours(pr);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = examens.filter((ex) => {
    if (filterNiveau && ex.niveauId !== parseInt(filterNiveau)) return false;
    if (filterDateDebut && new Date(ex.dateExamen) < new Date(filterDateDebut)) return false;
    if (filterDateFin && new Date(ex.dateExamen) > new Date(filterDateFin)) return false;
    return true;
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditId(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (examen: ExamenReadDto) => {
    setForm({
      matiereId: String(examen.matiereId),
      professeurId: String(examen.professeurId),
      salleId: String(examen.salleId),
      niveauId: examen.niveauId ? String(examen.niveauId) : '',
      parcoursId: examen.parcoursId ? String(examen.parcoursId) : '',
      dateExamen: examen.dateExamen.split('T')[0],
      heureDebut: examen.heureDebut,
      heureFin: examen.heureFin,
      description: examen.description || '',
    });
    setErrors({});
    setEditId(examen.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.matiereId) errs.matiereId = 'Requis.';
    if (!form.professeurId) errs.professeurId = 'Requis.';
    if (!form.salleId) errs.salleId = 'Requis.';
    if (!form.dateExamen) errs.dateExamen = 'Requis.';
    if (!form.heureDebut) errs.heureDebut = 'Requis.';
    if (!form.heureFin) errs.heureFin = 'Requis.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      matiereId: parseInt(form.matiereId),
      professeurId: parseInt(form.professeurId),
      salleId: parseInt(form.salleId),
      niveauId: form.niveauId ? parseInt(form.niveauId) : undefined,
      parcoursId: form.parcoursId ? parseInt(form.parcoursId) : undefined,
      dateExamen: form.dateExamen,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      description: form.description.trim() || undefined,
    };
    try {
      if (modalMode === 'create') {
        await examenService.create(payload as ExamenCreateDto);
        addToast('success', 'Examen planifié avec succès.');
      } else if (editId) {
        await examenService.update(editId, payload as ExamenUpdateDto);
        addToast('success', 'Examen modifié avec succès.');
      }
      setModalOpen(false);
      fetchAll();
    } catch {
      addToast('error', 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await examenService.delete(deleteTarget.id);
      addToast('success', `Examen "${deleteTarget.matiereNom}" supprimé.`);
      setExamens((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Impossible de supprimer cet examen.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <ProtectedLayout pageTitle="Gestion des examens">
      <div className={css({ position: 'fixed', bottom: '5', right: '5', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '2' })}>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      <div className={css({ display: 'flex', flexDirection: { base: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: '4', mb: '6' })}>
        <div>
          <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'accent.default' })}>Gestion des Examens</h1>
          <p className={css({ color: 'fg.muted', mt: '1', fontSize: 'sm' })}>Planifiez et gérez les examens.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} className={css({ mr: '1' })} /> Planifier un examen
        </Button>
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '3', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', fontSize: 'sm', fontWeight: 'medium', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2', rounded: 'lg' })}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3', mb: '4' })}>
        <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap', alignItems: 'center' })}>
          <select value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)}
            className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })}>
            <option value="">Tous niveaux</option>
            {niveaux.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
          </select>
          <input type="date" value={filterDateDebut} onChange={(e) => setFilterDateDebut(e.target.value)}
            className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })} />
          <span className={css({ color: 'fg.subtle', fontSize: 'xs' })}>→</span>
          <input type="date" value={filterDateFin} onChange={(e) => setFilterDateFin(e.target.value)}
            className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })} />
        </div>
      </div>

      {isLoading ? (
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', py: '24' })}>
          <div className={css({ w: '10', h: '10', border: '4px solid', borderColor: 'accent.default', borderTopColor: 'transparent', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={css({ textAlign: 'center', py: '20', color: 'fg.subtle' })}>
          <Calendar size={40} className={css({ mx: 'auto', mb: '3', opacity: 0.3 })} />
          <p className={css({ fontWeight: 'medium' })}>
            {examens.length === 0 ? 'Aucun examen planifié.' : 'Aucun résultat pour ces filtres.'}
          </p>
          {examens.length === 0 && (
            <button onClick={openCreate} className={css({ mt: '3', fontSize: 'sm', color: 'accent.default', fontWeight: 'semibold', _hover: { textDecoration: 'underline' } })}>
              + Planifier le premier examen
            </button>
          )}
        </div>
      ) : (
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden' })}>
          <table className={css({ w: 'full', fontSize: 'sm' })}>
            <thead>
              <tr className={css({ borderBottom: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })}>
                {['Matière', 'Professeur', 'Salle', 'Date', 'Horaire', 'Niveau', 'Actions'].map((h) => (
                  <th key={h} className={css({ p: '3', pl: '4', textAlign: 'left', fontWeight: 'bold', color: 'accent.default', fontSize: 'xs', textTransform: 'uppercase', letterSpacing: 'wide' })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((examen) => (
                <tr key={examen.id} className={css({ borderBottom: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.muted' }, transition: 'background 0.15s' })}>
                  <td className={css({ p: '3', pl: '4' })}>
                    <div>
                      <span className={css({ fontWeight: 'semibold', color: 'fg.default' })}>{examen.matiereNom}</span>
                      <span className={css({ color: 'fg.subtle', fontSize: 'xs', ml: '1' })}>({examen.matiereCode})</span>
                    </div>
                  </td>
                  <td className={css({ p: '3', color: 'fg.muted', fontSize: 'xs' })}>{examen.professeurNom}</td>
                  <td className={css({ p: '3', color: 'fg.muted', fontSize: 'xs' })}>{examen.salleNom}</td>
                  <td className={css({ p: '3', color: 'fg.default', fontSize: 'xs', fontWeight: 'medium' })}>{formatDate(examen.dateExamen)}</td>
                  <td className={css({ p: '3', color: 'fg.default', fontSize: 'xs' })}>{examen.heureDebut} — {examen.heureFin}</td>
                  <td className={css({ p: '3' })}>
                    <span className={css({
                      display: 'inline-flex', alignItems: 'center', px: '2', py: '0.5',
                      fontSize: 'xs', fontWeight: 'semibold', rounded: 'full',
                      bg: 'bg.muted', color: 'accent.default',
                    })}>
                      {niveaux.find((n) => n.id === examen.niveauId)?.code || '—'}
                    </span>
                  </td>
                  <td className={css({ p: '3', pr: '4', textAlign: 'right' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '1', justifyContent: 'flex-end' })}>
                      <button onClick={() => openEdit(examen)} title="Modifier"
                        className={css({ p: '1.5', color: 'accent.default', rounded: 'md', _hover: { bg: 'bg.muted' }, transition: 'colors 0.15s' })}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(examen)} title="Supprimer"
                        className={css({ p: '1.5', color: '#ef4444', rounded: 'md', _hover: { bg: 'rgba(239,68,68,0.1)' }, transition: 'colors 0.15s' })}>
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

      <ExamenModal isOpen={modalOpen} mode={modalMode} form={form} errors={errors}
        matieres={matieres} professeurs={professeurs} salles={salles} niveaux={niveaux} parcours={parcours}
        isSubmitting={isSubmitting} filterNiveau={filterNiveau}
        onClose={() => setModalOpen(false)}
        onChange={(field, value) => {
          setForm((prev) => ({ ...prev, [field]: value }));
          if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
        }}
        onSubmit={handleSubmit} />
      <DeleteModal examen={deleteTarget} isDeleting={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </ProtectedLayout>
  );
}
