'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import SalleCard from '@/components/SalleCard';
import { Salle } from '@/types';
import Button from '@/components/ui/Button';
import api from '@/services/api';

export default function AdminSallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalles();
  }, []);

  const fetchSalles = async () => {
    try {
      const response = await api.get<Salle[]>('/Salles');
      setSalles(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des salles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emit-bg p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-emit-blue">Gestion des Salles</h1>
          <p className="text-emit-text/60 mt-1">Configurez et gérez les ressources physiques de l'EMIT.</p>
        </div>
        <Button variant="orange" icon={Plus}>Ajouter une salle</Button>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emit-text/40" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou code..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-emit-border rounded-xl outline-none focus:ring-2 focus:ring-emit-orange/20 transition-all"
          />
        </div>
        <Button variant="glass" icon={Filter}>Filtres avancés</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {salles.map((salle, index) => (
            <motion.div 
              key={salle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SalleCard salle={salle} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
