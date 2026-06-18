import { z } from "zod";
import { createAnonClient } from "../lib/supabase.js";
import { createNotification } from "./notificationsService.js";
import { HttpError } from "../middleware/errorHandler.js";
import type {
  AdminChatMessage,
  AdminChatSession,
  AdminStats,
  AdminUser,
} from "../types/admin.js";

function userClient(accessToken: string) {
  return createAnonClient(accessToken);
}

export async function getAdminStats(accessToken: string): Promise<AdminStats> {
  const client = userClient(accessToken);

  const [
    profilesResult,
    ticketsResult,
    sessionsResult,
    messagesResult,
  ] = await Promise.all([
    client.from("profiles").select("role", { count: "exact", head: false }),
    client.from("support_tickets").select("status"),
    client.from("support_chat_sessions").select("status"),
    client.from("support_chat_messages").select("id", { count: "exact", head: true }),
  ]);

  if (profilesResult.error) {
    throw new HttpError(500, profilesResult.error.message);
  }
  if (ticketsResult.error) {
    throw new HttpError(500, ticketsResult.error.message);
  }
  if (sessionsResult.error) {
    throw new HttpError(500, sessionsResult.error.message);
  }
  if (messagesResult.error) {
    throw new HttpError(500, messagesResult.error.message);
  }

  const profiles = profilesResult.data ?? [];
  const tickets = ticketsResult.data ?? [];
  const sessions = sessionsResult.data ?? [];

  return {
    totalUsers: profiles.length,
    adminUsers: profiles.filter((row) => row.role === "admin").length,
    totalTickets: tickets.length,
    openTickets: tickets.filter((row) => row.status === "Open").length,
    inProgressTickets: tickets.filter((row) => row.status === "In Progress").length,
    resolvedTickets: tickets.filter((row) => row.status === "Resolved").length,
    openChatSessions: sessions.filter((row) => row.status === "open").length,
    totalChatMessages: messagesResult.count ?? 0,
  };
}

export async function listAdminUsers(accessToken: string): Promise<AdminUser[]> {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string | null,
    fullName: row.full_name as string | null,
    walletAddress: row.wallet_address as string | null,
    role: row.role as "user" | "admin",
    createdAt: row.created_at as string,
  }));
}

export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export async function updateUserRole(
  accessToken: string,
  userId: string,
  role: "user" | "admin"
) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new HttpError(500, error?.message ?? "Failed to update user role.");
  }

  return {
    id: data.id as string,
    email: data.email as string | null,
    fullName: data.full_name as string | null,
    walletAddress: data.wallet_address as string | null,
    role: data.role as "user" | "admin",
    createdAt: data.created_at as string,
  } satisfies AdminUser;
}

export async function listAdminChatSessions(
  accessToken: string
): Promise<AdminChatSession[]> {
  const client = userClient(accessToken);

  const { data: sessions, error } = await client
    .from("support_chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new HttpError(500, error.message);
  }

  if (!sessions?.length) {
    return [];
  }

  const userIds = sessions.map((session) => session.user_id as string);
  const sessionIds = sessions.map((session) => session.id as string);

  const [profilesResult, messagesResult] = await Promise.all([
    client.from("profiles").select("id, email, full_name").in("id", userIds),
    client
      .from("support_chat_messages")
      .select("session_id, message, created_at")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: false }),
  ]);

  if (profilesResult.error) {
    throw new HttpError(500, profilesResult.error.message);
  }
  if (messagesResult.error) {
    throw new HttpError(500, messagesResult.error.message);
  }

  const profileById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id as string, profile])
  );

  const latestBySession = new Map<
    string,
    { message: string; created_at: string }
  >();
  const messageCounts = new Map<string, number>();

  for (const message of messagesResult.data ?? []) {
    const sessionId = message.session_id as string;
    messageCounts.set(sessionId, (messageCounts.get(sessionId) ?? 0) + 1);

    if (!latestBySession.has(sessionId)) {
      latestBySession.set(sessionId, {
        message: message.message as string,
        created_at: message.created_at as string,
      });
    }
  }

  return sessions.map((session) => {
    const profile = profileById.get(session.user_id as string);
    const latest = latestBySession.get(session.id as string);

    return {
      id: session.id as string,
      userId: session.user_id as string,
      userEmail: (profile?.email as string | null) ?? null,
      userName: (profile?.full_name as string | null) ?? null,
      status: session.status as "open" | "closed",
      messageCount: messageCounts.get(session.id as string) ?? 0,
      lastMessageAt: latest?.created_at ?? null,
      lastMessagePreview: latest?.message ?? null,
      updatedAt: session.updated_at as string,
    };
  });
}

export async function getAdminChatMessages(
  accessToken: string,
  sessionId: string
): Promise<AdminChatMessage[]> {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("support_chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as "user" | "support",
    text: row.message as string,
    createdAt: row.created_at as string,
    time: new Date(row.created_at as string).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  }));
}

export const adminChatReplySchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

export async function sendAdminChatReply(
  accessToken: string,
  adminUserId: string,
  sessionId: string,
  message: string
) {
  const client = userClient(accessToken);

  const { data: session, error: sessionError } = await client
    .from("support_chat_sessions")
    .select("id, user_id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    throw new HttpError(500, sessionError.message);
  }

  if (!session) {
    throw new HttpError(404, "Chat session not found.");
  }

  const { data: supportMessage, error } = await client
    .from("support_chat_messages")
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      role: "support",
      message,
      metadata: { admin_id: adminUserId },
    })
    .select("*")
    .single();

  if (error || !supportMessage) {
    throw new HttpError(500, error?.message ?? "Failed to send reply.");
  }

  await client
    .from("support_chat_sessions")
    .update({ status: "open", updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  await createNotification(accessToken, session.user_id as string, {
    title: "Morfinance Support replied",
    message,
    type: "support",
    href: "support-chat",
  });

  return {
    id: supportMessage.id as string,
    role: "support" as const,
    text: supportMessage.message as string,
    createdAt: supportMessage.created_at as string,
    time: new Date(supportMessage.created_at as string).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  } satisfies AdminChatMessage;
}
