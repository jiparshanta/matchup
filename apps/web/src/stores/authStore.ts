import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@matchup/shared';
import { authApi, clearAuthTokens } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore errors during logout
        } finally {
          clearAuthTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await authApi.getMe();
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
    }),
    {
      name: 'matchup-auth',
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    }
  )
);
