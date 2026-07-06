import { css } from 'styled-system/css';

const styles: Record<string, { bg: string; color: string }> = {
  En_Attente: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Valide:     { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  Rejete:     { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  Annule:     { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  Termine:    { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
};

const labels: Record<string, string> = {
  En_Attente: 'En attente',
  Valide:     'Validé',
  Rejete:     'Rejeté',
  Annule:     'Annulé',
  Termine:    'Terminé',
};

const normalizedKeys: Record<string, string> = {};
for (const k of Object.keys(labels)) {
  normalizedKeys[k.toLowerCase().replace(/[éè_]/g, '')] = k;
}

export default function StatutBadge({ statut }: { statut: string }) {
  const normalized = statut.toLowerCase().replace(/[éè_]/g, '');
  const key = normalizedKeys[normalized] || statut;
  const style = styles[key] || { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };

  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        px: '2',
        py: '0.5',
        fontSize: '11px',
        fontWeight: 'medium',
        rounded: 'md',
        bg: style.bg,
        color: style.color,
      })}
    >
      {labels[key] ?? statut}
    </span>
  );
}
