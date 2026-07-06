'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { css } from 'styled-system/css';
import TopNavbar from './TopNavbar';
import RoleSidebar, { adminNav } from './RoleSidebar';
import useAuthStore from '@/store/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AdminLayout({ children, pageTitle = '' }: AdminLayoutProps) {
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
        <RoleSidebar links={adminNav} />
        <main className={css({ flex: '1', overflowY: 'auto', p: '6', bg: 'bg.canvas' })}>
          {children}
        </main>
      </div>
    </div>
  );
}
