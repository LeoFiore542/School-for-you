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
import { daysUntil, formatItalianDate, todayISO } from "@/lib/utils";
import { useSchool } from "@/store/school-store";

type Filter = "tutti" | "da_fare" | "fatti";

export default function CompitiPage() {
  const {
    data,
    ready,
    addHomework,
    toggleHomework,
    removeHomework,
    getSubject,
  } = useSchool();

  const [filter, setFilter] = useState<Filter>("da_fare");
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    let list = [...data.homework];
    if (filter === "da_fare") list = list.filter((h) => !h.done);
    if (filter === "fatti") list = list.filter((h) => h.done);
    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [data.homework, filter]);

  if (!ready) return <LoadingState />;

  function resetForm() {
    setShowForm(false);
    setTitle("");
    setNotes("");
    setDueDate(todayISO());
    setSubjectId(data.subjects[0]?.id ?? "");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subjectId || !title.trim()) return;
    addHomework({
      subjectId,
      title: title.trim(),
      dueDate,
      done: false,
      notes: notes.trim() || undefined,
    });
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Compiti"
        description="Scadenze e consegne: spunta quando hai finito."
        action={
          <BtnPrimary
            onClick={() => {
              setSubjectId(data.subjects[0]?.id ?? "");
              setShowForm(true);
            }}
            disabled={data.subjects.length === 0}
          >
            Nuovo compito
          </BtnPrimary>
        }
      />

      <div className="mb-4 flex gap-2 animate-fade-up">
        {(
          [
            ["da_fare", "Da fare"],
            ["fatti", "Fatti"],
            ["tutti", "Tutti"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={[
              "rounded-xl px-3 py-1.5 text-sm font-medium transition",
              filter === key
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-background-deep",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm ? (
        <Panel className="mb-5 animate-fade-up">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormGrid>
              <Field label="Titolo">
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Esercizi pag. 42"
                  required
                />
              </Field>
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
              <Field label="Scadenza">
                <input
                  type="date"
                  className={inputClass}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </Field>
              <Field label="Note">
                <input
                  className={inputClass}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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

      <Panel className="animate-fade-up stagger-1">
        {filtered.length === 0 ? (
          <EmptyState message="Nessun compito in questa vista." />
        ) : (
          <ul className="space-y-2">
            {filtered.map((hw) => {
              const subject = getSubject(hw.subjectId);
              const days = daysUntil(hw.dueDate);
              const overdue = !hw.done && days < 0;
              const soon = !hw.done && days >= 0 && days <= 1;
              return (
                <li
                  key={hw.id}
                  className={[
                    "flex items-start gap-3 rounded-xl px-3 py-3",
                    hw.done ? "bg-background/40 opacity-70" : "bg-background/70",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={hw.done}
                    onChange={() => toggleHomework(hw.id)}
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                    aria-label="Segna come fatto"
                  />
                  <SubjectDot
                    color={subject?.color ?? "#888"}
                    className="mt-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        "text-sm font-medium",
                        hw.done ? "line-through" : "",
                      ].join(" ")}
                    >
                      {hw.title}
                    </p>
                    <p className="text-xs text-muted">
                      {subject?.name}
                      {hw.notes ? ` · ${hw.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={[
                        "text-xs font-medium",
                        overdue
                          ? "text-danger"
                          : soon
                            ? "text-warning"
                            : "text-muted",
                      ].join(" ")}
                    >
                      {formatItalianDate(hw.dueDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHomework(hw.id)}
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
