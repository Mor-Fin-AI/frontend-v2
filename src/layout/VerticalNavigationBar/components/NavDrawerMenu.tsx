"use client";

import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Hamburger,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
  useRestoreFocusTarget,
  type NavItemValue,
  type OnNavItemSelectData,
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
  navHrefByValue,
  navSections,
  resolveNavSelection,
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
    "& .fui-NavItem": {
      backgroundColor: "transparent",
      color: "var(--sidebar-foreground)",
      transitionProperty: "background-color, color",
      transitionDuration: tokens.durationFaster,
      transitionTimingFunction: tokens.curveLinear,
      ":hover": {
        backgroundColor: "var(--sidebar-accent)",
        color: "var(--sidebar-accent-foreground)",
      },
      ":active": {
        backgroundColor: "var(--sidebar-accent)",
      },
    },
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
    "& .fui-NavItem": {
      justifyContent: "center",
      minWidth: "40px",
      paddingLeft: tokens.spacingHorizontalXS,
      paddingRight: tokens.spacingHorizontalXS,
    },
    "& .fui-NavItem__icon": {
      marginRight: 0,
    },
  },
  header: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
});

function NavDrawerLink({
  label,
  icon,
  value,
  href,
  isCollapsed,
  onNavigate,
}: {
  label: string;
  icon: ReactElement;
  value: NavItemValue;
  href: string;
  isCollapsed: boolean;
  onNavigate: (href: string) => void;
}) {
  const item = (
    <NavItem
      icon={icon}
      value={value}
      aria-label={isCollapsed ? label : undefined}
      onClick={() => onNavigate(href)}
    >
      {isCollapsed ? null : label}
    </NavItem>
  );

  if (!isCollapsed) {
    return item;
  }

  return (
    <Tooltip
      content={label}
      relationship="label"
      positioning="after"
      withArrow
    >
      {item}
    </Tooltip>
  );
}

export default function NavDrawerMenu() {
  const styles = useStyles();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { isAdmin } = useAuth();
  const { open, collapsed, close, toggle, toggleCollapsed } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const restoreFocusTargetAttributes = useRestoreFocusTarget();

  const isCollapsed = collapsed && isLargeScreen;
  const { selectedValue } = resolveNavSelection(pathname);
  const drawerOpen = isLargeScreen ? true : open;
  const drawerType = isLargeScreen ? "inline" : "overlay";

  const goTo = (href: string) => {
    if (pathname !== href) {
      navigate(href);
    }
    if (!isLargeScreen) {
      close();
    }
  };

  const handleNavSelect = (_: unknown, data: OnNavItemSelectData) => {
    const href = navHrefByValue[String(data.value)];
    if (href) {
      goTo(href);
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
        onNavItemSelect={handleNavSelect}
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
                  <NavDrawerLink
                    key={item.id}
                    label={item.label}
                    icon={<Icon />}
                    value={item.value}
                    href={item.href}
                    isCollapsed={isCollapsed}
                    onNavigate={goTo}
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
                  <NavDrawerLink
                    key={item.id}
                    label={item.label}
                    icon={<Icon />}
                    value={item.value}
                    href={item.href}
                    isCollapsed={isCollapsed}
                    onNavigate={goTo}
                  />
                );
              })}
            </div>
          ) : null}

          <NavDivider />

          {!isCollapsed ? <NavSectionHeader>Settings</NavSectionHeader> : null}
          <SettingsNavGroup onNavigate={goTo} isCollapsed={isCollapsed} />
        </NavDrawerBody>
      </NavDrawer>
    </div>
  );
}
