// import { MenuItem } from "@/types";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

export const sidebarMenu: MenuItem[] = [
  {
    id: "treasury-flow",
    label: "Treasury Flow",
    href: "/overview",
    icon: "dashboard",
  },
  {
    id: "arbitrage-monitor",
    label: "Arbitrage Monitor",
    href: "/arbitrage-monitor",
    icon: "arbitrage",
  },
  {
    id: "dao-education-rewards",
    label: "DAO Education Rewards",
    href: "/dao-education-rewards",
    icon: "rewards",
  },
  {
    id: "lending-debt-discharge",
    label: "Lending & Debt Discharge",
    href: "/lending-debt-discharge",
    icon: "bank",
  },
  {
    id: "infrastructure-deployment",
    label: "Infrastructure Tracker",
    href: "/infrastructure-deployment",
    icon: "infrastructure",
  },
  {
    id: "fee-integration",
    label: "Fee Integration",
    href: "/fee-integration",
    icon: "pricing",
  },
];
