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
    label: "Overview",
    href: "/overview",
    icon: "dashboard",
  },
  {
    id: "rewards",
    label: "My Rewards",
    href: "/my-rewards",
    icon: "rewards",
  },
  {
    id: "dao",
    label: "Dao Activities",
    href: "/dao-activities",
    icon: "dao",
  },
  {
    id: "infrastructure",
    label: "Infrastructure Impact",
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
    label: "Audit Logs",
    href: "/audit-logs",
    icon: "file",
  },
];
