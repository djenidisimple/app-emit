'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import GenerateurSeanceForm from '@/components/GenerateurSeanceForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GenerateurSeancePage() {
  return (
    <ProtectedLayout pageTitle="Génération de séances">
      <Link href="/admin"
        className="inline-flex items-center gap-2 text-fg-muted hover:text-accent text-sm mb-4 transition-colors duration-150">
        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;administration
      </Link>
      <GenerateurSeanceForm />
    </ProtectedLayout>
  );
}
