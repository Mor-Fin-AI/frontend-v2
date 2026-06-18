export type NotificationType =
  | "learning"
  | "governance"
  | "reward"
  | "system";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  href?: string;
}

export const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Module completed",
    message: "You finished Infrastructure Fundamentals — Module 4.",
    time: "5m ago",
    type: "learning",
    read: false,
    href: "/overview",
  },
  {
    id: "2",
    title: "New governance proposal",
    message: "Community Training Budget Q2 is open for voting.",
    time: "1h ago",
    type: "governance",
    read: false,
    href: "/overview",
  },
  {
    id: "3",
    title: "Reward credited",
    message: "12.5 MOR tokens added to your learning rewards.",
    time: "Yesterday",
    type: "reward",
    read: false,
    href: "/overview",
  },
  {
    id: "4",
    title: "Wallet synced",
    message: "Your connected wallet was linked to your DSA account.",
    time: "2 days ago",
    type: "system",
    read: true,
    href: "/overview",
  },
  {
    id: "5",
    title: "Assessment reminder",
    message: "Quality Assessment Training is due in 3 days.",
    time: "3 days ago",
    type: "learning",
    read: true,
    href: "/overview",
  },
];

export const TYPE_LABELS: Record<NotificationType, string> = {
  learning: "Learning",
  governance: "Governance",
  reward: "Reward",
  system: "System",
};

export const TYPE_COLORS: Record<NotificationType, string> = {
  learning: "#8C47D1",
  governance: "#30ABE8",
  reward: "#22C38E",
  system: "#F69E23",
};
