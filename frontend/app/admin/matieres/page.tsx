'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, BookOpen, AlertCircle, Filter } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { MatiereDto, FiliereDto, Parcours, Niveau } from '@/types';
import { api } from '@/services/api';

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

export default function AdminMatieresPage() {
  const [items, setItems] = useState<MatiereDto[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [filieres, setFilieres] = useState<FiliereDto[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [niveauId, setNiveauId] = useState('');
  const [formFiliereId, setFormFiliereId] = useState('');
  const [formParcoursId, setFormParcoursId] = useState('');

  const [filterFiliereId, setFilterFiliereId] = useState('');
  const [filterParcoursId, setFilterParcoursId] = useState('');
  const [filterNiveauId, setFilterNiveauId] = useState('');

  const filteredParcours = useMemo(() =>
    parcoursList.filter(p => !formFiliereId || p.filiereId === parseInt(formFiliereId)),
    [parcoursList, formFiliereId]
  );

  const filteredNiveaux = useMemo(() =>
    niveaux.filter(n => !formParcoursId || n.parcoursId === parseInt(formParcoursId)),
    [niveaux, formParcoursId]
  );

  const tableFilteredItems = useMemo(() => {
    if (!filterNiveauId) return items;
    return items.filter(i => i.niveauId === parseInt(filterNiveauId));
  }, [items, filterNiveauId]);

  const fetchData = async () => {
    setIsLoading(true); setError('');
    try {
      const [res, nv, fil, parc] = await Promise.all([
        api.get<MatiereDto[]>('/matieres'),
        api.get<Niveau[]>('/niveaux'),
        api.get<FiliereDto[]>('/filieres'),
        api.get<Parcours[]>('/parcours'),
      ]);
      setItems(res); setNiveaux(nv || []); setFilieres(fil || []); setParcoursList(parc || []);
    } catch { setError('Impossible de charger les données.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setCode(''); setNom(''); setDescription(''); setNiveauId('');
    setFormFiliereId(''); setFormParcoursId('');
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { code, nom, description, niveauId: parseInt(niveauId) };
      if (editId) await api.put(`/matieres/${editId}`, body);
      else await api.post('/matieres', body);
      setShowForm(false); resetForm(); fetchData();
    } catch { setError('Erreur lors de l\'enregistrement.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try { await api.delete(`/matieres/${id}`); setItems(items.filter(i => i.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  return (
    <ProtectedLayout pageTitle="Matières">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filtrer par
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Filière</label>
            <select value={filterFiliereId} onChange={e => { setFilterFiliereId(e.target.value); setFilterParcoursId(''); setFilterNiveauId(''); }} className={inputCls}>
              <option value="">Toutes les filières</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Parcours</label>
            <select value={filterParcoursId} onChange={e => { setFilterParcoursId(e.target.value); setFilterNiveauId(''); }}
              className={inputCls} disabled={!filterFiliereId}>
              <option value="">Tous les parcours</option>
              {parcoursList.filter(p => !filterFiliereId || p.filiereId === parseInt(filterFiliereId)).map(p =>
                <option key={p.id} value={p.id}>{p.nom}</option>
              )}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Niveau</label>
            <select value={filterNiveauId} onChange={e => setFilterNiveauId(e.target.value)}
              className={inputCls} disabled={!filterParcoursId}>
              <option value="">Tous les niveaux</option>
              {niveaux.filter(n => !filterParcoursId || n.parcoursId === parseInt(filterParcoursId)).map(n =>
                <option key={n.id} value={n.id}>{n.code}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => { setShowForm(true); resetForm(); }}
          className="bg-accent text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {error && <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-2.5 text-sm text-[#ef4444] flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm mb-5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Code</label>
                <input type="text" placeholder="Ex: MATH101" value={code} onChange={e => setCode(e.target.value)} className={inputCls} required />
              </div>
              <div className="flex-[2] flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nom</label>
                <input type="text" placeholder="Ex: Mathématiques" value={nom} onChange={e => setNom(e.target.value)} className={inputCls} required />
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filière</label>
                <select value={formFiliereId} onChange={e => { setFormFiliereId(e.target.value); setFormParcoursId(''); setNiveauId(''); }} className={inputCls} required>
                  <option value="">Sélectionner...</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Parcours</label>
                <select value={formParcoursId} onChange={e => { setFormParcoursId(e.target.value); setNiveauId(''); }}
                  className={inputCls} required disabled={!formFiliereId}>
                  <option value="">Sélectionner...</option>
                  {filteredParcours.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Niveau</label>
                <select value={niveauId} onChange={e => setNiveauId(e.target.value)}
                  className={inputCls} required disabled={!formParcoursId}>
                  <option value="">Sélectionner...</option>
                  {filteredNiveaux.map(n => <option key={n.id} value={n.id}>{n.code}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
              <textarea 
                placeholder="Description de la matière..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className={`${inputCls} py-2.5 h-20 resize-none`} 
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <button type="submit" className="bg-accent text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 shadow-sm transition-all">{editId ? 'Modifier' : 'Créer'}</button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="border border-border text-text-secondary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-bg-muted transition-colors">Annuler</button>
            </div>
          </div>
        </form>
      )}
      {isLoading ? (
        <LoadingSkeleton lines={5} className="bg-surface rounded-lg border border-border p-5" />
      ) : tableFilteredItems.length === 0 ? (
        <EmptyState icon={BookOpen} title="Aucune matière" description="Aucune matière trouvée pour les filtres sélectionnés." />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7FA] border-b border-neutral-200">
               <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Code</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Niveau</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider">Actions</th>
               </tr>
            </thead>
            <tbody>
               {tableFilteredItems.map(item => (
                 <tr key={item.id} className="border-b border-neutral-200 hover:bg-[#F7F7FA]">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#111827]">{item.code}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{item.nom}</td>
                    <td className="px-4 py-3 text-[12px] text-[#555A6E]">{item.niveauCode || `Niveau #${item.niveauId}`}</td>
                    <td className="px-4 py-3 text-[12px] text-fg-muted truncate max-w-[200px]">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => {
                        const niveau = niveaux.find(n => n.id === item.niveauId);
                        const parc = niveau ? parcoursList.find(p => p.id === niveau.parcoursId) : null;
                        const fil = parc ? filieres.find(f => f.id === parc.filiereId) : null;
                        setEditId(item.id); setCode(item.code); setNom(item.nom);
                        setDescription(item.description || ''); setNiveauId(String(item.niveauId));
                        setFormParcoursId(parc ? String(parc.id) : '');
                        setFormFiliereId(fil ? String(fil.id) : '');
                        setShowForm(true);
                      }}
                       className="p-1.5 text-[#5A55F2] rounded-md hover:bg-[#F7F7FA]"><Pencil className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#ef4444] rounded-md ml-1 hover:bg-[rgba(239,68,68,0.1)]"><Trash2 className="w-4 h-4" /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
