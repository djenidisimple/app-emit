import { css } from 'styled-system/css';

export function LoadingSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const barCls = css({ h: '4', bg: 'bg.muted', rounded: 'md', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' });

  return (
    <div className={css({ spaceY: '3', ...(className ? {} : {}) }) + (className ? ` ${className}` : '')}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={barCls}
          style={{ width: i === 0 ? '75%' : i === lines - 1 ? '50%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const barCls = css({ h: '5', bg: 'bg.muted', rounded: 'md', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' });

  return (
    <div className={css({ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' })}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={css({ display: 'flex', gap: '4', mb: '3' })}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={barCls} style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  const cardCls = css({ bg: 'bg.surface', rounded: 'lg', border: '1px solid', borderColor: 'border.default', p: '5', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' });
  const barCls = css({ bg: 'bg.muted', rounded: 'md', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' });

  return (
    <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: '5' })}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cardCls}>
          <div className={barCls} style={{ height: '20px', width: '66%', marginBottom: '16px' }} />
          <div className={barCls} style={{ height: '16px', width: '50%', marginBottom: '8px' }} />
          <div className={barCls} style={{ height: '16px', width: '75%' }} />
        </div>
      ))}
    </div>
  );
}
