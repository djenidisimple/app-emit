'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Users, X, Mail, ShieldCheck, Hash, Eye, EyeOff,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

interface UtilisateurDto {
  id: number; nom: string; prenom: string; email: string; matricule?: string; role?: string; niveauId?: number; niveauCode?: string;
}

interface UserForm {
  nom: string; prenom: string; email: string; motDePasse: string; confirmMotDePasse: string; matricule: string; role: string; niveauId: string;
}

const ROLES = ['Admin', 'Professeur', 'Etudiant', 'Responsable'];
const ROLE_COLORS: Record<string, string> = {
  Admin: 'rgba(239,68,68,0.15)', Professeur: 'rgba(59,130,246,0.15)',
  Etudiant: 'rgba(16,185,129,0.15)', Responsable: 'rgba(139,92,246,0.15)',
};
const ROLE_FG: Record<string, string> = {
  Admin: '#ef4444', Professeur: '#3b82f6', Etudiant: '#10b981', Responsable: '#8b5cf6',
};

const EMPTY_FORM: UserForm = { nom: '', prenom: '', email: '', motDePasse: '', confirmMotDePasse: '', matricule: '', role: '', niveauId: '' };

const inputCls = css({ w: 'full', px: '3', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(109,93,255,0.15)' } });
const labelCls = css({ fontSize: 'xs', fontWeight: 'bold', color: 'accent.default', textTransform: 'uppercase', letterSpacing: 'wide' });

function Avatar({ nom, prenom }: { nom: string; prenom: string }) {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e'];
  const idx = (nom.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={css({ w: '8', h: '8', rounded: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'xs', fontWeight: 'bold', flexShrink: '0', bg: colors[idx], color: '#fff' })}>
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<UtilisateurDto[]>('/Utilisateur');
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

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setEditId(null); setModalMode('create'); setModalOpen(true); };

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
    if (modalMode === 'create' && form.motDePasse !== form.confirmMotDePasse) { setError('Les mots de passe ne correspondent pas.'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        nom: form.nom.trim(), prenom: form.prenom.trim(), email: form.email.trim().toLowerCase(),
        motDePasse: modalMode === 'create' ? (form.motDePasse || undefined) : undefined,
        matricule: form.matricule.trim() || undefined,
        role: form.role, niveauId: form.niveauId ? parseInt(form.niveauId, 10) : undefined,
      };
      if (modalMode === 'create') {
        await api.post('/Utilisateur', payload);
      } else {
        await api.put(`/Utilisateur/${editId}`, {
          nom: form.nom.trim(), prenom: form.prenom.trim(), email: form.email.trim().toLowerCase(),
          matricule: form.matricule.trim() || undefined,
          role: form.role, niveauId: form.niveauId ? parseInt(form.niveauId, 10) : undefined,
        });
      }
      setModalOpen(false); setForm(EMPTY_FORM); fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      setError(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/Utilisateur/${id}`); setUsers((prev) => prev.filter((u) => u.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  const byRole = ROLES.reduce((acc, r) => { acc[r] = users.filter((u) => u.role === r).length; return acc; }, {} as Record<string, number>);

  return (
    <ProtectedLayout pageTitle="Gestion des Utilisateurs">
      <div className={css({ display: 'flex', flexDirection: { base: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: '4', mb: '8' })}>
        <p className={css({ fontSize: 'sm', color: 'fg.muted' })}>Gestion des comptes et des accès.</p>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <Button onClick={openCreate}>
            <Plus size={14} className={css({ mr: '1' })} /> Ajouter un utilisateur
          </Button>
        </div>
      </div>

      <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr 1fr', sm: '1fr 1fr 1fr 1fr 1fr' }, gap: '3', mb: '6' })}>
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3' })}>
          <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'accent.default' })}>{users.length}</div>
          <div className={css({ fontSize: 'xs', color: 'fg.muted' })}>Total</div>
        </div>
        {ROLES.map((role) => (
          <div key={role} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3' })}>
            <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: ROLE_FG[role] as any })}>{byRole[role] || 0}</div>
            <div className={css({ fontSize: 'xs', color: 'fg.muted' })}>{role}s</div>
          </div>
        ))}
      </div>

      <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3', mb: '4' })}>
        <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap', alignItems: 'center' })}>
          <div className={css({ position: 'relative', flex: '1', minW: '220px' })}>
            <Users size={16} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle' })} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, matricule..."
              className={css({ w: 'full', pl: '9', pr: '4', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } })} />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className={css({ border: '1px solid', borderColor: 'border.default', rounded: 'md', px: '2', py: '1.5', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none' })}>
            <option value="">Tous rôles</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '2.5', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', rounded: 'lg', fontSize: 'sm', color: '#ef4444' })}>{error}</div>
      )}

      {isLoading ? (
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', py: '24' })}>
          <div className={css({ w: '10', h: '10', border: '4px solid', borderColor: 'accent.default', borderTopColor: 'transparent', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={css({ textAlign: 'center', py: '20', color: 'fg.subtle' })}>
          <Users size={40} className={css({ mx: 'auto', mb: '3', opacity: 0.3 })} />
          <p className={css({ fontWeight: 'medium' })}>{users.length === 0 ? 'Aucun utilisateur.' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', overflow: 'hidden' })}>
          <table className={css({ w: 'full', fontSize: 'sm' })}>
            <thead>
              <tr className={css({ borderBottom: '1px solid', borderColor: 'border.default', bg: 'bg.muted' })}>
                {['Nom', 'Email', 'Rôle', 'Matricule', 'Actions'].map((h) => (
                  <th key={h} className={css({ p: '3', pl: '4', textAlign: 'left', fontWeight: 'bold', color: 'accent.default', fontSize: 'xs', textTransform: 'uppercase', letterSpacing: 'wide' })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={css({ borderBottom: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.muted' } })}>
                  <td className={css({ p: '3', pl: '4' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2.5' })}>
                      <Avatar nom={u.nom} prenom={u.prenom} />
                      <div>
                        <p className={css({ fontWeight: 'semibold', color: 'fg.default', fontSize: 'sm' })}>{u.nom} {u.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td className={css({ p: '3', color: 'fg.muted' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '1.5' })}>
                      <Mail size={12} className={css({ color: 'fg.subtle' })} />
                      <span className={css({ fontFamily: 'mono', fontSize: 'xs' })}>{u.email}</span>
                    </div>
                  </td>
                  <td className={css({ p: '3' })}>
                    {u.role ? (
                      <span className={css({ display: 'inline-block', fontSize: 'xs', fontWeight: 'bold', px: '2', py: '0.5', rounded: 'full', bg: ROLE_COLORS[u.role] || 'bg.muted', color: ROLE_FG[u.role] || 'fg.muted' })}>
                        {u.role}
                      </span>
                    ) : <span className={css({ color: 'fg.subtle', fontSize: 'xs' })}>—</span>}
                  </td>
                  <td className={css({ p: '3', fontSize: 'sm', color: 'fg.muted' })}>{u.matricule || '—'}</td>
                  <td className={css({ p: '3', pr: '4', textAlign: 'right' })}>
                    <div className={css({ display: 'flex', gap: '1', justifyContent: 'flex-end' })}>
                      <button onClick={() => openEdit(u)} title="Modifier"
                        className={css({ p: '1.5', color: 'accent.default', rounded: 'md', _hover: { bg: 'rgba(59,130,246,0.1)' } })}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} title="Supprimer"
                        className={css({ p: '1.5', color: '#ef4444', rounded: 'md', _hover: { bg: 'rgba(239,68,68,0.1)' } })}>
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
        <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '4' })}>
          <div className={css({ position: 'absolute', inset: 0, bg: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' })} onClick={() => setModalOpen(false)} />
          <div className={css({ position: 'relative', bg: 'bg.elevated', rounded: 'lg', shadow: '2xl', w: 'full', maxW: 'lg', border: '1px solid', borderColor: 'border.default' })}>
            <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '6', py: '4', borderBottom: '1px solid', borderColor: 'border.default' })}>
              <h2 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'accent.default' })}>
                {modalMode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
              </h2>
              <button onClick={() => setModalOpen(false)} className={css({ p: '1.5', color: 'fg.subtle', _hover: { color: 'fg.default', bg: 'bg.muted' }, rounded: 'md' })}><X size={18} /></button>
            </div>
            <div className={css({ px: '6', py: '5', spaceY: '4' })}>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
                <div><label className={labelCls}>Nom *</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Prénom *</label><input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
                <div><label className={labelCls}>Rôle *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    <option value="">Choisir...</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Matricule</label><input type="text" value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} className={inputCls} /></div>
              </div>
              {modalMode === 'create' && (
                <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
                  <div><label className={labelCls}>Mot de passe</label><input type="password" value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Confirmer</label><input type="password" value={form.confirmMotDePasse} onChange={(e) => setForm({ ...form, confirmMotDePasse: e.target.value })} className={inputCls} /></div>
                </div>
              )}
            </div>
            <div className={css({ px: '6', py: '4', borderTop: '1px solid', borderColor: 'border.default', display: 'flex', justifyContent: 'flex-end', gap: '2' })}>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
