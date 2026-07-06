'use client';

import React from 'react';
import {
  Building2, CalendarCheck, Users, BookOpen,
  GraduationCap, FolderTree, CalendarPlus, BookMarked, ArrowRight,
} from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import Link from 'next/link';
import { css } from 'styled-system/css';

const adminLinks = [
  { href: '/admin/filieres', label: 'Filières', icon: BookMarked, desc: 'Gérer les filières' },
  { href: '/admin/parcours', label: 'Parcours', icon: FolderTree, desc: 'Gérer les parcours' },
  { href: '/admin/niveaux', label: 'Niveaux', icon: GraduationCap, desc: 'L1, L2, L3, M1, M2' },
  { href: '/admin/matieres', label: 'Matières', icon: BookOpen, desc: 'Gérer les matières' },
  { href: '/admin/salles', label: 'Salles', icon: Building2, desc: 'Espaces disponibles' },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarCheck, desc: 'Valider les demandes' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, desc: 'Gérer les comptes' },
  { href: '/admin/generateur-seance', label: 'Séances', icon: CalendarPlus, desc: 'Générer des séances' },
];

const accentBorders = [
  'var(--colors-accent-default)', '#f59e0b', '#10b981', '#ef4444',
  'var(--colors-accent-default)', '#f59e0b', '#10b981', '#ef4444',
];

export default function AdminPage() {
  return (
    <ProtectedLayout pageTitle="Administration">
      <div className={css({ mb: '5' })}>
        <p className={css({ color: 'fg.subtle', fontSize: 'sm', fontWeight: 'medium' })}>
          Gérez l&apos;ensemble des données de la plateforme.
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr', xl: '1fr 1fr 1fr 1fr' },
          gap: '4',
        })}
      >
        {adminLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={css({
                  bg: 'white',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'border.default',
                  p: '5',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  _hover: { borderColor: accentBorders[i], boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                  borderLeft: '3px solid',
                  borderLeftColor: accentBorders[i],
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '3' })}>
                  <div
                    className={css({
                      w: '9',
                      h: '9',
                      bg: 'bg.muted',
                      rounded: 'lg',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <Icon className={css({ w: '4', h: '4', color: 'fg.subtle' })} />
                  </div>
                  <ArrowRight size={14} className={css({ color: 'fg.subtle', mt: '1', transition: 'color 0.15s', _hover: { color: 'accent.default' } })} />
                </div>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'fg.default', lineHeight: 'tight' })}>{link.label}</h3>
                <p className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1', fontWeight: 'medium' })}>{link.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}
