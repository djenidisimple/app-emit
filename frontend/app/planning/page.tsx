'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, Calendar, Table as TableIcon, Image as ImageIcon } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';
import useAuthStore from '@/store/authStore';
import html2canvas from 'html2canvas';

const HOUR_RANGES = [
  { label: '8h00–10h00', start: '08:00', end: '10:00' },
  { label: '10h00–12h00', start: '10:00', end: '12:00' },
  { label: '14h00–16h00', start: '14:00', end: '16:00' },
  { label: '16h00–18h00', start: '16:00', end: '18:00' },
];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setDate(d.getDate() + 5);
  return {
    start: d,
    end,
    mon: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
    sat: end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
  };
}

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');
  const tableRef = useRef<HTMLDivElement>(null);

  const weekRange = getWeekRange(currentDate);

  const fetchPlanning = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const start = getWeekRange(currentDate).start;
      const data = await api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${start.toISOString()}`);
      setSeances(data.seances || []);
    } catch { setError('Impossible de charger le planning.'); } finally { setIsLoading(false); }
  }, [currentDate]);

  useEffect(() => { 
    setTimeout(() => { fetchPlanning(); }, 0); 
  }, [fetchPlanning]);

  const nextWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() + 7); setCurrentDate(n); };
  const prevWeek = () => { const n = new Date(currentDate); n.setDate(n.getDate() - 7); setCurrentDate(n); };
  const goToday = () => setCurrentDate(new Date());

  const getSeancesForSlot = (jour: string, rangeStart: string, rangeEnd: string) =>
    seances.filter((s) => s.jour === jour && s.heureDebut >= rangeStart && s.heureDebut < rangeEnd);

  const legendColors = Object.values(
    seances.filter((s) => s.couleurAffichage).reduce((acc, s) => {
      acc[s.couleurAffichage!] = { color: s.couleurAffichage!, name: s.matiereNom };
      return acc;
    }, {} as Record<string, { color: string; name: string }>)
  );

  const navBtnCls = 'w-8 h-8 rounded-lg border border-border flex items-center justify-center text-fg-muted bg-surface hover:bg-[var(--colors-bg-elevated)] hover:text-fg-default transition-colors duration-150';

  return (
    <ProtectedLayout pageTitle="Planning de la semaine">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-fg-muted text-sm font-medium">
          Semaine du <span className="text-fg-default font-semibold">{weekRange.mon} — {weekRange.sat}</span>
        </p>
           <div className="flex items-center gap-2">
             <button onClick={prevWeek} className={navBtnCls}><ChevronLeft size={15} /></button>
             <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-fg-default hover:bg-bg-muted transition-colors duration-150">
               Aujourd&apos;hui
             </button>
             <button onClick={nextWeek} className={navBtnCls}><ChevronRight size={15} /></button>
             
             <div className="flex gap-2">
               <button
                 onClick={async () => {
                   const payload = { 
                     AnneeUniversitaire: '2025-2026', 
                     DateDebut: weekRange.start.toISOString(), 
                     DateFin: weekRange.end.toISOString(),
                     ProfesseurId: user?.id,
                     UtilisateurId: user?.id
                   };
                   try {
                     const blob = await api.postBlob('/Document/export/emploi-du-temps', payload);
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url; a.download = 'emploi_du_temps.pdf'; a.click();
                     URL.revokeObjectURL(url);
                   } catch (e) { console.error(e); }
                 }}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-fg-default hover:bg-bg-muted transition-colors duration-150"
               >
                 <FileText size={14} /> PDF
               </button>

               <button
                 onClick={async () => {
                   const payload = { 
                     AnneeUniversitaire: '2025-2026', 
                     DateDebut: weekRange.start.toISOString(), 
                     DateFin: weekRange.end.toISOString(),
                     ProfesseurId: user?.id,
                     UtilisateurId: user?.id
                   };
                   try {
                     const blob = await api.postBlob('/Document/export/emploi-du-temps/excel', payload);
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url; a.download = 'emploi_du_temps.xlsx'; a.click();
                     URL.revokeObjectURL(url);
                   } catch (e) { console.error(e); }
                 }}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-fg-default hover:bg-bg-muted transition-colors duration-150"
               >
                 <TableIcon size={14} /> Excel
               </button>

               <button
                 onClick={async () => {
                   if (!tableRef.current) return;
                   try {
                     const canvas = await html2canvas(tableRef.current);
                     const imgData = canvas.toDataURL('image/png');
                     const a = document.createElement('a');
                     a.href = imgData; a.download = 'emploi_du_temps.png'; a.click();
                   } catch (e) { console.error(e); }
                 }}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-fg-default hover:bg-bg-muted transition-colors duration-150"
               >
                 <ImageIcon size={14} /> Image
               </button>
             </div>
           </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] flex items-center gap-2 text-sm font-medium text-[#ef4444]">
          <AlertCircle size={15} />{error}
          <button onClick={fetchPlanning} className="ml-auto text-[#ef4444] hover:underline">Réessayer</button>
        </div>
      )}

       {isLoading ? (
         <div className="bg-white border border-border rounded-lg p-5 flex justify-center">
           <div className="w-8 h-8 border-3 border-[colorPalette.default] border-t-accent rounded-full animate-spin" />
         </div>
       ) : (
         <div ref={tableRef} className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
               <thead>
                 <tr>
                   <th className="px-3 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider bg-[#F7F7FA] w-20">Horaire</th>
                   {DAYS.map((day) => (
                     <th key={day} className="px-3 py-2.5 text-left text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider bg-[#F7F7FA]">{day}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {HOUR_RANGES.map((range) => (
                   <tr key={range.start} className="border-t border-neutral-200">
                     <td className="px-3 py-3 text-[12px] font-medium text-[#8A8FA3] align-top whitespace-nowrap">{range.label}</td>
                    {DAYS.map((jour) => {
                      const slotSeances = getSeancesForSlot(jour, range.start, range.end);
                      return (
                        <td key={`${jour}-${range.start}`} className="px-2 py-2 align-top min-h-[60px]">
                          <div className="flex flex-col gap-1">
                            {slotSeances.map((seance) => {
                              const color = seance.couleurAffichage || 'var(--colors-accent-default)';
                              const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                              return (
                                 <div key={seance.id}
                                   className="px-2.5 py-1.5 rounded-[6px] border border-neutral-200 cursor-pointer transition-all duration-150"
                                   style={{ borderLeftColor: isCancelled ? '#9ca3af' : color, backgroundColor: isCancelled ? '#f1f5f9' : `${color}10` }}>
                                   <p className={`text-xs font-medium leading-tight ${isCancelled ? 'text-[#9ca3af]' : 'text-[#111827]'}`}>
                                     {isCancelled ? <span className="line-through">{seance.matiereNom}</span> : seance.matiereNom}
                                   </p>
                                   <p className="text-[10px] text-[#8A8FA3] mt-0.5">{seance.salleNom}</p>
                                   <p className="text-[10px] text-[#8A8FA3]">{seance.professeurNomComplet}</p>
                                  {seance.motifException && <p className="text-[10px] text-[#f59e0b] font-medium mt-0.5">→ {seance.motifException}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {legendColors.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-[#555A6E]">
          {legendColors.map((l, i) => (
            <div key={`${l.color}-${i}`} className="flex items-center gap-2 rounded-[6px] border border-neutral-200 px-2.5 py-1 bg-white">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
              <span className="text-[#111827]">{l.name}</span>
            </div>
          ))}
        </div>
      )}

      {seances.length === 0 && !isLoading && !error && (
        <div className="bg-white border border-border rounded-lg p-12 text-center mt-4">
          <Calendar size={32} className="text-fg-subtle mx-auto mb-3" />
          <p className="text-fg-default font-semibold mb-1">Aucune séance cette semaine</p>
          <p className="text-fg-muted text-sm">Aucun cours n&apos;est planifié pour cette période.</p>
        </div>
      )}
    </ProtectedLayout>
  );
}
