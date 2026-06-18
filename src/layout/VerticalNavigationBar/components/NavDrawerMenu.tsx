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
  Money20Filled,
  Money20Regular,
  People20Filled,
  People20Regular,
  Settings20Filled,
  Settings20Regular,
  bundleIcon,
} from "@fluentui/react-icons";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";
import {
  navHrefByValue,
  navSections,
  resolveNavSelection,
  settingsNavItem,
} from "../navConfig";

const Dashboard = bundleIcon(Board20Filled, Board20Regular);
const Arbitrage = bundleIcon(ArrowSwap20Filled, ArrowSwap20Regular);
const Rewards = bundleIcon(People20Filled, People20Regular);
const Bank = bundleIcon(BuildingBank20Filled, BuildingBank20Regular);
const Infrastructure = bundleIcon(Box20Filled, Box20Regular);
const Fee = bundleIcon(Money20Filled, Money20Regular);
const Settings = bundleIcon(Settings20Filled, Settings20Regular);

const navIconMap = {
  dashboard: Dashboard,
  arbitrage: Arbitrage,
  rewards: Rewards,
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

          <NavDivider />

          <NavItem icon={<Settings />} value={settingsNavItem.value}>
            {settingsNavItem.label}
          </NavItem>
        </NavDrawerBody>
      </NavDrawer>
    </div>
  );
}
