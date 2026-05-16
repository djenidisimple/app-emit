'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { NiveauDto } from '@/types';
import api from '@/services/api';

export default function AdminNiveauxPage() {
  const [items, setItems] = useState<NiveauDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [parcoursId, setParcoursId] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get<NiveauDto[]>('/Niveau');
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Niveau', { code, parcoursId: parseInt(parcoursId) });
      setShowForm(false); setCode(''); setParcoursId('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    try {
      await api.delete(`/Niveau/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-28 pb-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-emit-blue">Niveaux</h1>
            <p className="text-emit-text/60 mt-1">Gestion des niveaux d'étude (L1, L2, etc.).</p>
          </div>
          <Button variant="orange" icon={Plus} onClick={() => setShowForm(true)}>Ajouter</Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-emit-border rounded-md p-4 mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-1">Code</label>
              <input type="text" placeholder="Ex: L3" value={code} onChange={e => setCode(e.target.value)}
                className="w-full p-2 border border-emit-border rounded-md outline-none text-sm" required />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-1">Parcours ID</label>
              <input type="number" placeholder="ID du parcours" value={parcoursId} onChange={e => setParcoursId(e.target.value)}
                className="w-full p-2 border border-emit-border rounded-md outline-none text-sm" required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="orange">Créer</Button>
              <Button type="button" variant="glass" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-white border border-emit-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emit-bg border-b border-emit-border">
                  <th className="text-left p-4 font-semibold text-emit-blue">Code</th>
                  <th className="text-left p-4 font-semibold text-emit-blue">Parcours</th>
                  <th className="text-right p-4 font-semibold text-emit-blue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-emit-border/50 hover:bg-emit-bg/50">
                    <td className="p-4 font-medium">{item.code}</td>
                    <td className="p-4 text-emit-text/70">{item.parcoursNom || `ID: ${item.parcoursId}`}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
