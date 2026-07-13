'use client';

import { ReactNode } from 'react';

interface StatItem {
  label: string;
  icon: ReactNode;
  iconBg: string;
  value: string;
  subText: string;
  subTextColor?: string;
  subTextBold?: boolean;
}

interface StatStripProps {
  stats: StatItem[];
}

export function StatStrip({ stats }: StatStripProps) {
  return (
    <div className="grid grid-cols-4 gap-[14px] max-[1180px]:grid-cols-2">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-card border border-[#E7EAEF] rounded-md2 px-[14px] py-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11.5px] text-ink-soft font-medium">{s.label}</span>
            <div
              className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: s.iconBg }}
            >
              {s.icon}
            </div>
          </div>
          <div className="font-mono text-[22px] font-semibold text-ink leading-none mb-1">
            {s.value}
          </div>
          <div
            className={`text-[11px] ${s.subTextColor || 'text-muted'} ${s.subTextBold ? 'font-bold' : 'font-medium'}`}
          >
            {s.subText}
          </div>
        </div>
      ))}
    </div>
  );
}

export const defaultStats: StatItem[] = [
  {
    label: 'Salles',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2F6FED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
    iconBg: '#EAF1FF',
    value: '24',
    subText: '4 indisponibles',
    subTextColor: 'text-red',
    subTextBold: true,
  },
  {
    label: 'Séances aujourd\'hui',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#F5A524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    iconBg: '#FFF4E0',
    value: '42',
    subText: '3 en conflit',
    subTextColor: 'text-red',
    subTextBold: true,
  },
  {
    label: 'Taux d\'occupation',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1DB876" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>,
    iconBg: '#E4F8EF',
    value: '78%',
    subText: '+5% vs semaine dernière',
    subTextColor: 'text-green',
    subTextBold: true,
  },
  {
    label: 'Exceptions actives',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    iconBg: '#FDEBEC',
    value: '7',
    subText: '3 urgentes',
    subTextColor: 'text-red',
    subTextBold: true,
  },
];
