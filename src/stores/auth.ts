import { getSession, removeSession } from '@/lib/auth';
import { create } from 'zustand';

interface AuthState {
  user: any; // Replace with your user type
  isLoggedIn: boolean;
  login: (user: any) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => {
    removeSession();
    set({ user: null, isLoggedIn: false });
  },
  initialize: async () => {
    const session = await getSession();
    if (session) {
      set({ user: session, isLoggedIn: true });
    }
  }
}));
