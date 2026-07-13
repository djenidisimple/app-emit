'use client';

import { Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';

interface TopbarProps {
  prenom?: string;
  date?: string;
  heure?: string;
  contexte?: string;
  onNouvelleException?: () => void;
}

export function Topbar({
  prenom: prenomProp,
  date,
  heure,
  contexte = '18 cours en session',
  onNouvelleException,
}: TopbarProps) {
  const { user } = useAuthStore();
  const prenom = prenomProp || user?.prenom || 'Utilisateur';
  const now = new Date();
  const dateStr = date || now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const heureStr = heure || now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between px-1 pt-1 pb-0">
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-full shrink-0 bg-[#2F6FED] flex items-center justify-center text-white font-bold text-base">
          {prenom?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-ink m-0 leading-tight">
            Bonjour, {prenom}
          </h1>
          <p className="text-[12.5px] text-muted mt-0.5 flex items-center gap-1.5">
            <span>{dateStr}</span>
            <span className="text-muted/50">·</span>
            <span className="font-mono font-semibold text-muted">{heureStr}</span>
            <span className="text-muted/50">·</span>
            <span>{contexte}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onNouvelleException}
          className="flex items-center gap-1.5 bg-blue text-white border-none rounded-[10px] px-4 py-2.5 text-[12.5px] font-bold cursor-pointer hover:brightness-110 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Nouvelle Exception
        </button>
      </div>
    </div>
  );
}
