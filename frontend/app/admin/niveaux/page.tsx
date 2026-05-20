// app/admin/niveaux/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import { Niveau, Parcours } from '@/types';
import EditNiveauModal from '@/components/modals/EditNiveauModal';

export default function AdminNiveauxPage() {
  const [items, setItems] = useState<Niveau[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [parcoursId, setParcoursId] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<Niveau | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Chargement des niveaux et des parcours
  const fetchData = async () => {
    try {
      const [niveauxRes, parcoursRes] = await Promise.all([
        api.get<Niveau[]>('/Niveau'),
        api.get<Parcours[]>('/Parcours'),
      ]);
      setItems(niveauxRes.data);
      setParcoursList(parcoursRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Création d'un niveau
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Niveau', { code, parcoursId: parseInt(parcoursId) });
      setShowForm(false);
      setCode('');
      setParcoursId('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Suppression
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    try {
      await api.delete(`/Niveau/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Édition
  const handleEdit = (niveau: Niveau) => {
    setSelectedNiveau(niveau);
    setModalOpen(true);
  };

  const handleModalSaved = () => {
    fetchData();
    setModalOpen(false);
  };

  // Helper pour obtenir le nom du parcours
  const getParcoursNom = (parcoursId: number): string => {
    const parcours = parcoursList.find(p => p.id === parcoursId);
    return parcours ? parcours.nom : `ID: ${parcoursId}`;
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
          <Button variant="orange" icon={Plus} onClick={() => setShowForm(true)}>
            Ajouter
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-emit-border rounded-md p-4 mb-6 flex gap-4 items-end"
          >
            <div className="flex-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-1">
                Code
              </label>
              <input
                type="text"
                placeholder="Ex: L3"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-emit-border rounded-md outline-none text-sm"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-1">
                Parcours
              </label>
              <select
                value={parcoursId}
                onChange={(e) => setParcoursId(e.target.value)}
                className="w-full p-2 border border-emit-border rounded-md outline-none text-sm"
                required
              >
                <option value="">Sélectionner un parcours</option>
                {parcoursList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="orange">
                Créer
              </Button>
              <Button type="button" variant="glass" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
          </div>
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
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-emit-border/50 hover:bg-emit-bg/50"
                  >
                    <td className="p-4 font-medium">{item.code}</td>
                    <td className="p-4 text-emit-text/70">
                      {getParcoursNom(item.parcoursId)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditNiveauModal
        isOpen={modalOpen}
        niveau={selectedNiveau}
        parcoursList={parcoursList}
        onClose={() => setModalOpen(false)}
        onSaved={handleModalSaved}
      />
    </div>
  );
}