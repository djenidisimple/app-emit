'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { Niveau, Parcours } from '@/types';
import { api } from '@/services/api';

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

export default function AdminNiveauxPage() {
  const [items, setItems] = useState<Niveau[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editParcoursId, setEditParcoursId] = useState('');
  const [code, setCode] = useState('');
  const [parcoursId, setParcoursId] = useState('');

  const fetchData = async () => {
    setIsLoading(true); setError('');
    try {
      const [niveauxData, parcoursData] = await Promise.all([api.get<Niveau[]>('/Niveau'), api.get<Parcours[]>('/Parcours')]);
      setItems(niveauxData); setParcoursList(parcoursData || []);
    } catch { setError('Impossible de charger les niveaux.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Niveau', { code, parcoursId: parseInt(parcoursId) });
      setShowForm(false); setCode(''); setParcoursId(''); fetchData();
    } catch { setError('Erreur lors de la création.'); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await api.put(`/Niveau/${editId}`, { code: editCode, parcoursId: parseInt(editParcoursId) });
      setShowForm(false); setEditId(null); fetchData();
    } catch { setError('Erreur lors de la modification.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    try { await api.delete(`/Niveau/${id}`); setItems(items.filter(i => i.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  return (
    <ProtectedLayout pageTitle="Niveaux">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setShowForm(true)}
          className="bg-accent text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {error && <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-2.5 text-sm text-[#ef4444]"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}
      {showForm && editId === null && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm mb-5 flex gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Code</label>
            <input type="text" placeholder="Ex: L3" value={code} onChange={e => setCode(e.target.value)} className={inputCls} required />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Parcours</label>
            <select value={parcoursId} onChange={e => setParcoursId(e.target.value)} className={inputCls} required>
              <option value="">Sélectionner...</option>
              {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 shadow-sm transition-all">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border text-text-secondary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-bg-muted transition-colors">Annuler</button>
          </div>
        </form>
      )}
      {showForm && editId !== null && (
        <form onSubmit={handleEditSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm mb-5 flex gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Code</label>
            <input type="text" placeholder="Ex: L3" value={editCode} onChange={e => setEditCode(e.target.value)} className={inputCls} required />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Parcours</label>
            <select value={editParcoursId} onChange={e => setEditParcoursId(e.target.value)} className={inputCls} required>
              <option value="">Sélectionner...</option>
              {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 shadow-sm transition-all">Enregistrer</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="border border-border text-text-secondary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-bg-muted transition-colors">Annuler</button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingSkeleton lines={5} className="bg-surface rounded-lg border border-border p-5" />
      : items.length === 0 ? <EmptyState icon={GraduationCap} title="Aucun niveau" description="Aucun niveau enregistré." />
      : <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7FA] border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Code</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Parcours</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{item.code}</td>
                  <td className="px-4 py-3 text-[13px] text-[#555A6E]">{parcoursList.find(p => p.id === item.parcoursId)?.nom || `ID: ${item.parcoursId}`}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditId(item.id); setEditCode(item.code); setEditParcoursId(item.parcoursId.toString()); setShowForm(true); }}
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
