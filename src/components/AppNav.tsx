"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useSchool } from "@/store/school-store";

const NAV = [
  { href: "/", label: "Oggi", icon: TodayIcon },
  { href: "/orario", label: "Orario", icon: ScheduleIcon },
  { href: "/voti", label: "Voti", icon: GradesIcon },
  { href: "/materie", label: "Materie", icon: SubjectsIcon },
] as const;

function navClass(active: boolean) {
  return [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-accent text-white shadow-sm"
      : "text-foreground/80 hover:bg-accent-soft hover:text-accent",
  ].join(" ");
}

function mobileNavClass(active: boolean) {
  return [
    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
    active ? "text-accent" : "text-muted",
  ].join(" ");
}

export function AppNav() {
  const pathname = usePathname();
  const { syncLabel } = useSchool();
  const { user, signOut, privacyOk } = useAuth();

  const isPublic =
    pathname.startsWith("/login") || pathname.startsWith("/privacy");

  if (isPublic || !user || !privacyOk) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/80 bg-surface/80 px-3 py-6 backdrop-blur-md lg:flex">
        <Link href="/" className="mb-8 px-3">
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            School for you
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Il tuo anno scolastico
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(active)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 px-3 pt-4">
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent">
                {(user.displayName ?? user.email ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {user.displayName ?? "Account"}
              </p>
              <p className="truncate text-[10px] text-muted">{user.email}</p>
            </div>
          </div>
          {syncLabel ? (
            <p className="text-[11px] text-muted" title="Stato sync Firebase">
              {syncLabel}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-left text-[11px] font-medium text-accent hover:underline"
          >
            Esci
          </button>
          <Link href="/privacy/" className="block text-[11px] text-muted hover:text-accent">
            Privacy
          </Link>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={mobileNavClass(active)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function TodayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ScheduleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function GradesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z" />
    </svg>
  );
}

function SubjectsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
