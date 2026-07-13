'use client';

import { useMemo } from 'react';
import { ArrowLeftRight, Download, CalendarDays, CheckCheck, X, AlertCircle, BookOpen, Clock, MapPin, Calendar, BarChart3, GraduationCap, Bell, FileText } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';
import SeanceCard from '@/components/global/SeanceCard';
import { SeancePlanningDto, DemandeEchangeReadDto, ExamenReadDto, Utilisateur } from '@/types';

interface ProfesseurDashboardProps {
  seances: SeancePlanningDto[];
  demandesRecues: DemandeEchangeReadDto[];
  examens: ExamenReadDto[];
  isLoading: boolean;
  error: string;
  user: Utilisateur | null;
  onTerminer: (seance: SeancePlanningDto) => void;
  handleEchangeAction: (id: number, statut: string) => void;
}

function formatHeure(h: string) { return h?.slice(0, 5) || '—'; }

const quickActions = [
  { label: 'Mon planning', path: '/planning', icon: Calendar, color: '#5A55F2', bg: '#F0EFFE' },
  { label: 'Nouvel échange', path: '/echanges/nouvelle', icon: ArrowLeftRight, color: '#10B981', bg: '#E4F8EF' },
  { label: 'Mes examens', path: '/mes-examens', icon: FileText, color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Réservations', path: '/reservations', icon: Bell, color: '#2F6FED', bg: '#EAF1FF' },
];

export function ProfesseurDashboard({
  seances,
  demandesRecues,
  examens,
  isLoading,
  error,
  user,
  onTerminer,
  handleEchangeAction,
}: ProfesseurDashboardProps) {
  const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const triees = useMemo(() =>
    [...seances].sort((a, b) => {
      const ia = joursOrdre.indexOf(a.jour), ib = joursOrdre.indexOf(b.jour);
      if (ia !== ib) return ia - ib;
      return a.heureDebut.localeCompare(b.heureDebut);
    }), [seances]);

  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const aujourdhuiCapitalize = aujourdhui.charAt(0).toUpperCase() + aujourdhui.slice(1);
  const seancesAujourdhui = triees.filter(s => s.jour === aujourdhuiCapitalize);
  const enCours = seances.filter(s =>
    s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé'
  ).length;
  const terminees = seances.filter(s =>
    s.statut === 'Terminee' || s.statut === 'Terminé'
  ).length;

  const examensAVenir = useMemo(() =>
    [...examens]
      .filter(e => new Date(e.dateExamen) >= new Date())
      .sort((a, b) => new Date(a.dateExamen).getTime() - new Date(b.dateExamen).getTime())
      .slice(0, 5),
  [examens]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const displayName = user
    ? `${user.prenom ?? 'Professeur'} ${user.nom ?? 'User'}`
    : 'Professeur';
  const initials = displayName.charAt(0).toUpperCase();

  const handleExport = () => {
    api.postBlob('/Document/export/pdf', {
      DateDebut: new Date().toISOString(),
      DateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ProfesseurId: user?.id,
      UtilisateurId: user?.id
    }).then((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto w-full">

      {/* ─── Hero Section ─── */}
      <div className="relative bg-white border border-neutral-200 rounded-[8px] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#5A55F2] flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827] leading-tight">
                Bon retour, {displayName.split(' ')[0]}
              </h1>
              <p className="text-[#8A8FA3] text-sm font-medium">
                Professeur · {dateStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/echanges/nouvelle"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#F0EFFE] text-[#5A55F2] text-[13px] font-semibold hover:bg-[#5A55F2] hover:text-white transition-all duration-200">
              <ArrowLeftRight size={15} /> Échanger
            </Link>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-neutral-200 text-[#555A6E] text-[13px] font-semibold hover:bg-[#F7F7FA] hover:text-[#111827] transition-all duration-200">
              <Download size={15} /> Exporter
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: "Aujourd'hui", value: seancesAujourdhui.length, color: '#5A55F2', icon: Calendar },
          { label: 'En cours', value: enCours, color: '#10B981', icon: Clock },
          { label: 'Terminées', value: terminees, color: '#F59E0B', icon: BarChart3 },
          { label: 'Demandes', value: demandesRecues.length, color: '#2F6FED', icon: Bell },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-neutral-200 rounded-[8px] p-4 transition-all duration-200 hover:border-[#5A55F2]/20 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[26px] font-bold leading-none" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[#8A8FA3] text-[12px] font-medium mt-1">
                  {stat.label}
                </div>
              </div>
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors duration-200"
                style={{ backgroundColor: `${stat.color}12` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-[6px] text-sm bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── Left: Weekly Schedule ─── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#5A55F2]" />
              <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
                Mon Planning Hebdomadaire
              </h2>
            </div>
            <div className="text-[11px] font-medium text-[#8A8FA3] bg-[#F7F7FA] px-2.5 py-1 rounded-[6px] border border-neutral-200">
              Cette semaine
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white border border-neutral-200 rounded-[8px] p-16 flex justify-center">
              <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-[#5A55F2] rounded-full animate-spin" />
            </div>
          ) : triees.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-[8px] p-12 text-center">
              <CalendarDays size={36} className="text-[#B4B8C6] mx-auto mb-3" />
              <p className="text-[#111827] font-semibold mb-1">Aucune séance prévue</p>
              <p className="text-[#8A8FA3] text-[12px]">Votre emploi du temps est vide pour cette semaine.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {triees.map((seance) => (
                <SeanceCard key={seance.id} seance={seance} mode="professeur" onTerminer={onTerminer} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Exchange Requests + Quick Actions ─── */}
        <div className="space-y-5">

          {/* Exchange Requests */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftRight size={15} className="text-[#5A55F2]" />
              <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
                Demandes d&apos;échange
              </h2>
              {demandesRecues.length > 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5A55F2] text-white">
                  {demandesRecues.length}
                </span>
              )}
            </div>

            {demandesRecues.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-[8px] p-7 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F7F7FA] flex items-center justify-center mx-auto mb-3">
                  <ArrowLeftRight size={18} className="text-[#B4B8C6]" />
                </div>
                <p className="text-[#111827] font-semibold text-[13px] mb-0.5">Aucune demande</p>
                <p className="text-[#8A8FA3] text-[11px]">Pas de demandes en attente.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {demandesRecues.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border border-neutral-200 rounded-[8px] p-3.5 hover:border-[#5A55F2]/25 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#F0EFFE] text-[#5A55F2] flex items-center justify-center text-[9px] font-bold shrink-0">
                            {d.nomDemandeur?.charAt(0)}
                          </div>
                          <p className="font-semibold text-[13px] text-[#111827] truncate">{d.nomDemandeur}</p>
                        </div>
                        <div className="bg-[#F7F7FA] rounded-[8px] p-2 border border-neutral-200">
                          <p className="text-[11px] font-medium text-[#555A6E] text-center">
                            {d.seanceDemandeurMatiere}
                            <span className="text-[#5A55F2] mx-1.5 font-bold">↔</span>
                            {d.seanceCibleMatiere}
                          </p>
                        </div>
                        {d.motif && (
                          <p className="text-[11px] text-[#8A8FA3] italic line-clamp-2 leading-tight">
                            &ldquo;{d.motif}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEchangeAction(d.id, 'Acceptee')}
                          className="p-1.5 rounded-[8px] bg-[#F0EFFE] text-[#5A55F2] hover:bg-[#5A55F2] hover:text-white transition-all duration-200"
                          title="Accepter"
                        >
                          <CheckCheck size={15} />
                        </button>
                        <button
                          onClick={() => handleEchangeAction(d.id, 'Refusee')}
                          className="p-1.5 rounded-[8px] bg-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all duration-200"
                          title="Refuser"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={15} className="text-[#5A55F2]" />
              <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
                Actions rapides
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  href={action.path}
                   className="bg-white border border-neutral-200 rounded-[6px] p-3.5 flex flex-col items-center gap-2 hover:border-[#5A55F2]/20 transition-all duration-200 group"
                >
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: action.bg }}
                  >
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#555A6E] text-center leading-tight group-hover:text-[#111827] transition-colors duration-200">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Upcoming Exams ─── */}
      {examensAVenir.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#F59E0B]" />
            <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
              Examens à venir
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examensAVenir.map((examen) => {
              const examenDate = new Date(examen.dateExamen);
              const estAujourdhui = examenDate.toDateString() === now.toDateString();
              const estBientot = (examenDate.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={examen.id}
                  className={`bg-white border rounded-[8px] p-4 transition-all duration-200 ${
                    estAujourdhui
                      ? 'border-[#F59E0B]'
                      : estBientot
                      ? 'border-[#F59E0B]/40'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[14px] text-[#111827] truncate">
                          {examen.matiereNom}
                        </p>
                        {estAujourdhui && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white shrink-0">
                            AUJOURD&apos;HUI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#555A6E]">
                        <Calendar size={12} className="shrink-0 text-[#8A8FA3]" />
                        <span>
                          {examenDate.toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#555A6E]">
                        <Clock size={12} className="shrink-0 text-[#8A8FA3]" />
                        <span>{formatHeure(examen.heureDebut)} — {formatHeure(examen.heureFin)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#555A6E]">
                        <MapPin size={12} className="shrink-0 text-[#8A8FA3]" />
                        <span>{examen.salleNom}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
