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
  EXAM_TYPE_LABELS,
  type ExamType,
} from "@/lib/types";
import { daysUntil, formatItalianDate, todayISO } from "@/lib/utils";
import { useSchool } from "@/store/school-store";

export default function ProvePage() {
  const { data, ready, addExam, removeExam, getSubject } = useSchool();
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<ExamType>("verifica");
  const [topic, setTopic] = useState("");

  const today = todayISO();

  const sorted = useMemo(() => {
    return [...data.exams].sort((a, b) => a.date.localeCompare(b.date));
  }, [data.exams]);

  const upcoming = sorted.filter((e) => e.date >= today);
  const past = sorted.filter((e) => e.date < today).reverse();

  if (!ready) return <LoadingState />;

  function resetForm() {
    setShowForm(false);
    setSubjectId(data.subjects[0]?.id ?? "");
    setDate(todayISO());
    setType("verifica");
    setTopic("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    addExam({
      subjectId,
      date,
      type,
      topic: topic.trim() || undefined,
    });
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Prove"
        description="Verifiche, interrogazioni e compiti in classe."
        action={
          <BtnPrimary
            onClick={() => {
              setSubjectId(data.subjects[0]?.id ?? "");
              setShowForm(true);
            }}
            disabled={data.subjects.length === 0}
          >
            Nuova prova
          </BtnPrimary>
        }
      />

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
              <Field label="Tipo">
                <select
                  className={inputClass}
                  value={type}
                  onChange={(e) => setType(e.target.value as ExamType)}
                >
                  {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((t) => (
                    <option key={t} value={t}>
                      {EXAM_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Data">
                <input
                  type="date"
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>
              <Field label="Argomenti">
                <input
                  className={inputClass}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Opzionale"
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

      <Panel className="mb-5 animate-fade-up stagger-1">
        <h2 className="mb-3 font-display text-xl font-semibold">In arrivo</h2>
        {upcoming.length === 0 ? (
          <EmptyState message="Nessuna prova in programma." />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((exam) => {
              const subject = getSubject(exam.subjectId);
              const days = daysUntil(exam.date);
              return (
                <li
                  key={exam.id}
                  className="flex items-start gap-3 rounded-xl bg-background/70 px-3 py-3"
                >
                  <SubjectDot
                    color={subject?.color ?? "#888"}
                    className="mt-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {subject?.name} · {EXAM_TYPE_LABELS[exam.type]}
                    </p>
                    {exam.topic ? (
                      <p className="text-xs text-muted">{exam.topic}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={[
                        "text-xs font-medium",
                        days <= 2 ? "text-warning" : "text-muted",
                      ].join(" ")}
                    >
                      {formatItalianDate(exam.date)}
                      {days === 0
                        ? " · oggi"
                        : days === 1
                          ? " · domani"
                          : ` · tra ${days} gg`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExam(exam.id)}
                      className="text-xs text-muted hover:text-danger"
                    >
                      Elimina
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {past.length > 0 ? (
        <Panel className="animate-fade-up stagger-2">
          <h2 className="mb-3 font-display text-xl font-semibold">Passate</h2>
          <ul className="space-y-2 opacity-75">
            {past.map((exam) => {
              const subject = getSubject(exam.subjectId);
              return (
                <li
                  key={exam.id}
                  className="flex items-start gap-3 rounded-xl bg-background/50 px-3 py-2.5"
                >
                  <SubjectDot
                    color={subject?.color ?? "#888"}
                    className="mt-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {subject?.name} · {EXAM_TYPE_LABELS[exam.type]}
                    </p>
                    {exam.topic ? (
                      <p className="text-xs text-muted">{exam.topic}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted">
                      {formatItalianDate(exam.date)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExam(exam.id)}
                      className="text-xs text-muted hover:text-danger"
                    >
                      Elimina
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
