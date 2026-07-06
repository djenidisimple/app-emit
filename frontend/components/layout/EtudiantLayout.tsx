'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { css } from 'styled-system/css';
import TopNavbar from './TopNavbar';
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
    <div className={css({ h: 'screen', display: 'flex', flexDirection: 'column', bg: 'bg.canvas', overflow: 'hidden' })}>
      <TopNavbar pageTitle={pageTitle} />
      <div className={css({ display: 'flex', flex: '1', overflow: 'hidden', pt: '14' })}>
        <RoleSidebar links={etudiantNav} />
        <main className={css({
          flex: '1', overflowY: 'auto', p: { base: '4', md: '6' },
          bg: 'bg.canvas', maxW: '4xl', mx: 'auto', w: 'full',
        })}>
          {children}
        </main>
      </div>
    </div>
  );
}
