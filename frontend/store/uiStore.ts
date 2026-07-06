// store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  toast: { message: string; type: 'success' | 'error' } | null;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  setToast: (toast) => set({ toast }),
  sidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));