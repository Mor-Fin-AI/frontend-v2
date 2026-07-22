import { z } from "zod";
import { createAnonClient } from "../lib/supabase.js";
import { HttpError } from "../middleware/errorHandler.js";
import type {
  ApiNotification,
  ApiSupportChatMessage,
  NotificationRow,
  NotificationType,
  SupportChatMessageRow,
} from "../types/notifications.js";

function userClient(accessToken: string) {
  return createAnonClient(accessToken);
}

function formatRelativeTime(iso: string) {
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

function mapNotification(row: NotificationRow): ApiNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    href: row.href,
    createdAt: row.created_at,
    time: formatRelativeTime(row.created_at),
  };
}

export async function listNotifications(accessToken: string, userId: string) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []).map((row) => mapNotification(row as NotificationRow));
}

export async function createNotification(
  accessToken: string,
  userId: string,
  input: {
    title: string;
    message: string;
    type: NotificationType;
    href?: string | null;
  }
) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("notifications")
    .insert({
      user_id: userId,
      title: input.title,
      message: input.message,
      type: input.type,
      href: input.href ?? null,
      read: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new HttpError(500, error?.message ?? "Failed to create notification.");
  }

  return mapNotification(data as NotificationRow);
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: string
) {
  const client = userClient(accessToken);
  const { error } = await client
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    throw new HttpError(500, error.message);
  }
}

export async function markAllNotificationsRead(accessToken: string, userId: string) {
  const client = userClient(accessToken);
  const { error } = await client
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    throw new HttpError(500, error.message);
  }
}

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  attachments: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        kind: z.enum(["file", "image"]),
      })
    )
    .max(3)
    .optional(),
});

const SUPPORT_ACK =
  "Thanks for reaching out to Morfinance Support. A specialist will follow up shortly. For urgent wallet issues, include your DSA account ID.";

async function getOrCreateSession(accessToken: string, userId: string) {
  const client = userClient(accessToken);

  const { data: existing, error: readError } = await client
    .from("support_chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new HttpError(500, readError.message);
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await client
    .from("support_chat_sessions")
    .insert({ user_id: userId, status: "open" })
    .select("*")
    .single();

  if (error || !data) {
    throw new HttpError(500, error?.message ?? "Failed to create chat session.");
  }

  return data;
}

function mapChatMessage(row: SupportChatMessageRow): ApiSupportChatMessage {
  const metadata = row.metadata ?? {};
  const attachments = Array.isArray(metadata.attachments)
    ? (metadata.attachments as ApiSupportChatMessage["attachments"])
    : undefined;

  return {
    id: row.id,
    role: row.role,
    text: row.message,
    time: new Date(row.created_at).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    attachments,
  };
}

export async function getSupportChat(accessToken: string, userId: string) {
  const session = await getOrCreateSession(accessToken, userId);
  const client = userClient(accessToken);

  const { data, error } = await client
    .from("support_chat_messages")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new HttpError(500, error.message);
  }

  const messages = (data ?? []).map((row) =>
    mapChatMessage(row as SupportChatMessageRow)
  );

  return {
    sessionId: session.id as string,
    messages,
  };
}

export async function sendSupportChatMessage(
  accessToken: string,
  userId: string,
  input: z.infer<typeof sendMessageSchema>
) {
  const session = await getOrCreateSession(accessToken, userId);
  const client = userClient(accessToken);

  const composedMessage =
    input.attachments?.length
      ? `${input.message}\n\n${input.attachments
          .map((item) => `[Attached ${item.kind}: ${item.name}]`)
          .join("\n")}`
      : input.message;

  const { data: userMessage, error: userError } = await client
    .from("support_chat_messages")
    .insert({
      session_id: session.id,
      user_id: userId,
      role: "user",
      message: composedMessage,
      metadata: { attachments: input.attachments ?? [] },
    })
    .select("*")
    .single();

  if (userError || !userMessage) {
    throw new HttpError(500, userError?.message ?? "Failed to send message.");
  }

  await createNotification(accessToken, userId, {
    title: "Message sent to Morfinance Support",
    message: "Your support chat message was received.",
    type: "support",
    href: "support-chat",
  });

  const { data: supportMessage, error: supportError } = await client
    .from("support_chat_messages")
    .insert({
      session_id: session.id,
      user_id: userId,
      role: "support",
      message: SUPPORT_ACK,
      metadata: { automated: true },
    })
    .select("*")
    .single();

  if (supportError || !supportMessage) {
    throw new HttpError(500, supportError?.message ?? "Failed to send support reply.");
  }

  await createNotification(accessToken, userId, {
    title: "Morfinance Support replied",
    message: SUPPORT_ACK,
    type: "support",
    href: "support-chat",
  });

  return {
    sessionId: session.id as string,
    messages: [
      mapChatMessage(userMessage as SupportChatMessageRow),
      mapChatMessage(supportMessage as SupportChatMessageRow),
    ],
  };
}
