'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Building2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { api } from '@/services/api';
import { Salle, Creneau } from '@/types';
import { useRouter } from 'next/navigation';
import { css } from 'styled-system/css';

type Step = 1 | 2 | 3;

const inputCls = css({ w: 'full', px: '3', py: '2.5', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } });
const labelCls = css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.subtle', textTransform: 'uppercase', letterSpacing: 'wide' });

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

  useEffect(() => { api.get<Creneau[]>('/creneaux').then(setCreneaux).catch(() => {}); }, []);

  const StepCircle = ({ num, label, active, done }: { num: Step; label: string; active: boolean; done: boolean }) => (
    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
      <div className={css({
        w: '8', h: '8', rounded: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'sm', fontWeight: 'bold', transition: 'colors 0.15s',
        bg: done || active ? 'accent.default' : 'bg.muted',
        color: done || active ? '#fff' : 'fg.subtle',
      })}>
        {done ? <Check className={css({ w: '4', h: '4' })} /> : num}
      </div>
      <span className={css({ fontSize: 'sm', fontWeight: active || done ? 'bold' : 'medium', color: active || done ? 'fg.default' : 'fg.subtle' })}>{label}</span>
    </div>
  );

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
              Votre demande est en attente de validation par l&apos;administrateur.
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
        <StepCircle num={1} label="Date & Créneau" active={step === 1} done={step > 1} />
        <div className={css({ w: '12', h: 'px', bg: 'bg.muted' })} />
        <StepCircle num={2} label="Choisir une salle" active={step === 2} done={step > 2} />
        <div className={css({ w: '12', h: 'px', bg: 'bg.muted' })} />
        <StepCircle num={3} label="Détails" active={step === 3} done={step > 3} />
      </div>

      {error && <div className={css({ mb: '4', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', rounded: 'lg', px: '4', py: '3', fontSize: 'sm', color: '#ef4444' })}>{error}</div>}

      {step === 1 && (
        <div className={css({ maxW: 'lg', mx: 'auto', bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '6', spaceY: '4' })}>
          <div><label className={labelCls}>Date souhaitée</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputCls} /></div>
          <div><label className={labelCls}>Créneau horaire</label>
            <select value={creneauId} onChange={e => setCreneauId(e.target.value)} className={inputCls}>
              <option value="">Sélectionner...</option>
              {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} — {c.heureDebut.slice(0, 5)} - {c.heureFin.slice(0, 5)}</option>)}
            </select>
          </div>
          <button onClick={handleStep1} disabled={loading}
            className={css({ w: 'full', bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
            Voir les salles disponibles <ArrowRight className={css({ w: '4', h: '4' })} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: '4', mb: '6' })}>
            {salles.map(salle => (
              <button key={salle.id} onClick={() => setSelectedSalleId(salle.id)}
                className={css({
                  bg: 'bg.surface', rounded: 'lg', border: '2px solid', p: '5', textAlign: 'left', transition: 'all 0.15s',
                  borderColor: selectedSalleId === salle.id ? 'accent.default' : 'border.default',
                  _hover: { shadow: 'md' },
                })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '3' })}>
                  <div className={css({ w: '10', h: '10', bg: 'bg.muted', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                    <Building2 className={css({ w: '5', h: '5', color: 'accent.default' })} />
                  </div>
                  <div>
                    <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>{salle.libelle || salle.nom}</p>
                    <p className={css({ fontSize: 'xs', color: 'fg.subtle' })}>{salle.capacite} places · {salle.type}</p>
                  </div>
                </div>
                {selectedSalleId === salle.id && (
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '1', fontSize: 'xs', color: '#10b981', fontWeight: 'semibold' })}>
                    <Check className={css({ w: '3', h: '3' })} /> Sélectionnée
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className={css({ display: 'flex', gap: '3' })}>
            <button onClick={() => setStep(1)}
              className={css({ border: '1px solid', borderColor: 'accent.default', color: 'accent.default', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { bg: 'bg.muted' } })}>
              <ArrowLeft className={css({ w: '4', h: '4' })} /> Retour
            </button>
            <button onClick={() => setStep(3)} disabled={!selectedSalleId}
              className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 }, _disabled: { opacity: 0.5 } })}>
              Continuer <ArrowRight className={css({ w: '4', h: '4' })} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={css({ maxW: 'lg', mx: 'auto', spaceY: '4' })}>
          <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '4', spaceY: '2', fontSize: 'sm', color: 'fg.default' })}>
            <p><strong>Date :</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Créneau :</strong> {creneaux.find(c => c.id === parseInt(creneauId))?.jour} — {creneaux.find(c => c.id === parseInt(creneauId))?.heureDebut?.slice(0,5)} - {creneaux.find(c => c.id === parseInt(creneauId))?.heureFin?.slice(0,5)}</p>
            <p><strong>Salle :</strong> {selectedSalle?.libelle || selectedSalle?.nom}</p>
          </div>
          <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '6', spaceY: '4' })}>
            <div><label className={labelCls}>Titre</label>
              <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex: Réunion club" className={inputCls} /></div>
            <div><label className={labelCls}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                <option>Cours</option><option>Examen</option><option>TP</option><option>Réunion</option><option>Autre</option>
              </select>
            </div>
            <div><label className={labelCls}>Motif (optionnel)</label>
              <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                className={css({ w: 'full', px: '3', py: '2.5', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', resize: 'none', _focus: { borderColor: 'accent.default' } })} />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className={css({ w: 'full', bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
              {loading ? 'Envoi...' : '✓ Soumettre la demande'}
            </button>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
