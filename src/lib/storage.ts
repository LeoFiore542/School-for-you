import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import type { SchoolData } from "./types";
import { emptySchoolData } from "./seed";

export const STORAGE_KEY = "school-manager-data-v1";

type RemotePayload = SchoolData & { updatedAt?: number };

function normalizeSchoolData(raw: unknown): SchoolData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<SchoolData>;
  return {
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    lessons: Array.isArray(data.lessons) ? data.lessons : [],
    homework: Array.isArray(data.homework) ? data.homework : [],
    grades: Array.isArray(data.grades) ? data.grades : [],
    exams: Array.isArray(data.exams) ? data.exams : [],
  };
}

function storageKeyForUser(uid: string | null): string {
  return uid ? `${STORAGE_KEY}:${uid}` : STORAGE_KEY;
}

export function loadSchoolData(uid: string | null = null): SchoolData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKeyForUser(uid));
    if (!raw) return null;
    return normalizeSchoolData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSchoolData(
  data: SchoolData,
  uid: string | null = null,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKeyForUser(uid), JSON.stringify(data));
}

export function clearSchoolData(uid: string | null = null): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeyForUser(uid));
}

function schoolDocRef(uid: string) {
  const db = getDb();
  if (!db) return null;
  return doc(db, "users", uid, "data", "school");
}

let activeUid: string | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: SchoolData | null = null;
let lastLocalWriteAt = 0;

export function setStorageUser(uid: string | null): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  pendingSave = null;
  lastLocalWriteAt = 0;
  activeUid = uid;
}

export function getActiveStorageUser(): string | null {
  return activeUid;
}

export function getLastLocalWriteAt(): number {
  return lastLocalWriteAt;
}

export async function loadSchoolDataFromFirebase(
  uid: string,
): Promise<SchoolData | null> {
  if (!isFirebaseConfigured()) return null;
  const ref = schoolDocRef(uid);
  if (!ref) return null;
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return normalizeSchoolData(snap.data());
  } catch (err) {
    console.error("[firebase] load failed", err);
    return null;
  }
}

export function saveSchoolDataToFirebase(data: SchoolData): void {
  if (!isFirebaseConfigured() || !activeUid) return;
  pendingSave = data;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void flushFirebaseSave();
  }, 400);
}

/** Salvataggio immediato (es. reset al primo accesso). */
export function saveSchoolDataToFirebaseNow(data: SchoolData): void {
  if (!isFirebaseConfigured() || !activeUid) return;
  pendingSave = data;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  void flushFirebaseSave();
}

async function flushFirebaseSave(): Promise<void> {
  const data = pendingSave;
  const uid = activeUid;
  pendingSave = null;
  saveTimer = null;
  if (!data || !uid) return;
  const ref = schoolDocRef(uid);
  if (!ref) return;
  lastLocalWriteAt = Date.now();
  const payload: RemotePayload = {
    ...data,
    updatedAt: lastLocalWriteAt,
  };
  try {
    await setDoc(ref, payload, { merge: false });
  } catch (err) {
    console.error("[firebase] save failed", err);
  }
}

export function subscribeSchoolData(
  uid: string,
  onRemote: (data: SchoolData, updatedAt: number) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null;
  const ref = schoolDocRef(uid);
  if (!ref) return null;

  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const raw = snap.data() as RemotePayload;
      const updatedAt =
        typeof raw.updatedAt === "number" ? raw.updatedAt : 0;
      if (updatedAt > 0 && updatedAt <= lastLocalWriteAt) return;
      const data = normalizeSchoolData(raw);
      if (!data) return;
      onRemote(data, updatedAt);
    },
    (err) => {
      console.error("[firebase] subscribe failed", err);
    },
  );
}

export async function ensureFirebaseDocument(
  uid: string,
  data: SchoolData,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const ref = schoolDocRef(uid);
  if (!ref) return;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    // Primo documento remoto: usa lo stato locale passato (già vuoto al primo accesso).
    lastLocalWriteAt = Date.now();
    await setDoc(ref, { ...data, updatedAt: lastLocalWriteAt });
  } catch (err) {
    console.error("[firebase] ensure document failed", err);
  }
}

export { emptySchoolData };
