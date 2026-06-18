"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Avatar,
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  Chat,
  ChatMessage,
  ChatMyMessage,
} from "@fluentui-contrib/react-chat";
import {
  ArrowUp24Filled,
  Attach24Regular,
  Chat24Regular,
  Dismiss24Regular,
  Document24Regular,
  Emoji24Regular,
  Image24Regular,
  Note24Regular,
  PersonSupport24Regular,
} from "@fluentui/react-icons";

type AttachmentKind = "file" | "image";

type ChatAttachment = {
  id: string;
  file: File;
  kind: AttachmentKind;
  previewUrl?: string;
};

type SupportChatMessage = {
  id: string;
  role: "user" | "support";
  text: string;
  time: string;
  attachments?: Array<{
    name: string;
    kind: AttachmentKind;
    previewUrl?: string;
  }>;
};

const WELCOME_MESSAGE: SupportChatMessage = {
  id: "welcome",
  role: "support",
  text: "Hi there! How can we help with your Morfinance dashboard today?",
  time: "Just now",
};

const SUPPORT_AVATAR = (
  <Avatar name="Morfinance Support" badge={{ status: "available" }} />
);

const MAX_TEXTAREA_HEIGHT = 120;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const EMOJI_OPTIONS = [
  "😀", "😊", "😂", "😍", "🥳", "👍", "👏", "🙏",
  "👋", "❤️", "🔥", "✅", "💡", "🎉", "😅", "🤝",
] as const;

