'use client';

import useAuthStore from '@/store/authStore';
import RoleSidebar, { adminNav, professeurNav, etudiantNav } from './RoleSidebar';

export default function Sidebar() {
  const { user } = useAuthStore();
  const role = user?.role || user?.roles?.[0] || '';

  const links = role === 'Admin' ? adminNav
    : role === 'Professeur' ? professeurNav
    : etudiantNav;

  return <RoleSidebar links={links} />;
}
