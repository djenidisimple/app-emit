'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
}

export function Card({ children, className = '', padding = '' }: CardProps) {
  return (
    <div
      className={`bg-card border border-neutral-200 rounded-[8px] ${padding || 'px-[18px] py-4 pb-[18px]'} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  right?: ReactNode;
}

export function CardHeader({ title, right }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-[14px]">
      <div className="text-[13.5px] font-bold text-ink">{title}</div>
      {right && (
        <div className="flex items-center gap-1 text-[11.5px] text-muted font-semibold cursor-pointer">
          {right}
        </div>
      )}
    </div>
  );
}
