'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, CheckCircle, AlertCircle,
  Upload, Download, FileSpreadsheet, FileText, Building2,
  Users, ChevronDown, ChevronUp, Filter, RefreshCw,
  Eye, EyeOff, ToggleLeft, ToggleRight,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

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

const TYPES_SALLE = ['Amphithéâtre', 'Laboratoire', 'Salle de cours', 'Salle informatique', 'Salle de TP', 'Autre'];

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

const inputCls = css({
  w: 'full',
  px: '3',
  py: '2',
  border: '1px solid',
  borderColor: 'border.default',
  rounded: 'md',
  fontSize: 'sm',
  color: 'fg.default',
  bg: 'bg.surface',
  outline: 'none',
  _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(109,93,255,0.15)' },
});

const errorInputCls = css({
  w: 'full',
  px: '3',
  py: '2',
  border: '1px solid',
  borderColor: '#ef4444',
  rounded: 'md',
  fontSize: 'sm',
  color: 'fg.default',
  bg: 'bg.surface',
  outline: 'none',
});

const labelCls = css({ fontSize: 'xs', fontWeight: 'bold', color: 'accent.default', textTransform: 'uppercase', letterSpacing: 'wide' });

function ToastItem({ toast, onRemove }: { toast: { id: number; type: string; message: string }; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        px: '4',
        py: '3',
        rounded: 'lg',
        shadow: 'lg',
        fontSize: 'sm',
        fontWeight: 'medium',
        minW: '280px',
        bg: toast.type === 'success' ? 'bg.surface' : 'bg.surface',
        border: '1px solid',
        borderColor: toast.type === 'success' ? '#10b981' : '#ef4444',
        color: toast.type === 'success' ? '#10b981' : '#ef4444',
      })}
    >
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className={css({ flex: '1' })}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className={css({ opacity: 0.5, _hover: { opacity: 1 } })}>
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
    <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '4' })}>
      <div className={css({ position: 'absolute', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' })} onClick={onClose} />
      <div className={css({ position: 'relative', bg: 'bg.elevated', rounded: 'lg', shadow: '2xl', w: 'full', maxW: 'lg', border: '1px solid', borderColor: 'border.default' })}>
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '6', py: '4', borderBottom: '1px solid', borderColor: 'border.default' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <div className={css({ w: '8', h: '8', bg: 'bg.muted', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
              <Building2 size={16} className={css({ color: 'accent.default' })} />
            </div>
            <h2 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'accent.default' })}>
              {mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'}
            </h2>
          </div>
          <button onClick={onClose} className={css({ p: '1.5', color: 'fg.subtle', _hover: { color: 'fg.default', bg: 'bg.muted' }, rounded: 'md' })}>
            <X size={18} />
          </button>
        </div>
        <div className={css({ px: '6', py: '5', spaceY: '4' })}>
          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div>
              <label className={labelCls}>Code salle *</label>
              <input type="text" placeholder="Ex: A101" value={form.codeSalle}
                onChange={(e) => onChange('codeSalle', e.target.value.toUpperCase())} maxLength={20}
                className={errors.codeSalle ? errorInputCls : inputCls} />
              {errors.codeSalle && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.codeSalle}</p>}
            </div>
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.type} onChange={(e) => onChange('type', e.target.value)} className={errors.type ? errorInputCls : inputCls}>
                <option value="">Choisir...</option>
                {TYPES_SALLE.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.type}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Libellé *</label>
            <input type="text" placeholder="Ex: Salle A" value={form.libelle}
              onChange={(e) => onChange('libelle', e.target.value)} maxLength={100}
              className={errors.libelle ? errorInputCls : inputCls} />
            {errors.libelle && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.libelle}</p>}
          </div>
          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div>
              <label className={labelCls}>Capacité *</label>
              <input type="number" placeholder="30" value={form.capacite}
                onChange={(e) => onChange('capacite', e.target.value)} min={1} max={500}
                className={errors.capacite ? errorInputCls : inputCls} />
              {errors.capacite && <p className={css({ fontSize: 'xs', color: '#ef4444', mt: '1' })}>{errors.capacite}</p>}
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <button type="button" onClick={() => onChange('estActive', !form.estActive)}
                className={css({
                  w: 'full', display: 'flex', alignItems: 'center', gap: '2', px: '3', py: '2',
                  border: '1px solid', rounded: 'md', fontSize: 'sm', fontWeight: 'medium',
                  borderColor: form.estActive ? '#10b981' : '#ef4444',
                  bg: form.estActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: form.estActive ? '#10b981' : '#ef4444',
                })}>
                {form.estActive ? <><ToggleRight size={18} /> Active</> : <><ToggleLeft size={18} /> Inactive</>}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Équipements (optionnel)</label>
            <textarea placeholder="Projecteur, tableau blanc..." value={form.equipements}
              onChange={(e) => onChange('equipements', e.target.value)} rows={2}
              className={css({ w: 'full', px: '3', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', resize: 'none', _focus: { borderColor: 'accent.default' } })} />
          </div>
        </div>
        <div className={css({ px: '6', py: '4', borderTop: '1px solid', borderColor: 'border.default', display: 'flex', justifyContent: 'flex-end', gap: '2' })}>
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
    <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '4' })}>
      <div className={css({ position: 'absolute', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' })} onClick={onCancel} />
      <div className={css({ position: 'relative', bg: 'bg.elevated', rounded: 'lg', shadow: '2xl', w: 'full', maxW: 'sm', border: '1px solid', borderColor: '#ef4444', p: '6' })}>
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', w: '12', h: '12', bg: 'rgba(239,68,68,0.1)', rounded: 'full', mx: 'auto', mb: '4' })}>
          <Trash2 size={22} className={css({ color: '#ef4444' })} />
        </div>
        <h3 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'fg.default', textAlign: 'center', mb: '1' })}>Supprimer la salle ?</h3>
        <p className={css({ fontSize: 'sm', color: 'fg.muted', textAlign: 'center', mb: '5' })}>
          La salle <strong>{salle.codeSalle} — {salle.libelle}</strong> sera définitivement supprimée.
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

export default function AdminSallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
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

  const addToast = useCallback((type: string, message: string) => {
    setToasts((prev) => [...prev, { id: ++toastId.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchSalles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Salle[]>('/Salles');
      setSalles(res);
    } catch {
      addToast('error', 'Impossible de charger les salles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSalles(); }, []);

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
      setModalOpen(false); fetchSalles();
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

  const totalActive = salles.filter((s) => s.estActive).length;
  const totalCapacity = salles.reduce((sum, s) => sum + s.capacite, 0);

  return (
    <ProtectedLayout pageTitle="Gestion des Salles">
      <div className={css({ position: 'fixed', bottom: '5', right: '5', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '2' })}>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      <div className={css({ display: 'flex', flexDirection: { base: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: '4', mb: '8' })}>
        <div>
          <h1 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'accent.default' })}>Gestion des Salles</h1>
          <p className={css({ color: 'fg.muted', mt: '1', fontSize: 'sm' })}>Configurez et gérez les ressources physiques.</p>
        </div>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })}>
          <button onClick={exportCSV}
            className={css({ display: 'flex', alignItems: 'center', gap: '1.5', px: '3', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'xs', fontWeight: 'semibold', color: 'fg.default', _hover: { bg: 'bg.muted' } })}>
            <FileSpreadsheet size={14} className={css({ color: '#10b981' })} /> CSV
          </button>
          <Button onClick={openCreate}>
            <Plus size={14} className={css({ mr: '1' })} /> Ajouter une salle
          </Button>
        </div>
      </div>

      <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: '3', mb: '6' })}>
        {[
          { label: 'Total salles', value: salles.length, color: 'accent.default' },
          { label: 'Actives', value: totalActive, color: '#10b981' },
          { label: 'Inactives', value: salles.length - totalActive, color: '#ef4444' },
          { label: 'Capacité totale', value: `${totalCapacity}`, color: 'accent.default' },
        ].map((stat) => (
          <div key={stat.label} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3' })}>
            <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: stat.color as any })}>{stat.value}</div>
            <div className={css({ fontSize: 'xs', color: 'fg.muted', mt: '0.5' })}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3', mb: '4' })}>
        <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap', alignItems: 'center' })}>
          <div className={css({ position: 'relative', flex: '1', minW: '200px' })}>
            <Search size={16} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle' })} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par code, libellé, type..."
              className={css({ w: 'full', pl: '9', pr: '4', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } })} />
          </div>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })}>
              <option value="">Tous types</option>
              {TYPES_SALLE.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })}>
              <option value="">Tous statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', py: '24' })}>
          <div className={css({ w: '10', h: '10', border: '4px solid', borderColor: 'accent.default', borderTopColor: 'transparent', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={css({ textAlign: 'center', py: '20', color: 'fg.subtle' })}>
          <Building2 size={40} className={css({ mx: 'auto', mb: '3', opacity: 0.3 })} />
          <p className={css({ fontWeight: 'medium' })}>
            {salles.length === 0 ? 'Aucune salle enregistrée.' : 'Aucun résultat pour cette recherche.'}
          </p>
          {salles.length === 0 && (
            <button onClick={openCreate} className={css({ mt: '3', fontSize: 'sm', color: 'accent.default', fontWeight: 'semibold', _hover: { textDecoration: 'underline' } })}>
              + Ajouter la première salle
            </button>
          )}
        </div>
      ) : (
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden' })}>
          <table className={css({ w: 'full', fontSize: 'sm' })}>
            <thead>
              <tr className={css({ borderBottom: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })}>
                {['Code', 'Libellé', 'Type', 'Capacité', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className={css({ p: '3', pl: '4', textAlign: 'left', fontWeight: 'bold', color: 'accent.default', fontSize: 'xs', textTransform: 'uppercase', letterSpacing: 'wide' })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((salle) => (
                <tr key={salle.id} className={css({ borderBottom: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.muted' }, transition: 'background 0.15s' })}>
                  <td className={css({ p: '3', pl: '4' })}>
                    <span className={css({ fontFamily: 'mono', fontSize: 'xs', fontWeight: 'bold', color: 'accent.default', bg: 'bg.muted', px: '2', py: '0.5', rounded: 'sm' })}>
                      {salle.codeSalle}
                    </span>
                  </td>
                  <td className={css({ p: '3', fontWeight: 'medium', color: 'fg.default' })}>{salle.libelle}</td>
                  <td className={css({ p: '3', fontSize: 'xs', color: 'fg.muted' })}>{salle.type || '—'}</td>
                  <td className={css({ p: '3', display: 'flex', alignItems: 'center', gap: '1.5' })}>
                    <Users size={13} className={css({ color: 'fg.subtle' })} />
                    <span className={css({ fontWeight: 'semibold', color: 'fg.default' })}>{salle.capacite}</span>
                  </td>
                  <td className={css({ p: '3' })}>
                    <span className={css({
                      display: 'inline-flex', alignItems: 'center', gap: '1', fontSize: 'xs', fontWeight: 'semibold',
                      px: '2', py: '0.5', rounded: 'full',
                      bg: salle.estActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: salle.estActive ? '#10b981' : '#ef4444',
                    })}>
                      {salle.estActive ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Inactive</>}
                    </span>
                  </td>
                  <td className={css({ p: '3', pr: '4', textAlign: 'right' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '1', justifyContent: 'flex-end' })}>
                      <button onClick={() => openEdit(salle)} title="Modifier"
                        className={css({ p: '1.5', color: 'accent.default', rounded: 'md', _hover: { bg: 'bg.muted' }, transition: 'colors 0.15s' })}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(salle)} title="Supprimer"
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

      <SalleModal isOpen={modalOpen} mode={modalMode} form={form} errors={errors} isSubmitting={isSubmitting}
        onClose={() => setModalOpen(false)} onChange={(field, value) => { setForm((prev) => ({ ...prev, [field]: value })); if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined })); }}
        onSubmit={handleSubmit} />
      <DeleteModal salle={deleteTarget} isDeleting={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </ProtectedLayout>
  );
}
