'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import Cookies from 'js-cookie';
import type { AuthResponse } from '@/types';

export function useAuth() {
  const { user, token, isLoading, error, login, logout, setUser } = useAuthStore();

  useEffect(() => {
    const storedToken = Cookies.get('app-emit-token');
    if (storedToken && !user) {
      api.get<AuthResponse>('/Auth/me')
        .then((userData) => {
          setUser({
            id: userData.id,
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email,
            role: userData.role,
            roles: userData.roles || [userData.role],
            matricule: userData.matricule,
            niveauId: userData.niveauId,
          });
        })
        .catch(() => {
          Cookies.remove('app-emit-token');
        });
    }
  }, [user, setUser]);

  const isAdmin = user?.role === 'Admin';
  const isProf = user?.role === 'Professeur' || isAdmin;
  const isEtudiant = user?.role === 'Etudiant';

  return { user, token, isLoading, error, login, logout, isAdmin, isProf, isEtudiant };
}
