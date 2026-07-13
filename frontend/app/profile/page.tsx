'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, BookOpen, Clock, MapPin, BadgeCheck, GraduationCap } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { SeancePlanningDto, PlanningHebdoResponse } from '@/types';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);

  const displayName = user ? `${user.prenom ?? ''} ${user.nom ?? ''}` : 'Utilisateur';
  const initials = displayName.charAt(0).toUpperCase();
  const email = user?.email ?? '—';
  const role = user?.role ?? '—';

  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    api.get<PlanningHebdoResponse>(`/Planning/hebdo?startDate=${today}&professeurId=${user.id}`)
      .then((res) => setSeances(res.seances || []))
      .catch(() => {});
  }, [user]);

  const matieres = [...new Set(seances.map((s) => s.matiereNom))];
  const enCours = seances.filter((s) =>
    s.statut !== 'Terminee' && s.statut !== 'Terminé' && s.statut !== 'Annule' && s.statut !== 'Annulé'
  ).length;
  const terminees = seances.filter((s) =>
    s.statut === 'Terminee' || s.statut === 'Terminé'
  ).length;

  return (
    <ProtectedLayout pageTitle="Profil">
      <div className="space-y-6">
        {/* Hero card */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="h-24 bg-[#5A55F2]" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-[#5A55F2] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                <h1 className="text-xl font-bold text-fg-default truncate">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-fg-subtle" /> {email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-accent" /> {role}
                  </span>
                  {role === 'Professeur' && matieres.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-fg-subtle" /> {matieres.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Séances cette semaine', value: seances.length, icon: BookOpen, color: '#5A55F2' },
            { label: 'En cours', value: enCours, icon: Clock, color: '#10B981' },
            { label: 'Terminées', value: terminees, icon: MapPin, color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-xl font-bold text-fg-default">{stat.value}</div>
                <div className="text-xs font-medium text-fg-muted">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Info details */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold text-fg-default uppercase tracking-wider">Informations détaillées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nom', value: `${user?.nom ?? '—'}` },
              { label: 'Prénom', value: `${user?.prenom ?? '—'}` },
              { label: 'Email', value: email },
              { label: 'Rôle', value: role },
              ...(role === 'Professeur' ? [{ label: 'Matières', value: matieres.length > 0 ? matieres.join(', ') : '—' }] : []),
              { label: 'ID utilisateur', value: user?.id?.toString() || '—' },
            ].map((info) => (
              <div key={info.label} className="border-b border-border pb-2 last:border-b-0">
                <p className="text-xs text-fg-muted font-medium">{info.label}</p>
                <p className="text-sm text-fg-default font-medium">{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
