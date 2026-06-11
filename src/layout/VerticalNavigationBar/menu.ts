// import { MenuItem } from "@/types";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string; 
}

export const sidebarMenu: MenuItem[] = [
  {
    id: "overview",
    label: "Platform Overview ",
    href: "/overview",
    icon: "dashboard",
  },
  {
    id: "rewards",
    label: "Account Credits",
    href: "/my-rewards",
    icon: "rewards",
  },
  {
    id: "dao",
    label: "Protocol Configuration",
    href: "/dao-activities",
    icon: "dao",
  },
  {
    id: "infrastructure",
    label: "System Health & Performance",
    href: "/infrastructure-impact",
    icon: "infrastructure",
  },
//   {
//     id: "dao",
//     label: "DAO & Rewards",
//     href: "/dao-rewards",
//     icon: "gift",
//   },
//   {
//     id: "infrastructure",
//     label: "Infrastructure",
//     href: "/infrastructure",
//     icon: "server",
//   },
  {
    id: "governance",
    label: "Governance",
    href: "/governance",
    icon: "bank",
  },
  {
    id: "audit",
    label: "Platform Activity Logs",
    href: "/audit-logs",
    icon: "file",
  },
  {
    id: "pricing",
    label: "Pricing & Billing",
    href: "/pricing",
    icon: "pricing",
  },
];
