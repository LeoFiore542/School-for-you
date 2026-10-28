"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ensureFirebaseDocument,
  loadSchoolData,
  saveSchoolData,
  saveSchoolDataToFirebase,
  setStorageUser,
  subscribeSchoolData,
} from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createSeedData, emptySchoolData } from "@/lib/seed";
import type {
  Exam,
  Grade,
  Homework,
  LessonSlot,
  SchoolData,
  Subject,
} from "@/lib/types";
import { createId } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";

type SchoolStore = {
  data: SchoolData;
  ready: boolean;
  syncLabel: string;
  resetToSeed: () => void;
  clearAll: () => void;
  addSubject: (input: Omit<Subject, "id">) => void;
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id">>) => void;
  removeSubject: (id: string) => void;
  addLesson: (input: Omit<LessonSlot, "id">) => void;
  updateLesson: (id: string, patch: Partial<Omit<LessonSlot, "id">>) => void;
  removeLesson: (id: string) => void;
  addHomework: (input: Omit<Homework, "id">) => void;
  updateHomework: (id: string, patch: Partial<Omit<Homework, "id">>) => void;
  removeHomework: (id: string) => void;
  toggleHomework: (id: string) => void;
  addGrade: (input: Omit<Grade, "id">) => void;
  updateGrade: (id: string, patch: Partial<Omit<Grade, "id">>) => void;
  removeGrade: (id: string) => void;
  addExam: (input: Omit<Exam, "id">) => void;
  updateExam: (id: string, patch: Partial<Omit<Exam, "id">>) => void;
  removeExam: (id: string) => void;
  getSubject: (id: string) => Subject | undefined;
};

const SchoolContext = createContext<SchoolStore | null>(null);

type Listener = () => void;

/** Stable empty snapshot — useSyncExternalStore forbids new refs each call. */
const EMPTY_DATA: SchoolData = emptySchoolData();

let cache: SchoolData = EMPTY_DATA;
let hydrated = false;
let firebaseReady = false;
let boundUid: string | null | undefined = undefined;
let syncLabelCache = "";
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

const SEED_HOMEWORK_IDS = new Set([
  "hw-1",
  "hw-2",
  "hw-3",
  "hw-4",
  "hw-5",
]);
const SEED_EXAM_IDS = new Set(["ex-1", "ex-2", "ex-3"]);

/** Rimuove i compiti/prove di esempio lasciando eventuali voci create dall’utente. */
function stripSeedHomeworkAndExams(data: SchoolData): SchoolData {
  const homework = data.homework.filter((h) => !SEED_HOMEWORK_IDS.has(h.id));
  const exams = data.exams.filter((e) => !SEED_EXAM_IDS.has(e.id));
  if (
    homework.length === data.homework.length &&
    exams.length === data.exams.length
  ) {
    return data;
  }
  return { ...data, homework, exams };
}

function hydrateForUser(uid: string | null): SchoolData {
  if (hydrated && boundUid === uid) return cache;
  const stored = loadSchoolData(uid);
  if (stored) {
    cache = stripSeedHomeworkAndExams(stored);
    if (cache !== stored) {
      saveSchoolData(cache, uid);
      if (uid) saveSchoolDataToFirebase(cache);
    }
  } else {
    cache = createSeedData();
    saveSchoolData(cache, uid);
  }
  boundUid = uid;
  hydrated = true;
  return cache;
}

function writeData(next: SchoolData, uid: string | null) {
  cache = next;
  boundUid = uid;
  hydrated = true;
  saveSchoolData(next, uid);
  if (uid) {
    saveSchoolDataToFirebase(next);
  }
  emit();
}

