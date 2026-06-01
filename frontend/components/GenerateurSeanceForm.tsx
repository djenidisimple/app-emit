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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Générer des séances de cours</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Parcours</label>
          <select {...register('parcoursId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]">
            <option value="">Sélectionner</option>
            {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {errors.parcoursId && <p className="text-red-500 text-sm mt-1">Requis</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Niveau</label>
          <select {...register('niveauId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]" disabled={!selectedParcoursId}>
            {niveauxList.map(n => <option key={n.id} value={n.id}>{n.code}</option>)}
          </select>
          {errors.niveauId && <p className="text-red-500 text-sm mt-1">Requis</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Matière</label>
          <select {...register('matiereId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]">
            <option value="">Choisir</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Enseignant (Professeur)</label>
          <select {...register('profId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]">
            <option value="">Choisir</option>
            {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Salle</label>
          <select {...register('salleId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]">
            <option value="">Choisir</option>
            {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.type}, cap. {s.capacite})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Créneau horaire</label>
          <select {...register('creneauId', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]">
            <option value="">Choisir</option>
            {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} {c.heureDebut.slice(0,5)} - {c.heureFin.slice(0,5)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Date de début</label>
          <input type="date" {...register('dateDebut', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-1">Date de fin</label>
          <input type="date" {...register('dateFin', { required: true })} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]" />
        </div>
      </div>

      {resultMsg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${resultMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {resultMsg.text}
        </div>
      )}

      <button type="submit" disabled={loading} className="bg-[#0052FF] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
        {loading ? 'Génération...' : 'Générer les séances'}
      </button>
    </form>
  );
}
