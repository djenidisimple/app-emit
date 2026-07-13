'use client';

import { ReactNode } from 'react';
import { Card, CardHeader } from './Card';

interface Exception {
  id: string;
  type: 'absence' | 'travaux' | 'report' | 'conflit';
  title: string;
  salle: string;
  description: string;
  urgent: boolean;
  actionLabel: string;
  onAction?: () => void;
  onVoir?: () => void;
}

interface ExceptionQueueProps {
  exceptions: Exception[];
  title?: string;
  linkLabel?: string;
}

const typeStyles: Record<string, { bg: string; iconBg: string; iconColor: string; icon: ReactNode }> = {
  absence: {
    bg: 'bg-[#E5484D]',
    iconBg: '#E5484D',
    iconColor: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  travaux: {
    bg: 'bg-[#F5A524]',
    iconBg: '#F5A524',
    iconColor: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  report: {
    bg: 'bg-[#2F6FED]',
    iconBg: '#2F6FED',
    iconColor: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  conflit: {
    bg: 'bg-[#E5484D]',
    iconBg: '#E5484D',
    iconColor: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

export function ExceptionQueue({
  exceptions,
  title = 'File d\'attente des exceptions',
  linkLabel = 'Voir tout',
}: ExceptionQueueProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        right={
          <span className="flex items-center gap-1 text-[11.5px] text-muted font-semibold cursor-pointer hover:text-ink-soft transition-colors">
            {linkLabel}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        }
      />
      <div className="flex flex-col gap-2">
        {exceptions.map((ex) => {
          const style = typeStyles[ex.type];
          return (
            <div
              key={ex.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] ${
                ex.urgent ? 'bg-[#FEF2F2] border border-[#FECACA]' : ''
              }`}
            >
              <div
                className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0 ${style.bg}`}
              >
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12.5px] font-bold text-ink truncate">{ex.title}</span>
                  <span className="font-mono text-[12.5px] font-semibold text-ink-soft shrink-0">{ex.salle}</span>
                </div>
                <p className="text-[11.5px] text-muted truncate">{ex.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-[20px] leading-none ${
                    ex.urgent
                      ? 'bg-[#E5484D] text-white'
                      : 'bg-[#F3F4F6] text-muted'
                  }`}
                >
                  {ex.urgent ? 'Urgent' : 'Normal'}
                </span>
                <button
                  onClick={ex.onAction}
                  className="px-3 py-1.5 rounded-[8px] bg-ink text-white text-[11px] font-bold border-none cursor-pointer hover:brightness-110 transition-all whitespace-nowrap"
                >
                  {ex.actionLabel}
                </button>
                <button
                  onClick={ex.onVoir}
                  className="px-3 py-1.5 rounded-[8px] bg-[#F3F4F6] text-ink-soft text-[11px] font-bold border-none cursor-pointer hover:bg-[#E7EAEF] transition-all whitespace-nowrap"
                >
                  Voir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export const defaultExceptions: Exception[] = [
  {
    id: '1',
    type: 'absence',
    title: 'M. Randria — Réseaux L3',
    salle: 'A2.04',
    description: 'Absence non prévenue — séance non remplacée',
    urgent: true,
    actionLabel: 'Réassigner',
  },
  {
    id: '2',
    type: 'travaux',
    title: 'Travaux — Amphi A',
    salle: 'A1.01',
    description: 'Fuite d\'eau signalée — amphi indisponible jusqu\'à nouvel ordre',
    urgent: true,
    actionLabel: 'Fermer salle',
  },
  {
    id: '3',
    type: 'report',
    title: 'Mme. Rabe — Stat L2',
    salle: 'B1.03',
    description: 'Report de séance de mercredi à vendredi (même créneau)',
    urgent: false,
    actionLabel: 'Valider',
  },
  {
    id: '4',
    type: 'conflit',
    title: 'Dr. Rakoto — Maths L3 / Dr. Rasoa — Thermo',
    salle: 'C1.02',
    description: 'Deux cours programmés dans la même salle au même créneau',
    urgent: true,
    actionLabel: 'Résoudre',
  },
];
