// components/GenerateurSeanceForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>();
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
    // Chargement des données
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
    } catch (err: any) {
      setResultMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Générer des séances de cours</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Parcours</label>
          <select {...register('parcoursId', { required: true })} className="w-full border p-2 rounded">
            <option value="">Sélectionner</option>
            {parcoursList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
          {errors.parcoursId && <p className="text-red-500 text-sm">Requis</p>}
        </div>

        <div>
          <label className="block font-medium">Niveau</label>
          <select {...register('niveauId', { required: true })} className="w-full border p-2 rounded" disabled={!selectedParcoursId}>
            {niveauxList.map(n => <option key={n.id} value={n.id}>{n.code}</option>)}
          </select>
          {errors.niveauId && <p className="text-red-500 text-sm">Requis</p>}
        </div>

        <div>
          <label className="block font-medium">Matière</label>
          <select {...register('matiereId', { required: true })} className="w-full border p-2 rounded">
            <option value="">Choisir</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Enseignant (Professeur)</label>
          <select {...register('profId', { required: true })} className="w-full border p-2 rounded">
            <option value="">Choisir</option>
            {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Salle</label>
          <select {...register('salleId', { required: true })} className="w-full border p-2 rounded">
            <option value="">Choisir</option>
            {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.type}, cap. {s.capacite})</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Créneau horaire</label>
          <select {...register('creneauId', { required: true })} className="w-full border p-2 rounded">
            <option value="">Choisir</option>
            {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} {c.heureDebut.slice(0,5)} - {c.heureFin.slice(0,5)}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Date de début (YYYY-MM-DD)</label>
          <input type="date" {...register('dateDebut', { required: true })} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium">Date de fin</label>
          <input type="date" {...register('dateFin', { required: true })} className="w-full border p-2 rounded" />
        </div>
      </div>

      {resultMsg && (
        <div className={`p-3 rounded ${resultMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {resultMsg.text}
        </div>
      )}

      <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition">
        {loading ? 'Génération...' : 'Générer les séances'}
      </button>
    </form>
  );
}