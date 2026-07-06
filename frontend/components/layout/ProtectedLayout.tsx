'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import useAuthStore from '@/store/authStore';
import AdminLayout from './AdminLayout';
import ProfesseurLayout from './ProfesseurLayout';
import EtudiantLayout from './EtudiantLayout';

export default function ProtectedLayout({
  children,
  pageTitle = '',
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const router = useRouter();
  const { user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('app-emit-token');
    if (!token) { router.replace('/login'); return; }
    loadUser();
  }, []);

  useEffect(() => {
    if (!Cookies.get('app-emit-token') && !isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const role = user.role || user.roles?.[0] || '';

  if (role === 'Admin') {
    return <AdminLayout pageTitle={pageTitle}>{children}</AdminLayout>;
  }
  if (role === 'Professeur') {
    return <ProfesseurLayout pageTitle={pageTitle}>{children}</ProfesseurLayout>;
  }
  return <EtudiantLayout pageTitle={pageTitle}>{children}</EtudiantLayout>;
}
