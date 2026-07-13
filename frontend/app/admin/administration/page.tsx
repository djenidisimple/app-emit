'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, BookOpen, FolderTree, GraduationCap, BookMarked, AlertCircle, Users, X } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { FiliereHierarchyDto, ParcoursHierarchyDto, NiveauHierarchyDto, MatiereHierarchyDto, Affectation, AffectationCreateDto } from '@/types';
import { api } from '@/services/api';

const inputCls = 'w-full px-3 py-2 border border-border rounded-md text-sm text-fg-default bg-surface outline-none focus:border-accent';

// ─── Accordion Row ───────────────────────────────────────────
function AccordionRow({
  label,
  sublabel,
  depth,
  defaultOpen,
  children,
}: {
  label: string;
  sublabel?: string;
  depth: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-[#111827] hover:bg-[#F7F7FA] rounded-lg transition-colors"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <Icon className="w-4 h-4 text-[#8A8FA3] shrink-0" />
        <span>{label}</span>
        {sublabel && <span className="text-xs text-[#8A8FA3] font-normal ml-1">{sublabel}</span>}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Inline Form ──────────────────────────────────────────────
function InlineForm({
  fields,
  onSubmit,
  onCancel,
  submitLabel,
  style,
}: {
  fields: { key: string; label: string; placeholder: string; value: string; onChange: (v: string) => void }[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="flex items-end gap-2 px-3 py-2" style={{ paddingLeft: '36px', ...style }}>
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-0.5">
          <label className="text-[10px] font-semibold text-[#8A8FA3] uppercase tracking-wider">{f.label}</label>
            <input
              type="text"
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="w-40 px-2.5 py-1.5 border border-border rounded-xl text-xs text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
        </div>
      ))}
      <button onClick={onSubmit} className="bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:opacity-90 shadow-sm transition-all">{submitLabel}</button>
      <button onClick={onCancel} className="border border-border text-text-secondary text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-bg-muted transition-colors">Annuler</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminAdministrationPage() {
  const [data, setData] = useState<FiliereHierarchyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFiliere, setExpandedFiliere] = useState<number | null>(null);
  const [expandedParcours, setExpandedParcours] = useState<number | null>(null);
  const [expandedNiveau, setExpandedNiveau] = useState<number | null>(null);

  // Creation state
  const [showNewFiliere, setShowNewFiliere] = useState(false);
  const [newFiliereNom, setNewFiliereNom] = useState('');

  const [newParcoursFiliereId, setNewParcoursFiliereId] = useState<number | null>(null);
  const [newParcoursNom, setNewParcoursNom] = useState('');
  const [newParcoursDesc, setNewParcoursDesc] = useState('');

  const [newNiveauParcoursId, setNewNiveauParcoursId] = useState<number | null>(null);
  const [newNiveauCode, setNewNiveauCode] = useState('');

  const [newMatiereNiveauId, setNewMatiereNiveauId] = useState<number | null>(null);
  const [newMatiereCode, setNewMatiereCode] = useState('');
  const [newMatiereNom, setNewMatiereNom] = useState('');

  // Edit state
  const [editFiliere, setEditFiliere] = useState<{ id: number; nom: string } | null>(null);
  const [editParcours, setEditParcours] = useState<{ id: number; nom: string; description: string; filiereId: number } | null>(null);
  const [editNiveau, setEditNiveau] = useState<{ id: number; code: string; parcoursId: number } | null>(null);
  const [editMatiere, setEditMatiere] = useState<{ id: number; code: string; nom: string; description: string; niveauId: number } | null>(null);

  // Prof assignment state
  const [profModal, setProfModal] = useState<{ open: boolean; matiereId: number; matiereNom: string }>({ open: false, matiereId: 0, matiereNom: '' });
  const [professeurs, setProfesseurs] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [selectedProfId, setSelectedProfId] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get<FiliereHierarchyDto[]>('/hierarchy');
      setData(res);
    } catch {
      setError('Impossible de charger la hiérarchie.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD helpers ──
  const createFiliere = async () => {
    if (!newFiliereNom.trim()) return;
    try {
      await api.post('/filieres', { nom: newFiliereNom.trim() });
      setShowNewFiliere(false); setNewFiliereNom(''); fetchData();
    } catch { setError('Erreur création filière.'); }
  };

  const updateFiliere = async () => {
    if (!editFiliere) return;
    try {
      await api.put(`/filieres/${editFiliere.id}`, { nom: editFiliere.nom });
      setEditFiliere(null); fetchData();
    } catch { setError('Erreur modification filière.'); }
  };

  const deleteFiliere = async (id: number) => {
    if (!confirm('Supprimer cette filière et tous ses parcours/niveaux/matières ?')) return;
    try { await api.delete(`/filieres/${id}`); fetchData(); }
    catch { setError('Erreur suppression filière.'); }
  };

  const createParcours = async () => {
    if (!newParcoursNom.trim() || newParcoursFiliereId === null) return;
    try {
      await api.post('/parcours', { nom: newParcoursNom.trim(), description: newParcoursDesc.trim() || null, filiereId: newParcoursFiliereId });
      setNewParcoursFiliereId(null); setNewParcoursNom(''); setNewParcoursDesc(''); fetchData();
    } catch { setError('Erreur création parcours.'); }
  };

  const updateParcours = async () => {
    if (!editParcours) return;
    try {
      await api.put(`/parcours/${editParcours.id}`, { nom: editParcours.nom, description: editParcours.description || null, filiereId: editParcours.filiereId });
      setEditParcours(null); fetchData();
    } catch { setError('Erreur modification parcours.'); }
  };

  const deleteParcours = async (id: number) => {
    if (!confirm('Supprimer ce parcours et ses niveaux/matières ?')) return;
    try { await api.delete(`/parcours/${id}`); fetchData(); }
    catch { setError('Erreur suppression parcours.'); }
  };

  const createNiveau = async () => {
    if (!newNiveauCode.trim() || newNiveauParcoursId === null) return;
    try {
      await api.post('/niveau', { code: newNiveauCode.trim().toUpperCase(), parcoursId: newNiveauParcoursId });
      setNewNiveauParcoursId(null); setNewNiveauCode(''); fetchData();
    } catch { setError('Erreur création niveau.'); }
  };

  const updateNiveau = async () => {
    if (!editNiveau) return;
    try {
      await api.put(`/niveau/${editNiveau.id}`, { code: editNiveau.code, parcoursId: editNiveau.parcoursId });
      setEditNiveau(null); fetchData();
    } catch { setError('Erreur modification niveau.'); }
  };

  const deleteNiveau = async (id: number) => {
    if (!confirm('Supprimer ce niveau et ses matières ?')) return;
    try { await api.delete(`/niveau/${id}`); fetchData(); }
    catch { setError('Erreur suppression niveau.'); }
  };

  const createMatiere = async () => {
    if (!newMatiereCode.trim() || !newMatiereNom.trim() || newMatiereNiveauId === null) return;
    try {
      await api.post('/matieres', { code: newMatiereCode.trim().toUpperCase(), nom: newMatiereNom.trim(), niveauId: newMatiereNiveauId });
      setNewMatiereNiveauId(null); setNewMatiereCode(''); setNewMatiereNom(''); fetchData();
    } catch { setError('Erreur création matière.'); }
  };

  const updateMatiere = async () => {
    if (!editMatiere) return;
    try {
      await api.put(`/matieres/${editMatiere.id}`, { code: editMatiere.code, nom: editMatiere.nom, description: editMatiere.description || null, niveauId: editMatiere.niveauId });
      setEditMatiere(null); fetchData();
    } catch { setError('Erreur modification matière.'); }
  };

  const deleteMatiere = async (id: number) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try { await api.delete(`/matieres/${id}`); fetchData(); }
    catch { setError('Erreur suppression matière.'); }
  };

  // ── Prof assignment handlers ──
  const openProfModal = async (matiereId: number, matiereNom: string) => {
    setSelectedProfId(0);
    setProfModal({ open: true, matiereId, matiereNom });
    try {
      const [profsRes, affsRes] = await Promise.all([
        api.get<{ id: number; nom: string; prenom: string }[]>('/utilisateurs?role=Professeur'),
        api.get<Affectation[]>('/affectations'),
      ]);
      setProfesseurs(profsRes);
      setAffectations(affsRes);
    } catch { setError('Erreur chargement données.'); }
  };

  const handleAddAffectation = async () => {
    if (!selectedProfId) return;
    try {
      const created = await api.post<Affectation>('/affectations', { professeurId: selectedProfId, matiereId: profModal.matiereId } as AffectationCreateDto);
      setAffectations((prev) => [...prev, created]);
      setSelectedProfId(0);
    } catch { setError("Erreur d'ajout d'affectation."); }
  };

  const handleRemoveAffectation = async (affId: number) => {
    try {
      await api.delete(`/affectations/${affId}`);
      setAffectations((prev) => prev.filter((a) => a.id !== affId));
    } catch { setError("Erreur de suppression d'affectation."); }
  };

  const affectationsForMatiere = (matiereId: number) => affectations.filter((a) => a.matiereId === matiereId);

  return (
    <ProtectedLayout pageTitle="Administration">
      {/* Error */}
      {error && (
        <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-2.5 text-sm text-[#ef4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Legend / Stats */}
      <div className="flex items-center gap-6 mb-5 text-xs text-[#8A8FA3]">
        <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Filières</span>
        <span className="flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5" /> Parcours</span>
        <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Niveaux</span>
        <span className="flex items-center gap-1.5"><BookMarked className="w-3.5 h-3.5" /> Matières</span>
      </div>

      {/* Loading */}
      {isLoading ? (
        <LoadingSkeleton lines={8} className="bg-surface rounded-lg border border-border p-5" />
      ) : (
        <div className="bg-surface border border-neutral-200 rounded-[8px] overflow-hidden">
          {/* ─── Add Filière Button ─── */}
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-end">
            {showNewFiliere ? (
              <InlineForm
                fields={[
                  { key: 'nom', label: 'Nom', placeholder: 'Ex: Informatique', value: newFiliereNom, onChange: setNewFiliereNom },
                ]}
                onSubmit={createFiliere}
                onCancel={() => { setShowNewFiliere(false); setNewFiliereNom(''); }}
                submitLabel="Créer"
              />
            ) : (
              <button onClick={() => setShowNewFiliere(true)}
                className="bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> Ajouter une filière
              </button>
            )}
          </div>

          {/* ─── Tree ─── */}
          {data.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#8A8FA3]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-[#111827]">Aucune filière</p>
              <p>Ajoutez une filière pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {data.map((filiere) => {
                const filiereOpen = expandedFiliere === filiere.id;
                return (
                  <div key={filiere.id}>
                    {/* ── Filière Row ── */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F7F7FA] cursor-pointer"
                      onClick={() => setExpandedFiliere(filiereOpen ? null : filiere.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {filiereOpen ? <ChevronDown className="w-4 h-4 text-[#8A8FA3] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#8A8FA3] shrink-0" />}
                        <BookOpen className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm font-medium text-[#111827]">{filiere.nom}</span>
                        <span className="text-[10px] text-[#8A8FA3] bg-[#F7F7FA] px-2 py-0.5 rounded-full">{filiere.parcours.length} parcours</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEditFiliere({ id: filiere.id, nom: filiere.nom })}
                          className="p-1 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteFiliere(filiere.id)}
                          className="p-1 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* ── Edit Filière Form ── */}
                    {editFiliere && editFiliere.id === filiere.id && (
                      <InlineForm
                        fields={[
                          { key: 'nom', label: 'Nom', placeholder: 'Nom', value: editFiliere.nom, onChange: (v) => setEditFiliere({ ...editFiliere, nom: v }) },
                        ]}
                        onSubmit={updateFiliere}
                        onCancel={() => setEditFiliere(null)}
                        submitLabel="Enregistrer"
                      />
                    )}

                    {/* ── Parcours ── */}
                    {filiereOpen && (
                      <div className="bg-[#FAFAFC]">
                        {/* Add Parcours button per filière */}
                        <div className="px-4 py-1.5 flex items-center justify-end border-b border-neutral-100">
                          {newParcoursFiliereId === filiere.id ? (
                            <InlineForm
                              fields={[
                                { key: 'nom', label: 'Nom', placeholder: 'Ex: GL', value: newParcoursNom, onChange: setNewParcoursNom },
                                { key: 'desc', label: 'Description', placeholder: 'Optionnelle', value: newParcoursDesc, onChange: setNewParcoursDesc },
                              ]}
                              onSubmit={createParcours}
                              onCancel={() => { setNewParcoursFiliereId(null); setNewParcoursNom(''); setNewParcoursDesc(''); }}
                              submitLabel="Créer"
                            />
                          ) : (
                            <button onClick={() => setNewParcoursFiliereId(filiere.id)}
                              className="text-accent text-xs font-medium flex items-center gap-1 hover:underline">
                              <Plus className="w-3 h-3" /> Ajouter un parcours
                            </button>
                          )}
                        </div>

                        {filiere.parcours.length === 0 ? (
                          <div className="px-6 py-3 text-xs text-[#8A8FA3] italic">Aucun parcours</div>
                        ) : (
                          filiere.parcours.map((parcours) => {
                            const parcoursOpen = expandedParcours === parcours.id;
                            return (
                              <div key={parcours.id}>
                                {/* ── Parcours Row ── */}
                                <div
                                  className="flex items-center justify-between px-4 py-2 hover:bg-[#F7F7FA] cursor-pointer border-b border-neutral-100"
                                  onClick={() => setExpandedParcours(parcoursOpen ? null : parcours.id)}
                                  style={{ paddingLeft: '48px' }}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {parcoursOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#8A8FA3] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8A8FA3] shrink-0" />}
                                    <FolderTree className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                                    <span className="text-sm text-[#111827]">{parcours.nom}</span>
                                    {parcours.description && <span className="text-xs text-[#8A8FA3] truncate max-w-[200px]">— {parcours.description}</span>}
                                    <span className="text-[10px] text-[#8A8FA3] bg-[#F7F7FA] px-2 py-0.5 rounded-full">{parcours.niveaux.length} niveaux</span>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => setEditParcours({ id: parcours.id, nom: parcours.nom, description: parcours.description || '', filiereId: filiere.id })}
                                      className="p-1 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => deleteParcours(parcours.id)}
                                      className="p-1 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>

                                {/* ── Edit Parcours Form ── */}
                                {editParcours && editParcours.id === parcours.id && (
                                  <InlineForm
                                    fields={[
                                      { key: 'nom', label: 'Nom', placeholder: 'Nom', value: editParcours.nom, onChange: (v) => setEditParcours({ ...editParcours, nom: v }) },
                                      { key: 'desc', label: 'Description', placeholder: 'Description', value: editParcours.description, onChange: (v) => setEditParcours({ ...editParcours, description: v }) },
                                    ]}
                                    onSubmit={updateParcours}
                                    onCancel={() => setEditParcours(null)}
                                    submitLabel="Enregistrer"
                                    style={{ paddingLeft: '72px' }}
                                  />
                                )}

                                {/* ── Niveaux ── */}
                                {parcoursOpen && (
                                  <div className="bg-white">
                                    {/* Add Niveau button per parcours */}
                                    <div className="px-4 py-1.5 flex items-center justify-end border-b border-neutral-100" style={{ paddingLeft: '72px' }}>
                                      {newNiveauParcoursId === parcours.id ? (
                                        <InlineForm
                                          fields={[
                                            { key: 'code', label: 'Code', placeholder: 'Ex: L3', value: newNiveauCode, onChange: setNewNiveauCode },
                                          ]}
                                          onSubmit={createNiveau}
                                          onCancel={() => { setNewNiveauParcoursId(null); setNewNiveauCode(''); }}
                                          submitLabel="Créer"
                                        />
                                      ) : (
                                        <button onClick={() => setNewNiveauParcoursId(parcours.id)}
                                          className="text-accent text-xs font-medium flex items-center gap-1 hover:underline">
                                          <Plus className="w-3 h-3" /> Ajouter un niveau
                                        </button>
                                      )}
                                    </div>

                                    {parcours.niveaux.length === 0 ? (
                                      <div className="px-10 py-3 text-xs text-[#8A8FA3] italic">Aucun niveau</div>
                                    ) : (
                                      parcours.niveaux.map((niveau) => {
                                        const niveauOpen = expandedNiveau === niveau.id;
                                        return (
                                          <div key={niveau.id}>
                                            {/* ── Niveau Row ── */}
                                            <div
                                              className="flex items-center justify-between px-4 py-2 hover:bg-[#F7F7FA] cursor-pointer border-b border-neutral-100"
                                              onClick={() => setExpandedNiveau(niveauOpen ? null : niveau.id)}
                                              style={{ paddingLeft: '72px' }}
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                {niveauOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#8A8FA3] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8A8FA3] shrink-0" />}
                                                <GraduationCap className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                                <span className="text-sm text-[#111827] font-medium">{niveau.code}</span>
                                                <span className="text-[10px] text-[#8A8FA3] bg-[#F7F7FA] px-2 py-0.5 rounded-full">{niveau.matieres.length} matières</span>
                                              </div>
                                              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => setEditNiveau({ id: niveau.id, code: niveau.code, parcoursId: parcours.id })}
                                                  className="p-1 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteNiveau(niveau.id)}
                                                  className="p-1 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-3.5 h-3.5" /></button>
                                              </div>
                                            </div>

                                            {/* ── Edit Niveau Form ── */}
                                            {editNiveau && editNiveau.id === niveau.id && (
                                              <InlineForm
                                                fields={[
                                                  { key: 'code', label: 'Code', placeholder: 'Ex: L3', value: editNiveau.code, onChange: (v) => setEditNiveau({ ...editNiveau, code: v }) },
                                                ]}
                                                onSubmit={updateNiveau}
                                                onCancel={() => setEditNiveau(null)}
                                                submitLabel="Enregistrer"
                                              />
                                            )}

                                            {/* ── Matières ── */}
                                            {niveauOpen && (
                                              <div className="bg-[#FAFAFC]">
                                                {/* Add Matiere button per niveau */}
                                                <div className="px-4 py-1.5 flex items-center justify-end border-b border-neutral-100" style={{ paddingLeft: '96px' }}>
                                                  {newMatiereNiveauId === niveau.id ? (
                                                    <InlineForm
                                                      fields={[
                                                        { key: 'code', label: 'Code', placeholder: 'Ex: MATH101', value: newMatiereCode, onChange: setNewMatiereCode },
                                                        { key: 'nom', label: 'Nom', placeholder: 'Ex: Maths', value: newMatiereNom, onChange: setNewMatiereNom },
                                                      ]}
                                                      onSubmit={createMatiere}
                                                      onCancel={() => { setNewMatiereNiveauId(null); setNewMatiereCode(''); setNewMatiereNom(''); }}
                                                      submitLabel="Créer"
                                                    />
                                                  ) : (
                                                    <button onClick={() => setNewMatiereNiveauId(niveau.id)}
                                                      className="text-accent text-xs font-medium flex items-center gap-1 hover:underline">
                                                      <Plus className="w-3 h-3" /> Ajouter une matière
                                                    </button>
                                                  )}
                                                </div>

                                                {niveau.matieres.length === 0 ? (
                                                  <div className="px-14 py-3 text-xs text-[#8A8FA3] italic">Aucune matière</div>
                                                ) : (
                                                  niveau.matieres.map((matiere) => (
                                                    <div key={matiere.id}>
                                                      <div
                                                        className="flex items-center justify-between px-4 py-2 hover:bg-[#F7F7FA] border-b border-neutral-100"
                                                        style={{ paddingLeft: '96px' }}
                                                      >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                          <BookMarked className="w-3.5 h-3.5 text-[#5A55F2] shrink-0" />
                                                          <span className="text-xs font-mono text-[#8A8FA3]">{matiere.code}</span>
                                                          <span className="text-sm text-[#111827]">{matiere.nom}</span>
                                                          {matiere.description && <span className="text-xs text-[#8A8FA3] truncate max-w-[150px]">— {matiere.description}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                          <button onClick={() => openProfModal(matiere.id, matiere.nom)} title="Assigner des professeurs"
                                                            className="p-1 text-[#3b82f6] rounded-md hover:bg-[#F7F7FA]"><Users className="w-3.5 h-3.5" /></button>
                                                          <button onClick={() => setEditMatiere({ id: matiere.id, code: matiere.code, nom: matiere.nom, description: matiere.description || '', niveauId: niveau.id })}
                                                            className="p-1 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-3.5 h-3.5" /></button>
                                                          <button onClick={() => deleteMatiere(matiere.id)}
                                                            className="p-1 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                      </div>

                                                      {/* ── Edit Matiere Form ── */}
                                                      {editMatiere && editMatiere.id === matiere.id && (
                                                        <InlineForm
                                                          fields={[
                                                            { key: 'code', label: 'Code', placeholder: 'Code', value: editMatiere.code, onChange: (v) => setEditMatiere({ ...editMatiere, code: v }) },
                                                            { key: 'nom', label: 'Nom', placeholder: 'Nom', value: editMatiere.nom, onChange: (v) => setEditMatiere({ ...editMatiere, nom: v }) },
                                                            { key: 'desc', label: 'Description', placeholder: 'Description', value: editMatiere.description, onChange: (v) => setEditMatiere({ ...editMatiere, description: v }) },
                                                          ]}
                                                          onSubmit={updateMatiere}
                                                          onCancel={() => setEditMatiere(null)}
                                                          submitLabel="Enregistrer"
                                                        />
                                                      )}
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* ── Prof Assignment Modal ── */}
      {profModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProfModal({ open: false, matiereId: 0, matiereNom: '' })} />
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-[#111827]">Professeurs — {profModal.matiereNom}</h2>
              <button onClick={() => setProfModal({ open: false, matiereId: 0, matiereNom: '' })} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Assigned */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Professeurs assignés</h3>
                {affectationsForMatiere(profModal.matiereId).length === 0 ? (
                  <p className="text-sm text-text-secondary">Aucun professeur assigné.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {affectationsForMatiere(profModal.matiereId).map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#3b82f6] shrink-0">
                            {(a.professeurPrenom[0] || '').toUpperCase()}{(a.professeurNom[0] || '').toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-[#111827]">{a.professeurPrenom} {a.professeurNom}</span>
                        </div>
                        <button onClick={() => handleRemoveAffectation(a.id)} className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add */}
              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Ajouter un professeur</h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Professeur</label>
                    <select value={selectedProfId || ''} onChange={(e) => setSelectedProfId(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors">
                      <option value="">Choisir...</option>
                      {professeurs.map((p) => (
                        <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleAddAffectation} disabled={!selectedProfId}
                    className="bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4 inline mr-1" />Assigner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
