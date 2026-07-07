"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { useSidebar } from "@/context/SidebarContext";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";
import {
  ArrowSwap24Regular,
  Board24Regular,
  Bot24Regular,
  Box24Regular,
  BuildingBank24Regular,
  DocumentText24Regular,
  Home24Regular,
  Money24Regular,
  Server24Regular,
  Vote24Regular,
  Wallet24Regular,
} from "@fluentui/react-icons";
import { MenuItem } from "../menu";
import { RewardIcon } from "../../../../public/Svg/sidebar/RewardIcon";
import { DaoIcon } from "../../../../public/Svg/sidebar/DaoIcon";

const iconMap = {
  home: Home24Regular,
  dashboard: Board24Regular,
  dsa: Wallet24Regular,
  arbitrage: ArrowSwap24Regular,
  agents: Bot24Regular,
  rewards: RewardIcon,
  dao: DaoIcon,
  infrastructure: Box24Regular,
  server: Server24Regular,
  bank: BuildingBank24Regular,
  file: DocumentText24Regular,
  governance: Vote24Regular,
  pricing: Money24Regular,
  fee: Money24Regular,
};

const useStyles = makeStyles({
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  navCollapsed: {
    gap: tokens.spacingVerticalM,
  },
  link: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground3,
    textDecoration: "none",
    transitionProperty: "color, background-color",
    transitionDuration: "200ms",
    ":hover": {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  linkExpanded: {
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  linkCollapsed: {
    justifyContent: "center",
    padding: tokens.spacingVerticalS,
    width: "40px",
    height: "40px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  linkActive: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    color: tokens.colorNeutralForeground1,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Selected,
      color: tokens.colorNeutralForeground1,
    },
  },
  icon: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
  iconActive: {
    color: tokens.colorBrandBackground,
  },
  activeDot: {
    marginLeft: "auto",
    width: "6px",
    height: "6px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground,
    boxShadow: `0 0 8px ${tokens.colorBrandBackground}`,
    flexShrink: 0,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: "20px",
    width: "4px",
    borderTopRightRadius: tokens.borderRadiusCircular,
    borderBottomRightRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground,
    boxShadow: `0 0 8px ${tokens.colorBrandBackground}`,
  },
});

function MenuLink({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const styles = useStyles();
  const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? undefined : item.label}
      className={mergeClasses(
        styles.link,
        collapsed ? styles.linkCollapsed : styles.linkExpanded,
        isActive && styles.linkActive
      )}
    >
      {isActive && collapsed && <span className={styles.activeBar} />}

      {Icon && (
        <Icon
          className={mergeClasses(styles.icon, isActive && styles.iconActive)}
        />
      )}

      {!collapsed && <span className="truncate">{item.label}</span>}

      {isActive && !collapsed && <span className={styles.activeDot} />}
    </Link>
  );
}

export default function AppMenu({ items }: { items: MenuItem[] }) {
  const pathname = useLocation().pathname;
  const { collapsed, close } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const isCollapsed = collapsed && isLargeScreen;
  const styles = useStyles();

  return (
    <nav className={mergeClasses(styles.nav, isCollapsed && styles.navCollapsed)}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        const link = (
          <MenuLink
            item={item}
            isActive={isActive}
            collapsed={isCollapsed}
            onNavigate={close}
          />
        );

        if (!isCollapsed) {
          return <div key={item.id}>{link}</div>;
        }

        return (
          <Tooltip
            key={item.id}
            content={item.label}
            relationship="label"
            positioning="after"
            withArrow
          >
            {link}
          </Tooltip>
        );
      })}
    </nav>
  );
}
