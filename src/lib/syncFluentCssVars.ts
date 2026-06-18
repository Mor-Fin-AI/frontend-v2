import type { Theme } from "@fluentui/react-components";
import type { AppThemeMode } from "@/lib/fluentTheme";

export function applyFluentThemeCssVariables(
  theme: Theme,
  mode: AppThemeMode
) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  const set = (name: string, value?: string) => {
    if (value) root.style.setProperty(name, value);
  };

  set("--background", theme.colorNeutralBackground1);
  set("--foreground", theme.colorNeutralForeground1);
  set("--card", theme.colorNeutralBackground2);
  set("--card-foreground", theme.colorNeutralForeground1);
  set("--popover", theme.colorNeutralBackground2);
  set("--popover-foreground", theme.colorNeutralForeground1);
  set("--primary", theme.colorBrandBackground);
  set("--primary-foreground", theme.colorBrandForeground1);
  set("--secondary", theme.colorNeutralBackground3);
  set("--secondary-foreground", theme.colorNeutralForeground2);
  set("--muted", theme.colorNeutralBackground3);
  set("--muted-foreground", theme.colorNeutralForeground3);
  set("--accent", theme.colorNeutralBackground4);
  set("--accent-foreground", theme.colorNeutralForeground2);
  set("--border", theme.colorNeutralStroke2);
  set("--input", theme.colorNeutralStroke1);
  set("--ring", theme.colorBrandStroke1 ?? theme.colorBrandBackground);
  set("--destructive", theme.colorPaletteRedBackground3);

  set(
    "--sidebar",
    mode === "dark"
      ? "rgba(18, 16, 28, 0.95)"
      : theme.colorNeutralBackground2
  );
  set("--sidebar-foreground", theme.colorNeutralForeground1);
  set("--sidebar-primary", theme.colorBrandBackground);
  set("--sidebar-primary-foreground", theme.colorBrandForeground1);
  set("--sidebar-accent", theme.colorNeutralBackground4);
  set("--sidebar-accent-foreground", theme.colorNeutralForeground2);
  set("--sidebar-border", theme.colorNeutralStroke2);
  set("--sidebar-ring", theme.colorBrandBackground);

  set(
    "--table-row-hover",
    mode === "dark"
      ? "rgba(167, 139, 250, 0.1)"
      : "rgba(99, 102, 241, 0.07)"
  );
  set(
    "--table-row-selected",
    mode === "dark"
      ? "rgba(140, 71, 209, 0.18)"
      : "rgba(99, 102, 241, 0.12)"
  );
}
