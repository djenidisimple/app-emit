'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { api } from '@/services/api';

interface ParcoursItem { id: number; nom: string; filiereId: number; filiereNom: string; }

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

export default function AdminParcoursPage() {
  const [items, setItems] = useState<ParcoursItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nom, setNom] = useState('');
  const [filiereId, setFiliereId] = useState('');

  const fetchData = async () => {
    setIsLoading(true); setError('');
    try { const res = await api.get<ParcoursItem[]>('/parcours'); setItems(res); }
    catch { setError('Impossible de charger les parcours.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { nom, filiereId: parseInt(filiereId) };
      if (editId) await api.put(`/parcours/${editId}`, body); else await api.post('/parcours', body);
      setShowForm(false); setEditId(null); setNom(''); setFiliereId(''); fetchData();
    } catch { setError('Erreur lors de l\'enregistrement.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce parcours ?')) return;
    try { await api.delete(`/parcours/${id}`); setItems(items.filter(i => i.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  return (
    <ProtectedLayout pageTitle="Parcours">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => { setShowForm(true); setEditId(null); setNom(''); setFiliereId(''); }}
          className="bg-accent text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {error && <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-2.5 text-sm text-[#ef4444]"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm mb-5 flex gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nom</label>
            <input type="text" placeholder="Ex: Informatique" value={nom} onChange={e => setNom(e.target.value)} className={inputCls} required />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filière</label>
            <select value={filiereId} onChange={e => setFiliereId(e.target.value)} className={inputCls} required>
              <option value="">Sélectionner...</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 shadow-sm transition-all">{editId ? 'Modifier' : 'Créer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border text-text-secondary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-bg-muted transition-colors">Annuler</button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingSkeleton lines={5} className="bg-surface rounded-lg border border-border p-5" />
      : items.length === 0 ? <EmptyState icon={FolderTree} title="Aucun parcours" description="Aucun parcours enregistré." />
      : <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7FA] border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Nom</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Filière</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{item.nom}</td>
                  <td className="px-4 py-3 text-[13px] text-[#555A6E]">{item.filiereNom || `ID: ${item.filiereId}`}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditId(item.id); setNom(item.nom); setFiliereId(String(item.filiereId)); setShowForm(true); }}
                      className="p-1.5 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#ef4444] rounded-md ml-1 hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </ProtectedLayout>
  );
}
