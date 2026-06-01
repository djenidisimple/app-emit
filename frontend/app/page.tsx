import Link from 'next/link';
import { ArrowRight, Calendar, Building2, Users } from 'lucide-react';

const stats = [
  { label: 'Salles gérées', value: '12+', icon: Building2 },
  { label: 'Séances / semaine', value: '80+', icon: Calendar },
  { label: 'Utilisateurs', value: '200+', icon: Users },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left panel: dark hero ───────────────────── */}
      <div className="relative flex-1 lg:w-3/5 bg-[#0052FF] flex flex-col justify-between p-8 lg:p-12 min-h-[50vh] lg:min-h-screen">
        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <div>
            <span className="text-white font-semibold text-base leading-none block">
              G-Salles
            </span>
            <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
              EMIT
            </span>
          </div>
        </div>

        {/* Main hero text */}
        <div className="relative z-10 my-auto">
          <div className="inline-block bg-white/20 px-3 py-1 mb-4 rounded-lg">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              Université de Fianarantsoa
            </span>
          </div>
          <h1 className="text-[clamp(4rem,10vw,8rem)] font-bold text-white leading-none tracking-tight">
            G-SALLES
          </h1>
          <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-bold text-white/40 leading-none tracking-tight -mt-1">
            EMIT
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mt-6">
            Système de gestion du planning et des salles de l&apos;École Mention
            Informatique et Technologies.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-8 flex-wrap">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <Icon size={16} className="text-white/70 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xl leading-none">
                      {s.value}
                    </p>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/30 text-xs font-medium">
          © 2025 EMIT — Université de Fianarantsoa
        </p>
      </div>

      {/* ── Right panel: CTA ─────────────────────────── */}
      <div className="flex-shrink-0 lg:w-2/5 bg-blue-50 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Tag */}
          <div className="inline-block bg-white px-3 py-1 mb-6 rounded-lg border border-blue-200 shadow-sm">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-widest">
              Accès plateforme
            </span>
          </div>

          <h2 className="text-4xl font-bold text-blue-900 leading-none mb-2">
            Bienvenue
          </h2>
          <p className="text-blue-500 text-sm mb-10 leading-relaxed">
            Connectez-vous pour accéder à votre espace de gestion du planning et des salles.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-[#0052FF] text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <span>Se connecter</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-white text-blue-900 border border-blue-200 font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              <span>Créer un compte</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-blue-200">
            <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest mb-4">
              Fonctionnalités
            </p>
            <ul className="space-y-2 text-sm text-blue-900">
              {[
                'Gestion du planning hebdomadaire',
                'Réservation de salles en ligne',
                'Suivi des notifications en temps réel',
                'Échange de créneaux entre professeurs',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0052FF] rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
