"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { LoadingState } from "@/components/ui";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/privacy" ||
    pathname.startsWith("/privacy/")
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready, privacyOk, configured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    if (!ready) return;

    // Senza config Firebase l'app funziona in sola cache locale.
    if (!configured) return;

    if (!user && !isPublic) {
      router.replace("/login/");
      return;
    }

    if (user && !privacyOk && !isPublic) {
      router.replace("/login/");
      return;
    }

    if (user && privacyOk && isPublicPath(pathname) && pathname.startsWith("/login")) {
      router.replace("/");
    }
  }, [ready, user, privacyOk, configured, isPublic, pathname, router]);

  if (!ready) {
    return <LoadingState />;
  }

  if (!configured) {
    return <>{children}</>;
  }

  if (!isPublic && (!user || !privacyOk)) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
