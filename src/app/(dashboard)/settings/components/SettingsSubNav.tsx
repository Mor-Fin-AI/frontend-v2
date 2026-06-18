"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { settingsNavItems } from "@/layout/VerticalNavigationBar/navConfig";

const useStyles = makeStyles({
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalXXS,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    width: "fit-content",
    maxWidth: "100%",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    padding: `${tokens.spacingVerticalSNudge} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    color: "var(--muted-foreground)",
    textDecorationLine: "none",
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
  },
  linkActive: {
    backgroundColor: "color-mix(in srgb, var(--primary) 12%, var(--card))",
    color: "var(--primary)",
    fontWeight: tokens.fontWeightSemibold,
  },
});

export default function SettingsSubNav() {
  const styles = useStyles();
  const { pathname } = useLocation();

  return (
    <nav className={styles.nav} aria-label="Settings sections">
      {settingsNavItems.map((item) => {
        const isActive =
          item.href === "/settings/general"
            ? pathname === "/settings/general" ||
              pathname === "/settings" ||
              pathname === "/settings/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === "/settings/general"}
            className={mergeClasses(styles.link, isActive && styles.linkActive)}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
