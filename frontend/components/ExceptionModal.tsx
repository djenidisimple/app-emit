'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { SeancePlanningDto, Salle, ExceptionPlanning } from '@/types';
import Button from './ui/Button';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';

interface ExceptionModalProps {
  seance: SeancePlanningDto | null;
  isOpen: boolean;
  onClose: () => void;
  salles: Salle[];
}

const ExceptionModal: React.FC<ExceptionModalProps> = ({ seance, isOpen, onClose, salles }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<ExceptionPlanning>>({
    typeException: 'Annulation',
    motif: '',
    dateDebut: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isOpen && seance) {
      setFormData({
        typeException: 'Annulation',
        motif: '',
        dateDebut: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, seance]);

  if (!isOpen || !seance) return null;

  const handleTerminer = async () => {
    setIsFinishing(true);
    try {
      await api.patch(`/SeanceCours/${seance.id}/terminer`);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la terminaison:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const typeException = formData.typeException === 'Indisponibilité' ? 'Indisponibilite' : formData.typeException;

      if (typeException === 'Annulation') {
        await api.post('/Exception/annuler', {
          seanceCoursId: seance.id,
          dateDebut: formData.dateDebut,
          typeException: 'Annulation',
          motif: formData.motif,
        });
      } else if (typeException === 'Report') {
        await api.post('/Exception/reporter', {
          seanceCoursId: seance.id,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin || null,
          typeException: 'Report',
          motif: formData.motif,
          nouvelleSalleId: formData.nouvelleSalleId,
        });
      } else {
        await api.post('/Exception/indisponible', {
          seanceCoursId: seance.id,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin || null,
          typeException: 'Indisponibilite',
          motif: formData.motif,
        });
      }

      onClose();
    } catch (err) {
      console.error("Erreur lors de la création de l'exception:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        <div className="bg-white p-5 border-b border-blue-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">Gérer une Exception</h2>
            <p className="text-xs text-blue-500">{seance.matiereNom} - {seance.jour} {seance.heureDebut}</p>
          </div>
          <button onClick={onClose} className="p-2 text-blue-400 hover:text-blue-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {user?.roles?.includes('Professeur') && (
          <div className="px-6 pt-4">
            <Button
              variant="secondary"
              icon={CheckCircle}
              isLoading={isFinishing}
              onClick={handleTerminer}
              className="w-full"
            >
              Marquer comme terminée
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700">Type d&apos;exception</label>
            <select 
              className="w-full p-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none transition-all text-sm"
              value={formData.typeException}
              onChange={(e) => setFormData({ ...formData, typeException: e.target.value as ExceptionPlanning['typeException'] })}
            >
              <option value="Annulation">Annulation de cours</option>
              <option value="Report">Report de séance</option>
              <option value="Indisponibilité">Indisponibilité salle/prof</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-blue-700">Date de début</label>
              <input 
                type="date"
                className="w-full p-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none text-sm"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                max={formData.dateFin || undefined}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-blue-700">Date de fin</label>
              <input 
                type="date"
                className="w-full p-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none text-sm"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                min={formData.dateDebut || undefined}
              />
            </div>
          </div>

          {formData.typeException === 'Report' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-blue-700">Nouvelle Salle</label>
              <select 
                className="w-full p-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none text-sm"
                value={formData.nouvelleSalleId}
                onChange={(e) => setFormData({ ...formData, nouvelleSalleId: parseInt(e.target.value) })}
                required
              >
                <option value="">Sélectionner une salle</option>
                {salles.map(s => (
                  <option key={s.id} value={s.id}>{s.libelle ?? s.nom} ({s.capacite} places)</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700">Motif de l&apos;exception</label>
            <textarea 
              className="w-full p-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none min-h-[80px] text-sm"
              placeholder="Expliquez la raison..."
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isSubmitting}
              className="flex-1"
            >
               Enregistrer l&apos;exception
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExceptionModal;
