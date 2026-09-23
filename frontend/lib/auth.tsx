'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe, loginAdmin, setToken } from './api';
import type { Admin } from './types';

interface AuthValue {
  admin: Admin | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the session from the stored token on first paint.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchMe();
        if (!cancelled) setAdmin(res.data.admin);
      } catch {
        if (!cancelled) {
          setToken(null);
          setAdmin(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await loginAdmin(email, password);
    setToken(res.data.token);
    setAdmin(res.data.admin);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, ready, signIn, signOut }), [admin, ready, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
