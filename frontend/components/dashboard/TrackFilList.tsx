'use client';

import { Card, CardHeader } from './Card';

interface FiliereData {
  name: string;
  color: string;
  value: string;
  percentage: string;
}

interface TrackFilListProps {
  data: FiliereData[];
  title?: string;
  linkLabel?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export function TrackFilList({
  data,
  title = 'Cours par filière',
  linkLabel = 'Détails',
  buttonLabel = 'Voir le planning complet',
  onButtonClick,
}: TrackFilListProps) {
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
      <div className="flex flex-col gap-2.5">
        {data.map((f) => (
          <div key={f.name} className="flex items-center gap-2.5">
            <span
              className="w-[9px] h-[9px] rounded-full shrink-0"
              style={{ background: f.color }}
            />
            <span className="flex-1 text-[12px] font-medium text-ink">{f.name}</span>
            <span className="font-mono text-[12px] font-semibold text-ink">{f.value}</span>
            <span className="text-[12px] text-muted w-10 text-right">{f.percentage}</span>
          </div>
        ))}
      </div>
      {buttonLabel && (
        <button
          onClick={onButtonClick}
          className="w-full mt-3 py-2.5 rounded-[10px] bg-[#F0F1F4] border-none text-[12px] font-bold text-ink cursor-pointer hover:bg-[#E7EAEF] transition-colors"
        >
          {buttonLabel}
        </button>
      )}
    </Card>
  );
}

export const defaultFiliereData: FiliereData[] = [
  { name: 'Informatique (L3)', color: '#2F6FED', value: '14h', percentage: '33%' },
  { name: 'Génie Civil (L3)', color: '#FF6A3D', value: '12h', percentage: '29%' },
  { name: 'Gestion (L2)', color: '#1DB876', value: '10h', percentage: '24%' },
  { name: 'Informatique (L2)', color: '#8B7CF6', value: '6h', percentage: '14%' },
];
