'use client';

import React, { useState, useEffect } from 'react';
import { css } from 'styled-system/css';
import { Search, Building2, Users, X } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Salle } from '@/types';
import { api } from '@/services/api';
import useAuthStore from '@/store/authStore';

const TYPE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'Amphithéâtre': { bg: '#8b5cf620', color: '#8b5cf6', border: '#8b5cf640' },
  'Laboratoire': { bg: '#3b82f620', color: '#3b82f6', border: '#3b82f640' },
  'Salle de cours': { bg: '#10b98120', color: '#10b981', border: '#10b98140' },
  'Salle TP': { bg: '#f59e0b20', color: '#f59e0b', border: '#f59e0b40' },
};

function getTypeStyle(type: string) {
  const key = Object.keys(TYPE_STYLES).find((k) => type.toLowerCase().includes(k.toLowerCase()));
  return key ? TYPE_STYLES[key] : { bg: 'rgba(59,130,246,0.12)', color: 'var(--colors-accent-default)', border: 'rgba(59,130,246,0.25)' };
}

export default function SallesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try { const data = await api.get<Salle[]>('/Salles'); setSalles(data); }
      catch { /* ignore */ } finally { setIsLoading(false); }
    };
    load();
  }, []);

  const filtered = salles.filter((s) =>
    (s.nom || s.libelle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedLayout pageTitle="Salles">
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4', mb: '5', flexWrap: 'wrap' })}>
        <div className={css({ position: 'relative', w: '72' })}>
          <Search size={14} className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', pointerEvents: 'none' })} />
          <Input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className={css({ pl: '9', pr: '8', bg: 'bg.surface', borderColor: 'border.default', color: 'fg.default', _placeholder: { color: 'fg.subtle' }, _focus: { borderColor: 'accent.default' } })}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className={css({ position: 'absolute', right: '3', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', _hover: { color: 'fg.muted' } })}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {!isLoading && salles.length > 0 && (
        <div className={css({ display: 'flex', gap: '3', mb: '5', flexWrap: 'wrap' })}>
          <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', px: '4', py: '3', display: 'flex', alignItems: 'center', gap: '2' })}>
            <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'accent.default' })}>{salles.length}</span>
            <span className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Salles totales</span>
          </div>
          <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', px: '4', py: '3', display: 'flex', alignItems: 'center', gap: '2' })}>
            <span className={css({ fontSize: 'xl', fontWeight: 'bold', color: '#10b981' })}>{salles.filter((s) => s.estDisponible).length}</span>
            <span className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted' })}>Disponibles</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: '4' })}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5' })}>
              <div className={css({ h: '5', w: '32', bg: 'bg.elevated', rounded: 'md', mb: '4' })} />
              <div className={css({ h: '3', w: '20', bg: 'bg.elevated', rounded: 'md', mb: '2' })} />
              <div className={css({ h: '3', w: '24', bg: 'bg.elevated', rounded: 'md' })} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '12', textAlign: 'center' })}>
          <Building2 size={32} className={css({ color: 'fg.subtle', mx: 'auto', mb: '3' })} />
          <p className={css({ color: 'fg.default', fontWeight: 'semibold', mb: '1' })}>Aucune salle</p>
          <p className={css({ color: 'fg.muted', fontSize: 'sm' })}>{searchTerm ? 'Aucune salle ne correspond à votre recherche.' : 'Aucune salle enregistrée.'}</p>
        </div>
      ) : (
        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: '4' })}>
          {filtered.map((salle) => {
            const typeStyle = getTypeStyle(salle.type);
            return (
              <div key={salle.id} className={css({ bg: 'bg.surface', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', _hover: { borderColor: 'border.subtle' }, transition: 'all 0.15s' })}>
                <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '4' })}>
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3', minW: '0' })}>
                    <div className={css({ w: '9', h: '9', bg: 'bg.elevated', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' })}>
                      <Building2 size={16} className={css({ color: 'fg.muted' })} />
                    </div>
                    <div className={css({ minWidth: '0' })}>
                      <h3 className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'base', lineHeight: 'tight', truncate: 'true' })}>{salle.libelle || salle.nom}</h3>
                      {salle.codeSalle && <p className={css({ fontSize: 'xs', color: 'fg.subtle' })}>{salle.codeSalle}</p>}
                    </div>
                  </div>
                  <span className={css({ display: 'inline-flex', alignItems: 'center', px: '2', py: '0.5', fontSize: 'xs', fontWeight: 'medium', rounded: 'md', flexShrink: '0', bg: salle.estDisponible ? '#10b98120' : '#ef444420', color: salle.estDisponible ? '#10b981' : '#ef4444', border: '1px solid', borderColor: salle.estDisponible ? '#10b98140' : '#ef444440' })}>
                    {salle.estDisponible ? 'Dispo' : 'Indispo'}
                  </span>
                </div>

                <div className={css({ display: 'flex', alignItems: 'center', gap: '3', fontSize: 'xs', fontWeight: 'medium', color: 'fg.muted', mb: '4' })}>
                  <span className={css({ display: 'flex', alignItems: 'center', gap: '1.5', bg: 'bg.elevated', rounded: 'md', border: '1px solid', borderColor: 'border.subtle', px: '2', py: '1' })}>
                    <Users size={11} />{salle.capacite} places
                  </span>
                  <span className={css({ display: 'inline-flex', alignItems: 'center', px: '2', py: '0.5', rounded: 'md', bg: typeStyle.bg, color: typeStyle.color, border: '1px solid', borderColor: typeStyle.border, fontWeight: 'medium' })}>
                    {salle.type}
                  </span>
                </div>

                <div className={css({ display: 'flex', alignItems: 'center', pt: '3', borderTop: '1px solid', borderColor: 'border.subtle' })}>
                  <span className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'accent.default', _hover: { textDecoration: 'underline' }, transition: 'colors 0.15s', cursor: 'pointer' })}>Voir planning →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProtectedLayout>
  );
}