const COMPOSER_OPTIONS = [
  { id: "attach", label: "Attach file", icon: Attach24Regular, action: "file" as const },
  { id: "emoji", label: "Add emoji", icon: Emoji24Regular, action: "emoji" as const },
  { id: "image", label: "Share image", icon: Image24Regular, action: "image" as const },
  { id: "note", label: "Add note", icon: Note24Regular, action: "note" as const },
] as const;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const useStyles = makeStyles({
  root: {
    position: "absolute",
    bottom: tokens.spacingVerticalL,
    right: tokens.spacingHorizontalL,
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: tokens.spacingVerticalS,
    pointerEvents: "none",
    "& > *": {
      pointerEvents: "auto",
    },
  },
  launcher: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: "1px solid var(--border)",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
    boxShadow: tokens.shadow16,
    cursor: "pointer",
    transitionProperty: "background-color, border-color, box-shadow, transform",
    transitionDuration: "200ms",
    ":hover": {
      backgroundColor: "var(--accent)",
    },
    ":focus-visible": {
      outline: "2px solid var(--ring)",
      outlineOffset: "2px",
    },
  },
  launcherOpen: {
    backgroundColor: "var(--muted)",
  },
  launcherLabel: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  panel: {
    display: "flex",
    width: "min(380px, calc(100vw - 32px))",
    height: "min(520px, calc(100vh - 120px))",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
    boxShadow: tokens.shadow28,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  headerInfo: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  headerIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "color-mix(in srgb, var(--primary) 16%, transparent)",
    color: "var(--primary)",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: "var(--card-foreground)",
  },
  closeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--accent)",
      color: "var(--card-foreground)",
    },
  },
  messages: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    overflowY: "auto",
    backgroundColor: "var(--background)",
  },
  chat: {
    paddingLeft: 0,
    maxWidth: "100%",
    margin: 0,
  },
  messageAttachments: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    marginTop: tokens.spacingVerticalXXS,
  },
  messageImage: {
    maxWidth: "200px",
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid var(--border)",
  },
  messageFile: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid var(--border)",
    backgroundColor: "var(--muted)",
    color: "var(--card-foreground)",
    fontSize: tokens.fontSizeBase100,
  },
  composerWrap: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    width: "100%",
    padding: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalS,
    borderTop: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  attachmentList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    width: "100%",
  },
  attachmentChip: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid var(--border)",
    backgroundColor: "var(--muted)",
    color: "var(--card-foreground)",
    fontSize: tokens.fontSizeBase100,
  },
  attachmentThumb: {
    width: "36px",
    height: "36px",
    objectFit: "cover",
    borderRadius: tokens.borderRadiusSmall,
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
  attachmentMeta: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  attachmentName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: tokens.fontWeightMedium,
  },
  attachmentSize: {
    color: "var(--muted-foreground)",
  },
  attachmentRemove: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    flexShrink: 0,
    ":hover": {
      backgroundColor: "var(--accent)",
      color: "var(--card-foreground)",
    },
  },
  limitNote: {
    color: "var(--muted-foreground)",
    fontSize: tokens.fontSizeBase100,
    lineHeight: 1.4,
  },
  composerError: {
    color: "var(--destructive)",
    fontSize: tokens.fontSizeBase100,
    lineHeight: 1.4,
  },
  composerToolbar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    width: "100%",
    overflowX: "auto",
    position: "relative",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalXXS,
    width: "100%",
    padding: tokens.spacingHorizontalS,
    border: "1px solid var(--border)",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    boxShadow: tokens.shadow16,
  },
  emojiButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    border: "none",
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: "transparent",
    fontSize: "18px",
    lineHeight: 1,
    cursor: "pointer",
    transitionProperty: "background-color, transform",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--accent)",
      transform: "scale(1.08)",
    },
  },
  composerOptionButtonActive: {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  composerOptionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    flexShrink: 0,
    border: "none",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--accent)",
      color: "var(--card-foreground)",
    },
    ":focus-visible": {
      outline: "2px solid var(--ring)",
      outlineOffset: "1px",
    },
  },
  composer: {
    display: "flex",
    alignItems: "flex-end",
    gap: tokens.spacingHorizontalS,
    width: "100%",
    minHeight: "44px",
    padding: `6px 6px 6px ${tokens.spacingHorizontalM}`,
    border: "1px solid var(--border)",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: "var(--background)",
    boxShadow: tokens.shadow2,
    transitionProperty: "border-color, box-shadow",
    transitionDuration: "200ms",
  },
  composerFocused: {
    borderTopColor: "var(--ring)",
    borderRightColor: "var(--ring)",
    borderBottomColor: "var(--ring)",
    borderLeftColor: "var(--ring)",
    boxShadow: tokens.shadow8,
  },
  inputField: {
    display: "flex",
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    minHeight: "28px",
  },
  textarea: {
    width: "100%",
    minWidth: 0,
    minHeight: "20px",
    maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
    resize: "none",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "var(--card-foreground)",
    fontFamily: "inherit",
    fontSize: tokens.fontSizeBase200,
    lineHeight: "20px",
    textAlign: "left",
    overflowX: "hidden",
    overflowY: "auto",
    padding: 0,
    margin: 0,
    "::placeholder": {
      color: "var(--muted-foreground)",
      textAlign: "left",
    },
  },
  sendButton: {
    display: "grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    flexShrink: 0,
    padding: 0,
    border: "none",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "var(--muted-foreground)",
    color: "var(--card)",
    cursor: "pointer",
    lineHeight: 0,
    transitionProperty: "background-color, opacity, transform",
    transitionDuration: "150ms",
    ":hover": {
      opacity: 0.9,
    },
    ":disabled": {
      opacity: 0.35,
      cursor: "not-allowed",
    },
  },
  sendIcon: {
    display: "block",
    width: "14px",
    height: "14px",
  },
  sendButtonActive: {
    backgroundColor: "var(--action-green)",
    color: "var(--action-green-foreground)",
  },
  typingDots: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: `${tokens.spacingVerticalXXS} 0`,
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "var(--muted-foreground)",
  },
});

function MessageBody({
  message,
  styles,
}: {
  message: SupportChatMessage;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <>
      {message.text ? <span>{message.text}</span> : null}
      {message.attachments?.length ? (
        <div className={styles.messageAttachments}>
          {message.attachments.map((attachment) =>
            attachment.kind === "image" && attachment.previewUrl ? (
              <img
                key={attachment.name}
                src={attachment.previewUrl}
                alt={attachment.name}
                className={styles.messageImage}
              />
            ) : (
              <span key={attachment.name} className={styles.messageFile}>
                <Document24Regular className="h-3.5 w-3.5 shrink-0" />
                {attachment.name}
              </span>
            )
          )}
        </div>
      ) : null}
    </>
  );
}

function TypingIndicator() {
  const styles = useStyles();

  return (
    <ChatMessage avatar={SUPPORT_AVATAR} author="Morfinance Support">
      <div className={styles.typingDots} aria-label="Support is typing">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={styles.typingDot}
            animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </ChatMessage>
  );
}

