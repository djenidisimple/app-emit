'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { SeancePlanningDto, Salle, ExceptionPlanning } from '@/types';
import { Button } from '@/components/ui/button';
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
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && seance) {
      setTimeout(() => {
        setFormData({
          typeException: 'Annulation',
          motif: '',
          dateDebut: new Date().toISOString().split('T')[0],
        });
        setSubmitError('');
      }, 0);
    }
  }, [isOpen, seance]);

  if (!isOpen || !seance) return null;

  const handleTerminer = async () => {
    setIsFinishing(true);
    try {
      await api.patch(`/SeanceCours/${seance.id}/terminer`);
      onClose();
    } catch {
      setSubmitError('Erreur lors de la terminaison de la séance.');
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
    } catch {
      setSubmitError("Erreur lors de la création de l'exception.");
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
        <div className="bg-surface p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-fg-default">Gérer une Exception</h2>
            <p className="text-xs text-fg-muted mt-0.5">{seance.matiereNom} - {seance.jour} {seance.heureDebut}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-fg-subtle hover:text-fg-default transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {submitError && (
          <div className="px-6 pt-4">
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#ef4444]">{submitError}</div>
          </div>
        )}

        {user?.roles?.includes('Professeur') && (
          <div className="px-6 pt-4">
            <Button
              variant="outline"
              loading={isFinishing}
              onClick={handleTerminer}
              className="w-full"
            >
              <CheckCircle size={14} /> Marquer comme terminée
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-fg-muted">Type d&apos;exception</label>
            <select
              className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
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
              <label className="text-xs font-medium text-fg-muted">Date de début</label>
              <input
                type="date"
                className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                max={formData.dateFin || undefined}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-fg-muted">Date de fin</label>
              <input
                type="date"
                className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                min={formData.dateDebut || undefined}
              />
            </div>
          </div>

          {formData.typeException === 'Report' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-fg-muted">Nouvelle Salle</label>
              <select
                className="w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF]"
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
            <label className="text-xs font-medium text-fg-muted">Motif de l&apos;exception</label>
            <textarea
              className={`w-full p-2 rounded-lg border border-border outline-none text-sm bg-surface text-fg-default focus:border-[#4F5EFF] min-h-[80px]`}
              placeholder="Expliquez la raison..."
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
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
