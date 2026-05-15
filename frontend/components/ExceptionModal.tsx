'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SeancePlanningDto, ExceptionPlanning, Salle } from '@/types';
import Button from './ui/Button';
import api from '@/services/api';

interface ExceptionModalProps {
  seance: SeancePlanningDto | null;
  isOpen: boolean;
  onClose: () => void;
  salles: Salle[];
}

const ExceptionModal: React.FC<ExceptionModalProps> = ({ seance, isOpen, onClose, salles }) => {
  const [formData, setFormData] = useState<Partial<ExceptionPlanning>>({
    typeException: 'Annulation',
    motif: '',
    dateDebut: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !seance) return null;

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
      console.error('Erreur lors de la création de l\'exception:', err);
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
            <h2 className="text-lg font-poppins font-bold text-emit-blue">Gérer une Exception</h2>
            <p className="text-xs text-emit-text/60">{seance.matiereNom} - {seance.jour} {seance.heureDebut}</p>
          </div>
          <button onClick={onClose} className="p-2 text-emit-text/40 hover:text-emit-blue transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Type d'exception</label>
            <select 
              className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none transition-all text-sm"
              value={formData.typeException}
              onChange={(e) => setFormData({ ...formData, typeException: e.target.value as any })}
            >
              <option value="Annulation">Annulation de cours</option>
              <option value="Report">Report de séance</option>
              <option value="Indisponibilité">Indisponibilité salle/prof</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Date de début</label>
              <input 
                type="date"
                className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Date de fin</label>
              <input 
                type="date"
                className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              />
            </div>
          </div>

          {formData.typeException === 'Report' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Nouvelle Salle</label>
              <select 
                className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none text-sm"
                value={formData.nouvelleSalleId}
                onChange={(e) => setFormData({ ...formData, nouvelleSalleId: parseInt(e.target.value) })}
                required
              >
                <option value="">Sélectionner une salle</option>
                {salles.map(s => (
                  <option key={s.id} value={s.id}>{s.libelle} ({s.capacite} places)</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider">Motif de l'exception</label>
            <textarea 
              className="w-full p-2.5 rounded-md border border-emit-border focus:ring-1 focus:ring-emit-blue outline-none min-h-[80px] text-sm"
              placeholder="Expliquez la raison..."
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="glass" 
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="orange" 
              isLoading={isSubmitting}
              className="flex-1"
            >
              Enregistrer l'exception
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExceptionModal;
