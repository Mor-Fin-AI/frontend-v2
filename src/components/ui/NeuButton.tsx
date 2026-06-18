"use client";

import clsx from "clsx";
import { Link } from "react-router-dom";
import AppSpinner from "@/components/ui/AppSpinner";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";

export type NeuButtonVariant =
  | "primary"
  | "success"
  | "secondary"
  | "dark"
  | "ghost";

export type NeuButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: NeuButtonVariant;
  size?: NeuButtonSize;
  fullWidth?: boolean;
  active?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type NeuButtonProps = ButtonProps | LinkProps;

const variantStyles: Record<NeuButtonVariant, string> = {
  primary: "bg-indigo-500 text-white",
  success: "bg-[var(--action-green)] text-[var(--action-green-foreground)] hover:bg-[var(--action-green-hover)] shadow-[var(--action-green-shadow)] hover:shadow-none",
  secondary:
    "bg-[var(--action-green)] text-[var(--action-green-foreground)] hover:bg-[var(--action-green-hover)] shadow-[var(--action-green-shadow)] hover:shadow-none",
  dark: "bg-black text-white",
  ghost:
    "bg-transparent text-[var(--action-green)] shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 hover:text-[var(--action-green-hover)]",
};

const sizeStyles: Record<NeuButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-6 py-4 text-base font-semibold uppercase",
};

export function neuButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  active = false,
  className,
}: {
  variant?: NeuButtonVariant;
  size?: NeuButtonSize;
  fullWidth?: boolean;
  active?: boolean;
  className?: string;
}) {
  const isGhost = variant === "ghost";

  return clsx(
    "inline-flex items-center justify-center gap-1.5 font-medium transition-all",
    !isGhost && "shadow-[3px_3px_0px_black]",
    !isGhost &&
      (active
        ? "shadow-none translate-x-[3px] translate-y-[3px]"
        : "hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"),
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    !fullWidth && !isGhost && "w-fit",
    className
  );
}

const NeuButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, NeuButtonProps>(
  function NeuButton(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      active = false,
      loading = false,
      loadingLabel = "Loading",
      className,
      children,
      ...props
    },
    ref
  ) {
    const classes = neuButtonClassName({
      variant,
      size,
      fullWidth,
      active,
      className,
    });

    if ("href" in props && props.href) {
      const { href, ...linkProps } = props as LinkProps;
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={href}
          className={classes}
          {...linkProps}
        >
          {children}
        </Link>
      );
    }

    const buttonProps = props as ButtonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type ?? "button"}
        className={classes}
        disabled={loading || buttonProps.disabled}
        aria-busy={loading}
        {...buttonProps}
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
);

export default NeuButton;
