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

export default function StatutBadge({ statut }: { statut: string }) {
  const key =
    Object.keys(labels).find((k) =>
      statut.toLowerCase().replace(/[éè]/g, 'e').includes(k.toLowerCase().replace(/[_]/g, ''))
    ) || statut;

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
