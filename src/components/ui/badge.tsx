import * as React from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = {
  base: "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
  variant: {
    default:
      "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
    destructive:
      "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
    outline:
      "border-border bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
    ghost:
      "border-transparent bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
    success:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warning:
      "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-400",
    info: "border-transparent bg-sky-500/15 text-sky-800 dark:text-sky-400",
    brand:
      "border-transparent bg-primary/15 text-primary dark:text-primary",
  },
} as const;

export type BadgeVariant = keyof typeof badgeVariants.variant;

export type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants.base, badgeVariants.variant[variant], className)}
      {...props}
    />
  );
}
