'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { Niveau, Parcours } from '@/types';
import api from '@/services/api';

export default function AdminNiveauxPage() {
  const [items, setItems] = useState<Niveau[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editParcoursId, setEditParcoursId] = useState('');
  const [code, setCode] = useState('');
  const [parcoursId, setParcoursId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [niveauxRes, parcoursRes] = await Promise.all([api.get<Niveau[]>('/Niveau'), api.get<Parcours[]>('/Parcours')]);
      setItems(niveauxRes.data); setParcoursList(parcoursRes.data || []);
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

  const handleEdit = (item: Niveau) => {
    setEditId(item.id);
    setEditCode(item.code);
    setEditParcoursId(item.parcoursId.toString());
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await api.put(`/Niveau/${editId}`, { code: editCode, parcoursId: parseInt(editParcoursId) });
      setShowEditForm(false); setEditId(null); fetchData();
    } catch { setError('Erreur lors de la modification.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    try { await api.delete(`/Niveau/${id}`); setItems(items.filter(i => i.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  return (
    <ProtectedLayout pageTitle="Niveaux">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setShowForm(true)}
          className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-6 flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Code</label>
            <input type="text" placeholder="Ex: L3" value={code} onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Parcours</label>
            <select value={parcoursId} onChange={e => setParcoursId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required>
              <option value="">Sélectionner...</option>
              {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-blue-200 text-blue-500 hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">Annuler</button>
          </div>
        </form>
      )}
      {showEditForm && editId !== null && (
        <form onSubmit={handleEditSubmit} className="bg-blue-50 rounded-2xl border border-blue-200 shadow-sm p-5 mb-6 flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Code</label>
            <input type="text" placeholder="Ex: L3" value={editCode} onChange={e => setEditCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Parcours</label>
            <select value={editParcoursId} onChange={e => setEditParcoursId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required>
              <option value="">Sélectionner...</option>
              {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">Enregistrer</button>
            <button type="button" onClick={() => setShowEditForm(false)} className="border border-blue-200 text-blue-500 hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">Annuler</button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingSkeleton lines={5} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5" />
      : items.length === 0 ? <EmptyState icon={GraduationCap} title="Aucun niveau" description="Aucun niveau enregistré." />
      : <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr><th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wide">Code</th><th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wide">Parcours</th><th className="px-4 py-3 text-right text-xs font-semibold text-blue-500 uppercase tracking-wide">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-900">{item.code}</td>
                  <td className="px-4 py-3 text-blue-500">{parcoursList.find(p => p.id === item.parcoursId)?.nom || `ID: ${item.parcoursId}`}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-[#0052FF] hover:bg-blue-50 rounded-lg transition-colors duration-150"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </ProtectedLayout>
  );
}
