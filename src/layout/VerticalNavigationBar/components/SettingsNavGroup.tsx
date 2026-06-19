"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronDown16Regular,
  Settings20Filled,
  Settings20Regular,
  bundleIcon,
} from "@fluentui/react-icons";
import { settingsNavItems } from "../navConfig";

const Settings = bundleIcon(Settings20Filled, Settings20Regular);

const useStyles = makeStyles({
  group: {
    display: "flex",
    flexDirection: "column",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    width: "100%",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    color: "var(--sidebar-foreground)",
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    cursor: "pointer",
    textAlign: "left",
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-foreground)",
    },
  },
  toggleCollapsed: {
    justifyContent: "center",
    width: "40px",
    height: "40px",
    marginLeft: "auto",
    marginRight: "auto",
    padding: tokens.spacingVerticalS,
  },
  toggleActive: {
    backgroundColor: "var(--sidebar-accent)",
    color: "var(--sidebar-accent-foreground)",
  },
  chevron: {
    marginLeft: "auto",
    transitionProperty: "transform",
    transitionDuration: tokens.durationFaster,
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  subList: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: tokens.spacingHorizontalL,
  },
  subItem: {
    display: "flex",
    width: "100%",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    color: "var(--sidebar-foreground)",
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    cursor: "pointer",
    textAlign: "left",
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-foreground)",
    },
  },
  subItemActive: {
    backgroundColor: "var(--sidebar-accent)",
    color: "var(--sidebar-accent-foreground)",
    fontWeight: tokens.fontWeightSemibold,
  },
});

function isSettingsPath(pathname: string) {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export default function SettingsNavGroup({
  onNavigate,
  isCollapsed = false,
}: {
  onNavigate: (href: string) => void;
  isCollapsed?: boolean;
}) {
  const styles = useStyles();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(isSettingsPath(pathname));

  useEffect(() => {
    if (isSettingsPath(pathname)) {
      setOpen(true);
    }
  }, [pathname]);

  const settingsActive = isSettingsPath(pathname);

  if (isCollapsed) {
    return (
      <div className={styles.group}>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Tooltip
              content="Settings"
              relationship="label"
              positioning="after"
              withArrow
            >
              <button
                type="button"
                className={mergeClasses(
                  styles.toggle,
                  styles.toggleCollapsed,
                  settingsActive && styles.toggleActive
                )}
                aria-label="Settings"
              >
                <Settings />
              </button>
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {settingsNavItems.map((item) => (
                <MenuItem key={item.id} onClick={() => onNavigate(item.href)}>
                  {item.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={mergeClasses(styles.toggle, settingsActive && styles.toggleActive)}
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setOpen(true);
            if (!settingsActive) {
              onNavigate(settingsNavItems[0].href);
            }
            return;
          }
          setOpen(false);
        }}
      >
        <Settings />
        <span>Settings</span>
        <ChevronDown16Regular
          className={mergeClasses(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      {open ? (
        <div className={styles.subList}>
          {settingsNavItems.map((item) => {
            const isActive =
              item.href === "/settings/general"
                ? pathname === "/settings/general" ||
                  pathname === "/settings" ||
                  pathname === "/settings/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <button
                key={item.id}
                type="button"
                className={mergeClasses(
                  styles.subItem,
                  isActive && styles.subItemActive
                )}
                onClick={() => onNavigate(item.href)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
