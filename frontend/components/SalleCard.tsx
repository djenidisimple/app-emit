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
  const estDisponible = salle.estActive;

  return (
    <div className="card-emit p-5 flex flex-col justify-between h-full group bg-white border border-emit-border rounded-md shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-md ${estDisponible ? 'bg-emit-blue/10 text-emit-blue' : 'bg-red-50 text-red-600'}`}>
          <MapPin size={22} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${estDisponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${estDisponible ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {estDisponible ? 'Disponible' : 'Occupée'}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-poppins font-bold text-emit-blue mb-2 group-hover:text-emit-orange transition-colors">
          {salle.libelle}
        </h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-emit-text/70">
            <Users size={16} className="text-emit-blue/50" />
            <span>{salle.capacite} places</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emit-text/70">
            <Monitor size={16} className="text-emit-blue/50" />
            <span>Type : {salle.type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emit-text/70">
            <ShieldCheck size={16} className="text-emit-blue/50" />
            <span>Code : {salle.codeSalle}</span>
          </div>
        </div>
      </div>

      <Button 
        variant={estDisponible ? 'orange' : 'glass'} 
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
