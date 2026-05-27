'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Salle, ReservationCreateDto } from '@/types';
import Button from './ui/Button';
import { api } from '@/services/api';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  salle: Salle | null;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, salle }) => {
  const [formData, setFormData] = useState({
    titre: '',
    type: 'Cours',
    datePrecise: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !salle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dto: ReservationCreateDto = {
        titre: formData.titre,
        type: formData.type,
        datePrecise: formData.datePrecise,
        salleId: salle.id,
      };
      await api.post('/Reservation', dto);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-md shadow-xl border border-emit-border overflow-hidden"
      >
        <div className="bg-white p-5 border-b border-emit-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-poppins font-bold text-emit-blue">Réserver une salle</h2>
            <p className="text-xs text-emit-text/60">{salle.libelle} - {salle.capacite} places</p>
          </div>
          <button onClick={onClose} className="p-2 text-emit-text/40 hover:text-emit-blue transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-emit-blue">Demande envoyée !</p>
            <p className="text-sm text-emit-text/60 mt-1">En attente de validation par l&apos;administration.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emit-bg rounded-md border border-emit-border">
              <MapPin size={18} className="text-emit-orange" />
              <div>
                <p className="text-sm font-bold text-emit-blue">{salle.libelle}</p>
                <p className="text-xs text-emit-text/60">{salle.capacite} places</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Titre de l&apos;événement</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                placeholder="Ex: Séance de TD Maths"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Type</label>
                <select
                  className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Cours">Cours</option>
                  <option value="TD">TD</option>
                  <option value="TP">TP</option>
                  <option value="Examen">Examen</option>
                  <option value="Réunion">Réunion</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                  value={formData.datePrecise}
                  onChange={(e) => setFormData({ ...formData, datePrecise: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
                Envoyer la demande
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ReservationModal;
