import { Theme, webDarkTheme, webLightTheme } from "@fluentui/react-components";

const fluentFontStack =
  '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif';

const sharedTheme = {
  fontFamilyBase: fluentFontStack,
  fontFamilyMonospace: '"Cascadia Mono", "Segoe UI Mono", Consolas, monospace',
  fontFamilyNumeric: fluentFontStack,
};

export const appFluentDarkTheme: Theme = {
  ...webDarkTheme,
  ...sharedTheme,
  colorBrandBackground: "#8c47d1",
  colorBrandForeground1: "#ffffff",
  colorBrandBackgroundHover: "#9d5ce0",
  colorBrandStroke1: "#a78bfa",
  colorNeutralBackground1: "#12101c",
  colorNeutralBackground2: "#1e1b2e",
  colorNeutralBackground3: "rgba(30, 27, 46, 0.55)",
  colorNeutralBackground4: "rgba(30, 27, 46, 0.35)",
  colorNeutralStroke1: "rgba(255, 255, 255, 0.14)",
  colorNeutralStroke2: "rgba(255, 255, 255, 0.08)",
  colorNeutralForeground1: "#f3f4f6",
  colorNeutralForeground2: "#d1d5db",
  colorNeutralForeground3: "#9ca3af",
  shadow2: "0 2px 8px rgba(0, 0, 0, 0.24)",
  shadow4: "0 4px 16px rgba(0, 0, 0, 0.32)",
};

export const appFluentLightTheme: Theme = {
  ...webLightTheme,
  ...sharedTheme,
  colorBrandBackground: "#6366f1",
  colorBrandForeground1: "#ffffff",
  colorBrandBackgroundHover: "#4f46e5",
  colorBrandStroke1: "#8b5cf6",
  colorNeutralBackground1: "#f4f2fa",
  colorNeutralBackground2: "#ffffff",
  colorNeutralBackground3: "#f1eff8",
  colorNeutralBackground4: "#e8e4f2",
  colorNeutralStroke1: "rgba(15, 12, 28, 0.12)",
  colorNeutralStroke2: "rgba(15, 12, 28, 0.08)",
  colorNeutralForeground1: "#12101c",
  colorNeutralForeground2: "#3f3a56",
  colorNeutralForeground3: "#6b6580",
  shadow2: "0 2px 8px rgba(15, 12, 28, 0.08)",
  shadow4: "0 4px 16px rgba(15, 12, 28, 0.12)",
};

/** @deprecated Use appFluentDarkTheme */
export const appFluentTheme = appFluentDarkTheme;

export const fluentThemes = {
  dark: appFluentDarkTheme,
  light: appFluentLightTheme,
} as const;

export type AppThemeMode = keyof typeof fluentThemes;

export const fluentFontFamily = fluentFontStack;
