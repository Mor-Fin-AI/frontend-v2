import { MenuItem } from "@/layout/VerticalNavigationBar/menu";

export const clientSidebarMenu: MenuItem[] = [
  {
    id: "client-dsa",
    label: "DSA Account",
    href: "/client/dsa-account",
    icon: "bank",
  },
  {
    id: "client-overview",
    label: "Client Overview",
    href: "/client/overview",
    icon: "dashboard",
  },
];
