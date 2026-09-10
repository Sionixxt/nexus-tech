/**
 * Auth helper utilities for client-side token management
 */

export const TOKEN_KEYS = {
  ACCESS: 'nexus_access_token',
  REFRESH: 'nexus_refresh_token',
  USER: 'nexus_user',
};

export const getStoredTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(TOKEN_KEYS.ACCESS),
    refreshToken: localStorage.getItem(TOKEN_KEYS.REFRESH),
  };
};

export const storeTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
};

/**
 * Decode JWT payload without verification (client-side only)
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};
