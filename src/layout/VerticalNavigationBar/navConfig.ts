import type { NavItemValue } from "@fluentui/react-components";

export interface NavLink {
  id: string;
  label: string;
  href: string;
  value: NavItemValue;
  icon: string;
}

export interface NavSection {
  header?: string;
  items: NavLink[];
}

export const navSections: NavSection[] = [
  {
    header: "Treasury & Finance",
    items: [
      {
        id: "treasury-flow",
        label: "Treasury Flow",
        href: "/overview",
        value: "treasury-flow",
        icon: "dashboard",
      },
      {
        id: "arbitrage-monitor",
        label: "Arbitrage Monitor",
        href: "/arbitrage-monitor",
        value: "arbitrage-monitor",
        icon: "arbitrage",
      },
      {
        id: "fee-integration",
        label: "Fee Integration",
        href: "/fee-integration",
        value: "fee-integration",
        icon: "pricing",
      },
    ],
  },
  {
    header: "Programs & Lending",
    items: [
      {
        id: "dao-education-rewards",
        label: "DAO Education Rewards",
        href: "/dao-education-rewards",
        value: "dao-education-rewards",
        icon: "rewards",
      },
      {
        id: "lending-debt-discharge",
        label: "Lending & Debt Discharge",
        href: "/lending-debt-discharge",
        value: "lending-debt-discharge",
        icon: "bank",
      },
    ],
  },
  {
    header: "Operations",
    items: [
      {
        id: "infrastructure-deployment",
        label: "Infrastructure Tracker",
        href: "/infrastructure-deployment",
        value: "infrastructure-deployment",
        icon: "infrastructure",
      },
    ],
  },
];

export const settingsNavItem: NavLink = {
  id: "settings",
  label: "Settings",
  href: "/settings",
  value: "settings",
  icon: "settings",
};

export const allNavLinks: NavLink[] = [
  ...navSections.flatMap((section) => section.items),
  settingsNavItem,
];

export const navHrefByValue: Record<string, string> = Object.fromEntries(
  allNavLinks.map((item) => [item.value, item.href])
);

export function resolveNavSelection(pathname: string): {
  selectedValue?: NavItemValue;
} {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const match = allNavLinks.find((item) => item.href === normalized);
  return match ? { selectedValue: match.value } : {};
}
