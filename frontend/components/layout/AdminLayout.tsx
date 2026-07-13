'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import ScolariteSidebar from './ScolariteSidebar';
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
    <div className="h-screen bg-white flex justify-center">
      <div className="h-full w-full max-w-[1560px] flex overflow-hidden gap-3.5">
        <ScolariteSidebar />
          <main className="flex-1 overflow-y-auto p-3.5 pr-10 bg-white">
            {children}
          </main>
      </div>
    </div>
  );
}
