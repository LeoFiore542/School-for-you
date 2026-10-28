"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BtnPrimary,
  BtnSecondary,
  EmptyState,
  Field,
  FormGrid,
  LoadingState,
  PageHeader,
  Panel,
  SubjectDot,
  inputClass,
} from "@/components/ui";
import {
  DAY_LABELS,
  DAY_SHORT,
  type DayOfWeek,
  type LessonSlot,
} from "@/lib/types";
import { todayDayOfWeek } from "@/lib/utils";
import { useSchool } from "@/store/school-store";

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6];

export default function OrarioPage() {
  const { data, ready, addLesson, removeLesson, getSubject } = useSchool();
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [room, setRoom] = useState("");

  const today = todayDayOfWeek();

  const byDay = useMemo(() => {
    const map: Record<DayOfWeek, LessonSlot[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    for (const lesson of data.lessons) {
      map[lesson.dayOfWeek].push(lesson);
    }
    for (const d of DAYS) {
      map[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [data.lessons]);

  if (!ready) return <LoadingState />;

  function resetForm() {
    setShowForm(false);
    setSubjectId(data.subjects[0]?.id ?? "");
    setDayOfWeek(1);
    setStartTime("08:00");
    setEndTime("09:00");
    setRoom("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    addLesson({
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || undefined,
    });
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Orario"
        description="La tua settimana scolastica a colpo d’occhio."
        action={
          <BtnPrimary
            onClick={() => {
              setSubjectId(data.subjects[0]?.id ?? "");
              setShowForm(true);
            }}
            disabled={data.subjects.length === 0}
          >
            Aggiungi ora
          </BtnPrimary>
        }
      />

      {data.subjects.length === 0 ? (
        <Panel>
          <EmptyState message="Aggiungi almeno una materia prima di creare l’orario." />
        </Panel>
      ) : null}

      {showForm ? (
        <Panel className="mb-5 animate-fade-up">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormGrid>
              <Field label="Materia">
                <select
                  className={inputClass}
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Giorno">
                <select
                  className={inputClass}
                  value={dayOfWeek}
                  onChange={(e) =>
                    setDayOfWeek(Number(e.target.value) as DayOfWeek)
                  }
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_LABELS[d]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Inizio">
                <input
                  type="time"
                  className={inputClass}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </Field>
              <Field label="Fine">
                <input
                  type="time"
                  className={inputClass}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </Field>
              <Field label="Aula (opzionale)">
                <input
                  className={inputClass}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Lascia vuoto per usare l’aula della materia"
                />
              </Field>
            </FormGrid>
            <div className="flex gap-2">
              <BtnPrimary type="submit">Aggiungi</BtnPrimary>
              <BtnSecondary onClick={resetForm}>Annulla</BtnSecondary>
            </div>
          </form>
        </Panel>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 animate-fade-up stagger-1">
        {DAYS.map((d) => (
          <Panel
            key={d}
            className={[
              "min-h-[140px]",
              today === d ? "ring-2 ring-accent/40" : "",
            ].join(" ")}
          >
            <h2 className="mb-3 flex items-center justify-between font-display text-lg font-semibold">
              <span>{DAY_SHORT[d]}</span>
              {today === d ? (
                <span className="text-xs font-medium text-accent">Oggi</span>
              ) : null}
            </h2>
            {byDay[d].length === 0 ? (
              <p className="text-xs text-muted">Libero</p>
            ) : (
              <ul className="space-y-2">
                {byDay[d].map((lesson) => {
                  const subject = getSubject(lesson.subjectId);
                  return (
                    <li
                      key={lesson.id}
                      className="group rounded-xl border border-transparent bg-background/70 px-2.5 py-2 hover:border-border"
                    >
                      <div className="flex items-start gap-2">
                        <SubjectDot
                          color={subject?.color ?? "#888"}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {subject?.name ?? "—"}
                          </p>
                          <p className="text-[11px] tabular-nums text-muted">
                            {lesson.startTime}–{lesson.endTime}
                            {(lesson.room || subject?.room) &&
                              ` · ${lesson.room || subject?.room}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLesson(lesson.id)}
                          className="text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger"
                          aria-label="Elimina ora"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
