'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, X, CheckCircle, AlertCircle,
  Upload, Download, FileSpreadsheet, FileText, Users,
  ChevronDown, ChevronUp, Filter, RefreshCw, Eye, EyeOff,
  ShieldCheck, Mail, User, Hash, Lock,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UtilisateurDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  role?: string;
  niveauId?: number;
  niveauCode?: string;
}

interface UserCreateForm {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmMotDePasse: string;
  matricule: string;
  role: string;
  niveauId: string;
}

interface UserEditForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: string;
  niveauId: string;
}

interface CreateErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  confirmMotDePasse?: string;
  role?: string;
}

interface EditErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = ['Admin', 'Professeur', 'Etudiant', 'Responsable'];

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-red-100 text-red-700',
  Professeur: 'bg-blue-100 text-blue-700',
  Etudiant: 'bg-green-100 text-green-700',
  Responsable: 'bg-purple-100 text-purple-700',
};

const EMPTY_CREATE: UserCreateForm = {
  nom: '', prenom: '', email: '',
  motDePasse: '', confirmMotDePasse: '',
  matricule: '', role: '', niveauId: '',
};

const EMPTY_EDIT: UserEditForm = {
  nom: '', prenom: '', email: '',
  matricule: '', role: '', niveauId: '',
};

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validateCreate(f: UserCreateForm): CreateErrors {
  const e: CreateErrors = {};
  if (!f.nom.trim()) e.nom = 'Le nom est requis.';
  else if (f.nom.trim().length > 100) e.nom = 'Max 100 caractères.';

  if (!f.prenom.trim()) e.prenom = 'Le prénom est requis.';
  else if (f.prenom.trim().length > 100) e.prenom = 'Max 100 caractères.';

  if (!f.email.trim()) e.email = "L'email est requis.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Format email invalide.';

  if (!f.motDePasse) e.motDePasse = 'Le mot de passe est requis.';
  else if (!PWD_RE.test(f.motDePasse))
    e.motDePasse = 'Min 8 car. avec majuscule, minuscule et chiffre.';

  if (!f.confirmMotDePasse) e.confirmMotDePasse = 'Veuillez confirmer le mot de passe.';
  else if (f.motDePasse !== f.confirmMotDePasse) e.confirmMotDePasse = 'Les mots de passe ne correspondent pas.';

  if (!f.role) e.role = 'Le rôle est requis.';
  return e;
}

function validateEdit(f: UserEditForm): EditErrors {
  const e: EditErrors = {};
  if (!f.nom.trim()) e.nom = 'Le nom est requis.';
  else if (f.nom.trim().length > 100) e.nom = 'Max 100 caractères.';

  if (!f.prenom.trim()) e.prenom = 'Le prénom est requis.';
  else if (f.prenom.trim().length > 100) e.prenom = 'Max 100 caractères.';

  if (!f.email.trim()) e.email = "L'email est requis.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Format email invalide.';

  if (!f.role) e.role = 'Le rôle est requis.';
  return e;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-[#0052FF] uppercase tracking-wider">
        {label}{required && <span className="text-[#0052FF] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] ${
        toast.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
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

// ─── Avatar initials ──────────────────────────────────────────────────────────
function Avatar({ nom, prenom }: { nom: string; prenom: string }) {
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
    'bg-cyan-100 text-cyan-700', 'bg-rose-100 text-rose-700',
  ];
  const idx = (nom.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[idx]}`}>
      {(nom[0] || '?').toUpperCase()}{(prenom[0] || '').toUpperCase()}
    </div>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: 'Très faible', color: 'bg-[#C62828]' },
    { label: 'Faible', color: 'bg-[#F57C00]' },
    { label: 'Moyen', color: 'bg-[#FBC02D]' },
    { label: 'Fort', color: 'bg-[#43A047]' },
    { label: 'Très fort', color: 'bg-[#2E7D32]' },
  ];
  const lvl = levels[Math.max(0, Math.min(score - 1, 4))];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= score ? lvl.color : 'bg-blue-200'}`} />
        ))}
      </div>
      <p className="text-[11px] text-blue-500">{lvl.label}</p>
    </div>
  );
}