function applyRemoteData(next: SchoolData, uid: string) {
  cache = next;
  boundUid = uid;
  hydrated = true;
  firebaseReady = true;
  saveSchoolData(next, uid);
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getDataSnapshot(): SchoolData {
  return hydrated ? cache : EMPTY_DATA;
}

function getDataServerSnapshot(): SchoolData {
  return EMPTY_DATA;
}

function getReadySnapshot(): boolean {
  return hydrated;
}

function getReadyServerSnapshot(): boolean {
  return false;
}

function getSyncLabelSnapshot(): string {
  return syncLabelCache;
}

function getSyncLabelServerSnapshot(): string {
  return "";
}

function computeSyncLabel(
  uid: string | null,
  privacyOk: boolean,
): string {
  if (!isFirebaseConfigured()) return "Solo dispositivo";
  if (!uid) return "Accesso richiesto";
  if (!privacyOk) return "Consenso privacy richiesto";
  return firebaseReady ? "Sincronizzato" : "Connessione…";
}

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user, privacyOk, ready: authReady } = useAuth();
  const uid = user?.uid ?? null;

  const data = useSyncExternalStore(
    subscribe,
    getDataSnapshot,
    getDataServerSnapshot,
  );

  const ready = useSyncExternalStore(
    subscribe,
    getReadySnapshot,
    getReadyServerSnapshot,
  );

  const syncLabel = useSyncExternalStore(
    subscribe,
    getSyncLabelSnapshot,
    getSyncLabelServerSnapshot,
  );

  useEffect(() => {
    if (!authReady) return;

    if (!isFirebaseConfigured()) {
      setStorageUser(null);
      firebaseReady = true;
      hydrateForUser(null);
      syncLabelCache = computeSyncLabel(null, privacyOk);
      emit();
      return;
    }

    if (!uid || !privacyOk) {
      setStorageUser(null);
      firebaseReady = false;
      // Reset store until login+privacy; keep snapshot stable.
      cache = EMPTY_DATA;
      hydrated = false;
      boundUid = undefined;
      syncLabelCache = computeSyncLabel(uid, privacyOk);
      emit();
      return;
    }

    setStorageUser(uid);
    firebaseReady = false;
    hydrateForUser(uid);
    syncLabelCache = computeSyncLabel(uid, privacyOk);
    emit();

    const local = cache;
    let unsub: (() => void) | null = null;
    void ensureFirebaseDocument(uid, local).then(() => {
      firebaseReady = true;
      syncLabelCache = computeSyncLabel(uid, privacyOk);
      emit();
    });
    unsub = subscribeSchoolData(uid, (remote) => {
      syncLabelCache = computeSyncLabel(uid, privacyOk);
      applyRemoteData(remote, uid);
    });

    return () => {
      unsub?.();
    };
  }, [authReady, uid, privacyOk]);

  const canWrite = Boolean(uid) || !isFirebaseConfigured();

  const commit = useCallback(
    (updater: (prev: SchoolData) => SchoolData) => {
      if (!canWrite) return;
      writeData(updater(hydrateForUser(uid)), uid);
    },
    [canWrite, uid],
  );

  const resetToSeed = useCallback(() => {
    if (!canWrite) return;
    writeData(createSeedData(), uid);
  }, [canWrite, uid]);

  const clearAll = useCallback(() => {
    if (!canWrite) return;
    writeData(emptySchoolData(), uid);
  }, [canWrite, uid]);

  const addSubject = useCallback(
    (input: Omit<Subject, "id">) => {
      commit((prev) => ({
        ...prev,
        subjects: [...prev.subjects, { ...input, id: createId("sub") }],
      }));
    },
    [commit],
  );

  const updateSubject = useCallback(
    (id: string, patch: Partial<Omit<Subject, "id">>) => {
      commit((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      }));
    },
    [commit],
  );

  const removeSubject = useCallback(
    (id: string) => {
      commit((prev) => ({
        subjects: prev.subjects.filter((s) => s.id !== id),
        lessons: prev.lessons.filter((l) => l.subjectId !== id),
        homework: prev.homework.filter((h) => h.subjectId !== id),
        grades: prev.grades.filter((g) => g.subjectId !== id),
        exams: prev.exams.filter((e) => e.subjectId !== id),
      }));
    },
    [commit],
  );

  const addLesson = useCallback(
    (input: Omit<LessonSlot, "id">) => {
      commit((prev) => ({
        ...prev,
        lessons: [...prev.lessons, { ...input, id: createId("les") }],
      }));
    },
    [commit],
  );

  const updateLesson = useCallback(
    (id: string, patch: Partial<Omit<LessonSlot, "id">>) => {
      commit((prev) => ({
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === id ? { ...l, ...patch } : l,
        ),
      }));
    },
    [commit],
  );

  const removeLesson = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((l) => l.id !== id),
      }));
    },
    [commit],
  );

  const addHomework = useCallback(
    (input: Omit<Homework, "id">) => {
      commit((prev) => ({
        ...prev,
        homework: [...prev.homework, { ...input, id: createId("hw") }],
      }));
    },
    [commit],
  );

  const updateHomework = useCallback(
    (id: string, patch: Partial<Omit<Homework, "id">>) => {
      commit((prev) => ({
        ...prev,
        homework: prev.homework.map((h) =>
          h.id === id ? { ...h, ...patch } : h,
        ),
      }));
    },
    [commit],
  );

  const removeHomework = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        homework: prev.homework.filter((h) => h.id !== id),
      }));
    },
    [commit],
  );

  const toggleHomework = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        homework: prev.homework.map((h) =>
          h.id === id ? { ...h, done: !h.done } : h,
        ),
      }));
    },
    [commit],
  );

  const addGrade = useCallback(
    (input: Omit<Grade, "id">) => {
      commit((prev) => ({
        ...prev,
        grades: [...prev.grades, { ...input, id: createId("gr") }],
      }));
    },
    [commit],
  );

  const updateGrade = useCallback(
    (id: string, patch: Partial<Omit<Grade, "id">>) => {
      commit((prev) => ({
        ...prev,
        grades: prev.grades.map((g) =>
          g.id === id ? { ...g, ...patch } : g,
        ),
      }));
    },
    [commit],
  );

  const removeGrade = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        grades: prev.grades.filter((g) => g.id !== id),
      }));
    },
    [commit],
  );

  const addExam = useCallback(
    (input: Omit<Exam, "id">) => {
      commit((prev) => ({
        ...prev,
        exams: [...prev.exams, { ...input, id: createId("ex") }],
      }));
    },
    [commit],
  );

  const updateExam = useCallback(
    (id: string, patch: Partial<Omit<Exam, "id">>) => {
      commit((prev) => ({
        ...prev,
        exams: prev.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [commit],
  );

  const removeExam = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        exams: prev.exams.filter((e) => e.id !== id),
      }));
    },
    [commit],
  );

  const getSubject = useCallback(
    (id: string) => data.subjects.find((s) => s.id === id),
    [data.subjects],
  );

  const value = useMemo<SchoolStore>(
    () => ({
      data,
      ready,
      syncLabel,
      resetToSeed,
      clearAll,
      addSubject,
      updateSubject,
      removeSubject,
      addLesson,
      updateLesson,
      removeLesson,
      addHomework,
      updateHomework,
      removeHomework,
      toggleHomework,
      addGrade,
      updateGrade,
      removeGrade,
      addExam,
      updateExam,
      removeExam,
      getSubject,
    }),
    [
      data,
      ready,
      syncLabel,
      resetToSeed,
      clearAll,
      addSubject,
      updateSubject,
      removeSubject,
      addLesson,
      updateLesson,
      removeLesson,
      addHomework,
      updateHomework,
      removeHomework,
      toggleHomework,
      addGrade,
      updateGrade,
      removeGrade,
      addExam,
      updateExam,
      removeExam,
      getSubject,
    ],
  );

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchool(): SchoolStore {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error("useSchool must be used within SchoolProvider");
  }
  return ctx;
}
