'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Repeat } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { UtilisateurDto, SeancePlanningDto, DemandeEchangeCreateDto } from '@/types';

export default function NouvelleEchangePage() {
  const [professeurs, setProfesseurs] = useState<UtilisateurDto[]>([]);
  const [mesSeances, setMesSeances] = useState<SeancePlanningDto[]>([]);
  const [seancesCible, setSeancesCible] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ cibleId: '', seanceDemandeurId: '', seanceCibleId: '', motif: '' });
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const profsData = await api.get<UtilisateurDto[]>('/Utilisateur');
        setProfesseurs(profsData.filter((p: UtilisateurDto) => p.role === 'Professeur' && p.id !== user.id));
        const today = new Date().toISOString().split('T')[0];
        const planningData = await api.get(`/Planning/hebdo?startDate=${today}&professeurId=${user.id}`);
        setMesSeances(planningData.seances || []);
      } catch {
        setError('Erreur lors du chargement des données.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleCibleChange = async (cibleId: string) => {
    setForm({ ...form, cibleId, seanceCibleId: '' });
    if (!cibleId) { setSeancesCible([]); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      const planningData = await api.get(`/Planning/hebdo?startDate=${today}&professeurId=${cibleId}`);
      setSeancesCible(planningData.seances || []);
    } catch {
      setError('Erreur lors du chargement des séances du professeur.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.cibleId || !form.seanceDemandeurId || !form.seanceCibleId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: DemandeEchangeCreateDto = {
        demandeurId: user!.id,
        cibleId: parseInt(form.cibleId),
        seanceDemandeurId: parseInt(form.seanceDemandeurId),
        seanceCibleId: parseInt(form.seanceCibleId),
        motif: form.motif || undefined,
      };
      await api.post('/DemandeEchange', payload);
      router.push('/echanges/mes-demandes');
    } catch {
      setError('Erreur lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout pageTitle="Nouvel échange">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout pageTitle="Proposer un échange">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-xl border border-blue-100 shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Professeur cible *</label>
          <select value={form.cibleId} onChange={e => handleCibleChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150">
            <option value="">Sélectionner un professeur...</option>
            {professeurs.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Ma séance à échanger *</label>
          <select value={form.seanceDemandeurId} onChange={e => setForm({ ...form, seanceDemandeurId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150">
            <option value="">Sélectionner ma séance...</option>
            {mesSeances.map(s => <option key={s.id} value={s.id}>{s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Séance souhaitée en échange *</label>
          <select value={form.seanceCibleId} onChange={e => setForm({ ...form, seanceCibleId: e.target.value })}
            disabled={!form.cibleId}
            className="w-full px-3 py-2.5 rounded-lg border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150 disabled:opacity-50">
            <option value="">{form.cibleId ? 'Sélectionner la séance...' : 'Choisir un professeur d\'abord'}</option>
            {seancesCible.map(s => <option key={s.id} value={s.id}>{s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}</option>)}
          </select>
        </div>

        {form.seanceDemandeurId && form.seanceCibleId && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Aperçu de l&apos;échange</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 bg-white rounded-lg p-2.5 text-center border border-blue-100">
                <p className="text-xs text-blue-500 mb-1">Ma séance</p>
                <p className="font-semibold text-blue-900">{mesSeances.find(s => s.id === parseInt(form.seanceDemandeurId))?.matiereNom}</p>
              </div>
              <Repeat className="w-5 h-5 text-[#0052FF]" />
              <div className="flex-1 bg-white rounded-lg p-2.5 text-center border border-blue-100">
                <p className="text-xs text-blue-500 mb-1">Séance souhaitée</p>
                <p className="font-semibold text-blue-900">{seancesCible.find(s => s.id === parseInt(form.seanceCibleId))?.matiereNom}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Motif (optionnel)</label>
          <textarea value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-blue-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all duration-150 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-blue-200 text-blue-500 hover:bg-blue-50 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Annuler
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 bg-[#0052FF] hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" /> {isSubmitting ? 'Envoi...' : 'Envoyer la proposition'}
          </button>
        </div>
      </form>
    </ProtectedLayout>
  );
}
