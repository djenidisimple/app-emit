'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Users, X, Mail, ShieldCheck, Hash, Copy, Check,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

interface UtilisateurDto {
  id: number; nom: string; prenom: string; email: string; matricule?: string; role?: string; niveauId?: number; niveauCode?: string;
}

interface UtilisateurCreatedDto extends UtilisateurDto {
  motDePasse?: string;
}

interface UserForm {
  nom: string; prenom: string; email: string; matricule: string; role: string; niveauId: string;
}

const ROLES = ['Admin', 'Professeur', 'Etudiant', 'Responsable'];
const ROLE_COLORS: Record<string, string> = {
  Admin: 'rgba(239,68,68,0.15)', Professeur: 'rgba(59,130,246,0.15)',
  Etudiant: 'rgba(16,185,129,0.15)', Responsable: 'rgba(139,92,246,0.15)',
};
const ROLE_FG: Record<string, string> = {
  Admin: '#ef4444', Professeur: '#3b82f6', Etudiant: '#10b981', Responsable: '#8b5cf6',
};

const EMPTY_FORM: UserForm = { nom: '', prenom: '', email: '', matricule: '', role: '', niveauId: '' };

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';
const labelCls = 'text-xs font-semibold text-text-secondary uppercase tracking-wider';

function Avatar({ nom, prenom }: { nom: string; prenom: string }) {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e'];
  const idx = (nom.charCodeAt(0) || 0) % colors.length;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ backgroundColor: colors[idx] }}>
      {(nom[0] || '?').toUpperCase()}{(prenom[0] || '').toUpperCase()}
    </div>
  );
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<UtilisateurDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<UtilisateurDto[]>('/utilisateurs');
      setUsers(res);
    } catch { setError('Impossible de charger les utilisateurs.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.matricule || '').toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setEditId(null); setModalMode('create'); setModalOpen(true); setCreatedPassword(''); };

  const openEdit = (user: UtilisateurDto) => {
    setForm({
      nom: user.nom, prenom: user.prenom, email: user.email,
      motDePasse: '', confirmMotDePasse: '',
      matricule: user.matricule || '', role: user.role || '', niveauId: user.niveauId ? String(user.niveauId) : '',
    });
    setError(''); setEditId(user.id); setModalMode('edit'); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.role) { setError('Remplissez tous les champs requis.'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        nom: form.nom.trim(), prenom: form.prenom.trim(), email: form.email.trim().toLowerCase(),
        matricule: form.matricule.trim() || undefined,
        role: form.role, niveauId: form.niveauId ? parseInt(form.niveauId, 10) : undefined,
      };
      if (modalMode === 'create') {
        const res = await api.post<UtilisateurCreatedDto>('/utilisateurs', payload);
        if (res.motDePasse) {
          setCreatedPassword(res.motDePasse);
          setPasswordCopied(false);
        }
        fetchUsers();
      } else {
        await api.put(`/utilisateurs/${editId}`, payload);
        setModalOpen(false); setForm(EMPTY_FORM); fetchUsers();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      setError(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
      try { await api.delete(`/utilisateurs/${id}`); setUsers((prev) => prev.filter((u) => u.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  const byRole = ROLES.reduce((acc, r) => { acc[r] = users.filter((u) => u.role === r).length; return acc; }, {} as Record<string, number>);

  return (
    <ProtectedLayout pageTitle="Gestion des Utilisateurs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <p className="text-sm text-fg-muted">Gestion des comptes et des accès.</p>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus size={14} className="mr-1" /> Ajouter un utilisateur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-accent">{users.length}</div>
          <div className="text-xs text-text-secondary mt-1">Total</div>
        </div>
        {ROLES.map((role) => (
          <div key={role} className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold" style={{ color: ROLE_FG[role] }}>{byRole[role] || 0}</div>
            <div className="text-xs text-text-secondary mt-1">{role}s</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-4 shadow-sm mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, matricule..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="border border-border rounded-xl px-3 py-2.5 text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors">
            <option value="">Tous rôles</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg text-sm text-[#ef4444]">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fg-subtle">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{users.length === 0 ? 'Aucun utilisateur.' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#F7F7FA]">
                {['Nom', 'Email', 'Rôle', 'Matricule', 'Actions'].map((h) => (
                  <th key={h} className="p-3 pl-4 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar nom={u.nom} prenom={u.prenom} />
                      <div>
                        <p className="font-semibold text-[13px] text-[#111827]">{u.nom} {u.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[#555A6E]">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-[#8A8FA3]" />
                      <span className="font-mono text-[12px]">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {u.role ? (
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: ROLE_COLORS[u.role] || 'var(--color-bg-muted)', color: ROLE_FG[u.role] || 'var(--color-fg-muted)' }}>
                        {u.role}
                      </span>
                    ) : <span className="text-[#8A8FA3] text-[12px]">—</span>}
                  </td>
                  <td className="p-3 text-[13px] text-[#555A6E]">{u.matricule || '—'}</td>
                  <td className="p-3 pr-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(u)} title="Modifier"
                        className="p-1.5 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} title="Supprimer"
                        className="p-1.5 text-[#ef4444] rounded-md hover:bg-[rgba(239,68,68,0.1)]">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-[#111827]">
                {modalMode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-fg-subtle hover:text-fg-default hover:bg-bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Nom *</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Prénom *</label><input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={labelCls}>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Rôle *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    <option value="">Choisir...</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5"><label className={labelCls}>Matricule</label><input type="text" value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} className={inputCls} /></div>
              </div>
              {modalMode === 'create' && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-accent inline mr-1.5 align-text-bottom" />
                  Un mot de passe sera généré automatiquement et affiché après la création.
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
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
            <h3 className="text-base font-bold text-[#111827] mb-1">Compte créé avec succès</h3>
            <p className="text-xs text-text-secondary mb-4">Partagez ce mot de passe avec l'utilisateur.</p>
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
