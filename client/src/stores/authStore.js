import { create } from 'zustand';
import api from '@/lib/api';
import {
  storeTokens, clearTokens, getStoredTokens,
  storeUser, getStoredUser,
} from '@/lib/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isHydrated: false,

  // ── Hydrate from localStorage ──────────────────────────────────────────
  hydrate: () => {
    const { accessToken, refreshToken } = getStoredTokens();
    const user = getStoredUser();
    set({ user, accessToken, refreshToken, isHydrated: true });
  },

  // ── Set tokens (called from api interceptor) ──────────────────────────
  setTokens: (accessToken, refreshToken) => {
    storeTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },

  // ── Register ──────────────────────────────────────────────────────────
  register: async ({ email, password, firstName, lastName }) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', {
        email, password, firstName, lastName,
      });
      storeTokens(data.accessToken, data.refreshToken);
      storeUser(data.user);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed.',
      };
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      storeTokens(data.accessToken, data.refreshToken);
      storeUser(data.user);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials.',
      };
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────
  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (_) {
      // Ignore — log out locally regardless
    }
    clearTokens();
    set({ user: null, accessToken: null, refreshToken: null });
  },

  // ── Fetch profile ────────────────────────────────────────────────────
  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/me');
      storeUser(data.user);
      set({ user: data.user });
    } catch (_) {
      // Token might be invalid
    }
  },

  // ── Helpers ───────────────────────────────────────────────────────────
  isAuthenticated: () => !!get().accessToken,
  isAdmin: () => get().user?.role === 'ADMIN',
}));
