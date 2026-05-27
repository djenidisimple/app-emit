import { create } from 'zustand';
import { api } from '@/services/api';
import { AuthResponse } from '@/types';
import Cookies from 'js-cookie';

type UserInfo = Pick<AuthResponse, 'nom' | 'prenom' | 'email' | 'role' | 'roles' | 'id' | 'matricule' | 'niveauId'>;

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  register: (data: { nom: string; prenom: string; email: string; motDePasse: string; role?: string; matricule?: string; niveauId?: number }) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserInfo) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('app-emit-token') || null : null,
  isLoading: false,
  error: null,

  login: async (email, motDePasse) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await api.post<AuthResponse>('/Auth/login', { email, motDePasse });
      const { token, ...userData } = authResponse;
      
      Cookies.set('app-emit-token', token, { expires: 1 });
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      set({ error: message || 'Erreur de connexion', isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await api.post<AuthResponse>('/Auth/register', data);
      const { token, ...userData } = authResponse;
      
      Cookies.set('app-emit-token', token, { expires: 1 });
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      set({ error: message || "Erreur lors de l'inscription", isLoading: false });
      return false;
    }
  },

  logout: () => {
    Cookies.remove('app-emit-token');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
