"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  WELCOME_MESSAGE,
  fetchSupportChat,
  mapRealtimeChatMessage,
  sendSupportChatMessage,
  type SupportChatAttachment,
  type SupportChatMessage,
} from "@/lib/supportChat";

type UseSupportChatOptions = {
  userId?: string;
  enabled?: boolean;
};

function mergeMessages(
  current: SupportChatMessage[],
  incoming: SupportChatMessage[]
) {
  const map = new Map<string, SupportChatMessage>();

  for (const message of current) {
    map.set(message.id, message);
  }

  for (const message of incoming) {
    map.set(message.id, message);
  }

  return Array.from(map.values());
}

export function useSupportChat({ userId, enabled = true }: UseSupportChatOptions) {
  const [messages, setMessages] = useState<SupportChatMessage[]>([WELCOME_MESSAGE]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadChat = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchSupportChat();

    if (result.data) {
      setSessionId(result.data.sessionId);
      setMessages(
        result.data.messages.length > 0
          ? result.data.messages
          : [WELCOME_MESSAGE]
      );
    }

    setError(result.error);
    setLoading(false);
  }, [enabled, userId]);

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!supabase || !enabled || !userId || !sessionId) {
      setIsLive(false);
      return;
    }

    const channel = supabase
      .channel(`support-chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const row = payload.new as {
            id: string;
            role: "user" | "support";
            message: string;
            metadata?: Record<string, unknown> | null;
            created_at: string;
          };

          const mapped = mapRealtimeChatMessage(row);
          setMessages((current) => mergeMessages(current, [mapped]));
          setIsTyping(false);
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      setIsLive(false);
      if (channelRef.current && supabase) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, sessionId, userId]);

  const sendMessage = useCallback(
    async (text: string, attachments: SupportChatAttachment[] = []) => {
      if (!userId || isSending) return { error: "Unable to send message." };

      const trimmed = text.trim();
      if (!trimmed && attachments.length === 0) {
        return { error: null };
      }

      setIsSending(true);
      setIsTyping(true);
      setError(null);

      const result = await sendSupportChatMessage({
        message: trimmed || "Shared attachments",
        attachments,
      });

      if (result.error) {
        setError(result.error);
        setIsTyping(false);
        setIsSending(false);
        return { error: result.error };
      }

      if (result.data) {
        setSessionId(result.data.sessionId);
        setMessages((current) => mergeMessages(current, result.data!.messages));
      }

      setIsTyping(false);
      setIsSending(false);
      return { error: null };
    },
    [isSending, userId]
  );

  return {
    messages,
    loading,
    isSending,
    isTyping,
    error,
    isLive,
    reload: loadChat,
    sendMessage,
  };
}
