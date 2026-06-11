// components/modals/EditNiveauModal.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Niveau, Parcours } from '@/types';
import { api } from '@/services/api';

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier le niveau</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code (L1, L2, ...)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Parcours</label>
            <select
              value={parcoursId}
              onChange={(e) => setParcoursId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            >
              {parcoursList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}