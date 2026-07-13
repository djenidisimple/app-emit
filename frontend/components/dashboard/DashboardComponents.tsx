'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    type: 'positive' | 'negative';
  };
}

export const DashboardStatCard: React.FC<StatCardProps> = ({ label, value, trend }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-catalyst-border-light)] transition-all duration-300 flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-[var(--color-catalyst-text-secondary)]">
          {label}
        </span>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend.type === 'positive' ? 'bg-[var(--color-catalyst-positive-bg)] text-[var(--color-catalyst-positive)]' : 'bg-[var(--color-catalyst-negative-bg)] text-[var(--color-catalyst-negative)]'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      <span className="text-xl font-bold text-[var(--color-catalyst-text-primary)]">
        {value}
      </span>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export const DashboardChartCard: React.FC<ChartCardProps> = ({ title, children, actionLabel, actionHref, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-[var(--color-catalyst-border-light)] transition-all duration-300 flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-[var(--color-catalyst-text-secondary)]">
          {title}
        </span>
        {actionLabel && (
          <a href={actionHref} className="text-xs font-medium text-[var(--color-catalyst-text-secondary)] hover:text-[var(--color-catalyst-primary)]">
            {actionLabel}
          </a>
        )}
      </div>
      {children}
    </div>
  );
};
