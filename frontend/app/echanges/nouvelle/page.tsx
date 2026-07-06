'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Repeat } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { UtilisateurDto, SeancePlanningDto, DemandeEchangeCreateDto, PlanningHebdoResponse } from '@/types';
import { css } from 'styled-system/css';

const inputCls = css({ w: 'full', px: '3', py: '2.5', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } });
const labelCls = css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wide' });

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
        setProfesseurs(profsData.filter((p) => p.role === 'Professeur' && p.id !== user.id));
        const today = new Date().toISOString().split('T')[0];
        const planningData = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${today}&professeurId=${user.id}`);
        setMesSeances(planningData.seances || []);
      } catch { setError('Erreur lors du chargement des données.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const handleCibleChange = async (cibleId: string) => {
    setForm({ ...form, cibleId, seanceCibleId: '' });
    if (!cibleId) { setSeancesCible([]); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      const planningData = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${today}&professeurId=${cibleId}`);
      setSeancesCible(planningData.seances || []);
    } catch { setError('Erreur lors du chargement des séances du professeur.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.cibleId || !form.seanceDemandeurId || !form.seanceCibleId) { setError('Veuillez remplir tous les champs.'); return; }
    setIsSubmitting(true);
    try {
      const payload: DemandeEchangeCreateDto = {
        demandeurId: user!.id, cibleId: parseInt(form.cibleId),
        seanceDemandeurId: parseInt(form.seanceDemandeurId), seanceCibleId: parseInt(form.seanceCibleId),
        motif: form.motif || undefined,
      };
      await api.post('/DemandeEchange', payload);
      router.push('/echanges/mes-demandes');
    } catch { setError('Erreur lors de la soumission.'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <ProtectedLayout pageTitle="Nouvel échange">
        <div className={css({ display: 'flex', justifyContent: 'center', py: '20' })}>
          <div className={css({ w: '8', h: '8', border: '4px solid', borderColor: 'accent.default', borderTopColor: 'transparent', rounded: 'full', animation: 'spin 1s linear infinite' })} />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout pageTitle="Proposer un échange">
      <form onSubmit={handleSubmit} className={css({ maxW: '2xl', mx: 'auto', bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '6', spaceY: '5' })}>
        {error && <div className={css({ bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', rounded: 'lg', px: '4', py: '3', fontSize: 'sm', color: '#ef4444' })}>{error}</div>}

        <div><label className={labelCls}>Professeur cible *</label>
          <select value={form.cibleId} onChange={e => handleCibleChange(e.target.value)} className={inputCls}>
            <option value="">Sélectionner un professeur...</option>
            {professeurs.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
        </div>

        <div><label className={labelCls}>Ma séance à échanger *</label>
          <select value={form.seanceDemandeurId} onChange={e => setForm({ ...form, seanceDemandeurId: e.target.value })} className={inputCls}>
            <option value="">Sélectionner ma séance...</option>
            {mesSeances.map(s => <option key={s.id} value={s.id}>{s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}</option>)}
          </select>
        </div>

        <div><label className={labelCls}>Séance souhaitée en échange *</label>
          <select value={form.seanceCibleId} onChange={e => setForm({ ...form, seanceCibleId: e.target.value })}
            disabled={!form.cibleId}
            className={css({ ...inputCls as any, _disabled: { opacity: 0.5 } })}>
            <option value="">{form.cibleId ? 'Sélectionner la séance...' : 'Choisir un professeur d\'abord'}</option>
            {seancesCible.map(s => <option key={s.id} value={s.id}>{s.jour} {s.heureDebut}-{s.heureFin} — {s.matiereNom}</option>)}
          </select>
        </div>

        {form.seanceDemandeurId && form.seanceCibleId && (
          <div className={css({ bg: 'bg.muted', rounded: 'lg', p: '4' })}>
            <p className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.default', textTransform: 'uppercase', letterSpacing: 'wide', mb: '2' })}>Aperçu de l&apos;échange</p>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', fontSize: 'sm' })}>
              <div className={css({ flex: '1', bg: 'bg.surface', rounded: 'lg', p: '2.5', textAlign: 'center', border: '1px solid', borderColor: 'border.default' })}>
                <p className={css({ fontSize: 'xs', color: 'fg.muted', mb: '1' })}>Ma séance</p>
                <p className={css({ fontWeight: 'semibold', color: 'fg.default' })}>{mesSeances.find(s => s.id === parseInt(form.seanceDemandeurId))?.matiereNom}</p>
              </div>
              <Repeat className={css({ w: '5', h: '5', color: 'accent.default' })} />
              <div className={css({ flex: '1', bg: 'bg.surface', rounded: 'lg', p: '2.5', textAlign: 'center', border: '1px solid', borderColor: 'border.default' })}>
                <p className={css({ fontSize: 'xs', color: 'fg.muted', mb: '1' })}>Séance souhaitée</p>
                <p className={css({ fontWeight: 'semibold', color: 'fg.default' })}>{seancesCible.find(s => s.id === parseInt(form.seanceCibleId))?.matiereNom}</p>
              </div>
            </div>
          </div>
        )}

        <div><label className={labelCls}>Motif (optionnel)</label>
          <textarea value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} rows={3}
            className={css({ w: 'full', px: '3', py: '2.5', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', resize: 'none', _focus: { borderColor: 'accent.default' } })} />
        </div>

        <div className={css({ display: 'flex', gap: '3', pt: '2' })}>
          <button type="button" onClick={() => router.back()}
            className={css({ flex: '1', border: '1px solid', borderColor: 'border.default', color: 'fg.muted', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { bg: 'bg.muted' } })}>
            <ArrowLeft className={css({ w: '4', h: '4' })} /> Annuler
          </button>
          <button type="submit" disabled={isSubmitting}
            className={css({ flex: '1', bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { opacity: 0.9 }, _disabled: { opacity: 0.5 } })}>
            <Send className={css({ w: '4', h: '4' })} /> {isSubmitting ? 'Envoi...' : 'Envoyer la proposition'}
          </button>
        </div>
      </form>
    </ProtectedLayout>
  );
}
