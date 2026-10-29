export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6; // Lun–Sab

export type GradeType = "scritto" | "orale" | "pratico" | "altro";

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher: string;
  room: string;
}

export interface LessonSlot {
  id: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;
  room?: string;
  /** Numero/sezione classe (es. 3A, 4B). */
  classNumber?: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  value: number;
  date: string; // YYYY-MM-DD
  type?: GradeType;
  weight?: number;
  note?: string;
}

/** Legacy shape kept for Firestore/localStorage compatibility (UI removed). */
export interface Homework {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string;
  done: boolean;
  notes?: string;
}

/** Legacy shape kept for Firestore/localStorage compatibility (UI removed). */
export interface Exam {
  id: string;
  subjectId: string;
  date: string;
  type: string;
  topic?: string;
}

export interface SchoolData {
  subjects: Subject[];
  lessons: LessonSlot[];
  homework: Homework[];
  grades: Grade[];
  exams: Exam[];
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  1: "Lunedì",
  2: "Martedì",
  3: "Mercoledì",
  4: "Giovedì",
  5: "Venerdì",
  6: "Sabato",
};

export const DAY_SHORT: Record<DayOfWeek, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Gio",
  5: "Ven",
  6: "Sab",
};

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  scritto: "Scritto",
  orale: "Orale",
  pratico: "Pratico",
  altro: "Altro",
};

export const SUBJECT_COLORS = [
  "#0D6E6E",
  "#1B4F72",
  "#B45309",
  "#9F1239",
  "#166534",
  "#6D28D9",
  "#0369A1",
  "#A16207",
  "#BE185D",
  "#0F766E",
] as const;
