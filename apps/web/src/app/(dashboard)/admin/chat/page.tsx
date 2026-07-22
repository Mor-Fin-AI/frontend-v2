"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  Caption1,
  Text,
  Textarea,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowUp24Filled,
  Chat24Regular,
} from "@fluentui/react-icons";
import {
  Chat,
  ChatMessage,
  ChatMyMessage,
} from "@fluentui-contrib/react-chat";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useScrollAnimation, fadeUpVariants } from "@/hooks/useScrollAnimation";
import {
  fetchAdminChatMessages,
  fetchAdminChatSessions,
  formatAdminDate,
  sendAdminChatReply,
  type AdminChatMessage,
  type AdminChatSession,
} from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { useAppToast } from "@/hooks/useAppToast";

const SUPPORT_AVATAR = (
  <Avatar name="Morfinance Support" badge={{ status: "available" }} />
);

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: tokens.spacingHorizontalL,
    minHeight: "520px",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "320px 1fr",
    },
  },
  sessions: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    maxHeight: "620px",
    overflowY: "auto",
  },
  sessionButton: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    width: "100%",
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--accent)",
    },
  },
  sessionActive: {
    borderTopColor: "var(--primary)",
    borderRightColor: "var(--primary)",
    borderBottomColor: "var(--primary)",
    borderLeftColor: "var(--primary)",
    backgroundColor: "color-mix(in srgb, var(--primary) 8%, var(--background))",
  },
  chatPanel: {
    display: "flex",
    flexDirection: "column",
    minHeight: "520px",
  },
  messages: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    overflowY: "auto",
    backgroundColor: "var(--background)",
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    minHeight: "360px",
    maxHeight: "460px",
  },
  composer: {
    display: "flex",
    alignItems: "flex-end",
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  textarea: {
    flex: 1,
    minHeight: "72px",
    resize: "vertical",
  },
  sendButton: {
    display: "grid",
    placeItems: "center",
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
    cursor: "pointer",
    ":disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
  empty: {
    textAlign: "center",
    color: "var(--muted-foreground)",
    padding: tokens.spacingHorizontalL,
  },
});

export default function AdminChatPage() {
  const styles = useStyles();
  const { ref, controls } = useScrollAnimation();
  const toast = useAppToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<AdminChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSession = sessions.find((item) => item.id === selectedSessionId);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    const result = await fetchAdminChatSessions();
    const nextSessions = result.data?.sessions ?? [];
    setSessions(nextSessions);
    if (result.error) {
      toast.error("Could not load chat sessions", result.error);
    }
    setError(result.error);

    if (!selectedSessionId && nextSessions.length > 0) {
      setSelectedSessionId(nextSessions[0].id);
    }

    setLoadingSessions(false);
  }, [selectedSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    setLoadingMessages(true);
    const result = await fetchAdminChatMessages(sessionId);
    setMessages(result.data?.messages ?? []);
    if (result.error) {
      setError(result.error);
      toast.error("Could not load messages", result.error);
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!selectedSessionId) return;
    void loadMessages(selectedSessionId);
  }, [loadMessages, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedSessionId]);

  useEffect(() => {
    if (!supabase || !selectedSessionId) return;

    const channel = supabase
      .channel(`admin-chat-${selectedSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_chat_messages",
          filter: `session_id=eq.${selectedSessionId}`,
        },
        () => {
          void loadMessages(selectedSessionId);
          void loadSessions();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadMessages, loadSessions, selectedSessionId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedSessionId || sending) return;

    setSending(true);
    setDraft("");
    const result = await sendAdminChatReply(selectedSessionId, text);
    setSending(false);

    if (result.error) {
      setError(result.error);
      toast.error("Message not sent", result.error);
      setDraft(text);
      return;
    }

    if (result.data?.message) {
      setMessages((current) => [...current, result.data!.message]);
      toast.success("Reply sent", "Your message was delivered to the user.");
    }

    void loadSessions();
    setError(null);
  };

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-col gap-6"
    >
      <PanelCard>
        <PanelCardTopBar>
          <PanelCardTopIcon>
            <Chat24Regular className="h-5 w-5 text-primary" />
          </PanelCardTopIcon>
        </PanelCardTopBar>
        <PanelCardHeader
          title="Morfinance Support Chat"
          description="Reply to user conversations in real time"
        />
        <PanelCardBody className={styles.layout}>
          <div className={mergeClasses(styles.sessions, "custom-scrollbar")}>
            {loadingSessions ? (
              <Caption1 className={styles.empty}>Loading sessions...</Caption1>
            ) : sessions.length === 0 ? (
              <Caption1 className={styles.empty}>No chat sessions yet.</Caption1>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={mergeClasses(
                    styles.sessionButton,
                    selectedSessionId === session.id && styles.sessionActive
                  )}
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <Text weight="semibold">
                    {session.userName || session.userEmail || session.userId}
                  </Text>
                  <Caption1>{session.userEmail ?? "No email"}</Caption1>
                  <Caption1>
                    {session.messageCount} messages ·{" "}
                    {session.lastMessageAt
                      ? formatAdminDate(session.lastMessageAt)
                      : "No activity"}
                  </Caption1>
                  <AppBadge tone="info" appearance="tint" size="small">
                    {session.status}
                  </AppBadge>
                </button>
              ))
            )}
          </div>

          <div className={styles.chatPanel}>
            {!selectedSession ? (
              <Caption1 className={styles.empty}>
                Select a chat session to view messages.
              </Caption1>
            ) : (
              <>
                <Text weight="semibold">
                  {selectedSession.userName ||
                    selectedSession.userEmail ||
                    selectedSession.userId}
                </Text>
                <Caption1 block className="mb-3 text-muted-foreground">
                  Session updated {formatAdminDate(selectedSession.updatedAt)}
                </Caption1>

                <div className={mergeClasses(styles.messages, "custom-scrollbar")}>
                  {loadingMessages ? (
                    <Caption1 className={styles.empty}>Loading messages...</Caption1>
                  ) : messages.length === 0 ? (
                    <Caption1 className={styles.empty}>No messages yet.</Caption1>
                  ) : (
                    <Chat>
                      {messages.map((message) =>
                        message.role === "support" ? (
                          <ChatMyMessage
                            key={message.id}
                            timestamp={<time>{message.time}</time>}
                          >
                            {message.text}
                          </ChatMyMessage>
                        ) : (
                          <ChatMessage
                            key={message.id}
                            avatar={SUPPORT_AVATAR}
                            author={
                              selectedSession.userName ||
                              selectedSession.userEmail ||
                              "User"
                            }
                            timestamp={<time>{message.time}</time>}
                          >
                            {message.text}
                          </ChatMessage>
                        )
                      )}
                    </Chat>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {error ? (
                  <Caption1 className="mt-2 text-destructive">{error}</Caption1>
                ) : null}

                <div className={styles.composer}>
                  <Textarea
                    className={styles.textarea}
                    value={draft}
                    placeholder="Reply as Morfinance Support..."
                    onChange={(_event, data) => setDraft(data.value)}
                  />
                  <button
                    type="button"
                    className={styles.sendButton}
                    aria-label="Send reply"
                    disabled={!draft.trim() || sending}
                    onClick={() => void handleSend()}
                  >
                    <ArrowUp24Filled className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
