'use client';

import React from 'react';
import { MapPin, Users, Monitor, ShieldCheck } from 'lucide-react';
import { Salle } from '@/types';
import Button from './ui/Button';

interface SalleCardProps {
  salle: Salle;
  onReserve?: (id: number) => void;
}

const SalleCard: React.FC<SalleCardProps> = ({ salle, onReserve }) => {
  const estDisponible = salle.estDisponible;

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col h-full group hover:shadow-lg transition-shadow">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-xl ${estDisponible ? 'bg-blue-100 text-[#0052FF]' : 'bg-red-50 text-red-500'}`}>
            <MapPin size={18} />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${estDisponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {estDisponible ? 'Disponible' : 'Occupée'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-[#0052FF] transition-colors">
          {salle.libelle}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Users size={14} className="text-blue-400" />
            <span>{salle.capacite} places</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Monitor size={14} className="text-blue-400" />
            <span>Type : {salle.type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>Code : {salle.codeSalle}</span>
          </div>
        </div>
      </div>

      <Button
        variant={estDisponible ? 'primary' : 'secondary'}
        disabled={!estDisponible}
        onClick={() => onReserve?.(salle.id)}
        className="w-full"
      >
        {estDisponible ? 'Réserver la salle' : 'Bientôt disponible'}
      </Button>
    </div>
  );
};

export default SalleCard;
