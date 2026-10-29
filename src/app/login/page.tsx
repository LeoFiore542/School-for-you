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
          School for you
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Accedi
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base">
          Entra con Google per sincronizzare orario, materie e voti in modo
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
                Accesso Google ok ({user.email}), ma il consenso privacy non è
                ancora registrato. Spunta la casella e riprova.
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => void signOut()}
                >
                  Esci
                </button>
              </div>
            ) : null}

            <div className="rounded-xl border border-border/80 bg-surface/60 p-3 text-sm leading-relaxed">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>
                  Dichiaro di aver letto e di accettare l’informativa sulla
                  privacy (versione {PRIVACY_VERSION}), che spiega come vengono
                  raccolti, salvati su Firebase e gestiti i miei dati scolastici
                  e di account Google.
                </span>
              </label>
              <p className="mt-2 pl-7 text-xs text-muted">
                <Link
                  href="/privacy/"
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  Apri l’informativa completa
                </Link>
              </p>
            </div>

            <BtnPrimary
              type="submit"
              disabled={!accepted || busy}
              className="w-full"
            >
              {busy
                ? "Accesso in corso…"
                : accepted
                  ? "Continua con Google"
                  : "Spunta la casella per continuare"}
            </BtnPrimary>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <p className="text-center text-xs text-muted">
              Se il popup di Google è bloccato, verrai reindirizzato
              automaticamente alla pagina di accesso Google.
            </p>
          </form>
        )}
      </Panel>
    </div>
  );
}
