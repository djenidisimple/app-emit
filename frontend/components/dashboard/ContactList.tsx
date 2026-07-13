'use client';

import { Phone } from 'lucide-react';
import { Card, CardHeader } from './Card';

interface Contact {
  id: string;
  name: string;
  initials: string;
  reason: string;
  salle: string;
  initials: string;
  reason: string;
  salle: string;
}

interface ContactListProps {
  contacts: Contact[];
  title?: string;
  linkLabel?: string;
}

const avatarColors = ['#2F6FED', '#FF6A3D', '#1DB876', '#F5A524'];

export function ContactList({
  contacts,
  title = 'Enseignants à contacter',
  linkLabel = 'Tout voir',
}: ContactListProps) {
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
        {contacts.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <div
              className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: avatarColors[i % avatarColors.length] }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-ink">{c.name}</div>
              <div className="text-[10.5px] text-muted">
                {c.reason} · <span className="font-mono font-semibold">{c.salle}</span>
              </div>
            </div>
            <button className="w-7 h-7 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center text-ink-soft cursor-pointer hover:bg-[#E7EAEF] transition-colors shrink-0 border-none">
              <Phone size={12} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export const defaultContacts: Contact[] = [
  { id: '1', name: 'Dr. Rakoto', initials: 'DR', reason: 'Absence non signalée', salle: 'A2.04' },
  { id: '2', name: 'Mme. Rabe', initials: 'MR', reason: 'Report de séance', salle: 'B1.03' },
  { id: '3', name: 'M. Randria', initials: 'RA', reason: 'Conflit horaire', salle: 'C1.02' },
  { id: '4', name: 'Dr. Rasoa', initials: 'RS', reason: 'Doublon réservation', salle: 'A1.01' },
];
