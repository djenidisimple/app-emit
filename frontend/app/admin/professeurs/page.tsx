'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Users, Mail, X, BookOpen, ShieldCheck, Copy, Check
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Affectation, AffectationCreateDto } from '@/types';

interface ProfesseurDto {
  id: number; nom: string; prenom: string; email: string; matricule?: string;
}

interface UtilisateurCreatedDto extends ProfesseurDto {
  motDePasse?: string;
}

interface ProfForm {
  nom: string; prenom: string; email: string;
}

const EMPTY_PROF_FORM: ProfForm = { nom: '', prenom: '', email: '' };
const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';
const labelCls = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

export default function AdminProfesseursPage() {
  const [profs, setProfs] = useState<ProfesseurDto[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [profForm, setProfForm] = useState<ProfForm>(EMPTY_PROF_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const [matiereModal, setMatiereModal] = useState<{ open: boolean; profId: number; profNom: string }>({ open: false, profId: 0, profNom: '' });
  const [matieres, setMatieres] = useState<{ id: number; nom: string; code: string }[]>([]);
  const [parcoursList, setParcoursList] = useState<{ id: number; nom: string }[]>([]);
  const [niveauxList, setNiveauxList] = useState<{ id: number; code: string; parcoursId: number }[]>([]);
  const [newAffect, setNewAffect] = useState<AffectationCreateDto>({ professeurId: 0, matiereId: 0 });
  const [selectedNiveaux, setSelectedNiveaux] = useState<{ id: number; code: string; parcoursId: number }[]>([]);

  const fetchProfs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get<ProfesseurDto[]>('/utilisateurs?role=Professeur');
      setProfs(res);
    } catch (err: unknown) {
      const detail = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      const msg = detail ? `API ${detail.status}: ${detail.data?.message || 'erreur inconnue'}` : 'Backend injoignable';
      setError(`Erreur chargement professeurs. ${msg}`);
      setIsLoading(false);
      return;
    }
    try {
      const affRes = await api.get<Affectation[]>('/affectations');
      setAffectations(affRes);
    } catch {
      // Les affectations peuvent ne pas être disponibles si la migration n'est pas appliquée
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchProfs(); }, [fetchProfs]);

  useEffect(() => {
    if (matiereModal.open) {
      api.get<{ id: number; nom: string; code: string }[]>('/matieres').then(setMatieres).catch(() => {});
      api.get<{ id: number; nom: string }[]>('/parcours').then(setParcoursList).catch(() => {});
      api.get<{ id: number; code: string; parcoursId: number }[]>('/niveaux').then(setNiveauxList).catch(() => {});
    }
  }, [matiereModal.open]);

  const filtered = profs.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.matricule || '').toLowerCase().includes(q);
  });

  const affectationsForProf = (profId: number) => affectations.filter((a) => a.professeurId === profId);

  const handleSubmitProf = async () => {
    if (!profForm.nom || !profForm.prenom || !profForm.email) { setError('Champs requis.'); return; }
    setIsSubmitting(true);
    try {
      const res = await api.post<UtilisateurCreatedDto>('/utilisateurs', {
        nom: profForm.nom.trim(), prenom: profForm.prenom.trim(),
        email: profForm.email.trim().toLowerCase(),
        role: 'Professeur',
      });
      setModalOpen(false); setProfForm(EMPTY_PROF_FORM);
      if (res.motDePasse) { setCreatedPassword(res.motDePasse); setPasswordCopied(false); }
      fetchProfs();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur création.';
      setError(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteProf = async (id: number) => {
    if (!confirm('Supprimer ce professeur ?')) return;
    try { await api.delete(`/utilisateurs/${id}`); setProfs((prev) => prev.filter((p) => p.id !== id)); }
    catch { setError('Erreur suppression.'); }
  };

  const openMatiereModal = (prof: ProfesseurDto) => {
    setNewAffect({ professeurId: prof.id, matiereId: 0 });
    setSelectedNiveaux([]);
    setMatiereModal({ open: true, profId: prof.id, profNom: `${prof.prenom} ${prof.nom}` });
  };

  const handleParcoursChange = (parcoursId: number) => {
    setNewAffect((prev) => ({ ...prev, parcoursId, niveauId: undefined }));
    setSelectedNiveaux(niveauxList.filter((n) => n.parcoursId === parcoursId));
  };

  const handleAddAffectation = async () => {
    if (!newAffect.matiereId) return;
    try {
      const created = await api.post<Affectation>('/affectations', newAffect);
      setAffectations((prev) => [...prev, created]);
      setNewAffect({ professeurId: matiereModal.profId, matiereId: 0 });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur affectation.';
      setError(msg);
    }
  };

  const handleRemoveAffectation = async (affId: number) => {
    try {
      await api.delete(`/affectations/${affId}`);
      setAffectations((prev) => prev.filter((a) => a.id !== affId));
    } catch { setError('Erreur suppression affectation.'); }
  };

  const profAffectations = affectationsForProf(matiereModal.profId);

  return (
    <ProtectedLayout pageTitle="Gestion des Professeurs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <p className="text-sm text-fg-muted">Gérer les professeurs et leurs matières.</p>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={14} className="mr-1" /> Ajouter un professeur
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg text-sm text-[#ef4444]">{error}</div>
      )}

      <div className="bg-surface border border-border rounded-lg p-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, matricule..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fg-subtle">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{profs.length === 0 ? 'Aucun professeur.' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#F7F7FA]">
                <th className="p-3 pl-4 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Professeur</th>
                <th className="p-3 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Email</th>
                <th className="p-3 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Matières</th>
                <th className="p-3 pr-4 text-right text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const profAffs = affectationsForProf(p.id);
                return (
                  <tr key={p.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#3b82f6] shrink-0">
                          {(p.prenom[0] || '').toUpperCase()}{(p.nom[0] || '').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] text-[#111827]">{p.prenom} {p.nom}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#555A6E]">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-[#8A8FA3]" />
                        <span className="font-mono text-[12px]">{p.email}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {profAffs.length === 0 ? (
                          <span className="text-[12px] text-[#8A8FA3]">Aucune</span>
                        ) : (
                          profAffs.slice(0, 3).map((a) => (
                            <span key={a.id} className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.15)] text-[#3b82f6]">
                              {a.matiereCode}
                            </span>
                          ))
                        )}
                        {profAffs.length > 3 && (
                          <span className="text-[11px] text-[#8A8FA3]">+{profAffs.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openMatiereModal(p)} title="Assigner des matières"
                          className="p-1.5 text-[#3b82f6] rounded-md hover:bg-[#F7F7FA]">
                          <BookOpen size={15} />
                        </button>
                        <button onClick={() => handleDeleteProf(p.id)} title="Supprimer"
                          className="p-1.5 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajouter Professeur */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-[#111827]">Ajouter un professeur</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Nom *</label><input type="text" value={profForm.nom} onChange={(e) => setProfForm({ ...profForm, nom: e.target.value })} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Prénom *</label><input type="text" value={profForm.prenom} onChange={(e) => setProfForm({ ...profForm, prenom: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={labelCls}>Email *</label><input type="email" value={profForm.email} onChange={(e) => setProfForm({ ...profForm, email: e.target.value })} className={inputCls} /></div>
              <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-accent inline mr-1.5 align-text-bottom" />
                Un mot de passe sera généré automatiquement et affiché après la création.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmitProf} loading={isSubmitting}>Créer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assigner Matières */}
      {matiereModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMatiereModal({ open: false, profId: 0, profNom: '' })} />
          <div className="relative bg-white rounded-xl w-full max-w-xl shadow-xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-[#111827]">Matières — {matiereModal.profNom}</h2>
              <button onClick={() => setMatiereModal({ open: false, profId: 0, profNom: '' })} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Matières assignées</h3>
                {profAffectations.length === 0 ? (
                  <p className="text-sm text-text-secondary">Aucune matière assignée.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {profAffectations.map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-2.5">
                        <div>
                          <span className="text-sm font-semibold text-[#111827]">{a.matiereNom}</span>
                          <span className="text-xs text-text-secondary ml-2">({a.matiereCode})</span>
                          {a.parcoursNom && <span className="text-xs text-text-secondary ml-2">· {a.parcoursNom}</span>}
                          {a.niveauCode && <span className="text-xs text-text-secondary ml-1">· {a.niveauCode}</span>}
                        </div>
                        <button onClick={() => handleRemoveAffectation(a.id)} className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Ajouter une matière</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Matière</label>
                    <select value={newAffect.matiereId || ''} onChange={(e) => setNewAffect({ ...newAffect, matiereId: parseInt(e.target.value) })} className={inputCls}>
                      <option value="">Choisir...</option>
                      {matieres.map((m) => <option key={m.id} value={m.id}>{m.code} - {m.nom}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Parcours</label>
                    <select value={newAffect.parcoursId || ''} onChange={(e) => handleParcoursChange(parseInt(e.target.value))} className={inputCls}>
                      <option value="">Tous</option>
                      {parcoursList.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Niveau</label>
                    <select value={newAffect.niveauId || ''} onChange={(e) => setNewAffect({ ...newAffect, niveauId: e.target.value ? parseInt(e.target.value) : undefined })} className={inputCls}>
                      <option value="">Tous</option>
                      {selectedNiveaux.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setMatiereModal({ open: false, profId: 0, profNom: '' })}>
                    Fermer
                  </Button>
                  <Button onClick={handleAddAffectation} disabled={!newAffect.matiereId}>
                    <Plus size={14} className="mr-1" /> Assigner
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password reveal modal */}
      {createdPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreatedPassword('')} />
          <div className="relative bg-white rounded-xl w-full max-w-sm shadow-xl border border-border p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Professeur créé avec succès</h3>
            <p className="text-xs text-text-secondary mb-4">Partagez ce mot de passe avec le professeur.</p>
            <div className="bg-bg-secondary border border-border rounded-xl px-4 py-3 mb-4">
              <code className="text-lg font-mono font-bold text-accent tracking-wider select-all">{createdPassword}</code>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(createdPassword); setPasswordCopied(true); }}
              className="w-full bg-accent text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-sm mb-2 transition-all"
            >
              {passwordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {passwordCopied ? 'Copié !' : 'Copier le mot de passe'}
            </button>
            <button onClick={() => setCreatedPassword('')}
              className="w-full border border-border text-text-secondary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-bg-muted transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
