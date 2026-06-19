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
    header: "Home",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        value: "dashboard",
        icon: "home",
      },
      {
        id: "dsa-account",
        label: "DSA Account",
        href: "/dsa-account",
        value: "dsa-account",
        icon: "dsa",
      },
      {
        id: "pricing",
        label: "Pricing",
        href: "/pricing",
        value: "pricing",
        icon: "pricing",
      },
    ],
  },
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
        icon: "fee",
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
        id: "governance",
        label: "Governance",
        href: "/governance",
        value: "governance",
        icon: "governance",
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

export const adminNavItems: NavLink[] = [
  {
    id: "admin-overview",
    label: "Overview",
    href: "/admin",
    value: "admin-overview",
    icon: "admin",
  },
  {
    id: "admin-tickets",
    label: "Support Queue",
    href: "/admin/tickets",
    value: "admin-tickets",
    icon: "admin",
  },
  {
    id: "admin-users",
    label: "Users",
    href: "/admin/users",
    value: "admin-users",
    icon: "users",
  },
  {
    id: "admin-chat",
    label: "Support Chat",
    href: "/admin/chat",
    value: "admin-chat",
    icon: "chat",
  },
];

export const adminNavItem = adminNavItems[1];

export const settingsNavItems: NavLink[] = [
  {
    id: "settings-general",
    label: "General",
    href: "/settings/general",
    value: "settings-general",
    icon: "settings",
  },
  {
    id: "settings-support",
    label: "Support",
    href: "/settings/support",
    value: "settings-support",
    icon: "settings",
  },
  {
    id: "settings-audit-logs",
    label: "Audit Logs",
    href: "/settings/audit-logs",
    value: "settings-audit-logs",
    icon: "settings",
  },
];

export const settingsNavItem = settingsNavItems[0];

export const allNavLinks: NavLink[] = [
  ...navSections.flatMap((section) => section.items),
  ...adminNavItems,
  ...settingsNavItems,
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

  const match = [...allNavLinks]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        normalized === item.href || normalized.startsWith(`${item.href}/`)
    );
  return match ? { selectedValue: match.value } : {};
}

export function getAdminNavItems(isAdmin: boolean): NavLink[] {
  return isAdmin ? adminNavItems : [];
}
