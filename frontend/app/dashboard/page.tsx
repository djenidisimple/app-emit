'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, CalendarDays, AlertCircle, BookOpen, Clock, MapPin, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import SeanceCard from '@/components/global/SeanceCard';
import StatusBadge from '@/components/global/StatusBadge';
import StatCard from '@/components/global/StatCard';
import { ScolariteDashboard } from '@/components/dashboard/ScolariteDashboard';
import { ProfesseurDashboard } from '@/components/dashboard/ProfesseurDashboard';
import { SeancePlanningDto, PlanningHebdoResponse, DemandeEchangeReadDto, ExamenReadDto, ReservationReadDto } from '@/types';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { examenService } from '@/services/examens';
import Link from 'next/link';

export default function DashboardPage() {
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [demandesRecues, setDemandesRecues] = useState<DemandeEchangeReadDto[]>([]);
  const [examens, setExamens] = useState<ExamenReadDto[]>([]);
  const [reservations, setReservations] = useState<ReservationReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const role = user?.role || user?.roles?.[0] || '';
  const isAdmin = role === 'Admin' || role === 'Scolarite';
  const isProf = role === 'Professeur';
  const isEtudiant = role === 'Etudiant';

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      let url = `/Planning/hebdo?startDate=${today}`;
      if (isEtudiant && user.niveauId) url += `&niveauId=${user.niveauId}`;
      else if (isProf && user.id) url += `&professeurId=${user.id}`;
      const res = await api.get<PlanningHebdoResponse>(url);
      if (res?.seances) setSeances(res.seances);
    } catch {
      setError('Impossible de charger le planning.');
    } finally { setIsLoading(false); }
  }, [user, isEtudiant, isProf]);

  const fetchDemandes = useCallback(async () => {
    if (!user || !isProf) return;
    try {
      const data = await api.get<DemandeEchangeReadDto[]>(`/DemandeEchange?professeurId=${user.id}`);
      setDemandesRecues(data.filter((d) => d.cibleId === user.id && d.statut === 'EnAttente'));
    } catch { /* ignore */ }
  }, [user, isProf]);

  const fetchExamens = useCallback(async () => {
    if (!user || !isProf) return;
    try {
      const all = await examenService.getAll();
      const miens = all.filter((e) => e.professeurId === user.id);
      setExamens(miens);
    } catch { /* ignore */ }
  }, [user, isProf]);

  const fetchStarted = useRef(false);
  useEffect(() => {
    if (!fetchStarted.current) {
      fetchStarted.current = true;
      setTimeout(() => {
        fetchData();
        if (isProf) { fetchDemandes(); fetchExamens(); }
        if (isEtudiant && user?.niveauId) {
          examenService.getByNiveau(user.niveauId).then(setExamens).catch(() => {});
          api.get<ReservationReadDto[]>(`/Reservation/utilisateur/${user.id}`).then(setReservations).catch(() => {});
        }
      }, 0);
    }
  }, [fetchData, fetchDemandes, fetchExamens, isProf, isEtudiant, user]);

  const handleTerminer = async (seance: SeancePlanningDto) => {
    try {
      await api.patch(`/seances/${seance.id}/terminer`);
      setSeances((prev) => prev.map((s) => s.id === seance.id ? { ...s, statut: 'Terminee' } : s));
    } catch { /* ignore */ }
  };

  const handleEchangeAction = async (id: number, statut: string) => {
    try {
      await api.patch(`/DemandeEchange/${id}/statut`, { statut });
      setDemandesRecues((prev) => prev.filter((d) => d.id !== id));
    } catch { /* ignore */ }
  };

  const triees = [...seances].sort((a, b) => {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const ia = jours.indexOf(a.jour), ib = jours.indexOf(b.jour);
    if (ia !== ib) return ia - ib;
    return a.heureDebut.localeCompare(b.heureDebut);
  });

  const enCours = seances.filter((s) => s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé').length;
  const terminees = seances.filter((s) => s.statut === 'Terminee' || s.statut === 'Terminé').length;

  if (isAdmin) {
    return (
      <ProtectedLayout pageTitle="Tableau de bord">
        <ScolariteDashboard />
      </ProtectedLayout>
    );
  }

  if (isProf) {
    return (
      <ProtectedLayout pageTitle="Tableau de bord">
        <ProfesseurDashboard
          seances={seances}
          demandesRecues={demandesRecues}
          examens={examens}
          isLoading={isLoading}
          error={error}
          user={user}
          onTerminer={handleTerminer}
          handleEchangeAction={handleEchangeAction}
        />
      </ProtectedLayout>
    );
  }

  const now = new Date();
  const prochaineSeance = triees.find((s) => {
    const joursMap: Record<string, number> = { Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5 };
    const todayIdx = now.getDay() === 0 ? -1 : now.getDay() - 1;
    const seanceIdx = joursMap[s.jour] ?? -1;
    return seanceIdx >= todayIdx && s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé';
  });
  const prochainExamen = examens
    .filter((e) => new Date(e.dateExamen) >= now)
    .sort((a, b) => new Date(a.dateExamen).getTime() - new Date(b.dateExamen).getTime())[0];
  const recentReservations = reservations.slice(-3).reverse();

  return (
    <ProtectedLayout pageTitle={isEtudiant ? 'Mon espace' : 'Mon planning'}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {isEtudiant && (
          <div className="space-y-4">
            {prochaineSeance && (
              <div className="bg-accent rounded-lg p-5 text-white">
                <p className="text-xs font-medium opacity-80 mb-1">
                  Prochaine séance
                </p>
                <p className="text-lg font-bold mb-1">
                  {prochaineSeance.matiereNom}
                </p>
                <div className="flex items-center gap-3 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {prochaineSeance.jour}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {prochaineSeance.heureDebut?.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {prochaineSeance.salleNom}
                  </span>
                </div>
              </div>
            )}

            {prochainExamen && (
              <div className="bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] rounded-lg p-4 flex items-start gap-3">
                <BookOpen size={18} className="text-[#f59e0b] mt-0.5 shrink-0" />
                <div className="space-y-0.5 text-sm">
                  <p className="font-semibold text-[#f59e0b]">
                    Examen à venir : {prochainExamen.matiereNom}
                  </p>
                  <p className="text-[#f59e0b] text-xs">
                    {new Date(prochainExamen.dateExamen).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — {prochainExamen.heureDebut?.slice(0, 5)}
                  </p>
                  <p className="text-[#f59e0b] text-xs">
                    {prochainExamen.salleNom} · {prochainExamen.professeurNom}
                  </p>
                </div>
              </div>
            )}

             <div className="flex gap-2 justify-center">
               <Link href="/student/reservations/nouvelle"
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-accent text-white hover:opacity-90">
                 Réserver une salle
               </Link>
               <button
                 onClick={async () => {
                   const payload = { 
                     AnneeUniversitaire: '2025-2026', 
                     DateDebut: new Date().toISOString(), 
                     DateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                     UtilisateurId: user?.id 
                   };
                   try {
                     const blob = await api.postBlob('/Document/export/pdf', payload);
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url; a.download = 'mon_emploi_du_temps.pdf'; a.click();
                     URL.revokeObjectURL(url);
                   } catch (e) { console.error(e); }
                 }}
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-fg-default border border-border hover:bg-bg-muted">
                 <Download size={16} /> Exporter mon EDT
               </button>
             </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm bg-[rgba(239,68,68,0.1)] text-[#ef4444] flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StatCard label="Séances cette semaine" value={seances.length} />
          <StatCard label="Terminées" value={terminees} variant="success" />
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-border border-t-accent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : triees.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <CalendarDays size={28} className="text-fg-subtle mx-auto mb-3" />
            <p className="text-fg-default font-semibold mb-1">Aucune séance cette semaine</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {triees.map((seance) => (
              <SeanceCard key={seance.id} seance={seance} mode={isEtudiant ? 'etudiant' : 'professeur'} />
            ))}
          </div>
        )}

        {isEtudiant && recentReservations.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-fg-default mb-3">
              Dernières réservations
            </h2>
            <div className="flex flex-col gap-2">
              {recentReservations.map((r) => (
                <div key={r.id} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-fg-default">{r.titre}</p>
                    <p className="text-xs text-fg-muted">
                      {new Date(r.datePrecise).toLocaleDateString('fr-FR')} — {r.salleLibelle}
                    </p>
                  </div>
                  <StatusBadge status={r.statut === 'Confirmée' ? 'confirmee' : r.statut === 'En attente' ? 'en-attente' : 'annulee'} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
