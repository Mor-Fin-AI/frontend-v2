"use client";

import {
  Link,
  Toast,
  ToastBody,
  ToastTitle,
  ToastTrigger,
  Toaster,
  type ToastIntent,
  type ToastPoliteness,
} from "@fluentui/react-components";

export const APP_TOASTER_ID = "morfinance-toaster";

export function AppToaster() {
  return (
    <Toaster
      toasterId={APP_TOASTER_ID}
      position="bottom-end"
      limit={3}
      timeout={5000}
      pauseOnHover
      pauseOnWindowBlur
      offset={{ horizontal: 20, vertical: 20 }}
      shortcuts={{
        focus: (event) => event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "t",
      }}
    />
  );
}

export type AppToastOptions = {
  intent?: ToastIntent;
  subtitle?: string;
  politeness?: ToastPoliteness;
  timeout?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export function buildToastContent(title: string, options: AppToastOptions = {}) {
  const action =
    options.actionLabel && options.onAction ? (
      <ToastTrigger>
        <Link
          onClick={(event) => {
            event.preventDefault();
            options.onAction?.();
          }}
        >
          {options.actionLabel}
        </Link>
      </ToastTrigger>
    ) : options.actionLabel ? (
      <ToastTrigger>
        <Link>{options.actionLabel}</Link>
      </ToastTrigger>
    ) : undefined;

  return (
    <Toast>
      <ToastTitle action={action}>{title}</ToastTitle>
      {options.subtitle ? <ToastBody>{options.subtitle}</ToastBody> : null}
    </Toast>
  );
}
