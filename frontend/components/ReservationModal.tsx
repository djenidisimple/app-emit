'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Salle, ReservationCreateDto } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

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
        {error && (
          <div className={css({ mx: '6', mt: '4', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: 'rgba(239,68,68,0.2)', rounded: 'lg', px: '4', py: '2.5', fontSize: 'sm', color: '#ef4444' })}>{error}</div>
        )}
        <div className={header}>
          <div>
            <h2 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default' })}>Réserver une salle</h2>
            <p className={css({ fontSize: 'xs', color: 'fg.muted', mt: '0.5' })}>{salle.libelle} - {salle.capacite} places</p>
          </div>
          <button onClick={onClose} className={css({ p: '1.5', color: 'fg.subtle', _hover: { color: 'fg.default' }, transition: 'colors' })}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className={css({ p: '8', textAlign: 'center' })}>
            <div className={css({ w: '14', h: '14', bg: 'rgba(16,185,129,0.15)', rounded: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: '4' })}>
              <svg className={css({ w: '7', h: '7', color: '#10b981' })} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default' })}>Demande envoyée !</p>
            <p className={css({ fontSize: 'sm', color: 'fg.muted', mt: '1' })}>En attente de validation par l&apos;administration.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={css({ p: '6', spaceY: '4' })}>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', p: '3', bg: 'bg.muted', rounded: 'lg', border: '1px solid', borderColor: 'border.default' })}>
              <MapPin size={18} className={css({ color: 'accent.default' })} />
              <div>
                <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'fg.default' })}>{salle.libelle}</p>
                <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>{salle.capacite} places</p>
              </div>
            </div>

            <div className={css({ spaceY: '1' })}>
              <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Titre de l&apos;événement</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ex: Séance de TD Maths"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
              />
            </div>

            <div className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4' })}>
              <div className={css({ spaceY: '1' })}>
                <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Type</label>
                <select
                  className={inputCls}
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
              <div className={css({ spaceY: '1' })}>
                <label className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={formData.datePrecise}
                  onChange={(e) => setFormData({ ...formData, datePrecise: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={css({ pt: '4', display: 'flex', gap: '3' })}>
              <Button type="button" variant="outline" onClick={onClose} className={css({ flex: '1' })}>
                Annuler
              </Button>
              <Button type="submit" loading={isSubmitting} className={css({ flex: '1' })}>
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
