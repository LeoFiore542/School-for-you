import type { SchoolData } from "./types";

function id(prefix: string, n: number): string {
  return `${prefix}-${n}`;
}

function dateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

/** Dati di esempio per una settimana tipo di liceo. */
export function createSeedData(): SchoolData {
  const subjects = [
    {
      id: id("sub", 1),
      name: "Italiano",
      color: "#9F1239",
      teacher: "Prof.ssa Bianchi",
      room: "Aula 12",
    },
    {
      id: id("sub", 2),
      name: "Matematica",
      color: "#1B4F72",
      teacher: "Prof. Rossi",
      room: "Aula 8",
    },
    {
      id: id("sub", 3),
      name: "Inglese",
      color: "#0D6E6E",
      teacher: "Prof.ssa Green",
      room: "Lab Lingue",
    },
    {
      id: id("sub", 4),
      name: "Storia",
      color: "#B45309",
      teacher: "Prof. Verdi",
      room: "Aula 5",
    },
    {
      id: id("sub", 5),
      name: "Scienze",
      color: "#166534",
      teacher: "Prof.ssa Neri",
      room: "Lab Scienze",
    },
    {
      id: id("sub", 6),
      name: "Educazione fisica",
      color: "#0369A1",
      teacher: "Prof. Blu",
      room: "Palestra",
    },
  ];

  const [ita, mat, eng, sto, sci, edf] = subjects.map((s) => s.id);

  const lessons = [
    // Lunedì
    { id: id("les", 1), subjectId: mat, dayOfWeek: 1 as const, startTime: "08:00", endTime: "09:00" },
    { id: id("les", 2), subjectId: ita, dayOfWeek: 1 as const, startTime: "09:00", endTime: "10:00" },
    { id: id("les", 3), subjectId: eng, dayOfWeek: 1 as const, startTime: "10:00", endTime: "11:00" },
    { id: id("les", 4), subjectId: sto, dayOfWeek: 1 as const, startTime: "11:00", endTime: "12:00" },
    // Martedì
    { id: id("les", 5), subjectId: sci, dayOfWeek: 2 as const, startTime: "08:00", endTime: "09:00" },
    { id: id("les", 6), subjectId: mat, dayOfWeek: 2 as const, startTime: "09:00", endTime: "10:00" },
    { id: id("les", 7), subjectId: ita, dayOfWeek: 2 as const, startTime: "10:00", endTime: "11:00" },
    { id: id("les", 8), subjectId: edf, dayOfWeek: 2 as const, startTime: "11:00", endTime: "12:00" },
    // Mercoledì
    { id: id("les", 9), subjectId: eng, dayOfWeek: 3 as const, startTime: "08:00", endTime: "09:00" },
    { id: id("les", 10), subjectId: sto, dayOfWeek: 3 as const, startTime: "09:00", endTime: "10:00" },
    { id: id("les", 11), subjectId: mat, dayOfWeek: 3 as const, startTime: "10:00", endTime: "11:00" },
    { id: id("les", 12), subjectId: sci, dayOfWeek: 3 as const, startTime: "11:00", endTime: "12:00" },
    // Giovedì
    { id: id("les", 13), subjectId: ita, dayOfWeek: 4 as const, startTime: "08:00", endTime: "09:00" },
    { id: id("les", 14), subjectId: eng, dayOfWeek: 4 as const, startTime: "09:00", endTime: "10:00" },
    { id: id("les", 15), subjectId: mat, dayOfWeek: 4 as const, startTime: "10:00", endTime: "11:00" },
    { id: id("les", 16), subjectId: sto, dayOfWeek: 4 as const, startTime: "11:00", endTime: "12:00" },
    // Venerdì
    { id: id("les", 17), subjectId: sci, dayOfWeek: 5 as const, startTime: "08:00", endTime: "09:00" },
    { id: id("les", 18), subjectId: ita, dayOfWeek: 5 as const, startTime: "09:00", endTime: "10:00" },
    { id: id("les", 19), subjectId: eng, dayOfWeek: 5 as const, startTime: "10:00", endTime: "11:00" },
    { id: id("les", 20), subjectId: edf, dayOfWeek: 5 as const, startTime: "11:00", endTime: "12:00" },
  ];

  const homework = [
    {
      id: id("hw", 1),
      subjectId: mat,
      title: "Esercizi sulle equazioni di secondo grado",
      dueDate: dateOffset(1),
      done: false,
      notes: "Pag. 142 n. 1–12",
    },
    {
      id: id("hw", 2),
      subjectId: ita,
      title: "Analisi del canto V dell'Inferno",
      dueDate: dateOffset(2),
      done: false,
    },
    {
      id: id("hw", 3),
      subjectId: eng,
      title: "Reading comprehension Unit 4",
      dueDate: dateOffset(0),
      done: false,
    },
    {
      id: id("hw", 4),
      subjectId: sto,
      title: "Mappa concettuale sulla Rivoluzione Francese",
      dueDate: dateOffset(-2),
      done: true,
    },
    {
      id: id("hw", 5),
      subjectId: sci,
      title: "Relazione di laboratorio sulla fotosintesi",
      dueDate: dateOffset(4),
      done: false,
    },
  ];

  const grades = [
    { id: id("gr", 1), subjectId: mat, value: 7.5, date: dateOffset(-14), type: "scritto" as const, weight: 1 },
    { id: id("gr", 2), subjectId: mat, value: 8, date: dateOffset(-7), type: "orale" as const, weight: 1 },
    { id: id("gr", 3), subjectId: ita, value: 7, date: dateOffset(-10), type: "scritto" as const, weight: 1 },
    { id: id("gr", 4), subjectId: ita, value: 8.5, date: dateOffset(-3), type: "orale" as const, weight: 1 },
    { id: id("gr", 5), subjectId: eng, value: 9, date: dateOffset(-5), type: "scritto" as const, weight: 1 },
    { id: id("gr", 6), subjectId: sto, value: 6.5, date: dateOffset(-12), type: "orale" as const, weight: 1 },
    { id: id("gr", 7), subjectId: sci, value: 8, date: dateOffset(-8), type: "pratico" as const, weight: 1 },
  ];

  const exams = [
    {
      id: id("ex", 1),
      subjectId: mat,
      date: dateOffset(3),
      type: "verifica" as const,
      topic: "Equazioni e disequazioni",
    },
    {
      id: id("ex", 2),
      subjectId: ita,
      date: dateOffset(5),
      type: "interrogazione" as const,
      topic: "Divina Commedia – Inferno",
    },
    {
      id: id("ex", 3),
      subjectId: sci,
      date: dateOffset(8),
      type: "compito_in_classe" as const,
      topic: "Cellula e metabolismo",
    },
  ];

  return { subjects, lessons, homework, grades, exams };
}

export function emptySchoolData(): SchoolData {
  return {
    subjects: [],
    lessons: [],
    homework: [],
    grades: [],
    exams: [],
  };
}
