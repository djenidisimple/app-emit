'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookMarked, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { Filiere } from '@/types';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

const inputCls = css({ w: 'full', px: '3', py: '2', border: '1px solid', borderColor: 'border.default', rounded: 'md', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } });

export default function AdminFilieresPage() {
  const [items, setItems] = useState<Filiere[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nom, setNom] = useState('');

  const fetchData = async () => {
    setIsLoading(true); setError('');
    try { const res = await api.get<Filiere[]>('/Filiere'); setItems(res); }
    catch { setError('Impossible de charger les filières.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/Filiere/${editId}`, { nom });
      else await api.post('/Filiere', { nom });
      setShowForm(false); setEditId(null); setNom(''); fetchData();
    } catch { setError('Erreur lors de l\'enregistrement.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette filière ?')) return;
    try { await api.delete(`/Filiere/${id}`); setItems(items.filter(i => i.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  return (
    <ProtectedLayout pageTitle="Filières">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5' })}>
        <button onClick={() => { setShowForm(true); setEditId(null); setNom(''); }}
          className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'medium', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
          <Plus className={css({ w: '4', h: '4' })} /> Ajouter
        </button>
      </div>
      {error && <div className={css({ mb: '4', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', rounded: 'lg', px: '4', py: '2.5', fontSize: 'sm', color: '#ef4444' })}><AlertCircle className={css({ w: '4', h: '4', display: 'inline', mr: '1' })} />{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5', mb: '5', display: 'flex', gap: '4', alignItems: 'flex-end' })}>
          <div className={css({ flex: '1', display: 'flex', flexDirection: 'column', gap: '1' })}>
            <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.subtle', textTransform: 'uppercase', letterSpacing: 'wide' })}>Nom</label>
            <input type="text" placeholder="Ex: Informatique" value={nom} onChange={e => setNom(e.target.value)} className={inputCls} required />
          </div>
          <div className={css({ display: 'flex', gap: '2' })}>
            <button type="submit" className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'medium', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', _hover: { opacity: 0.9 } })}>{editId ? 'Modifier' : 'Créer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className={css({ border: '1px solid', borderColor: 'border.default', color: 'fg.muted', fontWeight: 'medium', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', _hover: { bg: 'bg.muted' } })}>Annuler</button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingSkeleton lines={5} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })} />
      : items.length === 0 ? <EmptyState icon={BookMarked} title="Aucune filière" description="Aucune filière enregistrée." />
      : <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', overflow: 'hidden' })}>
          <table className={css({ w: 'full', fontSize: 'sm' })}>
            <thead className={css({ bg: 'bg.muted', borderBottom: '1px solid', borderColor: 'border.default' })}>
              <tr><th className={css({ px: '4', py: '2.5', textAlign: 'left', fontSize: 'xs', fontWeight: 'medium', color: 'fg.subtle', textTransform: 'uppercase', letterSpacing: 'wide' })}>Nom</th><th className={css({ px: '4', py: '2.5', textAlign: 'right', fontSize: 'xs', fontWeight: 'medium', color: 'fg.subtle', textTransform: 'uppercase', letterSpacing: 'wide' })}>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={css({ borderBottom: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.muted' } })}>
                  <td className={css({ px: '4', py: '3', fontWeight: 'medium', color: 'fg.default' })}>{item.nom}</td>
                  <td className={css({ px: '4', py: '3', textAlign: 'right' })}>
                    <button onClick={() => { setEditId(item.id); setNom(item.nom); setShowForm(true); }}
                      className={css({ p: '1.5', color: 'accent.default', rounded: 'md', _hover: { bg: 'bg.muted' } })}><Pencil className={css({ w: '4', h: '4' })} /></button>
                    <button onClick={() => handleDelete(item.id)} className={css({ p: '1.5', color: '#ef4444', rounded: 'md', ml: '1', _hover: { bg: 'rgba(239,68,68,0.1)' } })}><Trash2 className={css({ w: '4', h: '4' })} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </ProtectedLayout>
  );
}
