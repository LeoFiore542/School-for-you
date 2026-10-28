import Link from "next/link";
import {
  PRIVACY_SECTIONS,
  PRIVACY_UPDATED_AT,
  PRIVACY_VERSION,
} from "@/lib/privacy";
import { Panel } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <div className="mb-6">
        <p className="text-sm font-medium text-accent">Informativa privacy</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Come gestiamo i tuoi dati
        </h1>
        <p className="mt-2 text-sm text-muted">
          Versione {PRIVACY_VERSION} · aggiornata il {PRIVACY_UPDATED_AT}
        </p>
      </div>

      <Panel className="space-y-6">
        <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
          Questa informativa descrive in modo esplicito quali dati tratta School
          Manager, perché li tratta, dove li conserva (Firebase Authentication e
          Cloud Firestore) e quali diritti hai. L’accettazione è obbligatoria
          prima dell’accesso con Google.
        </p>

        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="space-y-2">
            <h2 className="font-display text-xl font-semibold">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-sm leading-relaxed text-muted md:text-[15px]"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </Panel>

      <p className="mt-6 text-center text-sm">
        <Link href="/login/" className="font-medium text-accent hover:underline">
          Torna al login
        </Link>
      </p>
    </div>
  );
}
