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
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {labels[key] ?? statut}
    </span>
  );
}
