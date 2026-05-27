'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, X, Clock, MapPin, User, AlertCircle, Loader2, FileText, FileSpreadsheet, RefreshCw } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import EmptyState from '@/components/global/EmptyState';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EdtGlobalePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlanning = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const response = await api.get<{ seances: any[] }>(`/Planning/hebdo?StartDate=${startOfWeek.toISOString()}`);
      setSeances(response.seances || []);
    } catch { setError('Impossible de charger le planning.'); }
    finally { setLoading(false); }
  }, [currentDate]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const getPosition = (heureDebut: string, heureFin: string) => {
    const [startH, startM] = heureDebut.split(':').map(Number);
    const [endH, endM] = heureFin.split(':').map(Number);
    const top = ((startH + startM / 60 - 7) / 13) * 100;
    const height = ((endH + endM / 60 - startH - startM / 60) / 13) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <ProtectedLayout pageTitle="EDT Globale">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))}
            className="p-2 rounded-lg border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] hover:text-[#1B3A6B] transition-colors duration-150">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-[#1B3A6B] border border-[#1B3A6B] rounded-lg hover:bg-[#E8EEF8] transition-colors duration-150">
            Aujourd&apos;hui
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))}
            className="p-2 rounded-lg border border-[#E9ECEF] text-[#6C757D] hover:bg-[#E8EEF8] hover:text-[#1B3A6B] transition-colors duration-150">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {isAdmin && (
          <button className="bg-[#1B3A6B] hover:bg-[#122850] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle séance
          </button>
        )}
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}
        <button onClick={fetchPlanning} className="ml-auto text-red-600 font-semibold hover:underline">Réessayer</button>
      </div>}

      {loading ? (
        <LoadingSkeleton lines={8} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5" />
      ) : seances.length === 0 ? (
        <EmptyState icon={RefreshCw} title="Aucune séance" description="Aucune séance planifiée cette semaine." />
      ) : (
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[60px_repeat(6,1fr)] bg-[#F8F9FA] border-b border-[#E9ECEF]">
                <div className="p-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Horaire</div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wide text-center border-l border-[#E9ECEF]">{day}</div>
                ))}
              </div>
              <div className="relative" style={{ height: '650px' }}>
                <div className="absolute inset-0 grid grid-cols-[60px_repeat(6,1fr)]">
                  {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                      <div className="border-b border-[#E9ECEF]/50 text-xs text-[#ADB5BD] p-1 text-right pr-2">{hour}h</div>
                      {DAYS.map(day => <div key={`${hour}-${day}`} className="border-b border-l border-[#E9ECEF]/50" />)}
                    </React.Fragment>
                  ))}
                </div>
                {seances.map(seance => {
                  const pos = getPosition(seance.heureDebut, seance.heureFin);
                  const dayIndex = DAYS.indexOf(seance.jour);
                  if (dayIndex === -1) return null;
                  const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                  const color = seance.couleurAffichage || '#1B3A6B';
                  return (
                    <div key={seance.id}
                      className="absolute cursor-pointer rounded-lg p-2 overflow-hidden transition-all hover:ring-2 hover:ring-[#1B3A6B]/20"
                      style={{
                        left: `calc(60px + ${dayIndex} * (100% - 60px) / 6 + 2px)`,
                        width: `calc((100% - 60px) / 6 - 4px)`,
                        top: pos.top, height: pos.height, minHeight: '28px',
                        backgroundColor: isCancelled ? '#F1F3F5' : `${color}15`,
                        borderLeft: `3px solid ${isCancelled ? '#ADB5BD' : color}`,
                      }}>
                      <p className="text-xs font-bold truncate" style={{ color: isCancelled ? '#ADB5BD' : color }}>
                        {isCancelled && <span className="line-through">{seance.matiereNom}</span>}
                        {!isCancelled && seance.matiereNom}
                        {isCancelled && <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold">ANNULÉ</span>}
                      </p>
                      <p className="text-[10px] text-[#6C757D] truncate">{seance.professeurNomComplet}</p>
                      <p className="text-[10px] text-[#6C757D] truncate">{seance.salleNom}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
