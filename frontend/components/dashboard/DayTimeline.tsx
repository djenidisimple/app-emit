'use client';

import { useMemo } from 'react';
import { Card, CardHeader } from './Card';

interface Block {
  startHour: number;
  endHour: number;
  filiere: 'informatique' | 'genie-civil' | 'gestion';
  label: string;
  isConflict?: boolean;
}

interface BuildingRow {
  name: string;
  blocks: Block[];
}

interface DayTimelineProps {
  buildings: BuildingRow[];
  title?: string;
  linkLabel?: string;
}

const filiereColors: Record<string, { bg: string; text: string }> = {
  informatique: { bg: '#2F6FED', text: '#FFFFFF' },
  'genie-civil': { bg: '#FF6A3D', text: '#FFFFFF' },
  gestion: { bg: '#1DB876', text: '#FFFFFF' },
};

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);
const TRACK_HEIGHT = 52;
const TRACK_GAP = 4;
const BLOCK_GAP = 0.4;

function assignTracks(blocks: Block[]): (Block & { track: number })[] {
  const sorted = blocks
    .map((b) => ({ ...b, track: 0 }))
    .sort((a, b) => a.startHour - b.startHour);

  const tracks: number[] = [];
  for (const block of sorted) {
    let track = 0;
    while (tracks[track] !== undefined && tracks[track] > block.startHour) {
      track++;
    }
    block.track = track;
    tracks[track] = block.endHour;
  }
  return sorted;
}

export function DayTimeline({
  buildings,
  title = 'Planning du jour',
  linkLabel = 'Voir tout',
}: DayTimelineProps) {
  const rows = useMemo(
    () =>
      buildings.map((b) => {
        const trackedBlocks = assignTracks(b.blocks);
        return {
          ...b,
          trackedBlocks,
          tracksCount: Math.max(1, ...trackedBlocks.map((blk) => blk.track + 1)),
        };
      }),
    [buildings]
  );

  return (
    <Card className="overflow-hidden">
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
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="flex mb-2">
            <div className="w-[90px] shrink-0" />
            {HOURS.map((h) => (
              <div key={h} className="flex-1 font-mono text-[10px] text-muted font-semibold text-center">
                {h.toString().padStart(2, '0')}h
              </div>
            ))}
          </div>
          {rows.map((b) => {
            const height = b.tracksCount * TRACK_HEIGHT + (b.tracksCount - 1) * TRACK_GAP;
            return (
              <div key={b.name} className="flex mb-3 last:mb-0">
                <div className="w-[90px] shrink-0 text-[11.5px] font-bold text-ink pr-3 leading-[30px]">
                  {b.name}
                </div>
                <div className="flex-1 relative bg-[#F6F7F9] rounded-[8px]" style={{ height }}>
                  {HOURS.map((h) => (
                    <div key={h} className="absolute top-0 bottom-0 border-l border-[#EEF0F4] pointer-events-none" style={{ left: `${((h - 8) / 10) * 100}%` }} />
                  ))}
                  {b.trackedBlocks.map((blk, i) => {
                    const left = ((blk.startHour - 8) / 10) * 100 + BLOCK_GAP / 2;
                    const width = ((blk.endHour - blk.startHour) / 10) * 100 - BLOCK_GAP;
                    const colors = filiereColors[blk.filiere];
                    const top = blk.track * (TRACK_HEIGHT + TRACK_GAP);
                    return (
                      <div
                        key={i}
                        className="absolute rounded-[6px] flex items-center justify-center text-[11px] font-bold overflow-hidden"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          top,
                          height: TRACK_HEIGHT,
                          background: colors.bg,
                          color: colors.text,
                          border: blk.isConflict ? '1.5px dashed #E5484D' : 'none',
                        }}
                        title={blk.label}
                      >
                        <span className="truncate px-1">{blk.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export const defaultDayTimeline: DayTimelineProps = {
  buildings: [
    {
      name: 'Bâtiment A',
      blocks: [
        { startHour: 8, endHour: 10, filiere: 'informatique', label: 'Réseaux L3' },
        { startHour: 10, endHour: 12, filiere: 'gestion', label: 'Compta L2' },
        { startHour: 14, endHour: 16, filiere: 'informatique', label: 'Dev Web L3' },
      ],
    },
    {
      name: 'Bâtiment B',
      blocks: [
        { startHour: 8, endHour: 10, filiere: 'genie-civil', label: 'RDM L3' },
        { startHour: 9, endHour: 11, filiere: 'informatique', label: 'Algo L2', isConflict: true },
        { startHour: 14, endHour: 17, filiere: 'genie-civil', label: 'TP Béton' },
      ],
    },
    {
      name: 'Bâtiment C',
      blocks: [
        { startHour: 8, endHour: 10, filiere: 'informatique', label: 'Maths L3' },
        { startHour: 10, endHour: 12, filiere: 'genie-civil', label: 'Topo L2' },
        { startHour: 14, endHour: 16, filiere: 'gestion', label: 'Marketing L3' },
      ],
    },
  ],
};
