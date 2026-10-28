export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** JS getDay(): 0=Sun … 6=Sat → our DayOfWeek 1–6 (Mon–Sat), null if Sunday */
export function todayDayOfWeek(): 1 | 2 | 3 | 4 | 5 | 6 | null {
  const d = new Date().getDay();
  if (d === 0) return null;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

export function todayISO(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function formatItalianDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatLongItalianDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, day] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, day);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
