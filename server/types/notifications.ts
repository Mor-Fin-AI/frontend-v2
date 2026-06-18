export type NotificationType =
  | "learning"
  | "governance"
  | "reward"
  | "system"
  | "support";

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  href: string | null;
  created_at: string;
}

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  href?: string | null;
  createdAt: string;
  time: string;
}

export interface SupportChatSessionRow {
  id: string;
  user_id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

export interface SupportChatMessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "support";
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiSupportChatMessage {
  id: string;
  role: "user" | "support";
  text: string;
  time: string;
  attachments?: Array<{
    name: string;
    kind: "file" | "image";
  }>;
}
