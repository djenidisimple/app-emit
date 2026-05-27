'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ProtectedLayout({ children, pageTitle = "" }: { children: React.ReactNode; pageTitle?: string }) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
