import { apiRequest } from "@/lib/apiClient";
import type { NotificationItem, NotificationType } from "@/layout/TopNavigatoionBar/data/notifications";

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

function mapNotification(item: ApiNotification): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.read,
    time: item.time,
    href: item.href ?? undefined,
  };
}

export async function fetchNotifications() {
  const result = await apiRequest<{ notifications: ApiNotification[] }>(
    "/notifications"
  );

  return {
    data: result.data?.notifications.map(mapNotification) ?? [],
    error: result.error,
  };
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<{ ok: boolean }>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return apiRequest<{ ok: boolean }>("/notifications/read-all", {
    method: "PATCH",
  });
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function mapRealtimeNotification(row: {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  href?: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    href: row.href ?? undefined,
    time: formatRelativeTime(row.created_at),
  };
}
