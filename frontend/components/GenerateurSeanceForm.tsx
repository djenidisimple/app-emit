'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Parcours, Niveau, Matiere, Utilisateur, Salle, Creneau, GenerationSeancePayload } from '@/types';
import { parcoursService } from '@/services/parcours';
import { niveauService } from '@/services/niveaux';
import { matiereService } from '@/services/matieres';
import { utilisateurService } from '@/services/utilisateurs';
import { salleService } from '@/services/salles';
import { creneauService } from '@/services/creneaux';
import { generateurService } from '@/services/generateur';
import { Button } from '@/components/ui/button';
import { css } from 'styled-system/css';

interface FormValues {
  parcoursId: number;
  niveauId: number;
  matiereId: number;
  profId: number;
  salleId: number;
  creneauId: number;
  dateDebut: string;
  dateFin: string;
}

export default function GenerateurSeanceForm() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>();
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [niveauxList, setNiveauxList] = useState<Niveau[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Utilisateur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  const selectedParcoursId = watch('parcoursId');

  useEffect(() => {
    Promise.all([
      parcoursService.getAll(),
      matiereService.getAll(),
      utilisateurService.getEnseignants(),
      salleService.getAll(),
      creneauService.getAll(),
    ]).then(([parcours, mat, profs, sallesList, creneauxList]) => {
      setParcoursList(parcours);
      setMatieres(mat);
      setEnseignants(profs);
      setSalles(sallesList);
      setCreneaux(creneauxList);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedParcoursId) {
      niveauService.getAll().then(allNiveaux => {
        const filtered = allNiveaux.filter(n => n.parcoursId === selectedParcoursId);
        setNiveauxList(filtered);
        setValue('niveauId', filtered.length ? filtered[0].id : 0);
      });
    } else {
      setNiveauxList([]);
    }
  }, [selectedParcoursId, setValue]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setResultMsg(null);
    try {
      const payload: GenerationSeancePayload = {
        parcoursId: data.parcoursId,
        niveauId: data.niveauId,
        matiereId: data.matiereId,
        profId: data.profId,
        salleId: data.salleId,
        creneauId: data.creneauId,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
      };
      const result = await generateurService.generer(payload);
      setResultMsg({ type: 'success', text: `${result.length} séance(s) générée(s) avec succès.` });
    } catch (err: unknown) {
      setResultMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  const selectCls = css({
    w: '100%',
    border: '1px solid',
    borderColor: 'border.default',
    rounded: 'lg',
    px: '3',
    py: '2',
    fontSize: 'sm',
    color: 'fg.default',
    bg: 'bg.surface',
    outline: 'none',
    _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(79,94,255,0.15)' },
  });

  const labelCls = css({
    display: 'block',
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'fg.muted',
    mb: '1',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={css({ spaceY: '5', bg: 'bg.surface', p: '6', rounded: 'lg', border: '1px solid', borderColor: 'border.default' })}>
      <h2 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'fg.default', mb: '4' })}>Générer des séances de cours</h2>

      <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr' }, gap: '4' })}>
        <div>
          <label className={labelCls}>Parcours</label>
          <select {...register('parcoursId', { required: true })} className={selectCls}>
            <option value="">Sélectionner</option>
            {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {errors.parcoursId && <p className={css({ color: '#ef4444', fontSize: 'sm', mt: '1' })}>Requis</p>}
        </div>

        <div>
          <label className={labelCls}>Niveau</label>
          <select {...register('niveauId', { required: true })} className={selectCls} disabled={!selectedParcoursId}>
            {niveauxList.map(n => <option key={n.id} value={n.id}>{n.code}</option>)}
          </select>
          {errors.niveauId && <p className={css({ color: '#ef4444', fontSize: 'sm', mt: '1' })}>Requis</p>}
        </div>

        <div>
          <label className={labelCls}>Matière</label>
          <select {...register('matiereId', { required: true })} className={selectCls}>
            <option value="">Choisir</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Enseignant (Professeur)</label>
          <select {...register('profId', { required: true })} className={selectCls}>
            <option value="">Choisir</option>
            {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Salle</label>
          <select {...register('salleId', { required: true })} className={selectCls}>
            <option value="">Choisir</option>
            {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.type}, cap. {s.capacite})</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Créneau horaire</label>
          <select {...register('creneauId', { required: true })} className={selectCls}>
            <option value="">Choisir</option>
            {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} {c.heureDebut.slice(0,5)} - {c.heureFin.slice(0,5)}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Date de début</label>
          <input type="date" {...register('dateDebut', { required: true })} className={selectCls} />
        </div>

        <div>
          <label className={labelCls}>Date de fin</label>
          <input type="date" {...register('dateFin', { required: true })} className={selectCls} />
        </div>
      </div>

      {resultMsg && (
        <div className={css({ p: '3', rounded: 'lg', fontSize: 'sm', fontWeight: 'medium', bg: resultMsg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: resultMsg.type === 'success' ? '#10b981' : '#ef4444', border: '1px solid', borderColor: resultMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' })}>
          {resultMsg.text}
        </div>
      )}

      <Button type="submit" loading={loading}>
        Générer les séances
      </Button>
    </form>
  );
}
