import React from 'react';
import { css } from 'styled-system/css';
import type { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: '16', textAlign: 'center' })}>
      <div className={css({ w: '12', h: '12', bg: 'bg.muted', rounded: 'lg', border: '1px solid', borderColor: 'border.default', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '4' })}>
        <Icon className={css({ w: '6', h: '6', color: 'fg.subtle' })} />
      </div>
      <p className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'fg.default', mb: '1' })}>{title}</p>
      <p className={css({ color: 'fg.subtle', fontSize: 'sm', maxW: 'xs' })}>{description}</p>
      {action && <div className={css({ mt: '5' })}>{action}</div>}
    </div>
  );
}
