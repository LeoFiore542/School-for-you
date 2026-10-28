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
  averageBySubject,
  formatGrade,
  weightedAverage,
} from "@/lib/calculations";
import {
  GRADE_TYPE_LABELS,
  type GradeType,
} from "@/lib/types";
import { formatItalianDate, todayISO } from "@/lib/utils";
import { useSchool } from "@/store/school-store";

export default function VotiPage() {
  const { data, ready, addGrade, removeGrade, getSubject } = useSchool();
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [value, setValue] = useState("7");
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<GradeType>("scritto");
  const [weight, setWeight] = useState("1");
  const [note, setNote] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("tutti");

  const overall = useMemo(
    () => weightedAverage(data.grades),
    [data.grades],
  );

  const bySubject = useMemo(
    () => averageBySubject(data.grades),
    [data.grades],
  );

  const grades = useMemo(() => {
    let list = [...data.grades];
    if (filterSubject !== "tutti") {
      list = list.filter((g) => g.subjectId === filterSubject);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [data.grades, filterSubject]);

  if (!ready) return <LoadingState />;

  function resetForm() {
    setShowForm(false);
    setSubjectId(data.subjects[0]?.id ?? "");
    setValue("7");
    setDate(todayISO());
    setType("scritto");
    setWeight("1");
    setNote("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    const num = Number(value.replace(",", "."));
    if (Number.isNaN(num) || num < 0 || num > 10) {
      alert("Inserisci un voto tra 0 e 10.");
      return;
    }
    const w = Number(weight.replace(",", ".")) || 1;
    addGrade({
      subjectId,
      value: num,
      date,
      type,
      weight: w,
      note: note.trim() || undefined,
    });
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Voti"
        description="Registra i voti e tieni d’occhio le medie."
        action={
          <BtnPrimary
            onClick={() => {
              setSubjectId(data.subjects[0]?.id ?? "");
              setShowForm(true);
            }}
            disabled={data.subjects.length === 0}
          >
            Nuovo voto
          </BtnPrimary>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up">
        <Panel className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Media generale
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-accent">
            {overall !== null ? formatGrade(overall) : "—"}
          </p>
        </Panel>
        {data.subjects.map((s) => {
          const avg = bySubject[s.id];
          if (avg === undefined || avg === null) return null;
          return (
            <Panel key={s.id}>
              <div className="flex items-center gap-2">
                <SubjectDot color={s.color} />
                <p className="truncate text-sm font-medium">{s.name}</p>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold">
                {formatGrade(avg)}
              </p>
            </Panel>
          );
        })}
      </div>

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
              <Field label="Voto (0–10)">
                <input
                  className={inputClass}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  inputMode="decimal"
                  required
                />
              </Field>
              <Field label="Tipo">
                <select
                  className={inputClass}
                  value={type}
                  onChange={(e) => setType(e.target.value as GradeType)}
                >
                  {(Object.keys(GRADE_TYPE_LABELS) as GradeType[]).map((t) => (
                    <option key={t} value={t}>
                      {GRADE_TYPE_LABELS[t]}
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
              <Field label="Peso">
                <input
                  className={inputClass}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  inputMode="decimal"
                />
              </Field>
              <Field label="Nota">
                <input
                  className={inputClass}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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

      <div className="mb-3 animate-fade-up stagger-1">
        <select
          className={`${inputClass} max-w-xs`}
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="tutti">Tutte le materie</option>
          {data.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Panel className="animate-fade-up stagger-2">
        {grades.length === 0 ? (
          <EmptyState message="Nessun voto registrato." />
        ) : (
          <ul className="space-y-2">
            {grades.map((g) => {
              const subject = getSubject(g.subjectId);
              return (
                <li
                  key={g.id}
                  className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-3"
                >
                  <span className="w-12 shrink-0 text-center font-display text-xl font-semibold text-accent">
                    {formatGrade(g.value)}
                  </span>
                  <SubjectDot color={subject?.color ?? "#888"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{subject?.name}</p>
                    <p className="text-xs text-muted">
                      {g.type ? GRADE_TYPE_LABELS[g.type] : "Voto"}
                      {g.weight && g.weight !== 1 ? ` · peso ${g.weight}` : ""}
                      {g.note ? ` · ${g.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted">
                      {formatItalianDate(g.date)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGrade(g.id)}
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
    </div>
  );
}
