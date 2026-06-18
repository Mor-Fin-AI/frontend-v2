"use client";

import { type ReactNode } from "react";
import AppSpinner from "@/components/ui/AppSpinner";
import {
  actionGreenButtonClassName,
  actionGreenButtonSizeClassName,
} from "@/components/ui/actionGreenButton";
import { ArrowUpRight24Regular } from "@fluentui/react-icons";
import clsx from "clsx";

export type ConnectWalletButtonProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  mono?: boolean;
  compact?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  "aria-label"?: string;
};

export default function ConnectWalletButton({
  onClick,
  children,
  className,
  mono = false,
  compact = false,
  loading = false,
  loadingLabel = "Connecting wallet",
  "aria-label": ariaLabel,
}: ConnectWalletButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      className={clsx(
        actionGreenButtonClassName,
        compact ? actionGreenButtonSizeClassName.compact : actionGreenButtonSizeClassName.default,
        mono && "font-mono tracking-tight",
        className
      )}
    >
      {loading ? (
        <>
          <AppSpinner size="extra-tiny" label={loadingLabel} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span className="truncate">{children}</span>
          <ArrowUpRight24Regular className="h-4 w-4 shrink-0" aria-hidden />
        </>
      )}
    </button>
  );
}
