"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppThemeMode } from "@/lib/fluentTheme";
import { fluentThemes } from "@/lib/fluentTheme";
import { applyFluentThemeCssVariables } from "@/lib/syncFluentCssVars";

const STORAGE_KEY = "morfinance-theme";

type ThemeContextValue = {
  theme: AppThemeMode;
  isDark: boolean;
  setTheme: (theme: AppThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): AppThemeMode {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyThemeClass(theme: AppThemeMode, animate = false) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  if (animate) {
    root.classList.add("theme-transition");
  }

  root.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  applyFluentThemeCssVariables(fluentThemes[theme], theme);

  if (animate) {
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 500);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeMode>(() => readStoredTheme());

  const setTheme = useCallback((next: AppThemeMode) => {
    setThemeState(next);
    applyThemeClass(next, true);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyThemeClass(next, true);
      return next;
    });
  }, []);

  useEffect(() => {
    applyThemeClass(theme, false);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
