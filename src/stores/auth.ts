import { getSession, removeSession, setSession } from '@/lib/auth';
import { create } from 'zustand';

interface AuthState {
  user: any; // Replace with your user type
  isLoggedIn: boolean;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (userData: Partial<any>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  login: (user) => {
    setSession(user);
    set({ user, isLoggedIn: true });
  },
  logout: () => {
    removeSession();
    set({ user: null, isLoggedIn: false });
  },
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setSession(updatedUser);
      set({ user: updatedUser });
    }
  },
  initialize: async () => {
    const session = await getSession();
    if (session) {
      set({ user: session, isLoggedIn: true });
    }
  }
}));
