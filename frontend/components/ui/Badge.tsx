import React from 'react';

interface BadgeProps {
  status: 'Confirmé' | 'Annulé' | 'Reporté' | 'Terminé';
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    'Confirmé': 'bg-green-100 text-green-800',
    'Annulé': 'bg-red-100 text-red-800',
    'Reporté': 'bg-amber-100 text-amber-800',
    'Terminé': 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Badge;
