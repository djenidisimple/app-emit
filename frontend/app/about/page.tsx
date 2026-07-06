'use client';

import Link from 'next/link';
import { css } from 'styled-system/css';
import { ArrowLeft, Building2, Calendar, Users, Bell } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Planning hebdomadaire', description: 'Visualisez et gérez le planning des cours par semaine, filière et niveau.' },
  { icon: Building2, title: 'Gestion des salles', description: 'Consultez la disponibilité des salles et gérez les réservations en temps réel.' },
  { icon: Users, title: 'Multi-rôles', description: 'Accès différencié pour les administrateurs, professeurs et étudiants.' },
  { icon: Bell, title: 'Notifications', description: 'Alertes en temps réel pour les modifications de planning et les réservations.' },
];

const techStack = ['ASP.NET Core', 'Next.js', 'PostgreSQL', 'Panda CSS', 'SignalR', 'TypeScript'];

export default function AboutPage() {
  return (
    <div className={css({ minH: '100vh', bg: 'bg.canvas' })}>
      <header className={css({ borderBottom: '1px solid', borderColor: 'border.default', px: '6', py: '3', bg: 'white' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <div className={css({ w: '8', h: '8', bg: 'accent.default', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            <span className={css({ color: 'white', fontSize: 'xs', fontWeight: 'bold' })}>GS</span>
          </div>
          <span className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'sm' })}>G-Salles EMIT</span>
        </div>
      </header>

      <main className={css({ maxWidth: '720px', mx: 'auto', px: '6', py: '12' })}>
        <Link href="/" className={css({ display: 'inline-flex', alignItems: 'center', gap: '2', color: 'fg.muted', fontSize: 'sm', fontWeight: 'medium', _hover: { color: 'fg.default' }, transition: 'colors 0.15s', mb: '8' })}>
          <ArrowLeft size={14} />Retour à l&apos;accueil
        </Link>

        <div className={css({ mb: '10' })}>
          <div className={css({ display: 'inline-block', bg: 'accent.default', px: '2.5', py: '1', mb: '4', rounded: 'md' })}>
            <span className={css({ color: 'white', fontSize: '10px', fontWeight: 'semibold', textTransform: 'uppercase', letterSpacing: 'widest' })}>À propos</span>
          </div>
          <h1 className={css({ fontSize: '5xl', fontWeight: 'bold', color: 'fg.default', lineHeight: 'none', mb: '3' })}>
            G-Salles<br />EMIT
          </h1>
          <p className={css({ color: 'fg.muted', fontSize: 'base', lineHeight: 'relaxed', maxWidth: '560px' })}>
            Système de gestion du planning et des salles de l&apos;École Mention Informatique et Technologies — EMIT, Université de Fianarantsoa, Madagascar.
          </p>
        </div>

        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' }, gap: '4', mb: '10' })}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={css({ bg: 'white', border: '1px solid', borderColor: 'border.default', rounded: 'lg', p: '5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })}>
                <div className={css({ w: '9', h: '9', bg: 'rgba(59,130,246,0.1)', rounded: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '3' })}>
                  <Icon size={16} className={css({ color: 'accent.default' })} />
                </div>
                <h3 className={css({ color: 'fg.default', fontWeight: 'semibold', fontSize: 'base', mb: '1' })}>{f.title}</h3>
                <p className={css({ color: 'fg.muted', fontSize: 'sm', lineHeight: 'relaxed' })}>{f.description}</p>
              </div>
            );
          })}
        </div>

        <div className={css({ bg: 'accent.default', rounded: 'lg', p: '6' })}>
          <p className={css({ fontSize: '10px', fontWeight: 'semibold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 'widest', mb: '3' })}>Stack technique</p>
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
            {techStack.map((tech) => (
              <span key={tech} className={css({ px: '2.5', py: '1', bg: 'rgba(255,255,255,0.1)', rounded: 'md', color: 'white', fontSize: 'xs', fontWeight: 'medium' })}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
