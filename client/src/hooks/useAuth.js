'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Auth hook: hydrates from localStorage, provides auth state & redirects.
 * @param {object} options
 * @param {boolean} options.required - Redirect to /login if not authenticated
 * @param {string}  options.role     - Required role (e.g. 'ADMIN')
 * @param {string}  options.redirectTo - Redirect path (default '/login')
 */
export function useAuth({ required = false, role = null, redirectTo = '/login' } = {}) {
  const router = useRouter();
  const { user, accessToken, isHydrated, hydrate, isLoading } = useAuthStore();

  // Hydrate on mount
  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  // Redirect if auth required but not authenticated
  useEffect(() => {
    if (!isHydrated) return;
    if (required && !accessToken) {
      router.push(redirectTo);
    }
    if (role && user?.role !== role) {
      router.push('/');
    }
  }, [isHydrated, required, accessToken, role, user, router, redirectTo]);

  return {
    user,
    isAuthenticated: !!accessToken,
    isAdmin: user?.role === 'ADMIN',
    isLoading: !isHydrated || isLoading,
    isHydrated,
  };
}
