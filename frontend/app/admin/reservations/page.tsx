'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calendar, MapPin, User, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { ReservationReadDto } from '@/types';
import api from '@/services/api';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('En attente');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ReservationReadDto[]>(`/Reservation/statut/${encodeURIComponent(filter)}`);
      setReservations(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatus = async (id: number, statut: string) => {
    try {
      await api.patch(`/Reservation/${id}/statut`, { id, statut });
      setReservations(reservations.filter(r => r.id !== id));
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-28 pb-10 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-emit-blue">Gestion des Réservations</h1>
          <p className="text-emit-text/60 mt-1">Validez ou refusez les demandes de réservation de salles.</p>
        </header>

        <div className="flex gap-2 mb-6">
          {['En attente', 'Confirmée', 'Annulée'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                filter === s
                  ? 'bg-emit-blue text-white shadow-sm'
                  : 'bg-white text-emit-text/70 border border-emit-border hover:bg-emit-bg'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 text-emit-text/50">
            <p className="text-lg">Aucune réservation {filter.toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-emit-border rounded-md p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-poppins font-bold text-emit-blue">{res.titre}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-emit-text/70">
                      <span className="flex items-center gap-1.5">
                        <User size={14} /> {res.demandeurNom}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} /> {res.salleLibelle}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> {formatDate(res.datePrecise)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {res.type}
                      </span>
                    </div>
                  </div>

                  {res.statut === 'En attente' && (
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => handleStatus(res.id, 'Confirmée')}
                        className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        title="Accepter"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleStatus(res.id, 'Annulée')}
                        className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        title="Refuser"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  {res.statut !== 'En attente' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      res.statut === 'Confirmée' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {res.statut}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
