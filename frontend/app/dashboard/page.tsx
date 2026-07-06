'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { css } from 'styled-system/css';
import { ArrowLeftRight, Download, CalendarDays, CheckCheck, X, AlertCircle, BookOpen, Clock, MapPin, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import SeanceCard from '@/components/global/SeanceCard';
import StatusBadge from '@/components/global/StatusBadge';
import StatCard from '@/components/global/StatCard';
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

  const fetchStarted = useRef(false);
  useEffect(() => {
    if (!fetchStarted.current) {
      fetchStarted.current = true;
      fetchData();
      if (isProf) fetchDemandes();
      if (isEtudiant && user?.niveauId) {
        examenService.getByNiveau(user.niveauId).then(setExamens).catch(() => {});
        api.get<ReservationReadDto[]>(`/Reservation/utilisateur/${user.id}`).then(setReservations).catch(() => {});
      }
    }
  }, [fetchData, fetchDemandes, isProf, isEtudiant, user]);

  const handleTerminer = async (seance: SeancePlanningDto) => {
    try {
      await api.patch(`/SeanceCours/${seance.id}/terminer`);
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

  if (isProf) {
    return (
      <ProtectedLayout pageTitle="Mes séances">
        <div className={css({ spaceY: '6', maxW: '3xl', mx: 'auto' })}>
          <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', flexWrap: 'wrap' })}>
            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <StatCard label="En cours" value={enCours} variant="success" />
              <StatCard label="Terminées" value={terminees} variant="warning" />
              <StatCard label="Total" value={seances.length} />
            </div>
            <div className={css({ display: 'flex', gap: '2' })}>
              <Link href="/echanges/nouvelle"
                className={css({
                  display: 'inline-flex', alignItems: 'center', gap: '1.5',
                  px: '3', py: '2', rounded: 'lg', fontSize: 'xs', fontWeight: 'medium',
                  border: '1px solid', borderColor: 'accent.default', color: 'accent.default',
                  _hover: { bg: 'accent.light' }, transition: 'all 0.15s',
                })}>
                <ArrowLeftRight size={14} /> Échanger
              </Link>
              <button
                className={css({
                  display: 'inline-flex', alignItems: 'center', gap: '1.5',
                  px: '3', py: '2', rounded: 'lg', fontSize: 'xs', fontWeight: 'medium',
                  border: '1px solid', borderColor: 'border.default', color: 'fg.muted',
                  _hover: { bg: 'bg.muted' }, transition: 'all 0.15s',
                })}
                onClick={() => api.postBlob('/Document/export/pdf', {}).then((blob) => {
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                })}
              >
                <Download size={14} /> Exporter
              </button>
            </div>
          </div>

          {error && (
            <div className={css({ px: '4', py: '3', rounded: 'lg', fontSize: 'sm', bg: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2' })}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div>
            <h2 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default', mb: '3' })}>
              Mes séances de la semaine
            </h2>
            {isLoading ? (
              <div className={css({ p: '12', display: 'flex', justifyContent: 'center' })}>
                <div className={css({ w: '8', h: '8', border: '3px solid', borderColor: 'border.default', borderTopColor: 'accent.default', rounded: 'full', animation: 'spin 1s linear infinite' })} />
              </div>
            ) : triees.length === 0 ? (
              <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center' })}>
                <CalendarDays size={28} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
                <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune séance cette semaine</p>
              </div>
            ) : (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                {triees.map((seance) => (
                  <SeanceCard key={seance.id} seance={seance} mode="professeur" onTerminer={handleTerminer} />
                ))}
              </div>
            )}
          </div>

          {demandesRecues.length > 0 && (
            <div>
              <h2 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default', mb: '3' })}>
                Demandes d&apos;échange reçues ({demandesRecues.length})
              </h2>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                {demandesRecues.map((d) => (
                  <div key={d.id} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '4' })}>
                    <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3' })}>
                      <div className={css({ spaceY: '1', fontSize: 'sm' })}>
                        <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>
                          {d.nomDemandeur}
                        </p>
                        <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                          {d.seanceDemandeurMatiere} ↔ {d.seanceCibleMatiere}
                        </p>
                        {d.motif && <p className={css({ fontSize: 'xs', color: 'fg.subtle', fontStyle: 'italic' })}>Motif : {d.motif}</p>}
                      </div>
                      <div className={css({ display: 'flex', gap: '2', flexShrink: '0' })}>
                        <button onClick={() => handleEchangeAction(d.id, 'Acceptee')}
                          className={css({ px: '3', py: '1.5', rounded: 'md', fontSize: 'xs', fontWeight: 'medium', bg: '#10b981', color: 'white', _hover: { bg: '#059669' }, transition: 'colors 0.15s' })}>
                          <CheckCheck size={14} />
                        </button>
                        <button onClick={() => handleEchangeAction(d.id, 'Refusee')}
                          className={css({ px: '3', py: '1.5', rounded: 'md', fontSize: 'xs', fontWeight: 'medium', bg: '#ef4444', color: 'white', _hover: { bg: '#dc2626' }, transition: 'colors 0.15s' })}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
      <div className={css({ spaceY: '6', maxW: '3xl', mx: 'auto' })}>
        {isEtudiant && (
          <div className={css({ spaceY: '4' })}>
            {prochaineSeance && (
              <div className={css({
                bg: 'accent.default', rounded: 'lg', p: '5', color: 'white',
              })}>
                <p className={css({ fontSize: 'xs', fontWeight: 'medium', opacity: '0.8', mb: '1' })}>
                  Prochaine séance
                </p>
                <p className={css({ fontSize: 'lg', fontWeight: 'bold', mb: '1' })}>
                  {prochaineSeance.matiereNom}
                </p>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3', fontSize: 'sm', opacity: '0.9' })}>
                  <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
                    <Calendar size={13} /> {prochaineSeance.jour}
                  </span>
                  <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
                    <Clock size={13} /> {prochaineSeance.heureDebut?.slice(0, 5)}
                  </span>
                  <span className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
                    <MapPin size={13} /> {prochaineSeance.salleNom}
                  </span>
                </div>
              </div>
            )}

            {prochainExamen && (
              <div className={css({
                bg: 'rgba(245,158,11,0.12)', border: '1px solid', borderColor: 'rgba(245,158,11,0.3)',
                rounded: 'lg', p: '4', display: 'flex', alignItems: 'flex-start', gap: '3',
              })}>
                <BookOpen size={18} className={css({ color: '#f59e0b', mt: '0.5', flexShrink: '0' })} />
                <div className={css({ spaceY: '0.5', fontSize: 'sm' })}>
                  <p className={css({ fontWeight: 'semibold', color: '#f59e0b' })}>
                    Examen à venir : {prochainExamen.matiereNom}
                  </p>
                  <p className={css({ color: '#f59e0b', fontSize: 'xs' })}>
                    {new Date(prochainExamen.dateExamen).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — {prochainExamen.heureDebut?.slice(0, 5)}
                  </p>
                  <p className={css({ color: '#f59e0b', fontSize: 'xs' })}>
                    {prochainExamen.salleNom} · {prochainExamen.professeurNom}
                  </p>
                </div>
              </div>
            )}

            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Link href="/student/reservations/nouvelle"
                className={css({
                  display: 'inline-flex', alignItems: 'center', gap: '2',
                  px: '6', py: '3', rounded: 'lg', fontSize: 'sm', fontWeight: 'semibold',
                  bg: 'accent.default', color: 'white',
                  _hover: { opacity: 0.9 },
                })}>
                Réserver une salle
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className={css({ px: '4', py: '3', rounded: 'lg', fontSize: 'sm', bg: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2' })}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr' }, gap: '3' })}>
          <StatCard label="Séances cette semaine" value={seances.length} />
          <StatCard label="Terminées" value={terminees} variant="success" />
        </div>

        {isLoading ? (
          <div className={css({ p: '12', display: 'flex', justifyContent: 'center' })}>
            <div className={css({ w: '8', h: '8', border: '3px solid', borderColor: 'border.default', borderTopColor: 'accent.default', rounded: 'full', animation: 'spin 1s linear infinite' })} />
          </div>
        ) : triees.length === 0 ? (
          <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center' })}>
            <CalendarDays size={28} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
            <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune séance cette semaine</p>
          </div>
        ) : (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
            {triees.map((seance) => (
              <SeanceCard key={seance.id} seance={seance} mode={isEtudiant ? 'etudiant' : 'professeur'} />
            ))}
          </div>
        )}

        {isEtudiant && recentReservations.length > 0 && (
          <div>
            <h2 className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default', mb: '3' })}>
              Dernières réservations
            </h2>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              {recentReservations.map((r) => (
                <div key={r.id} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
                  <div className={css({ fontSize: 'sm' })}>
                    <p className={css({ fontWeight: 'medium', color: 'fg.default' })}>{r.titre}</p>
                    <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
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
