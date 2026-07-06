'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { css } from 'styled-system/css';
import { api } from '@/services/api';

interface AvailabilityCheckProps {
  salleId: number | null;
  creneauId: number | null;
  date?: string;
  debounceMs?: number;
}

export default function AvailabilityCheck({ salleId, creneauId, date, debounceMs = 400 }: AvailabilityCheckProps) {
  const [state, setState] = useState<'idle' | 'checking' | 'available' | 'conflict'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!salleId || !creneauId) {
      setState('idle');
      return;
    }

    setState('checking');
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        params.append('creneauId', String(creneauId));
        const salles = await api.get<{ id: number }[]>(`/Salles/disponibles?${params.toString()}`);
        const dispo = salles.some((s) => s.id === salleId);
        setState(dispo ? 'available' : 'conflict');
      } catch {
        setState('idle');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [salleId, creneauId, date, debounceMs]);

  if (state === 'idle') return null;

  const styles = {
    checking:  { icon: Loader2, color: 'fg.muted', text: 'Vérification...' },
    available: { icon: CheckCircle, color: '#10b981', text: 'Salle disponible' },
    conflict:  { icon: AlertCircle, color: '#ef4444', text: 'Conflit détecté sur ce créneau' },
  };

  const s = styles[state];
  const Icon = s.icon;

  return (
    <div className={css({
      display: 'inline-flex', alignItems: 'center', gap: '1.5',
      fontSize: 'xs', fontWeight: 'medium', color: s.color, mt: '1',
    })}>
      <Icon size={12} className={css({ animation: state === 'checking' ? 'spin 1s linear infinite' : 'none' })} />
      {s.text}
    </div>
  );
}
