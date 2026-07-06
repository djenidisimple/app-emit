'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { SeancePlanningDto, Salle, ExceptionPlanning } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { css, cx } from 'styled-system/css';

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
      setFormData({
        typeException: 'Annulation',
        motif: '',
        dateDebut: new Date().toISOString().split('T')[0],
      });
      setSubmitError('');
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

  const overlay = css({
    position: 'fixed',
    inset: '0',
    zIndex: '50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: '4',
    bg: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
  });

  const modal = css({
    bg: 'bg.surface',
    w: '100%',
    maxW: 'lg',
    rounded: 'lg',
    shadow: 'xl',
    border: '1px solid',
    borderColor: 'border.default',
    overflow: 'hidden',
  });

  const header = css({
    bg: 'bg.surface',
    p: '5',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const inputCls = css({
    w: '100%',
    p: '2',
    rounded: 'lg',
    border: '1px solid',
    borderColor: 'border.default',
    outline: 'none',
    fontSize: 'sm',
    bg: 'bg.surface',
    color: 'fg.default',
    _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(79,94,255,0.15)' },
  });

  return (
    <div className={overlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={modal}
      >
        <div className={header}>
          <div>
            <h2 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default' })}>Gérer une Exception</h2>
            <p className={css({ fontSize: 'xs', color: 'fg.muted', mt: '0.5' })}>{seance.matiereNom} - {seance.jour} {seance.heureDebut}</p>
          </div>
          <button onClick={onClose} className={css({ p: '1.5', color: 'fg.subtle', _hover: { color: 'fg.default' }, transition: 'colors' })}>
            <X size={18} />
          </button>
        </div>

        {submitError && (
          <div className={css({ px: '6', pt: '4' })}>
            <div className={css({ bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: 'rgba(239,68,68,0.2)', rounded: 'lg', px: '4', py: '2.5', fontSize: 'sm', color: '#ef4444' })}>{submitError}</div>
          </div>
        )}

        {user?.roles?.includes('Professeur') && (
          <div className={css({ px: '6', pt: '4' })}>
            <Button
              variant="outline"
              loading={isFinishing}
              onClick={handleTerminer}
              className={css({ w: '100%' })}
            >
              <CheckCircle size={14} /> Marquer comme terminée
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={css({ p: '6', spaceY: '4' })}>
          <div className={css({ spaceY: '1' })}>
            <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Type d&apos;exception</label>
            <select
              className={inputCls}
              value={formData.typeException}
              onChange={(e) => setFormData({ ...formData, typeException: e.target.value as ExceptionPlanning['typeException'] })}
            >
              <option value="Annulation">Annulation de cours</option>
              <option value="Report">Report de séance</option>
              <option value="Indisponibilité">Indisponibilité salle/prof</option>
            </select>
          </div>

          <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
            <div className={css({ spaceY: '1' })}>
              <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Date de début</label>
              <input
                type="date"
                className={inputCls}
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                max={formData.dateFin || undefined}
                required
              />
            </div>
            <div className={css({ spaceY: '1' })}>
              <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Date de fin</label>
              <input
                type="date"
                className={inputCls}
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                min={formData.dateDebut || undefined}
              />
            </div>
          </div>

          {formData.typeException === 'Report' && (
            <div className={css({ spaceY: '1' })}>
              <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Nouvelle Salle</label>
              <select
                className={inputCls}
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

          <div className={css({ spaceY: '1' })}>
            <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Motif de l&apos;exception</label>
            <textarea
              className={cx(inputCls, css({ minH: '80px' }))}
              placeholder="Expliquez la raison..."
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              required
            />
          </div>

          <div className={css({ pt: '4', display: 'flex', gap: '3' })}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={css({ flex: '1' })}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className={css({ flex: '1' })}
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
