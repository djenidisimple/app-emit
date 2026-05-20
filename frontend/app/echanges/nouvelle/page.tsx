'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ArrowLeft, Send } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';
import { UtilisateurDto, SeancePlanningDto, DemandeEchangeCreateDto } from '@/types';

export default function NouvelleDemandePage() {
  const [professeurs, setProfesseurs] = useState<UtilisateurDto[]>([]);
  const [mesSeances, setMesSeances] = useState<SeancePlanningDto[]>([]);
  const [seancesCible, setSeancesCible] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    cibleId: '',
    seanceDemandeurId: '',
    seanceCibleId: '',
    motif: ''
  });

  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      // Charger tous les professeurs
      const profsRes = await api.get<UtilisateurDto[]>('/Utilisateur');
      const autresProfesseurs = profsRes.data.filter(
        p => p.role === 'Professeur' && p.id !== user?.id
      );
      setProfesseurs(autresProfesseurs);

      // Charger mes séances
      if (user?.id) {
        const today = new Date().toISOString().split('T')[0];
        const planningRes = await api.get(
          `/Planning/hebdo?startDate=${today}&professeurId=${user.id}`
        );
        setMesSeances(planningRes.data.seances || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCibleChange = async (cibleId: string) => {
    setForm({ ...form, cibleId, seanceCibleId: '' });
    if (!cibleId) { setSeancesCible([]); return; }

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(
        `/Planning/hebdo?startDate=${today}&professeurId=${cibleId}`
      );
      setSeancesCible(res.data.seances || []);
    } catch (err) {
      console.error(err);
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
        demandeurId: user?.id!,
        cibleId: parseInt(form.cibleId),
        seanceDemandeurId: parseInt(form.seanceDemandeurId),
        seanceCibleId: parseInt(form.seanceCibleId),
        motif: form.motif || undefined
      };

      await api.post('/DemandeEchange', payload);
      router.push('/echanges/mes-demandes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emit-bg">
        <Navbar />
        <div className="flex justify-center pt-40">
          <div className="w-10 h-10 border-4 border-emit-blue border-t-emit-orange rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emit-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-28 pb-10 px-4">

        {/* Header */}
        <div className="mb-8">
          <Link href="/echanges/mes-demandes" className="inline-flex items-center gap-2 text-emit-text/50 hover:text-emit-blue text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Retour aux demandes
          </Link>
          <h1 className="text-3xl font-poppins font-bold text-emit-blue">
            Nouvelle demande d'échange
          </h1>
          <p className="text-emit-text/60 mt-1">
            Proposez un échange de créneau avec un autre professeur.
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border border-emit-border rounded-md p-6 space-y-5"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Professeur cible */}
          <div>
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-2">
              Professeur cible *
            </label>
            <select
              value={form.cibleId}
              onChange={e => handleCibleChange(e.target.value)}
              className="w-full p-2.5 border border-emit-border rounded-md outline-none focus:ring-2 focus:ring-emit-blue/20 text-sm"
              required
            >
              <option value="">Sélectionner un professeur...</option>
              {professeurs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Ma séance */}
          <div>
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-2">
              Ma séance à échanger *
            </label>
            <select
              value={form.seanceDemandeurId}
              onChange={e => setForm({ ...form, seanceDemandeurId: e.target.value })}
              className="w-full p-2.5 border border-emit-border rounded-md outline-none focus:ring-2 focus:ring-emit-blue/20 text-sm"
              required
            >
              <option value="">Sélectionner ma séance...</option>
              {mesSeances.map(s => (
                <option key={s.id} value={s.id}>
                  {s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}
                </option>
              ))}
            </select>
          </div>

          {/* Séance cible */}
          <div>
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-2">
              Séance du professeur cible *
            </label>
            <select
              value={form.seanceCibleId}
              onChange={e => setForm({ ...form, seanceCibleId: e.target.value })}
              className="w-full p-2.5 border border-emit-border rounded-md outline-none focus:ring-2 focus:ring-emit-blue/20 text-sm"
              disabled={!form.cibleId}
              required
            >
              <option value="">
                {form.cibleId ? 'Sélectionner la séance...' : 'Choisir un professeur d\'abord'}
              </option>
              {seancesCible.map(s => (
                <option key={s.id} value={s.id}>
                  {s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}
                </option>
              ))}
            </select>
          </div>

          {/* Visualisation de l'échange */}
          {form.seanceDemandeurId && form.seanceCibleId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emit-bg border border-emit-border rounded-md p-4"
            >
              <p className="text-xs font-bold text-emit-blue uppercase mb-3">
                Aperçu de l'échange
              </p>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 bg-white border border-emit-border rounded-md p-2.5 text-center">
                  <p className="text-xs text-emit-text/50 mb-1">Votre séance</p>
                  <p className="font-semibold text-emit-blue">
                    {mesSeances.find(s => s.id === parseInt(form.seanceDemandeurId))?.matiereNom}
                  </p>
                </div>
                <ArrowLeftRight size={20} className="text-emit-orange flex-shrink-0" />
                <div className="flex-1 bg-white border border-emit-border rounded-md p-2.5 text-center">
                  <p className="text-xs text-emit-text/50 mb-1">Séance cible</p>
                  <p className="font-semibold text-emit-blue">
                    {seancesCible.find(s => s.id === parseInt(form.seanceCibleId))?.matiereNom}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Motif */}
          <div>
            <label className="text-xs font-bold text-emit-blue uppercase tracking-wider block mb-2">
              Motif (optionnel)
            </label>
            <textarea
              value={form.motif}
              onChange={e => setForm({ ...form, motif: e.target.value })}
              placeholder="Expliquez la raison de votre demande..."
              rows={3}
              className="w-full p-2.5 border border-emit-border rounded-md outline-none focus:ring-2 focus:ring-emit-blue/20 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link href="/echanges/mes-demandes" className="flex-1">
              <button
                type="button"
                className="w-full py-2.5 border border-emit-border rounded-md text-sm font-semibold text-emit-text/70 hover:bg-emit-bg transition-colors"
              >
                Annuler
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emit-orange text-white rounded-md text-sm font-semibold hover:bg-emit-orange/90 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}