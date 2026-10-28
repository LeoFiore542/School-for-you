"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { LoadingState } from "@/components/ui";

const PUBLIC_PATHS = ["/login", "/privacy"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready, privacyOk, configured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  useEffect(() => {
    if (!ready) return;

    if (!configured && !isPublic) {
      // Senza Firebase non possiamo fare login: resta sull'app in sola cache.
      return;
    }

    if (!user && !isPublic) {
      router.replace("/login/");
      return;
    }

    if (user && !privacyOk && !isPublic) {
      router.replace("/login/");
      return;
    }

    if (user && privacyOk && pathname.startsWith("/login")) {
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