// ─── Password input with eye toggle ──────────────────────────────────────────
function PasswordInput({
  value, onChange, placeholder, error,
}: { value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const [show, setShow] = useState(false);
  const inputClass = `w-full pl-3 pr-9 py-2 border rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] ${
    error ? 'border-red-400 bg-red-50/30' : 'border-blue-100 bg-white'
  }`;
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-900 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({
  isOpen, form, errors, isSubmitting,
  onClose, onChange, onSubmit,
}: {
  isOpen: boolean; form: UserCreateForm; errors: CreateErrors; isSubmitting: boolean;
  onClose: () => void; onChange: (f: keyof UserCreateForm, v: string) => void; onSubmit: () => void;
}) {
  const ic = (err?: string) =>
    `w-full px-3 py-2 border rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] ${
      err ? 'border-red-400 bg-red-50/30' : 'border-blue-100 bg-white'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-blue-100 my-4">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-[#0052FF]" />
                  </div>
                  <h2 className="text-base font-bold text-[#0052FF]">Ajouter un utilisateur</h2>
                </div>
        <button onClick={onClose} className="p-1.5 text-blue-300 hover:text-blue-900 hover:bg-blue-100 rounded-md transition-colors">
          <X size={18} />
        </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nom" required error={errors.nom}>
                    <input type="text" value={form.nom} onChange={(e) => onChange('nom', e.target.value)}
                      placeholder="Ex: RAKOTO" maxLength={100} className={ic(errors.nom)} />
                  </Field>
                  <Field label="Prénom" required error={errors.prenom}>
                    <input type="text" value={form.prenom} onChange={(e) => onChange('prenom', e.target.value)}
                      placeholder="Ex: Jean" maxLength={100} className={ic(errors.prenom)} />
                  </Field>
                </div>

                <Field label="Email" required error={errors.email}>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                    <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)}
                      placeholder="jean.rakoto@emit.edu" className={`pl-8 ${ic(errors.email)}`} />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Rôle" required error={errors.role}>
                    <div className="relative">
                      <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                      <select value={form.role} onChange={(e) => onChange('role', e.target.value)}
                        className={`pl-8 appearance-none ${ic(errors.role)}`}>
                        <option value="">Choisir...</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </Field>
                  <Field label="Matricule (optionnel)">
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input type="text" value={form.matricule} onChange={(e) => onChange('matricule', e.target.value)}
                        placeholder="Ex: 2024001" maxLength={20} className={`pl-8 ${ic()}`} />
                    </div>
                  </Field>
                </div>

                <Field label="Niveau ID (optionnel)">
                  <input type="number" value={form.niveauId} onChange={(e) => onChange('niveauId', e.target.value)}
                    placeholder="ID du niveau (ex: 1)" min={1} className={ic()} />
                </Field>

                <div className="border-t border-blue-100 pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0052FF] uppercase tracking-wider">
                    <Lock size={12} /> Sécurité
                  </div>
                  <Field label="Mot de passe" required error={errors.motDePasse}>
                    <PasswordInput value={form.motDePasse} onChange={(v) => onChange('motDePasse', v)}
                      placeholder="Min. 8 car. avec majuscule et chiffre" error={errors.motDePasse} />
                    <PasswordStrength pwd={form.motDePasse} />
                  </Field>
                  <Field label="Confirmer le mot de passe" required error={errors.confirmMotDePasse}>
                    <PasswordInput value={form.confirmMotDePasse} onChange={(v) => onChange('confirmMotDePasse', v)}
                      placeholder="Répéter le mot de passe" error={errors.confirmMotDePasse} />
                  </Field>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
                <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>Créer l&apos;utilisateur</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  isOpen, user, form, errors, isSubmitting,
  onClose, onChange, onSubmit,
}: {
  isOpen: boolean; user: UtilisateurDto | null; form: UserEditForm; errors: EditErrors; isSubmitting: boolean;
  onClose: () => void; onChange: (f: keyof UserEditForm, v: string) => void; onSubmit: () => void;
}) {
  const ic = (err?: string) =>
    `w-full px-3 py-2 border rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] ${
      err ? 'border-red-400 bg-red-50/30' : 'border-blue-100 bg-white'
    }`;

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-blue-100 my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <Avatar nom={user.nom} prenom={user.prenom} />
                  <div>
                    <h2 className="text-base font-bold text-[#0052FF]">Modifier l&apos;utilisateur</h2>
                    <p className="text-xs text-blue-500">{user.email}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-blue-300 hover:text-blue-900 hover:bg-blue-100 rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nom" required error={errors.nom}>
                    <input type="text" value={form.nom} onChange={(e) => onChange('nom', e.target.value)}
                      maxLength={100} className={ic(errors.nom)} />
                  </Field>
                  <Field label="Prénom" required error={errors.prenom}>
                    <input type="text" value={form.prenom} onChange={(e) => onChange('prenom', e.target.value)}
                      maxLength={100} className={ic(errors.prenom)} />
                  </Field>
                </div>

                <Field label="Email" required error={errors.email}>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                    <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)}
                      className={`pl-8 ${ic(errors.email)}`} />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Rôle" required error={errors.role}>
                    <div className="relative">
                      <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                      <select value={form.role} onChange={(e) => onChange('role', e.target.value)}
                        className={`pl-8 appearance-none ${ic(errors.role)}`}>
                        <option value="">Choisir...</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </Field>
                  <Field label="Matricule">
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input type="text" value={form.matricule} onChange={(e) => onChange('matricule', e.target.value)}
                        maxLength={20} className={`pl-8 ${ic()}`} />
                    </div>
                  </Field>
                </div>

                <Field label="Niveau ID (optionnel)">
                  <input type="number" value={form.niveauId} onChange={(e) => onChange('niveauId', e.target.value)}
                    min={1} placeholder="ID du niveau" className={ic()} />
                </Field>

                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2 text-xs text-amber-700">
                  <Lock size={13} className="mt-0.5 flex-shrink-0" />
                  Pour modifier le mot de passe, utilisez la fonctionnalit&eacute; &quot;R&eacute;initialiser le mot de passe&quot;.
                </div>
              </div>

              <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
                <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>Enregistrer</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  user, isDeleting, onConfirm, onCancel,
}: {
  user: UtilisateurDto | null; isDeleting: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onCancel} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-red-100 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-blue-900 text-center mb-1">
                Supprimer cet utilisateur ?
              </h3>
              <p className="text-sm text-blue-500 text-center mb-5">
                Le compte de <strong className="text-blue-900">{user.prenom} {user.nom}</strong>{' '}
                (<span className="font-mono text-xs">{user.email}</span>) sera définitivement supprimé.
              </p>
              <div className="flex gap-2">
                <button onClick={onCancel} disabled={isDeleting}
                  className="flex-1 py-2 border border-blue-100 rounded-md text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors">
                  Annuler
                </button>
                <Button variant="danger" onClick={onConfirm} isLoading={isDeleting} className="flex-1 justify-center">
                  Supprimer
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({
  isOpen, onClose, onImport,
}: { isOpen: boolean; onClose: () => void; onImport: (users: Partial<UtilisateurDto>[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Partial<UtilisateurDto>[]>([]);

  const parseCSV = (text: string): Partial<UtilisateurDto>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('Fichier vide ou sans données.');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return {
        nom: obj['nom'] || obj['name'] || '',
        prenom: obj['prenom'] || obj['firstname'] || '',
        email: obj['email'] || '',
        matricule: obj['matricule'] || '',
        role: obj['role'] || 'Etudiant',
      };
    }).filter((u) => u.nom && u.email);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); setPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Seuls les fichiers CSV sont acceptés.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = parseCSV(ev.target?.result as string);
        if (!data.length) { setError('Aucun utilisateur valide trouvé.'); return; }
        setPreview(data.slice(0, 5));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur de lecture.');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = 'Nom,Prenom,Email,Matricule,Role\nRAKOTO,Jean,jean.rakoto@emit.edu,2024001,Etudiant\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'template_utilisateurs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-blue-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Upload size={16} className="text-[#0052FF]" />
                  </div>
                  <h2 className="text-base font-bold text-[#0052FF]">Importer des utilisateurs</h2>
                </div>
                <button onClick={onClose} className="p-1.5 text-blue-300 hover:text-blue-900 rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <span className="text-sm text-blue-500">Télécharger le modèle CSV</span>
                  <button onClick={downloadTemplate}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0052FF] hover:text-[#0052FF] transition-colors">
                    <Download size={14} /> Modèle CSV
                  </button>
                </div>

                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-blue-100 rounded-xl p-8 text-center cursor-pointer hover:border-[#0052FF]/50 hover:bg-blue-100 transition-all">
                  <FileSpreadsheet size={32} className="mx-auto text-blue-300 mb-2" />
                  <p className="text-sm font-medium text-blue-900">Cliquer pour choisir un fichier</p>
                  <p className="text-xs text-blue-300 mt-1">Format : CSV (Nom, Prenom, Email, Matricule, Role)</p>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle size={16} className="flex-shrink-0" />{error}
                  </div>
                )}

                {preview.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#0052FF] uppercase tracking-wider mb-2">
                      Aperçu ({preview.length} utilisateur{preview.length > 1 ? 's' : ''})
                    </p>
                    <div className="overflow-x-auto border border-blue-100 rounded-lg">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-50 border-b border-blue-100">
                            {['Nom', 'Prénom', 'Email', 'Rôle'].map((h) => (
                              <th key={h} className="p-2 text-left font-semibold text-[#0052FF]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.map((u, i) => (
                            <tr key={i} className="border-b border-blue-100">
                              <td className="p-2 font-medium">{u.nom}</td>
                              <td className="p-2">{u.prenom}</td>
                              <td className="p-2 font-mono text-[11px]">{u.email}</td>
                              <td className="p-2">{u.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={11} /> Un mot de passe temporaire sera généré pour chaque utilisateur.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Annuler</Button>
                <Button variant="primary" onClick={() => { onImport(preview); onClose(); }}
                  disabled={preview.length === 0} icon={Upload}>
                  Importer {preview.length > 0 ? `(${preview.length})` : ''}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({
  user, index, onEdit, onDelete,
}: { user: UtilisateurDto; index: number; onEdit: (u: UtilisateurDto) => void; onDelete: (u: UtilisateurDto) => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      className="border-b border-blue-100 hover:bg-blue-50 transition-colors group"
    >
      <td className="p-3 pl-4">
        <div className="flex items-center gap-2.5">
          <Avatar nom={user.nom} prenom={user.prenom} />
          <div>
            <p className="font-semibold text-blue-900 text-sm leading-tight">{user.nom} {user.prenom}</p>
            {user.matricule && (
              <p className="text-[11px] text-blue-300 font-mono">{user.matricule}</p>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1.5 text-sm text-blue-500">
          <Mail size={12} className="text-blue-300 flex-shrink-0" />
          <span className="font-mono text-xs">{user.email}</span>
        </div>
      </td>
      <td className="p-3">
        {user.role ? (
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
            {user.role}
          </span>
        ) : <span className="text-blue-300 text-xs">—</span>}
      </td>
      <td className="p-3 text-sm text-blue-500">
        {user.niveauCode || <span className="text-blue-300">—</span>}
      </td>
      <td className="p-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button onClick={() => onEdit(user)} title="Modifier"
            className="p-1.5 text-[#0052FF] hover:bg-blue-100 rounded-md transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(user)} title="Supprimer"
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<UtilisateurDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof UtilisateurDto>('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UserCreateForm>(EMPTY_CREATE);
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UtilisateurDto | null>(null);
  const [editForm, setEditForm] = useState<UserEditForm>(EMPTY_EDIT);
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [isEditing, setIsEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<UtilisateurDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import
  const [importOpen, setImportOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: ++toastId.current, type, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<UtilisateurDto[]>('/Utilisateur');
      setUsers(res);
    } catch {
      addToast('error', 'Impossible de charger les utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<UtilisateurDto[]>('/Utilisateur');
        setUsers(res);
      } catch {
        addToast('error', 'Impossible de charger les utilisateurs.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [addToast]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.matricule || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      const va = String(a[sortField] ?? '');
      const vb = String(b[sortField] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field: keyof UtilisateurDto) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: keyof UtilisateurDto }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <span className="w-3" />;

  // ── Create ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setCreateErrors({});
    setCreateOpen(true);
  };

  const handleCreateChange = (field: keyof UserCreateForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
    if (createErrors[field as keyof CreateErrors]) {
      setCreateErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreate = async () => {
    const errs = validateCreate(createForm);
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setIsCreating(true);
    try {
      await api.post('/Utilisateur', {
        nom: createForm.nom.trim(),
        prenom: createForm.prenom.trim(),
        email: createForm.email.trim().toLowerCase(),
        motDePasse: createForm.motDePasse,
        matricule: createForm.matricule.trim() || undefined,
        role: createForm.role,
        niveauId: createForm.niveauId ? parseInt(createForm.niveauId, 10) : undefined,
      });
      addToast('success', `Utilisateur "${createForm.prenom} ${createForm.nom}" créé avec succès.`);
      setCreateOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      addToast('error', msg);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (user: UtilisateurDto) => {
    setEditTarget(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      matricule: user.matricule || '',
      role: user.role || '',
      niveauId: user.niveauId ? String(user.niveauId) : '',
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditChange = (field: keyof UserEditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field as keyof EditErrors]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEdit = async () => {
    const errs = validateEdit(editForm);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    if (!editTarget) return;
    setIsEditing(true);
    try {
      await api.put(`/Utilisateur/${editTarget.id}`, {
        nom: editForm.nom.trim(),
        prenom: editForm.prenom.trim(),
        email: editForm.email.trim().toLowerCase(),
        matricule: editForm.matricule.trim() || undefined,
        role: editForm.role,
        niveauId: editForm.niveauId ? parseInt(editForm.niveauId, 10) : undefined,
      });
      addToast('success', `Utilisateur "${editForm.prenom} ${editForm.nom}" modifié.`);
      setEditOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      addToast('error', msg);
    } finally {
      setIsEditing(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Utilisateur/${deleteTarget.id}`);
      addToast('success', `Utilisateur "${deleteTarget.prenom} ${deleteTarget.nom}" supprimé.`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Impossible de supprimer cet utilisateur.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async (rows: Partial<UtilisateurDto>[]) => {
    let success = 0; let fail = 0;
    for (const row of rows) {
      try {
        await api.post('/Utilisateur', {
          ...row,
          motDePasse: 'ChangeMe@2024',
        });
        success++;
      } catch { fail++; }
    }
    if (success > 0) addToast('success', `${success} utilisateur(s) importé(s).`);
    if (fail > 0) addToast('error', `${fail} utilisateur(s) n'ont pas pu être importés.`);
    fetchUsers();
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'Nom,Prenom,Email,Matricule,Role,NiveauCode';
    const rows = filtered.map((u) =>
      `"${u.nom}","${u.prenom}","${u.email}","${u.matricule || ''}","${u.role || ''}","${u.niveauCode || ''}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'utilisateurs_export.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Export CSV téléchargé.');
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = filtered.map((u) => `
      <tr>
        <td>${u.nom} ${u.prenom}</td>
        <td>${u.email}</td>
        <td>${u.role || '—'}</td>
        <td>${u.matricule || '—'}</td>
        <td>${u.niveauCode || '—'}</td>
      </tr>`).join('');
    win.document.write(`
      <html><head><title>Utilisateurs — EMIT</title>
      <style>body{font-family:sans-serif;padding:20px}h1{color:#0A2B4E;font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}th{background:#0A2B4E;color:#fff;padding:8px;text-align:left}td{padding:6px 8px;border-bottom:1px solid #e2e8f0}</style>
      </head><body>
      <h1>Liste des Utilisateurs — EMIT</h1>
      <p style="font-size:12px;color:#666">Exporté le ${new Date().toLocaleDateString('fr-FR')} — ${filtered.length} utilisateur(s)</p>
      <table><thead><tr><th>Nom & Prénom</th><th>Email</th><th>Rôle</th><th>Matricule</th><th>Niveau</th></tr></thead>
      <tbody>${rows}</tbody></table>
      </body></html>`);
    win.document.close(); win.print();
    addToast('success', 'PDF généré via la fenêtre d\'impression.');
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const byRole = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <    ProtectedLayout pageTitle="Utilisateurs">
      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
        </AnimatePresence>
      </div>

      <div>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-blue-500">Gestion des comptes et des accès de la plateforme EMIT.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-100 rounded-lg text-xs font-semibold text-blue-500 hover:bg-blue-50 transition-colors duration-150">
                <FileSpreadsheet size={14} className="text-green-600" /> CSV
              </button>
              <button onClick={exportPDF}
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-100 rounded-lg text-xs font-semibold text-blue-500 hover:bg-blue-50 transition-colors duration-150">
                <FileText size={14} className="text-red-500" /> PDF
              </button>
            </div>
            <Button variant="secondary" icon={Upload} onClick={() => setImportOpen(true)}>Importer</Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>Ajouter un utilisateur</Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3 sm:col-span-1">
            <div className="text-2xl font-bold text-[#0052FF]">{users.length}</div>
            <div className="text-xs text-blue-500 mt-0.5">Total</div>
          </div>
          {ROLES.map((role) => (
            <div key={role} className="bg-white rounded-xl border border-blue-100 shadow-sm p-3">
              <div className={`text-2xl font-bold ${
                role === 'Admin' ? 'text-red-600' :
                role === 'Professeur' ? 'text-blue-600' :
                role === 'Etudiant' ? 'text-green-600' : 'text-purple-600'
              }`}>{byRole[role] || 0}</div>
              <div className="text-xs text-blue-500 mt-0.5">{role}s</div>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3 mb-4 space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, matricule, rôle..."
                className="w-full pl-9 pr-8 py-2 border border-blue-100 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-900">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                showFilters || filterRole
                  ? 'border-[#0052FF] bg-blue-100 text-[#0052FF]'
                  : 'border-blue-100 text-blue-900 hover:bg-blue-50'
              }`}
            >
              <Filter size={14} /> Filtres {filterRole && <span className="w-1.5 h-1.5 bg-[#0052FF] rounded-full" />}
            </button>
            <button onClick={fetchUsers} title="Rafraîchir"
              className="p-2 border border-blue-100 rounded-md text-blue-500 hover:text-[#0052FF] hover:bg-blue-50 transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-3 flex-wrap pt-1 border-t border-blue-100 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0052FF] uppercase tracking-wider">Rôle :</label>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-blue-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#0052FF]">
                    <option value="">Tous</option>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {filterRole && (
                  <button onClick={() => setFilterRole('')}
                    className="text-xs text-[#0052FF] hover:underline font-medium">Réinitialiser</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-blue-300">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {users.length === 0 ? 'Aucun utilisateur enregistré.' : 'Aucun résultat pour cette recherche.'}
            </p>
            {users.length === 0 && (
              <button onClick={openCreate} className="mt-3 text-sm text-[#0052FF] hover:underline font-semibold">
                + Ajouter le premier utilisateur
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-blue-300 mb-2 px-1">
              {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
              {users.length !== filtered.length && ` sur ${users.length}`}
            </div>
            <div className="bg-white border border-blue-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50">
                    {[
                      { key: 'nom', label: 'Utilisateur' },
                      { key: 'email', label: 'Email' },
                      { key: 'role', label: 'Rôle' },
                      { key: 'niveauCode', label: 'Niveau' },
                    ].map(({ key, label }) => (
                      <th key={key} onClick={() => toggleSort(key as keyof UtilisateurDto)}
                        className="p-3 pl-4 text-left font-bold text-[#0052FF] uppercase tracking-wider text-xs cursor-pointer select-none hover:text-[#0052FF] transition-colors">
                        <span className="inline-flex items-center gap-1">
                          {label} <SortIcon field={key as keyof UtilisateurDto} />
                        </span>
                      </th>
                    ))}
                    <th className="p-3 pr-4 text-right font-bold text-[#0052FF] uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <UserRow key={user.id} user={user} index={i} onEdit={openEdit} onDelete={setDeleteTarget} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <CreateModal
        isOpen={createOpen} form={createForm} errors={createErrors} isSubmitting={isCreating}
        onClose={() => setCreateOpen(false)} onChange={handleCreateChange} onSubmit={handleCreate}
      />
      <EditModal
        isOpen={editOpen} user={editTarget} form={editForm} errors={editErrors} isSubmitting={isEditing}
        onClose={() => setEditOpen(false)} onChange={handleEditChange} onSubmit={handleEdit}
      />
      <DeleteModal
        user={deleteTarget} isDeleting={isDeleting}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ImportModal
        isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport}
      />
    </ProtectedLayout>
  );
}
