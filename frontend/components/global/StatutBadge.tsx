const styles: Record<string, string> = {
  En_Attente: 'bg-amber-100 text-amber-700',
  Valide:     'bg-emerald-100 text-emerald-700',
  Rejete:     'bg-red-100 text-red-700',
  Annule:     'bg-zinc-100 text-zinc-600',
  Termine:    'bg-violet-100 text-violet-700',
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

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-medium rounded-md ${
        styles[key] ?? 'bg-zinc-50 text-zinc-600'
      }`}
    >
      {labels[key] ?? statut}
    </span>
  );
}
