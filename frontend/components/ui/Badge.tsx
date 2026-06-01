import React from 'react';

type BadgeStatus = 'Confirmé' | 'Annulé' | 'Reporté' | 'Terminé' | 'En attente';

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const styles: Record<BadgeStatus, string> = {
  'Confirmé':   'bg-emerald-100 text-emerald-700',
  'Annulé':     'bg-zinc-100 text-zinc-600',
  'Reporté':    'bg-amber-100 text-amber-700',
  'Terminé':    'bg-violet-100 text-violet-700',
  'En attente': 'bg-amber-100 text-amber-700',
};

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-medium rounded-md ${styles[status] ?? 'bg-zinc-50 text-zinc-600'} ${className}`}
    >
      {status}
    </span>
  );
};

export default Badge;
