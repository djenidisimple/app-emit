'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import GenerateurSeanceForm from '@/components/GenerateurSeanceForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GenerateurSeancePage() {
  return (
    <ProtectedLayout pageTitle="Génération de séances">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#6C757D] hover:text-[#1B3A6B] transition-colors text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;administration
      </Link>
      <GenerateurSeanceForm />
    </ProtectedLayout>
  );
}
