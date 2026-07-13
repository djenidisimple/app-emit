'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Salle, ReservationCreateDto } from '@/types';
import { Button } from '@/components/ui/button';
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
  const [error, setError] = useState('');

  if (!isOpen || !salle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
    } catch {
      setError('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface w-full max-w-lg rounded-lg border border-border overflow-hidden"
      >
        {error && (
          <div className="mx-6 mt-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
        )}
        <div className="bg-surface p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-fg-default">Réserver une salle</h2>
            <p className="text-xs text-fg-muted mt-0.5">{salle.libelle} - {salle.capacite} places</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-fg-subtle hover:text-fg-default transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-[rgba(16,185,129,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-semibold text-fg-default">Demande envoyée !</p>
            <p className="text-sm text-fg-muted mt-1">En attente de validation par l&apos;administration.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-bg-muted rounded-lg border border-border">
              <MapPin size={18} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-fg-default">{salle.libelle}</p>
                <p className="text-xs text-fg-muted">{salle.capacite} places</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-fg-muted">Titre de l&apos;événement</label>
              <input
                type="text"
                className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
                placeholder="Ex: Séance de TD Maths"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-fg-muted">Type</label>
                <select
                  className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
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
                <label className="text-xs font-medium text-fg-muted">Date</label>
                <input
                  type="date"
                  className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
                  value={formData.datePrecise}
                  onChange={(e) => setFormData({ ...formData, datePrecise: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" loading={isSubmitting} className="flex-1">
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
