'use client';

import { Card, CardHeader } from './Card';

interface DayData {
  jour: string;
  batimentA: number;
  batimentB: number;
  batimentC: number;
}

interface WeeklyLoadChartProps {
  data: DayData[];
  title?: string;
  linkLabel?: string;
}

const MAX_HEIGHT = 120;
const BAR_WIDTH = 6;

export function WeeklyLoadChart({
  data,
  title = 'Charge hebdomadaire',
  linkLabel = 'Détails',
}: WeeklyLoadChartProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.batimentA, d.batimentB, d.batimentC]));

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
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
          <span className="w-2 h-2 rounded-sm bg-[#2F6FED]" />A
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
          <span className="w-2 h-2 rounded-sm bg-[#FF6A3D]" />B
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
          <span className="w-2 h-2 rounded-sm bg-[#1DB876]" />C
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 h-[120px]">
        {data.map((d) => {
          const hA = maxVal > 0 ? (d.batimentA / maxVal) * MAX_HEIGHT : 0;
          const hB = maxVal > 0 ? (d.batimentB / maxVal) * MAX_HEIGHT : 0;
          const hC = maxVal > 0 ? (d.batimentC / maxVal) * MAX_HEIGHT : 0;
          return (
            <div key={d.jour} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-[3px] h-[120px]">
                <div
                  className="w-[6px] rounded-t-sm"
                  style={{ height: `${hA}px`, background: '#2F6FED' }}
                />
                <div
                  className="w-[6px] rounded-t-sm"
                  style={{ height: `${hB}px`, background: '#FF6A3D' }}
                />
                <div
                  className="w-[6px] rounded-t-sm"
                  style={{ height: `${hC}px`, background: '#1DB876' }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted">{d.jour}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export const defaultWeeklyLoad: DayData[] = [
  { jour: 'Lun', batimentA: 8, batimentB: 4, batimentC: 6 },
  { jour: 'Mar', batimentA: 6, batimentB: 6, batimentC: 4 },
  { jour: 'Mer', batimentA: 10, batimentB: 2, batimentC: 8 },
  { jour: 'Jeu', batimentA: 4, batimentB: 8, batimentC: 6 },
  { jour: 'Ven', batimentA: 6, batimentB: 6, batimentC: 4 },
  { jour: 'Sam', batimentA: 2, batimentB: 4, batimentC: 2 },
];
