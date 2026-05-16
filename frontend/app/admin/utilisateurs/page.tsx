'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { UtilisateurDto } from '@/types';
import api from '@/services/api';

export default function AdminUtilisateursPage() {
  const [items, setItems] = useState<UtilisateurDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get<UtilisateurDto[]>('/Utilisateur');
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/Utilisateur/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = items.filter(i =>
    `${i.nom} ${i.prenom} ${i.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-28 pb-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-emit-blue">Utilisateurs</h1>
            <p className="text-emit-text/60 mt-1">Gestion des comptes utilisateurs.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emit-text/40" size={18} />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-emit-border rounded-md outline-none text-sm w-64" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-white border border-emit-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emit-bg border-b border-emit-border">
                  <th className="text-left p-4 font-semibold text-emit-blue">Nom</th>
                  <th className="text-left p-4 font-semibold text-emit-blue">Email</th>
                  <th className="text-left p-4 font-semibold text-emit-blue">Rôle</th>
                  <th className="text-left p-4 font-semibold text-emit-blue">Niveau</th>
                  <th className="text-right p-4 font-semibold text-emit-blue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-emit-border/50 hover:bg-emit-bg/50">
                    <td className="p-4 font-medium">{item.nom} {item.prenom}</td>
                    <td className="p-4 text-emit-text/70">{item.email}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emit-blue/10 text-emit-blue">{item.role}</span></td>
                    <td className="p-4 text-emit-text/70">{item.niveauCode || '-'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
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
