"use client";

import { useLocation, useNavigate } from "react-router-dom";
import {
  AppItem,
  Hamburger,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  Tooltip,
  makeStyles,
  tokens,
  useRestoreFocusTarget,
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
  settingsNavItems,
} from "../navConfig";
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
    "& .fui-NavItem, & .fui-AppItem": {
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
  header: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
});

function BrandIcon() {
  return (
    <img
      src="/sidebar/side-logo.png"
      alt=""
      aria-hidden
      className="h-8 w-8 rounded-md object-contain"
      draggable={false}
    />
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

  const { selectedValue } = resolveNavSelection(pathname);
  const drawerOpen = isLargeScreen ? !collapsed : open;
  const drawerType = isLargeScreen ? "inline" : "overlay";

  const handleNavSelect = (_: unknown, data: OnNavItemSelectData) => {
    const href = navHrefByValue[data.value];
    if (href) {
      navigate(href);
      if (!isLargeScreen) {
        close();
      }
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
        className={styles.drawer}
      >
        <NavDrawerHeader className={styles.header}>
          <Tooltip content="Toggle navigation" relationship="label">
            <Hamburger
              onClick={handleToggle}
              {...restoreFocusTargetAttributes}
              aria-expanded={drawerOpen}
            />
          </Tooltip>
        </NavDrawerHeader>

        <NavDrawerBody>
          <AppItem icon={<BrandIcon />} onClick={() => navigate("/overview")}>
            Morfinance
          </AppItem>

          {navSections.map((section) => (
            <div key={section.header ?? "root"}>
              {section.header ? (
                <NavSectionHeader>{section.header}</NavSectionHeader>
              ) : null}

              {section.items.map((item) => {
                const Icon =
                  navIconMap[item.icon as keyof typeof navIconMap] ?? Dashboard;

                return (
                  <NavItem key={item.id} icon={<Icon />} value={item.value}>
                    {item.label}
                  </NavItem>
                );
              })}
            </div>
          ))}

          {isAdmin ? (
            <div>
              <NavSectionHeader>Admin</NavSectionHeader>
              {adminNavItems.map((item) => {
                const Icon =
                  navIconMap[item.icon as keyof typeof navIconMap] ?? Admin;

                return (
                  <NavItem key={item.id} icon={<Icon />} value={item.value}>
                    {item.label}
                  </NavItem>
                );
              })}
            </div>
          ) : null}

          <NavDivider />

          <NavSectionHeader>Settings</NavSectionHeader>
          {settingsNavItems.map((item) => {
            const Icon =
              navIconMap[item.icon as keyof typeof navIconMap] ?? Settings;

            return (
              <NavItem key={item.id} icon={<Icon />} value={item.value}>
                {item.label}
              </NavItem>
            );
          })}
        </NavDrawerBody>
      </NavDrawer>
    </div>
  );
}
