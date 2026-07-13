'use client';

import { Card, CardHeader } from './Card';

interface RoomCell {
  code: string;
  status: 'libre' | 'occupee' | 'exception' | 'conflit';
}

interface BuildingGroup {
  name: string;
  color: string;
  rooms: RoomCell[];
}

interface RoomStatusGridProps {
  buildings: BuildingGroup[];
  title?: string;
  linkLabel?: string;
}

const statusConfig = {
  libre: {
    label: 'Libre',
    bg: '#1DB876',
    text: '#FFFFFF',
    border: 'transparent',
  },
  occupee: {
    label: 'Occupée',
    bg: '#2F6FED',
    text: '#FFFFFF',
    border: 'transparent',
  },
  exception: {
    label: 'Exception',
    bg: '#F5A524',
    text: '#FFFFFF',
    border: 'transparent',
  },
  conflit: {
    label: 'Conflit',
    bg: '#E5484D',
    text: '#FFFFFF',
    border: '#FECACA',
  },
};

export function RoomStatusGrid({
  buildings,
  title = 'État des salles',
  linkLabel = 'Détails',
}: RoomStatusGridProps) {
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
        {(['libre', 'occupee', 'exception', 'conflit'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ background: statusConfig[s].bg }}
            />
            {statusConfig[s].label}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {buildings.map((b) => {
          const libres = b.rooms.filter((r) => r.status === 'libre').length;
          const total = b.rooms.length;
          return (
            <div key={b.name}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-[3px] shrink-0"
                  style={{ background: b.color }}
                />
                <span className="text-[12px] font-bold text-ink">{b.name}</span>
                <span className="font-mono text-[11px] text-muted font-semibold">
                  {libres}/{total} libres
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {b.rooms.map((r) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <div
                      key={r.code}
                      className="rounded-[8px] px-1 py-3 text-center flex flex-col items-center"
                      style={{
                        background: cfg.bg,
                        border: cfg.border !== 'transparent' ? `1.5px solid ${cfg.border}` : '1.5px solid transparent',
                      }}
                    >
                      <span
                        className="font-mono text-[12px] font-bold leading-tight"
                        style={{ color: cfg.text }}
                      >
                        {r.code}
                      </span>
                      <span
                        className="text-[10px] font-semibold leading-tight mt-0.5"
                        style={{ color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export const defaultBuildings: BuildingGroup[] = [
  {
    name: 'Bâtiment A',
    color: '#2F6FED',
    rooms: [
      { code: 'A1.01', status: 'occupee' },
      { code: 'A1.02', status: 'libre' },
      { code: 'A1.03', status: 'occupee' },
      { code: 'A1.04', status: 'libre' },
      { code: 'A2.01', status: 'libre' },
      { code: 'A2.02', status: 'conflit' },
      { code: 'A2.03', status: 'occupee' },
      { code: 'A2.04', status: 'exception' },
      { code: 'A2.05', status: 'libre' },
      { code: 'A2.06', status: 'libre' },
      { code: 'A3.01', status: 'occupee' },
      { code: 'A3.02', status: 'libre' },
    ],
  },
  {
    name: 'Bâtiment B',
    color: '#FF6A3D',
    rooms: [
      { code: 'B1.01', status: 'libre' },
      { code: 'B1.02', status: 'occupee' },
      { code: 'B1.03', status: 'libre' },
      { code: 'B1.04', status: 'exception' },
      { code: 'B2.01', status: 'occupee' },
      { code: 'B2.02', status: 'libre' },
      { code: 'B2.03', status: 'libre' },
      { code: 'B2.04', status: 'occupee' },
      { code: 'B3.01', status: 'libre' },
      { code: 'B3.02', status: 'libre' },
      { code: 'B3.03', status: 'occupee' },
      { code: 'B3.04', status: 'libre' },
    ],
  },
  {
    name: 'Bâtiment C',
    color: '#1DB876',
    rooms: [
      { code: 'C1.01', status: 'libre' },
      { code: 'C1.02', status: 'conflit' },
      { code: 'C1.03', status: 'occupee' },
      { code: 'C1.04', status: 'libre' },
      { code: 'C2.01', status: 'libre' },
      { code: 'C2.02', status: 'occupee' },
      { code: 'C2.03', status: 'libre' },
      { code: 'C2.04', status: 'exception' },
      { code: 'C3.01', status: 'occupee' },
      { code: 'C3.02', status: 'libre' },
      { code: 'C3.03', status: 'libre' },
      { code: 'C3.04', status: 'occupee' },
    ],
  },
];
