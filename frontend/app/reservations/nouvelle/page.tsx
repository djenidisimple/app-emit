'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Building2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { api } from '@/services/api';
import { Salle, Creneau } from '@/types';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3;

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-fg-default bg-surface outline-none focus:border-accent';
const labelCls = 'text-xs font-semibold text-fg-subtle uppercase tracking-wide';

const StepCircle = ({ num, label, active, done }: { num: Step; label: string; active: boolean; done: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-150 ${done || active ? 'bg-accent text-white' : 'bg-bg-muted text-fg-subtle'}`}>
      {done ? <Check className="w-4 h-4" /> : num}
    </div>
    <span className={`text-sm ${active || done ? 'font-bold text-fg-default' : 'font-medium text-fg-subtle'}`}>{label}</span>
  </div>
);

export default function NouvelleReservationPage() {

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
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-surface rounded-lg border border-border p-8">
            <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-xl font-bold text-fg-default mb-2">Demande soumise !</h2>
            <p className="text-sm text-fg-subtle mb-6">
              Votre demande est en attente de validation par l&apos;administrateur.
            </p>
            <button onClick={() => router.push('/reservations')}
              className="bg-accent text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90">
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
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepCircle num={1} label="Date & Créneau" active={step === 1} done={step > 1} />
        <div className="w-12 h-px bg-bg-muted" />
        <StepCircle num={2} label="Choisir une salle" active={step === 2} done={step > 2} />
        <div className="w-12 h-px bg-bg-muted" />
        <StepCircle num={3} label="Détails" active={step === 3} done={step > 3} />
      </div>

      {error && <div className="mb-4 bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-3 text-sm text-[#ef4444]">{error}</div>}

      {step === 1 && (
        <div className="max-w-lg mx-auto bg-surface rounded-lg border border-border p-6 space-y-4">
          <div><label className={labelCls}>Date souhaitée</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputCls} /></div>
          <div><label className={labelCls}>Créneau horaire</label>
            <select value={creneauId} onChange={e => setCreneauId(e.target.value)} className={inputCls}>
              <option value="">Sélectionner...</option>
              {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} — {c.heureDebut.slice(0, 5)} - {c.heureFin.slice(0, 5)}</option>)}
            </select>
          </div>
          <button onClick={handleStep1} disabled={loading}
            className="w-full bg-accent text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90">
            Voir les salles disponibles <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {salles.map(salle => (
              <button key={salle.id} onClick={() => setSelectedSalleId(salle.id)}
                className={`bg-surface rounded-lg border-2 p-5 text-left transition-all duration-150 ${selectedSalleId === salle.id ? 'border-accent' : 'border-border'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-fg-default">{salle.libelle || salle.nom}</p>
                    <p className="text-xs text-fg-subtle">{salle.capacite} places · {salle.type}</p>
                  </div>
                </div>
                {selectedSalleId === salle.id && (
                  <div className="flex items-center gap-1 text-xs text-[#10b981] font-semibold">
                    <Check className="w-3 h-3" /> Sélectionnée
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="border border-accent text-accent font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-bg-muted">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button onClick={() => setStep(3)} disabled={!selectedSalleId}
              className="bg-accent text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-bg-muted rounded-lg p-4 space-y-2 text-sm text-fg-default">
            <p><strong>Date :</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Créneau :</strong> {creneaux.find(c => c.id === parseInt(creneauId))?.jour} — {creneaux.find(c => c.id === parseInt(creneauId))?.heureDebut?.slice(0,5)} - {creneaux.find(c => c.id === parseInt(creneauId))?.heureFin?.slice(0,5)}</p>
            <p><strong>Salle :</strong> {selectedSalle?.libelle || selectedSalle?.nom}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <div><label className={labelCls}>Titre</label>
              <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex: Réunion club" className={inputCls} /></div>
            <div><label className={labelCls}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                <option>Cours</option><option>Examen</option><option>TP</option><option>Réunion</option><option>Autre</option>
              </select>
            </div>
            <div><label className={labelCls}>Motif (optionnel)</label>
              <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-fg-default bg-surface outline-none resize-none focus:border-accent" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-accent text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90">
              {loading ? 'Envoi...' : '✓ Soumettre la demande'}
            </button>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