export default function SupportChat() {
  const styles = useStyles();
  const panelId = useId();
  const inputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const composerWrapRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentUrlsRef = useRef<Set<string>>(new Set());

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [messages, setMessages] = useState<SupportChatMessage[]>([WELCOME_MESSAGE]);

  const canSend =
    (draft.trim().length > 0 || attachments.length > 0) && !isSending;

  const trackPreviewUrl = (url: string) => {
    attachmentUrlsRef.current.add(url);
  };

  const revokePreviewUrl = (url?: string) => {
    if (!url || !attachmentUrlsRef.current.has(url)) return;
    URL.revokeObjectURL(url);
    attachmentUrlsRef.current.delete(url);
  };

  const clearAttachments = (items = attachments) => {
    items.forEach((item) => revokePreviewUrl(item.previewUrl));
    setAttachments([]);
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [draft, open, attachments.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, isTyping, attachments.length]);

  useEffect(() => {
    if (!emojiOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!composerWrapRef.current?.contains(event.target as Node)) {
        setEmojiOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [emojiOpen]);

  useEffect(() => {
    return () => {
      attachmentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      attachmentUrlsRef.current.clear();
    };
  }, []);

  const addAttachments = (files: FileList | null, kind: AttachmentKind) => {
    if (!files?.length) return;

    setComposerError(null);

    const incoming = Array.from(files);
    const maxSize =
      kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;

    if (remainingSlots <= 0) {
      setComposerError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
      return;
    }

    const accepted: ChatAttachment[] = [];
    const errors: string[] = [];

    incoming.slice(0, remainingSlots).forEach((file) => {
      if (file.size > maxSize) {
        errors.push(
          `${file.name} exceeds the ${kind === "image" ? MAX_IMAGE_SIZE_MB : MAX_FILE_SIZE_MB}MB limit.`
        );
        return;
      }

      if (kind === "image" && !file.type.startsWith("image/")) {
        errors.push(`${file.name} is not a supported image.`);
        return;
      }

      const previewUrl =
        kind === "image" ? URL.createObjectURL(file) : undefined;
      if (previewUrl) trackPreviewUrl(previewUrl);

      accepted.push({
        id: `${kind}-${file.name}-${file.lastModified}`,
        file,
        kind,
        previewUrl,
      });
    });

    if (incoming.length > remainingSlots) {
      errors.push(`Only ${remainingSlots} more attachment(s) can be added.`);
    }

    if (accepted.length) {
      setAttachments((current) => [...current, ...accepted]);
    }

    if (errors.length) {
      setComposerError(errors[0]);
    }

    textareaRef.current?.focus();
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      revokePreviewUrl(target?.previewUrl);
      return current.filter((item) => item.id !== id);
    });
    setComposerError(null);
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if ((!text && attachments.length === 0) || isSending) return;

    const sentAttachments = attachments.map((item) => ({
      name: item.file.name,
      kind: item.kind,
      previewUrl: item.previewUrl,
    }));

    const userMessage: SupportChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      time: formatTime(),
      attachments: sentAttachments.length ? sentAttachments : undefined,
    };

    setIsSending(true);
    setDraft("");
    setAttachments([]);
    setComposerError(null);
    setMessages((prev) => [...prev, userMessage]);

    await new Promise((resolve) => window.setTimeout(resolve, 320));
    setIsSending(false);
    setIsTyping(true);

    window.setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `support-${Date.now()}`,
          role: "support",
          text: "Thanks for reaching out. A support specialist will follow up shortly. For urgent wallet issues, include your DSA account ID.",
          time: formatTime(),
        },
      ]);
    }, 900);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleComposerOption = (
    action: (typeof COMPOSER_OPTIONS)[number]["action"]
  ) => {
    if (action === "emoji") {
      setEmojiOpen((current) => !current);
      return;
    }

    setEmojiOpen(false);

    if (action === "file") {
      fileInputRef.current && (fileInputRef.current.value = "");
      fileInputRef.current?.click();
      return;
    }

    if (action === "image") {
      imageInputRef.current && (imageInputRef.current.value = "");
      imageInputRef.current?.click();
      return;
    }

    if (action === "note") {
      setDraft((current) => {
        if (current.includes("[Note]")) return current;
        return current.trim() ? `${current.trim()}\n[Note] ` : "[Note] ";
      });
      textareaRef.current?.focus();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={styles.root}>
      <AnimatePresence>
        {open && (
          <motion.section
            id={panelId}
            role="dialog"
            aria-label="Support chat"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={styles.panel}
          >
            <header className={styles.header}>
              <div className={styles.headerInfo}>
                <span className={styles.headerIcon}>
                  <PersonSupport24Regular className="h-5 w-5" />
                </span>
                <Text className={styles.headerTitle}>Support Chat</Text>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close support chat"
                onClick={() => {
                  setEmojiOpen(false);
                  clearAttachments();
                  setOpen(false);
                }}
              >
                <Dismiss24Regular className="h-4 w-4" />
              </button>
            </header>

            <div className={mergeClasses(styles.messages, "custom-scrollbar")}>
              <Chat className={styles.chat}>
                {messages.map((message) =>
                  message.role === "user" ? (
                    <ChatMyMessage
                      key={message.id}
                      timestamp={<time dateTime={message.time}>{message.time}</time>}
                      showAnimation
                    >
                      <MessageBody message={message} styles={styles} />
                    </ChatMyMessage>
                  ) : (
                    <ChatMessage
                      key={message.id}
                      avatar={SUPPORT_AVATAR}
                      author="Morfinance Support"
                      timestamp={<time dateTime={message.time}>{message.time}</time>}
                      showAnimation
                    >
                      <MessageBody message={message} styles={styles} />
                    </ChatMessage>
                  )
                )}

                {isTyping ? <TypingIndicator /> : null}
              </Chat>

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.composerWrap} ref={composerWrapRef}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  addAttachments(event.target.files, "file");
                  event.target.value = "";
                }}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  addAttachments(event.target.files, "image");
                  event.target.value = "";
                }}
              />

              {attachments.length > 0 ? (
                <div className={styles.attachmentList}>
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className={styles.attachmentChip}>
                      {attachment.previewUrl ? (
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.file.name}
                          className={styles.attachmentThumb}
                        />
                      ) : (
                        <Document24Regular className="h-4 w-4 shrink-0" />
                      )}
                      <div className={styles.attachmentMeta}>
                        <span className={styles.attachmentName}>
                          {attachment.file.name}
                        </span>
                        <span className={styles.attachmentSize}>
                          {formatFileSize(attachment.file.size)} ·{" "}
                          {attachment.kind === "image" ? "Image" : "File"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.attachmentRemove}
                        aria-label={`Remove ${attachment.file.name}`}
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <Dismiss24Regular className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <Caption1 className={styles.limitNote}>
                Attach up to {MAX_ATTACHMENTS} items · Files {MAX_FILE_SIZE_MB}MB max ·
                Images {MAX_IMAGE_SIZE_MB}MB max · Use note for extra context
              </Caption1>

              {composerError ? (
                <Caption1 className={styles.composerError} role="alert">
                  {composerError}
                </Caption1>
              ) : null}

              <div className={styles.composerToolbar}>
                <AnimatePresence>
                  {emojiOpen ? (
                    <motion.div
                      key="emoji-picker"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className={styles.emojiPicker}
                      role="listbox"
                      aria-label="Emoji picker"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={styles.emojiButton}
                          aria-label={`Insert ${emoji}`}
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {COMPOSER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.action === "emoji" && emojiOpen;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={mergeClasses(
                        styles.composerOptionButton,
                        isActive && styles.composerOptionButtonActive
                      )}
                      aria-label={option.label}
                      title={option.label}
                      aria-pressed={isActive}
                      onClick={() => handleComposerOption(option.action)}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>

              <div
                className={mergeClasses(
                  styles.composer,
                  focused && styles.composerFocused
                )}
              >
                <div className={styles.inputField}>
                  <textarea
                    ref={textareaRef}
                    id={inputId}
                    className={mergeClasses(styles.textarea, "custom-scrollbar")}
                    rows={1}
                    placeholder="Type msg here"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-label="Message support"
                  />
                </div>

                <button
                  type="button"
                  className={mergeClasses(
                    styles.sendButton,
                    canSend && styles.sendButtonActive
                  )}
                  aria-label="Send message"
                  disabled={!canSend}
                  onClick={() => void sendMessage()}
                >
                  <ArrowUp24Filled className={styles.sendIcon} />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={mergeClasses(styles.launcher, open && styles.launcherOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((value) => !value)}
      >
        <Chat24Regular className="h-5 w-5" />
        <span className={styles.launcherLabel}>Support</span>
      </button>
    </div>
  );
}
