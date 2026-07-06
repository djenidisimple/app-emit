'use client';

import { css } from 'styled-system/css';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  icon?: React.ElementType;
}

const variantStyles = {
  default: { accent: 'accent.default' as string },
  danger:  { accent: '#ef4444' },
  success: { accent: '#10b981' },
  warning: { accent: '#f59e0b' },
};

export default function StatCard({ label, value, variant = 'default', icon: Icon }: StatCardProps) {
  const { accent } = variantStyles[variant];

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        rounded: 'lg',
        p: '4',
        borderLeft: '3px solid',
        borderLeftColor: accent,
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' })}>
        <div>
          <div className={css({ color: accent, fontSize: '2xl', fontWeight: 'bold', lineHeight: 'none' })}>
            {value}
          </div>
          <div className={css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'medium', mt: '1' })}>
            {label}
          </div>
        </div>
        {Icon && (
          <div className={css({
            w: '8', h: '8', rounded: 'lg',
            bg: `${accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0',
          })}>
            <Icon size={15} className={css({ color: accent })} />
          </div>
        )}
      </div>
    </div>
  );
}
