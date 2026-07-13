import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, id, className = '' }) => {
  return (
    <div 
      id={id} 
      className={`bg-white rounded-[8px] p-5 border border-neutral-200 transition-all duration-300 flex flex-col ${className}`}
    >
      {children}
    </div>
  );
};
