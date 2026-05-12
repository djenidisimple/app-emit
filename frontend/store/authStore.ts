import { create } from 'zustand';
import api from '@/services/api';
import { User, LoginDto, RegisterDto, AuthResponse } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: Partial<User> | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  register: (data: RegisterDto) => Promise<boolean>;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('app-emit-token') || null : null,
  isLoading: false,
  error: null,

  login: async (email, motDePasse) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/Auth/login', { email, motDePasse });
      const { token, ...userData } = response.data;
      
      Cookies.set('app-emit-token', token, { expires: 1 }); // 1 jour
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Erreur de connexion', isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/Auth/register', data);
      const { token, ...userData } = response.data;
      
      Cookies.set('app-emit-token', token, { expires: 1 });
      set({ user: userData, token, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Erreur lors de l\'inscription', isLoading: false });
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
