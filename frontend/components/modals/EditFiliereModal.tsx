// components/modals/EditFiliereModal.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Filiere } from '@/types';
import { api } from '@/services/api';

interface Props {
  isOpen: boolean;
  filiere: Filiere | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditFiliereModal({ isOpen, filiere, onClose, onSaved }: Props) {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prevId = useRef<number | null>(null);
  useEffect(() => {
    if (filiere && filiere.id !== prevId.current) {
      prevId.current = filiere.id;
      setNom(filiere.nom);
    }
  }, [filiere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filiere) return;
    setLoading(true);
    setError('');
    try {
      await api.put(`/Filiere/${filiere.id}`, { nom });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !filiere) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier la filière</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
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