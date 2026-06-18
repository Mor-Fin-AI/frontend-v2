"use client";

import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import AppSpinner from "@/components/ui/AppSpinner";
import { actionGreenButtonClassName } from "@/components/ui/actionGreenButton";

const fieldClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  requiredMark?: boolean;
};

export function AuthField({
  label,
  requiredMark = false,
  className,
  id,
  ...props
}: AuthFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 inline-block text-sm font-medium text-foreground"
      >
        {label}
        {requiredMark && <span className="text-destructive">*</span>}
      </label>
      <input id={inputId} className={clsx(fieldClassName, className)} {...props} />
    </div>
  );
}

export function AuthSubmitButton({
  children,
  className,
  loading = false,
  loadingLabel = "Loading",
}: {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={clsx(
        actionGreenButtonClassName,
        "w-full rounded-lg px-4 py-2.5 text-sm shadow-[var(--action-green-shadow)] hover:translate-x-0 hover:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-80",
        className
      )}
    >
      {loading ? (
        <>
          <AppSpinner size="extra-tiny" label={loadingLabel} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
