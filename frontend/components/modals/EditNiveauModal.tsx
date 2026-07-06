'use client';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Niveau, Parcours } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { css } from 'styled-system/css';

interface Props {
  isOpen: boolean;
  niveau: Niveau | null;
  parcoursList: Parcours[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditNiveauModal({ isOpen, niveau, parcoursList, onClose, onSaved }: Props) {
  const [code, setCode] = useState('');
  const [parcoursId, setParcoursId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prevId = useRef<number | null>(null);
  useEffect(() => {
    if (niveau && niveau.id !== prevId.current) {
      prevId.current = niveau.id;
      setCode(niveau.code);
      setParcoursId(niveau.parcoursId);
    }
  }, [niveau]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niveau) return;
    setLoading(true);
    setError('');
    try {
      await api.put(`/Niveau/${niveau.id}`, { code, parcoursId });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !niveau) return null;

  const overlay = css({
    position: 'fixed',
    inset: '0',
    bg: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '50',
  });

  const panel = css({
    bg: 'bg.surface',
    rounded: 'lg',
    p: '6',
    w: '100%',
    maxW: 'md',
    border: '1px solid',
    borderColor: 'border.default',
    shadow: 'xl',
  });

  const inputCls = css({
    w: '100%',
    border: '1px solid',
    borderColor: 'border.default',
    rounded: 'lg',
    px: '3',
    py: '2',
    fontSize: 'sm',
    bg: 'bg.surface',
    color: 'fg.default',
    outline: 'none',
    _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(79,94,255,0.15)' },
  });

  return (
    <div className={overlay}>
      <div className={panel}>
        <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '4' })}>
          <h2 className={css({ fontSize: 'base', fontWeight: 'semibold', color: 'fg.default' })}>Modifier le niveau</h2>
          <button onClick={onClose} className={css({ p: '1', color: 'fg.subtle', _hover: { color: 'fg.default' } })}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={css({ mb: '4' })}>
            <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'fg.muted', mb: '1' })}>Code (L1, L2, ...)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div className={css({ mb: '4' })}>
            <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'fg.muted', mb: '1' })}>Parcours</label>
            <select
              value={parcoursId}
              onChange={(e) => setParcoursId(Number(e.target.value))}
              className={inputCls}
              required
            >
              {parcoursList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          {error && <p className={css({ color: '#ef4444', fontSize: 'sm', mb: '3' })}>{error}</p>}
          <div className={css({ display: 'flex', justifyContent: 'flex-end', gap: '2' })}>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
