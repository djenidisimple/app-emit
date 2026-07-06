'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Building2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { api } from '@/services/api';
import { Salle, Creneau } from '@/types';
import { useRouter } from 'next/navigation';
import { css } from 'styled-system/css';

type Step = 1 | 2 | 3;

export default function NouvelleReservationPage() {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState('');
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [creneauId, setCreneauId] = useState('');
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [titre, setTitre] = useState('');
  const [type, setType] = useState('Cours');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => { api.get<Creneau[]>('/Creneaux').then(setCreneaux).catch(() => {}); }, []);

  const handleStep1 = async () => {
    if (!date || !creneauId) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.get<Salle[]>(`/Salles/disponibles?date=${date}&creneauId=${creneauId}`);
      setSalles(data); setStep(2);
    } catch { setError('Erreur lors du chargement des salles.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!titre || !selectedSalleId) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    try {
      const creneauObj = creneaux.find(c => c.id === parseInt(creneauId));
      const sessionLabel = creneauObj ? `${creneauObj.jour} ${creneauObj.heureDebut.slice(0,5)}-${creneauObj.heureFin.slice(0,5)}` : '';
      await api.post('/Reservation', { titre, type, datePrecise: date, salleId: selectedSalleId, session: sessionLabel });
      setSubmitted(true);
    } catch { setError('Erreur lors de la soumission.'); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <ProtectedLayout pageTitle="Nouvelle réservation">
        <div className={css({ maxW: 'lg', mx: 'auto', textAlign: 'center' })}>
          <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '8' })}>
            <div className={css({ w: '16', h: '16', bg: 'rgba(16,185,129,0.1)', rounded: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: '4' })}>
              <CheckCircle className={css({ w: '8', h: '8', color: '#10b981' })} />
            </div>
            <h2 className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'fg.default', mb: '2' })}>Demande soumise !</h2>
            <p className={css({ fontSize: 'sm', color: 'fg.subtle', mb: '6' })}>
              Votre demande est en attente de validation par l'administrateur.
            </p>
            <button onClick={() => router.push('/reservations')}
              className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '6', py: '2.5', rounded: 'lg', _hover: { opacity: 0.9 } })}>
              Voir mes réservations
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const selectedSalle = salles.find(s => s.id === selectedSalleId);

  return (
    <ProtectedLayout pageTitle="Nouvelle réservation">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4', mb: '8' })}>
        <h1>Nouvelle Réservation Page</h1>
      </div>
    </ProtectedLayout>
  );
}
