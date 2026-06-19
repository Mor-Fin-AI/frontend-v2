"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Caption1,
  CounterBadge,
  InteractionTag,
  InteractionTagPrimary,
  Text,
  counterBadgeClassNames,
  interactionTagClassNames,
  interactionTagPrimaryClassNames,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Alert24Regular } from "@fluentui/react-icons";
import {
  PanelCardHeaderLink,
} from "@/components/ui/PanelCard";
import {
  initialNotifications,
  TYPE_LABELS,
  type NotificationItem,
} from "../data/notifications";
import AppBadge from "@/components/ui/AppBadge";
import { notificationTypeBadge } from "@/lib/badgeTones";
import { useAuth } from "@/context/AuthContext";
import { useSupportChatContext } from "@/context/SupportChatContext";
import { useNotifications } from "@/hooks/useNotifications";

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: "fit-content",
    height: "fit-content",
  },
  counterWrap: {
    display: "inline-flex",
    alignItems: "center",
    [`& .${counterBadgeClassNames.root}`]: {
      display: "inline-flex",
      alignItems: "center",
    },
  },
  notificationTag: {
    display: "inline-flex",
    [`& .${interactionTagClassNames.root}`]: {
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      borderRadius: tokens.borderRadiusMedium,
      backgroundColor: tokens.colorNeutralBackground3,
      boxShadow: "none",
      transitionProperty: "background-color, border-color, box-shadow, color",
      transitionDuration: "200ms",
      ":hover": {
        backgroundColor: tokens.colorNeutralBackground1Hover,
        borderTopColor: tokens.colorNeutralStroke1,
        borderRightColor: tokens.colorNeutralStroke1,
        borderBottomColor: tokens.colorNeutralStroke1,
        borderLeftColor: tokens.colorNeutralStroke1,
      },
    },
  },
  notificationTagOpen: {
    [`& .${interactionTagClassNames.root}`]: {
      backgroundColor: tokens.colorNeutralBackground1Selected,
      borderTopColor: tokens.colorNeutralStroke1,
      borderRightColor: tokens.colorNeutralStroke1,
      borderBottomColor: tokens.colorNeutralStroke1,
      borderLeftColor: tokens.colorNeutralStroke1,
      boxShadow: tokens.shadow2,
    },
  },
  notificationPrimary: {
    [`& .${interactionTagPrimaryClassNames.root}`]: {
      minWidth: "36px",
      width: "36px",
      height: "36px",
      padding: 0,
      justifyContent: "center",
      color: tokens.colorBrandForeground1,
    },
    [`& .${interactionTagPrimaryClassNames.icon}`]: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
    },
    [`& .${interactionTagPrimaryClassNames.primaryText}`]: {
      display: "none",
    },
    [`&:hover .${interactionTagPrimaryClassNames.root}`]: {
      color: tokens.colorNeutralForeground1,
    },
  },
  flyout: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    zIndex: 50,
    width: "380px",
    maxWidth: "calc(100vw - 24px)",
  },
  bridge: {
    position: "absolute",
    top: "-12px",
    left: 0,
    right: 0,
    height: "12px",
    backgroundColor: "transparent",
  },
  arrow: {
    position: "absolute",
    right: "14px",
    top: 0,
    width: "14px",
    height: "14px",
    transform: "translateY(-50%) rotate(45deg)",
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  panel: {
    overflow: "hidden",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  headerTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "360px",
    overflowY: "auto",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    width: "100%",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    border: "none",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--table-row-hover)",
    },
    ":last-child": {
      borderBottom: "none",
    },
  },
  itemUnread: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    ":hover": {
      backgroundColor: "var(--table-row-selected)",
    },
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
  },
  typeBadge: {
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  itemTime: {
    color: tokens.colorNeutralForeground3,
  },
  itemTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  itemMessage: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    lineHeight: 1.45,
  },
  empty: {
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    padding: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

type NotificationPanelProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onItemClick: (item: NotificationItem) => void;
  onViewAll: () => void;
};

function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onItemClick,
  onViewAll,
}: NotificationPanelProps) {
  const styles = useStyles();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Text className={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <PanelCardHeaderLink onClick={onMarkAllRead}>Mark all read</PanelCardHeaderLink>
        )}
      </div>

      <div className={mergeClasses(styles.list, "custom-scrollbar")} role="list">
        {notifications.length === 0 ? (
          <p className={styles.empty}>You&apos;re all caught up.</p>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={mergeClasses(
                styles.item,
                !item.read && styles.itemUnread
              )}
              onClick={() => onItemClick(item)}
            >
              <div className={styles.itemTop}>
                <AppBadge
                  className={styles.typeBadge}
                  tone={notificationTypeBadge[item.type].tone}
                  appearance={notificationTypeBadge[item.type].appearance}
                  size="small"
                >
                  {TYPE_LABELS[item.type]}
                </AppBadge>
                <Caption1 className={styles.itemTime}>{item.time}</Caption1>
              </div>
              <Text className={styles.itemTitle}>{item.title}</Text>
              <Text className={styles.itemMessage}>{item.message}</Text>
            </button>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <PanelCardHeaderLink onClick={onViewAll}>View all activity</PanelCardHeaderLink>
      </div>
    </div>
  );
}

export default function NotificationDropdown() {
  const panelId = useId();
  const navigate = useNavigate();
  const styles = useStyles();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [guestNotifications, setGuestNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const { user, isAuthenticated } = useAuth();
  const { openChat } = useSupportChatContext();
  const {
    notifications: liveNotifications,
    markRead,
    markAllRead,
  } = useNotifications({
    userId: user?.id,
    enabled: isAuthenticated,
  });

  const notifications = isAuthenticated ? liveNotifications : guestNotifications;

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const markAllReadHandler = () => {
    if (isAuthenticated) {
      void markAllRead();
      return;
    }

    setGuestNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (isAuthenticated) {
      void markRead(item.id);
    } else {
      setGuestNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }

    setOpen(false);

    if (item.href === "support-chat") {
      openChat();
      return;
    }

    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <CounterBadge
        className={styles.counterWrap}
        count={unreadCount}
        appearance="filled"
        color="danger"
        size="extra-small"
        overflowCount={9}
      >
        <InteractionTag
          className={mergeClasses(
            styles.notificationTag,
            open && styles.notificationTagOpen
          )}
          appearance="filled"
          shape="rounded"
          size="small"
          selected={open}
        >
          <InteractionTagPrimary
            className={styles.notificationPrimary}
            icon={<Alert24Regular className="h-4 w-4" />}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          />
        </InteractionTag>
      </CounterBadge>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={styles.flyout}
          >
            <div className={styles.bridge} />
            <div className={styles.arrow} />
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllReadHandler}
              onItemClick={handleNotificationClick}
              onViewAll={() => {
                setOpen(false);
                navigate("/settings/audit-logs");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
