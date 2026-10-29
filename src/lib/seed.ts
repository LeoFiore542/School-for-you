import type { SchoolData } from "./types";

/** Stato iniziale vuoto: l’utente riempie tutto da zero. */
export function emptySchoolData(): SchoolData {
  return {
    subjects: [],
    lessons: [],
    homework: [],
    grades: [],
    exams: [],
  };
}

/** @deprecated Alias di emptySchoolData — non ci sono più dati di esempio. */
export function createSeedData(): SchoolData {
  return emptySchoolData();
}
