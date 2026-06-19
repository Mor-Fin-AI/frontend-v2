"use client";

import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Hamburger,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavSectionHeader,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
  useRestoreFocusTarget,
} from "@fluentui/react-components";
import {
  ArrowSwap20Filled,
  ArrowSwap20Regular,
  Board20Filled,
  Board20Regular,
  Box20Filled,
  Box20Regular,
  BuildingBank20Filled,
  BuildingBank20Regular,
  Home20Filled,
  Home20Regular,
  Money20Filled,
  Money20Regular,
  Chat20Filled,
  Chat20Regular,
  People20Filled,
  People20Regular,
  Settings20Filled,
  Settings20Regular,
  ShieldTask20Filled,
  ShieldTask20Regular,
  Vote20Filled,
  Vote20Regular,
  Wallet20Filled,
  Wallet20Regular,
  bundleIcon,
} from "@fluentui/react-icons";
import { useAuth } from "@/context/AuthContext";
import {
  adminNavItems,
  navSections,
  resolveNavSelection,
  type NavLink,
} from "../navConfig";
import SettingsNavGroup from "./SettingsNavGroup";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

const Dashboard = bundleIcon(Board20Filled, Board20Regular);
const Home = bundleIcon(Home20Filled, Home20Regular);
const Dsa = bundleIcon(Wallet20Filled, Wallet20Regular);
const Arbitrage = bundleIcon(ArrowSwap20Filled, ArrowSwap20Regular);
const Rewards = bundleIcon(People20Filled, People20Regular);
const Bank = bundleIcon(BuildingBank20Filled, BuildingBank20Regular);
const Infrastructure = bundleIcon(Box20Filled, Box20Regular);
const Fee = bundleIcon(Money20Filled, Money20Regular);
const Governance = bundleIcon(Vote20Filled, Vote20Regular);
const Admin = bundleIcon(ShieldTask20Filled, ShieldTask20Regular);
const Users = bundleIcon(People20Filled, People20Regular);
const ChatNav = bundleIcon(Chat20Filled, Chat20Regular);
const Settings = bundleIcon(Settings20Filled, Settings20Regular);

const navIconMap = {
  home: Home,
  dashboard: Dashboard,
  dsa: Dsa,
  arbitrage: Arbitrage,
  rewards: Rewards,
  governance: Governance,
  admin: Admin,
  users: Users,
  chat: ChatNav,
  bank: Bank,
  infrastructure: Infrastructure,
  fee: Fee,
  pricing: Fee,
  settings: Settings,
} as const;

const useStyles = makeStyles({
  root: {
    height: "100%",
    flexShrink: 0,
  },
  drawer: {
    width: "260px",
    height: "100%",
    backgroundColor: "var(--sidebar)",
    borderRight: `1px solid var(--sidebar-border)`,
    transitionProperty: "width",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  drawerCollapsed: {
    width: "72px",
    "& .fui-NavSectionHeader": {
      display: "none",
    },
    "& .fui-NavDrawerHeader": {
      justifyContent: "center",
      paddingLeft: tokens.spacingHorizontalXS,
      paddingRight: tokens.spacingHorizontalXS,
    },
  },
  header: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
  navLink: {
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
    textDecoration: "none",
    cursor: "pointer",
    textAlign: "left",
    transitionProperty: "background-color, color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-foreground)",
    },
  },
  navLinkCollapsed: {
    justifyContent: "center",
    minWidth: "40px",
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
  },
  navLinkActive: {
    backgroundColor: "var(--sidebar-accent)",
    color: "var(--sidebar-accent-foreground)",
  },
  navLinkIcon: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

function isNavActive(pathname: string, href: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return normalized === href || normalized.startsWith(`${href}/`);
}

function SidebarNavLink({
  item,
  icon,
  isCollapsed,
  onNavigate,
}: {
  item: NavLink;
  icon: ReactElement;
  isCollapsed: boolean;
  onNavigate: () => void;
}) {
  const styles = useStyles();
  const pathname = useLocation().pathname;
  const isActive = isNavActive(pathname, item.href);

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-label={isCollapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={mergeClasses(
        styles.navLink,
        isCollapsed && styles.navLinkCollapsed,
        isActive && styles.navLinkActive
      )}
    >
      <span className={styles.navLinkIcon}>{icon}</span>
      {isCollapsed ? null : item.label}
    </Link>
  );

  if (!isCollapsed) {
    return link;
  }

  return (
    <Tooltip
      content={item.label}
      relationship="label"
      positioning="after"
      withArrow
    >
      {link}
    </Tooltip>
  );
}

export default function NavDrawerMenu() {
  const styles = useStyles();
  const pathname = useLocation().pathname;
  const { isAdmin } = useAuth();
  const { open, collapsed, close, toggle, toggleCollapsed } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const restoreFocusTargetAttributes = useRestoreFocusTarget();

  const isCollapsed = collapsed && isLargeScreen;
  const { selectedValue } = resolveNavSelection(pathname);
  const drawerOpen = isLargeScreen ? true : open;
  const drawerType = isLargeScreen ? "inline" : "overlay";

  const closeMobileDrawer = () => {
    if (!isLargeScreen) {
      close();
    }
  };

  const handleToggle = () => {
    if (isLargeScreen) {
      toggleCollapsed();
      return;
    }
    toggle();
  };

  return (
    <div className={styles.root}>
      <NavDrawer
        type={drawerType}
        open={drawerOpen}
        selectedValue={selectedValue}
        className={mergeClasses(
          styles.drawer,
          isCollapsed && styles.drawerCollapsed
        )}
      >
        <NavDrawerHeader className={styles.header}>
          <Tooltip
            content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            relationship="label"
            positioning={isCollapsed ? "after" : "below"}
            withArrow={isCollapsed}
          >
            <Hamburger
              onClick={handleToggle}
              {...restoreFocusTargetAttributes}
              aria-expanded={isLargeScreen ? !collapsed : open}
            />
          </Tooltip>
        </NavDrawerHeader>

        <NavDrawerBody>
          {navSections.map((section) => (
            <div key={section.header ?? "root"}>
              {section.header && !isCollapsed ? (
                <NavSectionHeader>{section.header}</NavSectionHeader>
              ) : null}

              {section.items.map((item) => {
                const Icon =
                  navIconMap[item.icon as keyof typeof navIconMap] ?? Dashboard;

                return (
                  <SidebarNavLink
                    key={item.id}
                    item={item}
                    icon={<Icon />}
                    isCollapsed={isCollapsed}
                    onNavigate={closeMobileDrawer}
                  />
                );
              })}
            </div>
          ))}

          {isAdmin ? (
            <div>
              {!isCollapsed ? (
                <NavSectionHeader>Admin</NavSectionHeader>
              ) : null}
              {adminNavItems.map((item) => {
                const Icon =
                  navIconMap[item.icon as keyof typeof navIconMap] ?? Admin;

                return (
                  <SidebarNavLink
                    key={item.id}
                    item={item}
                    icon={<Icon />}
                    isCollapsed={isCollapsed}
                    onNavigate={closeMobileDrawer}
                  />
                );
              })}
            </div>
          ) : null}

          <NavDivider />

          {!isCollapsed ? <NavSectionHeader>Settings</NavSectionHeader> : null}
          <SettingsNavGroup isCollapsed={isCollapsed} />
        </NavDrawerBody>
      </NavDrawer>
    </div>
  );
}
