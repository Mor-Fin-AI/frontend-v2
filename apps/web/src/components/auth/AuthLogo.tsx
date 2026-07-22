"use client";

import { Link } from "react-router-dom";
import clsx from "clsx";

const LOGO_SRC = "/sidebar/side-logo.png";

export function AuthLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/overview"
      className={clsx(
        "absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center justify-center gap-2.5 md:left-6 md:translate-x-0",
        className
      )}
      aria-label="Morfinance home"
    >
      <span className="inline-flex h-9 w-[42px] shrink-0 items-center justify-center overflow-hidden">
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="h-9 w-auto max-w-none -translate-x-px select-none"
          draggable={false}
        />
      </span>
      <span className="text-lg font-semibold leading-none tracking-[-0.02em] text-foreground transition-colors duration-300">
        Morfinance
      </span>
    </Link>
  );
}
