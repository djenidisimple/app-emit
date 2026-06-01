import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, Users, Bell } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Planning hebdomadaire',
    description: "Visualisez et gérez le planning des cours par semaine, filière et niveau.",
  },
  {
    icon: Building2,
    title: 'Gestion des salles',
    description: "Consultez la disponibilité des salles et gérez les réservations en temps réel.",
  },
  {
    icon: Users,
    title: 'Multi-rôles',
    description: "Accès différencié pour les administrateurs, professeurs et étudiants.",
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: "Alertes en temps réel pour les modifications de planning et les réservations.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-[#0052FF] px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold">GS</span>
          </div>
          <span className="text-white font-semibold text-base">
            G-Salles EMIT
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Retour à l&apos;accueil
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-block bg-[#0052FF] px-3 py-1 mb-4 rounded-lg shadow-sm">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              À propos
            </span>
          </div>
          <h1 className="text-6xl font-bold text-blue-900 leading-none mb-4">
            G-Salles
            <br />
            EMIT
          </h1>
          <p className="text-blue-500 text-base leading-relaxed max-w-xl">
            Système de gestion du planning et des salles de l&apos;École Mention Informatique et
            Technologies — EMIT, Université de Fianarantsoa, Madagascar.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <div className="w-10 h-10 bg-[#0052FF] rounded-xl flex items-center justify-center mb-3">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  {f.title}
                </h3>
                <p className="text-blue-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>

        {/* Tech info */}
        <div className="bg-[#0052FF] rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
            Stack technique
          </p>
          <div className="flex flex-wrap gap-2">
            {['Next.js 16', 'React 19', 'Tailwind CSS v4', '.NET 9', 'SignalR', 'PostgreSQL'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/10 rounded-lg text-white text-xs font-medium"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
