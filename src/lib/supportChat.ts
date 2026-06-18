import { supabase } from "@/lib/supabase";

export type SupportChatAttachment = {
  name: string;
  kind: "file" | "image";
};

export type SupportChatMessage = {
  id: string;
  role: "user" | "support";
  text: string;
  time: string;
  attachments?: Array<SupportChatAttachment & { previewUrl?: string }>;
};

export const WELCOME_MESSAGE: SupportChatMessage = {
  id: "welcome",
  role: "support",
  text: "Hi there! How can Morfinance Support help with your dashboard today?",
  time: "Just now",
};

const SUPPORT_ACK =
  "Thanks for reaching out to Morfinance Support. A specialist will follow up shortly. For urgent wallet issues, include your DSA account ID.";

function mapSetupError(message: string) {
  if (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("42P01")
  ) {
    return "Support chat tables are missing. Run Supabase migrations 001–003 in your project.";
  }

  return message;
}

async function requireAuthUser() {
  if (!supabase) {
    return { user: null, error: "Supabase is not configured." as const };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { user: null, error: "You must be signed in." as const };
  }

  return { user: session.user, error: null };
}

async function getOrCreateChatSession(userId: string) {
  if (!supabase) {
    return { session: null, error: "Supabase is not configured." };
  }

  const { data: existing, error: readError } = await supabase
    .from("support_chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    return { session: null, error: mapSetupError(readError.message) };
  }

  if (existing) {
    return { session: existing, error: null };
  }

  const { data, error } = await supabase
    .from("support_chat_sessions")
    .insert({ user_id: userId, status: "open" })
    .select("id")
    .single();

  if (error || !data) {
    return {
      session: null,
      error: mapSetupError(error?.message ?? "Failed to create chat session."),
    };
  }

  return { session: data, error: null };
}

async function createSupportNotification(
  userId: string,
  title: string,
  message: string
) {
  if (!supabase) return;

  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type: "support",
    href: "support-chat",
    read: false,
  });
}

export function mapRealtimeChatMessage(row: {
  id: string;
  role: "user" | "support";
  message: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}): SupportChatMessage {
  const metadata = row.metadata ?? {};
  const attachments = Array.isArray(metadata.attachments)
    ? (metadata.attachments as SupportChatAttachment[])
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

export async function fetchSupportChat() {
  const { user, error: authError } = await requireAuthUser();
  if (authError || !user) {
    return { data: null, error: authError };
  }

  const { session, error: sessionError } = await getOrCreateChatSession(user.id);
  if (sessionError || !session) {
    return { data: null, error: sessionError };
  }

  const { data, error } = await supabase!
    .from("support_chat_messages")
    .select("id, role, message, metadata, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: mapSetupError(error.message) };
  }

  return {
    data: {
      sessionId: session.id,
      messages: (data ?? []).map(mapRealtimeChatMessage),
    },
    error: null,
  };
}

export async function sendSupportChatMessage(input: {
  message: string;
  attachments?: SupportChatAttachment[];
}) {
  const trimmed = input.message.trim();
  if (!trimmed && !(input.attachments?.length ?? 0)) {
    return { data: null, error: "Message cannot be empty." };
  }

  const { user, error: authError } = await requireAuthUser();
  if (authError || !user) {
    return { data: null, error: authError };
  }

  const { session, error: sessionError } = await getOrCreateChatSession(user.id);
  if (sessionError || !session) {
    return { data: null, error: sessionError };
  }

  const composedMessage = input.attachments?.length
    ? `${trimmed || "Shared attachments"}\n\n${input.attachments
        .map((item) => `[Attached ${item.kind}: ${item.name}]`)
        .join("\n")}`
    : trimmed;

  const { data: userMessage, error: userError } = await supabase!
    .from("support_chat_messages")
    .insert({
      session_id: session.id,
      user_id: user.id,
      role: "user",
      message: composedMessage,
      metadata: { attachments: input.attachments ?? [] },
    })
    .select("id, role, message, metadata, created_at")
    .single();

  if (userError || !userMessage) {
    return {
      data: null,
      error: mapSetupError(userError?.message ?? "Failed to send message."),
    };
  }

  await createSupportNotification(
    user.id,
    "Message sent to Morfinance Support",
    "Your support chat message was received."
  );

  const { data: supportMessage, error: supportError } = await supabase!
    .from("support_chat_messages")
    .insert({
      session_id: session.id,
      user_id: user.id,
      role: "support",
      message: SUPPORT_ACK,
      metadata: { automated: true },
    })
    .select("id, role, message, metadata, created_at")
    .single();

  if (supportError || !supportMessage) {
    return {
      data: {
        sessionId: session.id,
        messages: [mapRealtimeChatMessage(userMessage)],
      },
      error: null,
    };
  }

  await createSupportNotification(
    user.id,
    "Morfinance Support replied",
    SUPPORT_ACK
  );

  return {
    data: {
      sessionId: session.id,
      messages: [
        mapRealtimeChatMessage(userMessage),
        mapRealtimeChatMessage(supportMessage),
      ],
    },
    error: null,
  };
}
