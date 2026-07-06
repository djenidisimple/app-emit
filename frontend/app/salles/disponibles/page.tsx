'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, Users, ArrowRight, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import EmptyState from '@/components/global/EmptyState';
import { Salle, Creneau } from '@/types';
import { api } from '@/services/api';
import { css } from 'styled-system/css';

const inputCls = css({ w: 'full', px: '3', py: '2.5', border: '1px solid', borderColor: 'border.default', rounded: 'lg', fontSize: 'sm', color: 'fg.default', bg: 'bg.surface', outline: 'none', _focus: { borderColor: 'accent.default' } });
const labelCls = css({ fontSize: 'xs', fontWeight: 'semibold', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: 'wide' });

export default function SallesDisponiblesPage() {
  const [date, setDate] = useState('');
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [creneauId, setCreneauId] = useState('');
  const [results, setResults] = useState<Salle[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { api.get<Creneau[]>('/creneaux').then(setCreneaux).catch(() => {}); }, []);

  const handleSearch = async () => {
    if (!date || !creneauId) return;
    setIsLoading(true);
    try {
      const data = await api.get<Salle[]>(`/Salles/disponibles?date=${date}&creneauId=${creneauId}`);
      setResults(data);
    } catch { setResults([]); }
    finally { setSearched(true); setIsLoading(false); }
  };

  return (
    <ProtectedLayout pageTitle="Chercher une salle disponible">
      <div className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5', mb: '6' })}>
        <div className={css({ display: 'flex', alignItems: 'flex-end', gap: '4' })}>
          <div className={css({ flex: '1', display: 'flex', flexDirection: 'column', gap: '1' })}>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div className={css({ flex: '1', display: 'flex', flexDirection: 'column', gap: '1' })}>
            <label className={labelCls}>Créneau horaire</label>
            <select value={creneauId} onChange={(e) => setCreneauId(e.target.value)} className={inputCls}>
              <option value="">Sélectionner...</option>
              {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} — {c.heureDebut.slice(0, 5)} - {c.heureFin.slice(0, 5)}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} disabled={!date || !creneauId || isLoading}
            className={css({ bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '6', py: '2.5', rounded: 'lg', display: 'flex', alignItems: 'center', gap: '2', _hover: { opacity: 0.9 }, _disabled: { opacity: 0.5 } })}>
            <Search className={css({ w: '4', h: '4' })} /> Rechercher
          </button>
        </div>
      </div>

      {searched && (
        <>
          <p className={css({ fontSize: 'sm', color: 'fg.muted', mb: '4' })}>{results.length} salle{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''}</p>
          {results.length === 0 ? (
            <EmptyState icon={Calendar} title="Aucune salle disponible" description="Aucune salle disponible pour ce créneau." />
          ) : (
            <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: '6' })}>
              {results.map(salle => (
                <div key={salle.id} className={css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5', transition: 'box-shadow 0.15s', _hover: { shadow: 'md' } })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '4' })}>
                    <div className={css({ w: '10', h: '10', bg: 'bg.muted', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                      <Building2 className={css({ w: '5', h: '5', color: 'accent.default' })} />
                    </div>
                    <div>
                      <h3 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default' })}>{salle.libelle || salle.nom}</h3>
                    </div>
                  </div>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3', fontSize: 'sm', color: 'fg.muted', mb: '4' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '1' })}><Users className={css({ w: '4', h: '4' })} />{salle.capacite} places</div>
                    <span>|</span>
                    <span>{salle.type}</span>
                  </div>
                  <button className={css({ w: 'full', bg: 'accent.default', color: '#fff', fontWeight: 'semibold', fontSize: 'sm', px: '4', py: '2', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', _hover: { opacity: 0.9 } })}>
                    Réserver <ArrowRight className={css({ w: '4', h: '4' })} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ProtectedLayout>
  );
}
