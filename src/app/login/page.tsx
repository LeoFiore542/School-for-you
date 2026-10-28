"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { BtnPrimary, Panel } from "@/components/ui";

export default function LoginPage() {
  const {
    signInGoogleWithPrivacy,
    error,
    clearError,
    configured,
    user,
    privacyOk,
    signOut,
  } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accepted || busy) return;
    clearError();
    setBusy(true);
    try {
      await signInGoogleWithPrivacy();
    } catch {
      // errore già in context
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center animate-fade-up">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          School Manager
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Accedi
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base">
          Entra con Google per sincronizzare orario, compiti e voti in modo
          sicuro sul tuo account.
        </p>
      </div>

      <Panel>
        {!configured ? (
          <p className="text-sm text-danger">
            Firebase non è configurato. Aggiungi le variabili{" "}
            <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> in{" "}
            <code className="text-xs">.env.local</code>.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {user && !privacyOk ? (
              <div className="rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">
                Hai effettuato l’accesso come {user.email}, ma manca
                l’accettazione dell’informativa privacy (versione{" "}
                {PRIVACY_VERSION}). Accetta i termini e ripeti l’accesso.
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => void signOut()}
                >
                  Esci
                </button>
              </div>
            ) : null}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-surface/60 p-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                required
              />
              <span>
                Dichiaro di aver letto e di accettare l’
                <Link
                  href="/privacy/"
                  className="font-medium text-accent underline-offset-2 hover:underline"
                  target="_blank"
                >
                  informativa sulla privacy
                </Link>{" "}
                (versione {PRIVACY_VERSION}), che spiega in modo esplicito come
                vengono raccolti, salvati su Firebase e gestiti i miei dati
                scolastici e di account Google.
              </span>
            </label>

            <BtnPrimary type="submit" disabled={!accepted || busy}>
              {busy ? "Accesso in corso…" : "Continua con Google"}
            </BtnPrimary>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error.includes("auth/operation-not-allowed")
                  ? "Il provider Google non è ancora abilitato nella console Firebase. Abilita Authentication → Sign-in method → Google."
                  : error}
              </p>
            ) : null}

            <p className="text-center text-xs text-muted">
              Senza accettazione non è possibile accedere né sincronizzare i
              dati.{" "}
              <Link href="/privacy/" className="text-accent hover:underline">
                Leggi l’informativa
              </Link>
            </p>
          </form>
        )}
      </Panel>
    </div>
  );
}
