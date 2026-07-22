"use client";

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { ChevronDown16Regular } from "@fluentui/react-icons";
import { settingsNavItems } from "@/layout/VerticalNavigationBar/navConfig";

const useStyles = makeStyles({
  trigger: {
    minWidth: "180px",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalL,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    color: "var(--foreground)",
    ":hover": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
  },
});

export default function SettingsSubNav() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeItem = useMemo(
    () =>
      settingsNavItems.find((item) =>
        item.href === "/settings/general"
          ? pathname === "/settings/general" ||
            pathname === "/settings" ||
            pathname === "/settings/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
      ) ?? settingsNavItems[0],
    [pathname]
  );

  return (
    <nav aria-label="Settings sections">
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <MenuButton
            className={styles.trigger}
            menuIcon={<ChevronDown16Regular />}
          >
            {activeItem.label}
          </MenuButton>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            {settingsNavItems.map((item) => (
              <MenuItem key={item.id} onClick={() => navigate(item.href)}>
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </nav>
  );
}
