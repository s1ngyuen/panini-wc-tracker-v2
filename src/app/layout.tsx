import type { Metadata } from "next";
import "./globals.css";
import "./app.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/ToastProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Swappa — Panini WC 2026 Tracker",
  description: "Track your Panini World Cup 2026 Adrenalyn XL card collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
