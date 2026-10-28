"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  hasValidPrivacyConsent,
  loadUserProfile,
  savePrivacyConsent,
  signInWithGoogle,
  signOut as authSignOut,
  subscribeAuth,
  type UserProfile,
} from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  ready: boolean;
  privacyOk: boolean;
  configured: boolean;
  error: string | null;
  signInGoogleWithPrivacy: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    const unsub = subscribeAuth(async (next) => {
      setUser(next);
      if (!next) {
        setProfile(null);
        setReady(true);
        return;
      }
      try {
        const p = await loadUserProfile(next.uid);
        setProfile(
          p ?? {
            uid: next.uid,
            email: next.email,
            displayName: next.displayName,
            photoURL: next.photoURL,
          },
        );
      } catch (err) {
        console.error(err);
        setProfile({
          uid: next.uid,
          email: next.email,
          displayName: next.displayName,
          photoURL: next.photoURL,
        });
      } finally {
        setReady(true);
      }
    });
    return unsub;
  }, [configured]);

  const signInGoogleWithPrivacy = useCallback(async () => {
    setError(null);
    try {
      const u = await signInWithGoogle();
      await savePrivacyConsent(u);
      const p = await loadUserProfile(u.uid);
      setUser(u);
      setProfile(p);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Accesso Google non riuscito";
      setError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await authSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const privacyOk = hasValidPrivacyConsent(profile);

  const value = useMemo<AuthState>(
    () => ({
      user,
      profile,
      ready,
      privacyOk,
      configured,
      error,
      signInGoogleWithPrivacy,
      signOut,
      clearError,
    }),
    [
      user,
      profile,
      ready,
      privacyOk,
      configured,
      error,
      signInGoogleWithPrivacy,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
