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

let cache: SchoolData | null = null;
let hydrated = false;
let firebaseReady = false;
let boundUid: string | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function readClientData(uid: string | null): SchoolData {
  if (cache && boundUid === uid) return cache;
  const stored = loadSchoolData(uid);
  if (stored) {
    cache = stored;
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

function getServerSnapshot(): SchoolData {
  return emptySchoolData();
}

function getReadyServerSnapshot(): boolean {
  return false;
}

function getSyncLabelServerSnapshot(): string {
  return "";
}

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user, privacyOk, ready: authReady } = useAuth();
  const uid = user?.uid ?? null;

  const data = useSyncExternalStore(
    subscribe,
    () => (authReady ? readClientData(uid) : emptySchoolData()),
    getServerSnapshot,
  );

  const ready = useSyncExternalStore(
    subscribe,
    () => {
      if (!authReady) return false;
      if (typeof window !== "undefined" && uid) {
        readClientData(uid);
      }
      return hydrated && Boolean(uid);
    },
    getReadyServerSnapshot,
  );

  const syncLabel = useSyncExternalStore(
    subscribe,
    () => {
      if (!uid) return "Accesso richiesto";
      if (!isFirebaseConfigured()) return "Solo dispositivo";
      if (!privacyOk) return "Consenso privacy richiesto";
      return firebaseReady ? "Sincronizzato" : "Connessione…";
    },
    getSyncLabelServerSnapshot,
  );

  useEffect(() => {
    if (!authReady || !uid || !privacyOk) {
      setStorageUser(null);
      firebaseReady = false;
      emit();
      return;
    }

    setStorageUser(uid);
    firebaseReady = false;
    cache = null;
    boundUid = null;
    const local = readClientData(uid);
    emit();

    let unsub: (() => void) | null = null;
    void ensureFirebaseDocument(uid, local).then(() => {
      firebaseReady = true;
      emit();
    });
    unsub = subscribeSchoolData(uid, (remote) => {
      applyRemoteData(remote, uid);
    });

    return () => {
      unsub?.();
    };
  }, [authReady, uid, privacyOk]);

  const commit = useCallback(
    (updater: (prev: SchoolData) => SchoolData) => {
      if (!uid) return;
      writeData(updater(readClientData(uid)), uid);
    },
    [uid],
  );

  const resetToSeed = useCallback(() => {
    if (!uid) return;
    writeData(createSeedData(), uid);
  }, [uid]);

  const clearAll = useCallback(() => {
    if (!uid) return;
    writeData(emptySchoolData(), uid);
  }, [uid]);

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
