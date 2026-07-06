'use client';

import { css } from 'styled-system/css';

type StatusVariant =
  | 'actif' | 'conflit' | 'en-attente'
  | 'confirmee' | 'annulee' | 'terminee'
  | 'acceptee' | 'refusee';

const config: Record<StatusVariant, { bg: string; color: string; label: string }> = {
  actif:      { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Actif' },
  conflit:    { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Conflit' },
  'en-attente': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'En attente' },
  confirmee:  { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Confirmée' },
  annulee:    { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: 'Annulée' },
  terminee:   { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Terminée' },
  acceptee:   { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Acceptée' },
  refusee:    { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Refusée' },
};

const aliases: Record<string, StatusVariant> = {
  valide: 'confirmee', confirme: 'confirmee', confirmée: 'confirmee',
  en_attente: 'en-attente', enattente: 'en-attente', validé: 'confirmee',
  rejete: 'refusee', rejeté: 'refusee', annule: 'annulee', annulé: 'annulee',
  termine: 'terminee', terminé: 'terminee', terminée: 'terminee',
  accepté: 'acceptee', refusé: 'refusee',
};

export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/[_éèêë]/g, '').trim();
  const variant = aliases[normalized] as StatusVariant | undefined;
  const variantKey = (variant && config[variant])
    ? variant
    : (Object.keys(config).includes(normalized) ? normalized as StatusVariant : undefined);
  const style = variantKey ? config[variantKey] : { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: status };

  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1.5',
        px: '2',
        py: '0.5',
        fontSize: '11px',
        fontWeight: 'medium',
        rounded: 'md',
        bg: style.bg,
        color: style.color,
      })}
    >
      <span className={css({ w: '1.5', h: '1.5', rounded: 'full', bg: style.color, flexShrink: '0' })} />
      {style.label}
    </span>
  );
}
