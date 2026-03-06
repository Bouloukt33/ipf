import { AuthState } from '@/lib/type';
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    clearUser: () => set({ user: null, isLoading: false }),
}));

// Selectors
export const useRole = () => useAuthStore((s) => s.user?.role);
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN');
export const useIsModerator = () => useAuthStore((s) =>
    s.user?.role === 'ADMIN' || s.user?.role === 'MODERATOR'
);