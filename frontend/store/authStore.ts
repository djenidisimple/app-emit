import { create } from 'zustand';
import { api } from '@/services/api';
import { AuthResponse } from '@/types';
import Cookies from 'js-cookie';

type UserInfo = Pick<AuthResponse, 'nom' | 'prenom' | 'email' | 'role' | 'id' | 'matricule' | 'niveauId'> & { roles?: string[] };

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  register: (data: { nom: string; prenom: string; email: string; motDePasse: string; role?: string; matricule?: string; niveauId?: number }) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserInfo) => void;
  loadUser: () => Promise<void>;
  extraireMessageErreur: (err: unknown) => string | undefined;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('app-emit-token') || null : null,
  isLoading: false,
  error: null,

  extraireMessageErreur: (err: unknown): string | undefined => {
    if (!(err instanceof Error && 'response' in err)) return undefined;
    const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data;
    if (!data) return undefined;
    if (typeof data.message === 'string') return data.message;
    if (data.errors && typeof data.errors === 'object') {
      for (const value of Object.values(data.errors as Record<string, unknown>)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string')
          return value[0];
      }
    }
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string')
        return value[0];
    }
    return undefined;
  },

  login: async (email, motDePasse) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await api.post<AuthResponse>('/Auth/login', { email, motDePasse });
      const { token, ...userData } = authResponse;
      
      Cookies.set('app-emit-token', token, { expires: 1, secure: true, sameSite: 'Strict' });
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = get().extraireMessageErreur(err);
      set({ error: message || 'Erreur de connexion', isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await api.post<AuthResponse>('/Auth/register', data);
      const { token, ...userData } = authResponse;
      
      Cookies.set('app-emit-token', token, { expires: 1, secure: true, sameSite: 'Strict' });
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = get().extraireMessageErreur(err);
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

  loadUser: async () => {
    const token = Cookies.get('app-emit-token');
    if (!token) return;
    if (get().user) return;
    try {
      set({ isLoading: true });
      const userData = await api.get<{ id: number; nom: string; prenom: string; email: string; role: string; matricule?: string; niveauId?: number }>('/Auth/me');
      set({ user: { ...userData, roles: [userData.role] }, token, isLoading: false });
    } catch {
      Cookies.remove('app-emit-token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
