'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, X, CheckCircle, AlertCircle,
  Upload, Download, FileSpreadsheet, FileText, Building2,
  Users, ChevronDown, ChevronUp, Filter, RefreshCw, Eye,
  EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────
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

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TYPES_SALLE = ['Amphithéâtre', 'Laboratoire', 'Salle de cours', 'Salle informatique', 'Salle de TP', 'Autre'];

const EMPTY_FORM: SalleForm = {
  codeSalle: '',
  libelle: '',
  capacite: '',
  equipements: '',
  estActive: true,
  type: '',
};

// ─── Validation ──────────────────────────────────────────────────────────────
function validateForm(form: SalleForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.codeSalle.trim()) {
    errors.codeSalle = 'Le code est requis.';
  } else if (form.codeSalle.trim().length > 20) {
    errors.codeSalle = 'Max 20 caractères.';
  } else if (!/^[A-Z0-9_\-]+$/i.test(form.codeSalle.trim())) {
    errors.codeSalle = 'Lettres, chiffres, tirets uniquement.';
  }

  if (!form.libelle.trim()) {
    errors.libelle = 'Le libellé est requis.';
  } else if (form.libelle.trim().length > 100) {
    errors.libelle = 'Max 100 caractères.';
  }

  const cap = parseInt(form.capacite, 10);
  if (!form.capacite) {
    errors.capacite = 'La capacité est requise.';
  } else if (isNaN(cap) || cap < 1 || cap > 500) {
    errors.capacite = 'Entre 1 et 500 personnes.';
  }

  if (!form.type) {
    errors.type = 'Le type est requis.';
  }

  return errors;
}

// ─── Toast Component ─────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] ${
        toast.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────
