'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import api from '@/services/api';

interface ParcoursItem { id: number; nom: string; filiereId: number; filiereNom: string; }

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
    try { const res = await api.get<ParcoursItem[]>('/parcours'); setItems(res.data || res); }
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
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { setShowForm(true); setEditId(null); setNom(''); setFiliereId(''); }}
          className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-6 flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Nom</label>
            <input type="text" placeholder="Ex: Informatique" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Filière</label>
            <select value={filiereId} onChange={e => setFiliereId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150" required>
              <option value="">Sélectionner...</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">{editId ? 'Modifier' : 'Créer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-blue-200 text-blue-500 hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-150">Annuler</button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingSkeleton lines={5} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5" />
      : items.length === 0 ? <EmptyState icon={FolderTree} title="Aucun parcours" description="Aucun parcours enregistré." />
      : <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr><th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wide">Nom</th><th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 uppercase tracking-wide">Filière</th><th className="px-4 py-3 text-right text-xs font-semibold text-blue-500 uppercase tracking-wide">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-900">{item.nom}</td>
                  <td className="px-4 py-3 text-blue-500">{item.filiereNom || `ID: ${item.filiereId}`}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditId(item.id); setNom(item.nom); setFiliereId(String(item.filiereId)); setShowForm(true); }}
                      className="p-1.5 text-[#0052FF] hover:bg-blue-50 rounded-lg transition-colors duration-150"><Pencil className="w-4 h-4" /></button>
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
