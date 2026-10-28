"use client";

import { FormEvent, useState } from "react";
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
import { SUBJECT_COLORS } from "@/lib/types";
import { useSchool } from "@/store/school-store";

export default function MateriePage() {
  const {
    data,
    ready,
    syncLabel,
    addSubject,
    updateSubject,
    removeSubject,
    resetToSeed,
    clearAll,
  } = useSchool();

  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [color, setColor] = useState<string>(SUBJECT_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!ready) return <LoadingState />;

  function resetForm() {
    setName("");
    setTeacher("");
    setRoom("");
    setColor(SUBJECT_COLORS[data.subjects.length % SUBJECT_COLORS.length]);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(id: string) {
    const s = data.subjects.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setName(s.name);
    setTeacher(s.teacher);
    setRoom(s.room);
    setColor(s.color);
    setShowForm(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      teacher: teacher.trim(),
      room: room.trim(),
      color,
    };
    if (editingId) {
      updateSubject(editingId, payload);
    } else {
      addSubject(payload);
    }
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Materie"
        description="Gestisci le materie dell’anno: colore, docente e aula."
        action={
          <BtnPrimary
            onClick={() => {
              resetForm();
              setShowForm(true);
              setColor(
                SUBJECT_COLORS[data.subjects.length % SUBJECT_COLORS.length],
              );
            }}
          >
            Aggiungi materia
          </BtnPrimary>
        }
      />

      {showForm ? (
        <Panel className="mb-5 animate-fade-up">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormGrid>
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="es. Matematica"
                  required
                />
              </Field>
              <Field label="Docente">
                <input
                  className={inputClass}
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="es. Prof. Rossi"
                />
              </Field>
              <Field label="Aula">
                <input
                  className={inputClass}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="es. Aula 8"
                />
              </Field>
              <Field label="Colore">
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={[
                        "h-8 w-8 rounded-full transition ring-offset-2 ring-offset-surface",
                        color === c ? "ring-2 ring-accent" : "",
                      ].join(" ")}
                      style={{ backgroundColor: c }}
                      aria-label={`Colore ${c}`}
                    />
                  ))}
                </div>
              </Field>
            </FormGrid>
            <div className="flex flex-wrap gap-2">
              <BtnPrimary type="submit">
                {editingId ? "Salva modifiche" : "Aggiungi"}
              </BtnPrimary>
              <BtnSecondary onClick={resetForm}>Annulla</BtnSecondary>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel className="animate-fade-up stagger-1">
        {data.subjects.length === 0 ? (
          <EmptyState message="Nessuna materia. Aggiungine una per iniziare." />
        ) : (
          <ul className="divide-y divide-border/60">
            {data.subjects.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <SubjectDot color={s.color} className="h-3 w-3" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted">
                    {[s.teacher || null, s.room || null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <BtnSecondary onClick={() => startEdit(s.id)}>
                    Modifica
                  </BtnSecondary>
                  <BtnSecondary
                    danger
                    onClick={() => {
                      if (
                        confirm(
                          `Eliminare ${s.name}? Verranno rimossi anche orario, compiti, voti e prove collegati.`,
                        )
                      ) {
                        removeSubject(s.id);
                      }
                    }}
                  >
                    Elimina
                  </BtnSecondary>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="mt-5 animate-fade-up stagger-2">
        <h2 className="font-display text-lg font-semibold">Dati</h2>
        <p className="mt-1 text-sm text-muted">
          I tuoi dati restano sul tuo account Google (Firestore) dopo il consenso privacy. Stato: {syncLabel}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <BtnSecondary
            onClick={() => {
              if (confirm("Ripristinare i dati di esempio? I dati attuali verranno sostituiti.")) {
                resetToSeed();
              }
            }}
          >
            Ripristina dati esempio
          </BtnSecondary>
          <BtnSecondary
            danger
            onClick={() => {
              if (confirm("Cancellare tutti i dati?")) {
                clearAll();
              }
            }}
          >
            Svuota tutto
          </BtnSecondary>
        </div>
      </Panel>
    </div>
  );
}
