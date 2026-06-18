"use client";

import type { ReactNode } from "react";
import { AuthLogo } from "./AuthLogo";
import { AuthSupplementalPanel } from "./AuthSupplementalPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="relative grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_600px]">
      <div className="absolute right-4 top-4 z-30 md:right-6">
        <ThemeToggle />
      </div>
      <AuthLogo />
      {children}
      <AuthSupplementalPanel />
    </section>
  );
}
