'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import GenerateurSeanceForm from '@/components/GenerateurSeanceForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { css } from 'styled-system/css';

export default function GenerateurSeancePage() {
  return (
    <ProtectedLayout pageTitle="Génération de séances">
      <Link href="/admin"
        className={css({ display: 'inline-flex', alignItems: 'center', gap: '2', color: 'fg.muted', _hover: { color: 'accent.default' }, fontSize: 'sm', mb: '4', transition: 'colors 0.15s' })}>
        <ArrowLeft className={css({ w: '4', h: '4' })} /> Retour à l&apos;administration
      </Link>
      <GenerateurSeanceForm />
    </ProtectedLayout>
  );
}
