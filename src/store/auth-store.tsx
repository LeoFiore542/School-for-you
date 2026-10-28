"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  completeRedirectSignIn,
  hasValidPrivacyConsent,
  loadUserProfile,
  profileFromUser,
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
  /** Evita che un load profilo “stale” sovrascriva il consenso appena salvato. */
  const profileEpoch = useRef(0);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function finishConsent(u: User) {
      const epoch = ++profileEpoch.current;
      await savePrivacyConsent(u);
      if (cancelled || epoch !== profileEpoch.current) return;
      setUser(u);
      setProfile(profileFromUser(u, true));
    }

    // Completa login via redirect (se il popup era stato bloccato).
    void (async () => {
      try {
        const redirected = await completeRedirectSignIn();
        if (redirected && !cancelled) {
          await finishConsent(redirected);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Accesso Google non riuscito",
          );
        }
      }
    })();

    const unsub = subscribeAuth(async (next) => {
      if (cancelled) return;
      setUser(next);
      if (!next) {
        setProfile(null);
        setReady(true);
        return;
      }

      const epoch = ++profileEpoch.current;
      try {
        const p = await loadUserProfile(next.uid);
        if (cancelled || epoch !== profileEpoch.current) return;
        // Non degradare un profilo che ha già il consenso in memoria.
        setProfile((prev) => {
          if (hasValidPrivacyConsent(prev) && prev?.uid === next.uid) {
            return prev;
          }
          return (
            p ?? {
              uid: next.uid,
              email: next.email,
              displayName: next.displayName,
              photoURL: next.photoURL,
            }
          );
        });
      } catch (err) {
        console.error(err);
        if (cancelled || epoch !== profileEpoch.current) return;
        setProfile((prev) =>
          hasValidPrivacyConsent(prev) && prev?.uid === next.uid
            ? prev
            : {
                uid: next.uid,
                email: next.email,
                displayName: next.displayName,
                photoURL: next.photoURL,
              },
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [configured]);

  const signInGoogleWithPrivacy = useCallback(async () => {
    setError(null);
    try {
      const u = await signInWithGoogle();
      const epoch = ++profileEpoch.current;
      await savePrivacyConsent(u);
      // Profilo ottimistico: non dipendere dal round-trip getDoc (race con onAuthStateChanged).
      if (epoch === profileEpoch.current) {
        setUser(u);
        setProfile(profileFromUser(u, true));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Accesso Google non riuscito";
      setError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    profileEpoch.current += 1;
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
