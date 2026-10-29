import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/store/auth-store";
import { SchoolProvider } from "@/store/school-store";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School for you",
  description:
    "Gestisci orario, materie e voti — il tuo anno scolastico in un posto solo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <SchoolProvider>
            <AuthGate>
              <AppShell>{children}</AppShell>
            </AuthGate>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl lg:px-0">
      <AppNav />
      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pt-8 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
