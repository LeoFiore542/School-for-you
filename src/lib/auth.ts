import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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

export function subscribeAuth(onUser: (user: User | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUser);
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase non configurato");
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
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

/** Salva profilo + consenso privacy dopo login Google. */
export async function savePrivacyConsent(user: User): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database non disponibile");
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      privacyAcceptedAt: serverTimestamp(),
      privacyVersion: PRIVACY_VERSION,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}