function Field({
  label, required, error, children
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-[#0052FF] uppercase tracking-wider">
        {label}{required && <span className="text-[#0052FF] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function SalleModal({
  isOpen,
  mode,
  form,
  errors,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  mode: 'create' | 'edit';
  form: SalleForm;
  errors: FormErrors;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof SalleForm, value: string | boolean) => void;
  onSubmit: () => void;
}) {
  const inputClass = (hasError?: string) =>
    `w-full px-3 py-2 border rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] ${
      hasError ? 'border-red-400 bg-red-50/30' : 'border-blue-100 bg-white'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-blue-100">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 size={16} className="text-[#0052FF]" />
                  </div>
                  <h2 className="text-base font-bold text-[#0052FF]">
                    {mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-blue-300 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Code salle" required error={errors.codeSalle}>
                    <input
                      type="text"
                      placeholder="Ex: A101"
                      value={form.codeSalle}
                      onChange={(e) => onChange('codeSalle', e.target.value.toUpperCase())}
                      maxLength={20}
                      className={inputClass(errors.codeSalle)}
                    />
                  </Field>

                  <Field label="Type" required error={errors.type}>
                    <select
                      value={form.type}
                      onChange={(e) => onChange('type', e.target.value)}
                      className={inputClass(errors.type)}
                    >
                      <option value="">Choisir...</option>
                      {TYPES_SALLE.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Libellé" required error={errors.libelle}>
                  <input
                    type="text"
                    placeholder="Ex: Salle A - Bâtiment Principal"
                    value={form.libelle}
                    onChange={(e) => onChange('libelle', e.target.value)}
                    maxLength={100}
                    className={inputClass(errors.libelle)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Capacité (personnes)" required error={errors.capacite}>
                    <input
                      type="number"
                      placeholder="Ex: 30"
                      value={form.capacite}
                      onChange={(e) => onChange('capacite', e.target.value)}
                      min={1}
                      max={500}
                      className={inputClass(errors.capacite)}
                    />
                  </Field>

                  <Field label="Statut">
                    <button
                      type="button"
                      onClick={() => onChange('estActive', !form.estActive)}
                      className={`w-full flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium transition-all ${
                        form.estActive
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-red-300 bg-red-50 text-red-600'
                      }`}
                    >
                      {form.estActive ? (
                        <><ToggleRight size={18} /> Active</>
                      ) : (
                        <><ToggleLeft size={18} /> Inactive</>
                      )}
                    </button>
                  </Field>
                </div>

                <Field label="Équipements (optionnel)">
                  <textarea
                    placeholder="Ex: Projecteur, tableau blanc, climatisation..."
                    value={form.equipements}
                    onChange={(e) => onChange('equipements', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-blue-100 rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] resize-none"
                  />
                </Field>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={onSubmit}
                  isLoading={isSubmitting}
                >
                  {mode === 'create' ? 'Créer la salle' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({
  salle,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  salle: Salle | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {salle && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-red-100 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-blue-900 text-center mb-1">
                Supprimer la salle ?
              </h3>
              <p className="text-sm text-blue-500 text-center mb-5">
                La salle <strong className="text-blue-900">{salle.codeSalle} — {salle.libelle}</strong> sera
                définitivement supprimée. Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 py-2 border border-blue-100 rounded-md text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                >
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
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (salles: Partial<Salle>[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Partial<Salle>[]>([]);

  const parseCSV = (text: string): Partial<Salle>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('Le fichier est vide ou ne contient que des en-têtes.');
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { obj[h] = vals[i] || ''; });
      const cap = parseInt(obj['capacite'] || obj['capacity'] || '0', 10);
      return {
        codeSalle: (obj['codesalle'] || obj['code'] || '').toUpperCase(),
        libelle: obj['libelle'] || obj['nom'] || obj['name'] || '',
        capacite: isNaN(cap) ? 0 : cap,
        type: obj['type'] || '',
        equipements: obj['equipements'] || obj['equipement'] || '',
        estActive: (obj['estactive'] || obj['actif'] || 'true').toLowerCase() !== 'false',
      };
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv'].includes(ext || '')) {
      setError('Seuls les fichiers CSV sont supportés pour l\'import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = parseCSV(text);
        if (data.length === 0) { setError('Aucune salle valide trouvée.'); return; }
        setPreview(data.slice(0, 5));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur de lecture du fichier.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (preview.length > 0) {
      onImport(preview);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const csv = 'CodeSalle,Libelle,Capacite,Type,Equipements,EstActive\nA101,Salle A101,30,Salle de cours,"Projecteur, tableau",true\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'template_salles.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-blue-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Upload size={16} className="text-[#0052FF]" />
                  </div>
                  <h2 className="text-base font-bold text-[#0052FF]">Importer des salles</h2>
                </div>
                <button onClick={onClose} className="p-1.5 text-blue-300 hover:text-blue-900 rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-sm text-blue-500">Télécharger le modèle CSV</div>
                  <button onClick={downloadTemplate}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0052FF] hover:text-[#0052FF] transition-colors">
                    <Download size={14} /> Modèle CSV
                  </button>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-blue-100 rounded-xl p-8 text-center cursor-pointer hover:border-[#0052FF]/50 hover:bg-blue-100 transition-all"
                >
                  <FileSpreadsheet size={32} className="mx-auto text-blue-300 mb-2" />
                  <p className="text-sm font-medium text-blue-900">Cliquer pour choisir un fichier</p>
                  <p className="text-xs text-blue-300 mt-1">Format accepté : CSV</p>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle size={16} className="flex-shrink-0" /> {error}
                  </div>
                )}

                {preview.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#0052FF] uppercase tracking-wider mb-2">
                      Aperçu ({preview.length} ligne{preview.length > 1 ? 's' : ''})
                    </p>
                    <div className="overflow-x-auto border border-blue-100 rounded-lg">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-50 border-b border-blue-100">
                            <th className="p-2 text-left font-semibold text-[#0052FF]">Code</th>
                            <th className="p-2 text-left font-semibold text-[#0052FF]">Libellé</th>
                            <th className="p-2 text-left font-semibold text-[#0052FF]">Capa.</th>
                            <th className="p-2 text-left font-semibold text-[#0052FF]">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.map((s, i) => (
                            <tr key={i} className="border-b border-blue-100 hover:bg-blue-50">
                              <td className="p-2 font-mono">{s.codeSalle}</td>
                              <td className="p-2">{s.libelle}</td>
                              <td className="p-2">{s.capacite}</td>
                              <td className="p-2">{s.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Annuler</Button>
                <Button variant="primary" onClick={handleConfirm} disabled={preview.length === 0} icon={Upload}>
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

// ─── Salle Row ────────────────────────────────────────────────────────────────
function SalleRow({
  salle,
  index,
  onEdit,
  onDelete,
}: {
  salle: Salle;
  index: number;
  onEdit: (s: Salle) => void;
  onDelete: (s: Salle) => void;
}) {
  const typeColors: Record<string, string> = {
    'Amphithéâtre': 'bg-purple-100 text-purple-700',
    'Laboratoire': 'bg-blue-100 text-blue-700',
    'Salle de cours': 'bg-green-100 text-green-700',
    'Salle informatique': 'bg-cyan-100 text-cyan-700',
    'Salle de TP': 'bg-amber-100 text-amber-700',
    'Autre': 'bg-gray-100 text-gray-600',
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-blue-100 hover:bg-blue-50 transition-colors group"
    >
      <td className="p-3 pl-4">
        <span className="font-mono text-xs font-bold text-[#0052FF] bg-blue-100 px-2 py-0.5 rounded">
          {salle.codeSalle}
        </span>
      </td>
      <td className="p-3 font-medium text-blue-900 text-sm">{salle.libelle}</td>
      <td className="p-3">
        {salle.type ? (
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[salle.type] || 'bg-gray-100 text-gray-600'}`}>
            {salle.type}
          </span>
        ) : (
          <span className="text-blue-300 text-xs">—</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Users size={13} className="text-blue-300" />
          <span className="font-semibold text-blue-900">{salle.capacite}</span>
        </div>
      </td>
      <td className="p-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          salle.estActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {salle.estActive ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Inactive</>}
        </span>
      </td>
      <td className="p-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button
            onClick={() => onEdit(salle)}
            title="Modifier"
            className="p-1.5 text-[#0052FF] hover:bg-blue-100 rounded-md transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(salle)}
            title="Supprimer"
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof Salle>('codeSalle');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<SalleForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Salle | null>(null);
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

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [addToast]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = salles
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.codeSalle.toLowerCase().includes(q) ||
        s.libelle.toLowerCase().includes(q) ||
        (s.type || '').toLowerCase().includes(q) ||
        (s.equipements || '').toLowerCase().includes(q);
      const matchType = !filterType || s.type === filterType;
      const matchStatus =
        filterStatus === '' ||
        (filterStatus === 'active' && s.estActive) ||
        (filterStatus === 'inactive' && !s.estActive);
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      const va = String(a[sortField] ?? '');
      const vb = String(b[sortField] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field: keyof Salle) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: keyof Salle }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <span className="w-3" />;

  // ── Open modals ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditId(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (salle: Salle) => {
    setForm({
      codeSalle: salle.codeSalle,
      libelle: salle.libelle,
      capacite: String(salle.capacite),
      equipements: salle.equipements || '',
      estActive: salle.estActive,
      type: salle.type || '',
    });
    setErrors({});
    setEditId(salle.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleFormChange = (field: keyof SalleForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    const payload = {
      codeSalle: form.codeSalle.trim(),
      libelle: form.libelle.trim(),
      capacite: parseInt(form.capacite, 10),
      equipements: form.equipements.trim() || undefined,
      estActive: form.estActive,
      type: form.type,
    };
    try {
      if (modalMode === 'create') {
        await api.post('/Salles', payload);
        addToast('success', `Salle "${payload.codeSalle}" créée avec succès.`);
      } else {
        await api.put(`/Salles/${editId}`, { ...payload, id: editId });
        addToast('success', `Salle "${payload.codeSalle}" modifiée avec succès.`);
      }
      setModalOpen(false);
      fetchSalles();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Une erreur est survenue.';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Salles/${deleteTarget.id}`);
      addToast('success', `Salle "${deleteTarget.codeSalle}" supprimée.`);
      setSalles((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Impossible de supprimer cette salle.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = async (rows: Partial<Salle>[]) => {
    let success = 0;
    let fail = 0;
    for (const row of rows) {
      try {
        await api.post('/Salles', row);
        success++;
      } catch { fail++; }
    }
    if (success > 0) addToast('success', `${success} salle(s) importée(s) avec succès.`);
    if (fail > 0) addToast('error', `${fail} salle(s) n'ont pas pu être importées.`);
    fetchSalles();
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'CodeSalle,Libelle,Capacite,Type,Equipements,EstActive';
    const rows = filtered.map(
      (s) =>
        `"${s.codeSalle}","${s.libelle}",${s.capacite},"${s.type || ''}","${s.equipements || ''}",${s.estActive}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'salles_export.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Export CSV téléchargé.');
  };

  const exportPDF = () => {
    // Print-based PDF export
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = filtered
      .map(
        (s) => `<tr>
          <td>${s.codeSalle}</td>
          <td>${s.libelle}</td>
          <td>${s.type || '—'}</td>
          <td>${s.capacite}</td>
          <td>${s.estActive ? 'Active' : 'Inactive'}</td>
          <td>${s.equipements || '—'}</td>
        </tr>`
      )
      .join('');
    win.document.write(`
      <html><head><title>Salles — EMIT</title>
      <style>body{font-family:sans-serif;padding:20px} h1{color:#0A2B4E;font-size:18px} table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px} th{background:#0A2B4E;color:#fff;padding:8px;text-align:left} td{padding:6px 8px;border-bottom:1px solid #e2e8f0}</style>
      </head><body>
      <h1>Liste des Salles — EMIT</h1>
      <p style="font-size:12px;color:#666">Exporté le ${new Date().toLocaleDateString('fr-FR')}</p>
      <table><thead><tr><th>Code</th><th>Libellé</th><th>Type</th><th>Capacité</th><th>Statut</th><th>Équipements</th></tr></thead>
      <tbody>${rows}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.print();
    addToast('success', 'PDF généré via la fenêtre d\'impression.');
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalActive = salles.filter((s) => s.estActive).length;
  const totalCapacity = salles.reduce((sum, s) => sum + s.capacite, 0);

  return (
    <ProtectedLayout pageTitle="Salles">
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      <div className="p-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0052FF]">Gestion des Salles</h1>
            <p className="text-blue-500 mt-1 text-sm">
              Configurez et g&eacute;rez les ressources physiques de l&apos;EMIT.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export */}
            <div className="flex items-center gap-1">
              <button
                onClick={exportCSV}
                title="Exporter CSV"
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-100 rounded-md text-xs font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-green-600" /> CSV
              </button>
              <button
                onClick={exportPDF}
                title="Exporter PDF"
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-100 rounded-md text-xs font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
              >
                <FileText size={14} className="text-red-500" /> PDF
              </button>
            </div>
            <Button variant="secondary" icon={Upload} onClick={() => setImportOpen(true)}>
              Importer
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Ajouter une salle
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total salles', value: salles.length, color: 'text-[#0052FF]' },
            { label: 'Salles actives', value: totalActive, color: 'text-green-600' },
            { label: 'Salles inactives', value: salles.length - totalActive, color: 'text-red-500' },
            { label: 'Capacité totale', value: `${totalCapacity} pers.`, color: 'text-[#0052FF]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-blue-100 rounded-lg p-3">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-blue-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white border border-blue-100 rounded-lg p-3 mb-4 space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par code, libellé, type, équipements..."
                className="w-full pl-9 pr-4 py-2 border border-blue-100 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                showFilters || filterType || filterStatus
                  ? 'border-[#0052FF] bg-blue-100 text-[#0052FF]'
                  : 'border-blue-100 text-blue-900 hover:bg-blue-50'
              }`}
            >
              <Filter size={14} />
              Filtres
              {(filterType || filterStatus) && (
                <span className="w-1.5 h-1.5 bg-[#0052FF] rounded-full" />
              )}
            </button>
            <button
              onClick={fetchSalles}
              title="Rafraîchir"
              className="p-2 border border-blue-100 rounded-md text-blue-500 hover:text-[#0052FF] hover:bg-blue-50 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-3 flex-wrap pt-1 border-t border-blue-100"
              >
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0052FF] uppercase tracking-wider">Type :</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-blue-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#0052FF]"
                  >
                    <option value="">Tous</option>
                    {TYPES_SALLE.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0052FF] uppercase tracking-wider">Statut :</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-blue-100 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#0052FF]"
                  >
                    <option value="">Tous</option>
                    <option value="active">Actives</option>
                    <option value="inactive">Inactives</option>
                  </select>
                </div>
                {(filterType || filterStatus) && (
                  <button
                    onClick={() => { setFilterType(''); setFilterStatus(''); }}
                    className="text-xs text-[#0052FF] hover:underline font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-blue-300">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {salles.length === 0 ? 'Aucune salle enregistrée.' : 'Aucun résultat pour cette recherche.'}
            </p>
            {salles.length === 0 && (
              <button onClick={openCreate} className="mt-3 text-sm text-[#0052FF] hover:underline font-semibold">
                + Ajouter la première salle
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-blue-300 mb-2 px-1">
              {filtered.length} salle{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
              {salles.length !== filtered.length && ` sur ${salles.length}`}
            </div>
            <div className="bg-white border border-blue-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50">
                    {[
                      { key: 'codeSalle', label: 'Code' },
                      { key: 'libelle', label: 'Libellé' },
                      { key: 'type', label: 'Type' },
                      { key: 'capacite', label: 'Capacité' },
                      { key: 'estActive', label: 'Statut' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key as keyof Salle)}
                        className="p-3 pl-4 text-left font-bold text-[#0052FF] uppercase tracking-wider text-xs cursor-pointer select-none hover:text-[#0052FF] transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label} <SortIcon field={key as keyof Salle} />
                        </span>
                      </th>
                    ))}
                    <th className="p-3 pr-4 text-right font-bold text-[#0052FF] uppercase tracking-wider text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((salle, i) => (
                    <SalleRow
                      key={salle.id}
                      salle={salle}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <SalleModal
        isOpen={modalOpen}
        mode={modalMode}
        form={form}
        errors={errors}
        isSubmitting={isSubmitting}
        onClose={() => setModalOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />

      <DeleteModal
        salle={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </ProtectedLayout>
  );
}