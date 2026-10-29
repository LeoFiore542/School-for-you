"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BtnPrimary,
  EmptyState,
  LoadingState,
  Panel,
  SubjectDot,
} from "@/components/ui";
import { weightedAverage, formatGrade } from "@/lib/calculations";
import { DAY_LABELS, type DayOfWeek } from "@/lib/types";
import {
  formatLongItalianDate,
  todayDayOfWeek,
  todayISO,
} from "@/lib/utils";
import { useSchool } from "@/store/school-store";

export default function DashboardPage() {
  const { data, ready, getSubject } = useSchool();

  const today = todayISO();
  const dow = todayDayOfWeek();

  const todayLessons = useMemo(() => {
    if (dow === null) return [];
    return data.lessons
      .filter((l) => l.dayOfWeek === dow)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data.lessons, dow]);

  const overallAvg = useMemo(
    () => weightedAverage(data.grades),
    [data.grades],
  );

  if (!ready) return <LoadingState />;

  const weekdayLabel =
    dow !== null ? DAY_LABELS[dow as DayOfWeek] : "Domenica";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface-elevated/80 px-6 py-10 shadow-[var(--shadow)] md:px-10 md:py-14 animate-fade-up">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-soft) 0%, transparent 45%), linear-gradient(225deg, #c5dde8 0%, transparent 40%)",
          }}
        />
        <div className="relative max-w-2xl">
          <p className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            School for you
          </p>
          <h1 className="mt-4 text-lg font-medium text-foreground/90 md:text-xl">
            {weekdayLabel}, {formatLongItalianDate(today)}
          </h1>
          <p className="mt-2 text-sm text-muted md:text-base">
            {todayLessons.length > 0
              ? `Hai ${todayLessons.length} lezion${todayLessons.length === 1 ? "e" : "i"} oggi.`
              : "Nessuna lezione in orario per oggi."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/orario">
              <BtnPrimary>Apri l&apos;orario</BtnPrimary>
            </Link>
            <Link
              href="/voti"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-deep"
            >
              Vedi i voti
            </Link>
          </div>
          {overallAvg !== null ? (
            <p className="mt-6 text-sm text-muted">
              Media generale:{" "}
              <span className="font-semibold text-accent">
                {formatGrade(overallAvg)}
              </span>
            </p>
          ) : null}
        </div>
      </section>

      <Panel className="animate-fade-up stagger-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Lezioni di oggi</h2>
          <Link
            href="/orario"
            className="text-xs font-medium text-accent hover:underline"
          >
            Orario
          </Link>
        </div>
        {dow === null ? (
          <EmptyState message="Oggi è domenica — riposo!" />
        ) : todayLessons.length === 0 ? (
          <EmptyState message="Nessuna lezione in programma." />
        ) : (
          <ul className="space-y-2">
            {todayLessons.map((lesson) => {
              const subject = getSubject(lesson.subjectId);
              return (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 rounded-xl bg-background/60 px-3 py-2.5"
                >
                  <SubjectDot color={subject?.color ?? "#888"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {subject?.name ?? "Materia"}
                    </p>
                    <p className="text-xs text-muted">
                      {[
                        lesson.classNumber
                          ? `Cl. ${lesson.classNumber}`
                          : null,
                        lesson.room || subject?.room || null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {lesson.startTime}–{lesson.endTime}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
