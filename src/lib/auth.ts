import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDb, getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { PRIVACY_VERSION } from "./privacy";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  privacyAcceptedAt?: unknown;
  privacyVersion?: string;
};

function mapAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  const message = err instanceof Error ? err.message : "Accesso Google non riuscito";

  switch (code) {
    case "auth/popup-blocked":
      return "Il browser ha bloccato il popup di Google. Consenti i popup per questo sito e riprova.";
    case "auth/popup-closed-by-user":
      return "Finestra di Google chiusa prima del completamento. Riprova.";
    case "auth/unauthorized-domain":
      return "Questo dominio non è autorizzato in Firebase Authentication. Aggiungi leofiore542.github.io nei domini autorizzati.";
    case "auth/operation-not-allowed":
      return "Il provider Google non è abilitato nella console Firebase.";
    case "auth/network-request-failed":
      return "Errore di rete durante l’accesso. Controlla la connessione e riprova.";
    default:
      return message.replace(/^Firebase:\s*/i, "");
  }
}

export function subscribeAuth(onUser: (user: User | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUser);
}

/** Completa eventuale login con redirect (utile se il popup è bloccato). */
export async function completeRedirectSignIn(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.error("[auth] redirect result failed", err);
    throw new Error(mapAuthError(err));
  }
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase non configurato");
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("profile");
  provider.addScope("email");

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code: string }).code)
        : "";
    // Su GitHub Pages / mobile il popup spesso fallisce: fallback redirect.
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      // La pagina naviga via: resta in attesa senza segnalare errore.
      return await new Promise<User>(() => {});
    }
    throw new Error(mapAuthError(err));
  }
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: (data.email as string | null) ?? null,
    displayName: (data.displayName as string | null) ?? null,
    photoURL: (data.photoURL as string | null) ?? null,
    privacyAcceptedAt: data.privacyAcceptedAt,
    privacyVersion: data.privacyVersion as string | undefined,
  };
}

export function hasValidPrivacyConsent(profile: UserProfile | null): boolean {
  if (!profile?.privacyAcceptedAt) return false;
  return profile.privacyVersion === PRIVACY_VERSION;
}

export function profileFromUser(
  user: User,
  consent: boolean,
): UserProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    ...(consent
      ? {
          privacyAcceptedAt: new Date().toISOString(),
          privacyVersion: PRIVACY_VERSION,
        }
      : {}),
  };
}

/** Salva profilo + consenso privacy dopo login Google. */
export async function savePrivacyConsent(user: User): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database non disponibile");
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      privacyAcceptedAt: serverTimestamp(),
      privacyVersion: PRIVACY_VERSION,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}
