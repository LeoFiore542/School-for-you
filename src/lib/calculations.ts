import type { Grade } from "./types";

export function weightedAverage(grades: Grade[]): number | null {
  if (grades.length === 0) return null;
  let sum = 0;
  let totalWeight = 0;
  for (const g of grades) {
    const w = g.weight ?? 1;
    sum += g.value * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return null;
  return Math.round((sum / totalWeight) * 100) / 100;
}

export function averageBySubject(
  grades: Grade[],
): Record<string, number | null> {
  const bySubject: Record<string, Grade[]> = {};
  for (const g of grades) {
    (bySubject[g.subjectId] ??= []).push(g);
  }
  const result: Record<string, number | null> = {};
  for (const [id, list] of Object.entries(bySubject)) {
    result[id] = weightedAverage(list);
  }
  return result;
}

export function formatGrade(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
