'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { LoadingSkeleton } from '@/components/global/LoadingSkeleton';
import { examenService } from '@/services/examens';
import useAuthStore from '@/store/authStore';
import { ExamenReadDto } from '@/types';
import { css } from 'styled-system/css';

type FilterPeriod = 'all' | 'upcoming' | 'past';

export default function MesExamensPage() {
  const { user } = useAuthStore();
  const [examens, setExamens] = useState<ExamenReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('upcoming');

  useEffect(() => {
    const load = async () => {
      if (!user?.niveauId) return;
      setLoading(true);
      setError('');
      try {
        const data = await examenService.getByNiveau(user.niveauId);
        setExamens(data);
      } catch {
        setError('Impossible de charger les examens.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const now = new Date();
  const filtered = examens.filter((e) => {
    const dateExamen = new Date(e.dateExamen);
    if (filterPeriod === 'upcoming') return dateExamen >= now;
    if (filterPeriod === 'past') return dateExamen < now;
    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <ProtectedLayout pageTitle="Mes examens">
      <div className={css({ display: 'flex', gap: '2', mb: '5' })}>
        {([
          { key: 'upcoming', label: 'À venir' },
          { key: 'past', label: 'Passés' },
          { key: 'all', label: 'Tous' },
        ] as const).map((opt) => (
          <button key={opt.key} onClick={() => setFilterPeriod(opt.key)}
            className={css({
              px: '4', py: '1.5', rounded: 'md', fontSize: 'sm', fontWeight: 'medium', transition: 'all 0.15s',
              bg: filterPeriod === opt.key ? 'accent.default' : 'bg.surface',
              color: filterPeriod === opt.key ? '#fff' : 'fg.muted',
              border: filterPeriod === opt.key ? 'none' : '1px solid',
              borderColor: 'border.default',
            })}>
            {opt.label}
            {opt.key !== 'all' && (
              <span className={css({ ml: '1.5', px: '1', py: '0.5', fontSize: '9px', fontWeight: 'semibold', rounded: 'sm',
                bg: filterPeriod === opt.key ? 'rgba(255,255,255,0.2)' : 'bg.muted',
                color: filterPeriod === opt.key ? '#fff' : 'fg.default',
              })}>
                {examens.filter((e) => {
                  const d = new Date(e.dateExamen);
                  return opt.key === 'upcoming' ? d >= now : d < now;
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className={css({ mb: '4', px: '4', py: '3', bg: 'rgba(239,68,68,0.1)', border: '1px solid', borderColor: '#ef4444', fontSize: 'sm', fontWeight: 'medium', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2', rounded: 'lg' })}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton lines={5} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5' })} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucun examen"
          description={filterPeriod === 'upcoming' ? 'Aucun examen à venir.' : 'Aucun examen trouvé.'} />
      ) : (
        <div className={css({ display: 'grid', gap: '4', gridTemplateColumns: { base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' } })}>
          {filtered.map((examen) => (
            <div key={examen.id} className={css({
              bg: 'bg.surface', border: '1px solid', borderColor: 'border.default',
              rounded: 'lg', overflow: 'hidden', transition: 'box-shadow 0.15s', _hover: { shadow: 'md' },
            })}>
              <div className={css({ px: '5', py: '4', spaceY: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <BookOpen size={16} className={css({ color: 'accent.default' })} />
                    <div>
                      <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>{examen.matiereNom}</p>
                      <p className={css({ fontSize: 'xs', color: 'fg.subtle' })}>{examen.matiereCode}</p>
                    </div>
                  </div>
                </div>

                <div className={css({ spaceY: '2' })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
                    <Calendar size={13} />
                    <span className={css({ fontWeight: 'medium', color: 'fg.default' })}>{formatDate(examen.dateExamen)}</span>
                  </div>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
                    <Clock size={13} />
                    <span className={css({ fontWeight: 'medium', color: 'fg.default' })}>
                      {examen.heureDebut} — {examen.heureFin}
                    </span>
                  </div>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
                    <MapPin size={13} />
                    <span className={css({ fontWeight: 'medium', color: 'fg.default' })}>{examen.salleNom}</span>
                  </div>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'xs', color: 'fg.muted' })}>
                    <User size={13} />
                    <span className={css({ color: 'fg.default' })}>{examen.professeurNom}</span>
                  </div>
                </div>

                {examen.description && (
                  <p className={css({ fontSize: 'xs', color: 'fg.muted', mt: '1', fontStyle: 'italic' })}>
                    {examen.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
