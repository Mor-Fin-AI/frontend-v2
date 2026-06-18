"use client";

import { useCallback, useMemo } from "react";
import { useToastController } from "@fluentui/react-components";
import {
  APP_TOASTER_ID,
  buildToastContent,
  type AppToastOptions,
} from "@/components/ui/AppToaster";

export function useAppToast() {
  const { dispatchToast, dismissToast, dismissAllToasts, updateToast, pauseToast, playToast } =
    useToastController(APP_TOASTER_ID);

  const notify = useCallback(
    (title: string, options: AppToastOptions = {}) => {
      dispatchToast(buildToastContent(title, options), {
        intent: options.intent ?? "info",
        politeness: options.politeness,
        timeout: options.timeout,
      });
    },
    [dispatchToast]
  );

  const success = useCallback(
    (title: string, subtitle?: string, options: Omit<AppToastOptions, "intent" | "subtitle"> = {}) => {
      notify(title, { ...options, intent: "success", subtitle });
    },
    [notify]
  );

  const error = useCallback(
    (title: string, subtitle?: string, options: Omit<AppToastOptions, "intent" | "subtitle"> = {}) => {
      notify(title, {
        ...options,
        intent: "error",
        subtitle,
        politeness: options.politeness ?? "assertive",
        timeout: options.timeout ?? 7000,
      });
    },
    [notify]
  );

  const warning = useCallback(
    (title: string, subtitle?: string, options: Omit<AppToastOptions, "intent" | "subtitle"> = {}) => {
      notify(title, { ...options, intent: "warning", subtitle });
    },
    [notify]
  );

  const info = useCallback(
    (title: string, subtitle?: string, options: Omit<AppToastOptions, "intent" | "subtitle"> = {}) => {
      notify(title, { ...options, intent: "info", subtitle });
    },
    [notify]
  );

  return useMemo(
    () => ({
      notify,
      success,
      error,
      warning,
      info,
      dismissToast,
      dismissAllToasts,
      updateToast,
      pauseToast,
      playToast,
    }),
    [
      notify,
      success,
      error,
      warning,
      info,
      dismissToast,
      dismissAllToasts,
      updateToast,
      pauseToast,
      playToast,
    ]
  );
}
