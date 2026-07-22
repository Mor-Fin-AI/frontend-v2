"use client";

import * as React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AppBadgeTone =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "important"
  | "severe"
  | "subtle";

export type AppBadgeAppearance = "tint" | "outline" | "ghost" | "filled";
export type AppBadgeSize = "table" | "small" | "medium" | "large";

const TONE_VARIANT: Record<AppBadgeTone, BadgeVariant> = {
  brand: "brand",
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "secondary",
  important: "default",
  severe: "destructive",
  subtle: "secondary",
};

const OUTLINE_TONE_CLASSES: Record<AppBadgeTone, string> = {
  brand: "border-primary/35 text-primary bg-transparent",
  success: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-transparent",
  warning: "border-amber-500/40 text-amber-800 dark:text-amber-400 bg-transparent",
  danger: "border-destructive/40 text-destructive bg-transparent",
  info: "border-sky-500/40 text-sky-800 dark:text-sky-400 bg-transparent",
  neutral: "border-border text-muted-foreground bg-transparent",
  important: "border-primary/35 text-primary bg-transparent",
  severe: "border-destructive/40 text-destructive bg-transparent",
  subtle: "border-border text-muted-foreground bg-transparent",
};

const GHOST_TONE_CLASSES: Record<AppBadgeTone, string> = {
  brand: "text-primary",
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-800 dark:text-amber-400",
  danger: "text-destructive",
  info: "text-sky-800 dark:text-sky-400",
  neutral: "text-muted-foreground",
  important: "text-primary",
  severe: "text-destructive",
  subtle: "text-muted-foreground",
};

const FILLED_TONE_VARIANT: Record<AppBadgeTone, BadgeVariant> = {
  brand: "default",
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "secondary",
  important: "default",
  severe: "destructive",
  subtle: "secondary",
};

const SIZE_CLASSES: Record<AppBadgeSize, string> = {
  table:
    "h-5 min-h-5 px-1.5 py-0 text-[12px] leading-5 font-normal rounded-[6px] [&>svg]:!size-2.5",
  small: "px-2 py-0.5 text-xs font-medium",
  medium: "px-2.5 py-0.5 text-xs font-medium",
  large: "px-2.5 py-1 text-sm font-medium",
};

function resolveVariant(
  tone: AppBadgeTone,
  appearance: AppBadgeAppearance
): { variant: BadgeVariant; className?: string } {
  if (appearance === "outline") {
    return { variant: "outline", className: OUTLINE_TONE_CLASSES[tone] };
  }

  if (appearance === "ghost") {
    return { variant: "ghost", className: GHOST_TONE_CLASSES[tone] };
  }

  if (appearance === "filled") {
    return { variant: FILLED_TONE_VARIANT[tone] };
  }

  return { variant: TONE_VARIANT[tone] };
}

export type AppBadgeProps = React.ComponentProps<"span"> & {
  tone?: AppBadgeTone;
  appearance?: AppBadgeAppearance;
  size?: AppBadgeSize;
  icon?: React.ReactNode;
  /** @deprecated Use `tone` instead */
  color?: AppBadgeTone;
};

export default function AppBadge({
  tone = "neutral",
  color,
  appearance = "tint",
  size = "small",
  icon,
  className,
  children,
  ...props
}: AppBadgeProps) {
  const resolvedTone = color ?? tone;
  const { variant, className: toneClassName } = resolveVariant(
    resolvedTone,
    appearance
  );

  return (
    <Badge
      variant={variant}
      className={cn(SIZE_CLASSES[size], toneClassName, className)}
      {...props}
    >
      {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
      {children}
    </Badge>
  );
}

export function toneFromText(value: string): AppBadgeTone {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("success") ||
    normalized.includes("complete") ||
    normalized.includes("approved") ||
    normalized.includes("active") ||
    normalized.includes("attended") ||
    normalized.includes("voted") ||
    normalized.includes("participated")
  ) {
    return "success";
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("pending") ||
    normalized.includes("progress") ||
    normalized.includes("planning") ||
    normalized.includes("flagged")
  ) {
    return "warning";
  }

  if (
    normalized.includes("danger") ||
    normalized.includes("fail") ||
    normalized.includes("defeat") ||
    normalized.includes("suspend")
  ) {
    return "danger";
  }

  if (
    normalized.includes("governance") ||
    normalized.includes("vote") ||
    normalized.includes("info") ||
    normalized.includes("executed")
  ) {
    return "info";
  }

  if (
    normalized.includes("brand") ||
    normalized.includes("training") ||
    normalized.includes("learning")
  ) {
    return "brand";
  }

  return "neutral";
}
