const styles: Record<string, string> = {
  En_Attente: "bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]",
  Valide: "bg-green-100 text-green-800 border border-green-200",
  Rejete: "bg-red-100 text-red-800 border border-red-200",
  Annule: "bg-slate-100 text-slate-700 border border-slate-200",
  Termine: "bg-blue-100 text-blue-800 border border-blue-200",
};
const labels: Record<string, string> = {
  En_Attente: "En attente", Valide: "Validé",
  Rejete: "Rejeté", Annule: "Annulé", Termine: "Terminé",
};

export default function StatutBadge({ statut }: { statut: string }) {
  const key = Object.keys(labels).find(k => statut.toLowerCase().includes(k.toLowerCase())) || statut;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[key] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
      {labels[key] ?? statut}
    </span>
  );
}
