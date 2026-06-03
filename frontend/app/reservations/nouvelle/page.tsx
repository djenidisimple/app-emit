'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Building2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { api } from '@/services/api';
import { Salle, Creneau } from '@/types';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    api.get<Creneau[]>('/creneaux').then(setCreneaux).catch(() => {});
  }, []);

  const StepCircle = ({ num, label, active, done }: { num: Step; label: string; active: boolean; done: boolean }) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done ? 'bg-[#2E7D32] text-white' : active ? 'bg-[#1B3A6B] text-white' : 'bg-[#E9ECEF] text-[#ADB5BD]'
      }`}>
        {done ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-[#1B3A6B] font-bold' : done ? 'text-[#2E7D32]' : 'text-[#ADB5BD]'}`}>{label}</span>
    </div>
  );

  const handleStep1 = async () => {
    if (!date || !creneauId) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Salle[]>(`/Salles/disponibles?date=${date}&creneauId=${creneauId}`);
      setSalles(data);
      setStep(2);
    } catch {
      setError('Erreur lors du chargement des salles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!titre || !selectedSalleId) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      const creneauObj = creneaux.find(c => c.id === parseInt(creneauId));
      const sessionLabel = creneauObj ? `${creneauObj.jour} ${creneauObj.heureDebut.slice(0,5)}-${creneauObj.heureFin.slice(0,5)}` : '';
      await api.post('/Reservation', { titre, type, datePrecise: date, salleId: selectedSalleId, session: sessionLabel });
      setSubmitted(true);
    } catch {
      setError('Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ProtectedLayout pageTitle="Nouvelle réservation">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-8">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <h2 className="text-xl font-bold text-[#212529] mb-2">Demande soumise !</h2>
            <p className="text-sm text-[#6C757D] mb-6">
              Votre demande est en attente de validation par l&apos;administrateur. Vous recevrez une notification dès qu&apos;elle sera traitée.
            </p>
            <button
              onClick={() => router.push('/reservations')}
              className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors duration-150"
            >
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
        <div className="w-12 h-px bg-[#E9ECEF]" />
        <StepCircle num={2} label="Choisir une salle" active={step === 2} done={step > 2} />
        <div className="w-12 h-px bg-[#E9ECEF]" />
        <StepCircle num={3} label="Détails & Confirmation" active={step === 3} done={step > 3} />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {step === 1 && (
        <div className="max-w-lg mx-auto bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Date souhaitée</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Créneau horaire</label>
            <select value={creneauId} onChange={e => setCreneauId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150">
              <option value="">Sélectionner...</option>
              {creneaux.map(c => (
                <option key={c.id} value={c.id}>
                  {c.jour} — {c.heureDebut.slice(0, 5)} - {c.heureFin.slice(0, 5)}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleStep1} disabled={loading}
            className="w-full bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2">
            Voir les salles disponibles <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {salles.map(salle => (
              <button
                key={salle.id}
                onClick={() => setSelectedSalleId(salle.id)}
                className={`bg-white rounded-xl border-2 shadow-sm p-5 text-left transition-all duration-150 hover:shadow-md ${
                  selectedSalleId === salle.id ? 'border-[#1B3A6B]' : 'border-[#E9ECEF]'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E8EEF8] rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#1B3A6B]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#212529]">{salle.libelle || salle.nom}</p>
                    <p className="text-xs text-[#6C757D]">{salle.capacite} places · {salle.type}</p>
                  </div>
                </div>
                {selectedSalleId === salle.id && (
                  <div className="flex items-center gap-1 text-xs text-[#2E7D32] font-semibold">
                    <Check className="w-3 h-3" /> Sélectionnée
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="border border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#E8EEF8] font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button onClick={() => setStep(3)} disabled={!selectedSalleId}
              className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2 disabled:opacity-50">
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-[#E8EEF8] rounded-xl p-4 space-y-2 text-sm">
            <p><strong>Date :</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Créneau :</strong> {creneaux.find(c => c.id === parseInt(creneauId))?.jour} — {creneaux.find(c => c.id === parseInt(creneauId))?.heureDebut?.slice(0,5)} - {creneaux.find(c => c.id === parseInt(creneauId))?.heureFin?.slice(0,5)}</p>
            <p><strong>Salle :</strong> {selectedSalle?.libelle || selectedSalle?.nom}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-6 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Titre de la réservation</label>
              <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex: Réunion club"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150">
                <option>Cours</option>
                <option>Examen</option>
                <option>TP</option>
                <option>Réunion</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Motif / Description (optionnel)</label>
              <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150 resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2">
              {loading ? 'Envoi...' : '✓ Soumettre la demande'}
            </button>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
