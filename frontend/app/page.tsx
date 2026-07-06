'use client';

import Link from 'next/link';
import { css } from 'styled-system/css';
import { ArrowRight, Calendar, Building2, Users, Bell, Clock } from 'lucide-react';

const stats = [
  { label: 'Salles gérées', value: '12+', icon: Building2 },
  { label: 'Séances / semaine', value: '80+', icon: Calendar },
  { label: 'Utilisateurs', value: '200+', icon: Users },
];

const features = [
  { icon: Clock, title: 'Emploi du temps', desc: 'Planning hebdomadaire interactif avec vue grille et filtrage par jour.' },
  { icon: Building2, title: 'Gestion des salles', desc: 'Consultation des salles, capacités, types et disponibilités en temps réel.' },
  { icon: Bell, title: 'Notifications temps réel', desc: 'Alertes instantanées via SignalR pour les modifications et réservations.' },
  { icon: Users, title: 'Réservations', desc: 'Réservation de salles et échange de créneaux entre professeurs.' },
];

export default function LandingPage() {
  return (
    <div className={css({ minH: '100vh', display: 'flex', flexDirection: 'column', bg: 'bg.canvas' })}>
      <div className={css({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: '6', py: '16', maxWidth: '960px', mx: 'auto', w: 'full' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3', mb: '8' })}>
          <div className={css({ w: '10', h: '10', bg: 'accent.default', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            <span className={css({ color: 'white', fontSize: 'xs', fontWeight: 'bold' })}>GS</span>
          </div>
          <div>
            <span className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'sm', display: 'block', lineHeight: 'none' })}>G-Salles</span>
            <span className={css({ color: 'accent.default', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' })}>EMIT</span>
          </div>
        </div>

        <h1 className={css({ fontSize: { base: '3xl', md: '5xl' }, fontWeight: 'bold', color: 'fg.default', textAlign: 'center', lineHeight: 'tight', mb: '4' })}>
          Système de gestion des salles et emploi du temps — EMIT
        </h1>

        <p className={css({ color: 'fg.muted', fontSize: 'sm', textAlign: 'center', maxWidth: '520px', mb: '10', lineHeight: 'relaxed' })}>
          Planifiez, gérez et visualisez l&apos;emploi du temps des cours et la disponibilité des salles de l&apos;École Mention Informatique et Technologies.
        </p>

        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' }, gap: '4', w: 'full', maxWidth: '640px', mb: '12' })}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', px: '5', py: '4', display: 'flex', alignItems: 'center', gap: '3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
                <Icon size={18} className={css({ color: 'accent.default' })} />
                <div>
                  <p className={css({ color: 'fg.default', fontWeight: 'bold', fontSize: 'xl', lineHeight: 'none' })}>{s.value}</p>
                  <p className={css({ color: 'fg.muted', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 'wider', fontWeight: 'medium', mt: '0.5' })}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' }, gap: '4', w: 'full', maxWidth: '640px', mb: '12' })}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
                <div className={css({ w: '8', h: '8', bg: 'rgba(59,130,246,0.1)', rounded: 'md', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '3' })}>
                  <Icon size={15} className={css({ color: 'accent.default' })} />
                </div>
                <h3 className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'sm', mb: '1' })}>{f.title}</h3>
                <p className={css({ color: 'fg.muted', fontSize: 'xs', lineHeight: 'relaxed' })}>{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap', justifyContent: 'center' })}>
          <Link
            href="/login"
            className={css({ display: 'inline-flex', alignItems: 'center', gap: '2', px: '6', py: '3', bg: 'accent.default', color: 'white', fontWeight: 'semibold', fontSize: 'sm', rounded: 'lg', _hover: { bg: 'accent.emphasized' }, transition: 'all 0.2s' })}
          >
            Connexion <ArrowRight size={16} />
          </Link>
          <Link
            href="/register"
            className={css({ display: 'inline-flex', alignItems: 'center', gap: '2', px: '6', py: '3', bg: 'transparent', color: 'fg.default', fontWeight: 'semibold', fontSize: 'sm', rounded: 'lg', border: '1px solid', borderColor: 'border.default', _hover: { bg: 'bg.surface' }, transition: 'all 0.2s' })}
          >
            Créer un compte <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <footer className={css({ borderTop: '1px solid', borderColor: 'border.default', py: '5', textAlign: 'center' })}>
        <p className={css({ color: 'fg.muted', fontSize: 'xs' })}>Université de Fianarantsoa — EMIT 2025-2026</p>
      </footer>
    </div>
  );
}
