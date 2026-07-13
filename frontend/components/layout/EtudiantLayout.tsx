'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import RoleSidebar, { etudiantNav } from './RoleSidebar';
import useAuthStore from '@/store/authStore';

interface EtudiantLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function EtudiantLayout({ children, pageTitle = '' }: EtudiantLayoutProps) {
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

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <RoleSidebar links={etudiantNav} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:pr-10 bg-white max-w-4xl mx-auto w-full">
          {children}
        </main>
    </div>
  );
}
