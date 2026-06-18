"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Caption1,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Chat24Regular,
  People24Regular,
  ShieldTask24Regular,
} from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useScrollAnimation, fadeUpVariants } from "@/hooks/useScrollAnimation";
import { useSupportTickets } from "@/hooks/useSupportTicketsRealtime";
import { formatAdminDate, fetchAdminStats, type AdminStats } from "@/lib/admin";
import { formatTicketDate } from "@/lib/supportTickets";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState } from "react";

const useStyles = makeStyles({
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
    color: "var(--card-foreground)",
  },
  quickLinks: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  quickLink: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    color: "inherit",
    textDecoration: "none",
    transitionProperty: "border-color, background-color, transform",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "var(--accent)",
      transform: "translateY(-1px)",
    },
  },
  quickIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)",
    color: "var(--primary)",
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: tokens.spacingHorizontalL,
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
  },
  empty: {
    textAlign: "center",
    color: "var(--muted-foreground)",
    padding: tokens.spacingHorizontalL,
  },
});

const emptyStats: AdminStats = {
  totalUsers: 0,
  adminUsers: 0,
  totalTickets: 0,
  openTickets: 0,
  inProgressTickets: 0,
  resolvedTickets: 0,
  openChatSessions: 0,
  totalChatMessages: 0,
};

export default function AdminDashboardPage() {
  const styles = useStyles();
  const { ref, controls } = useScrollAnimation();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [statsError, setStatsError] = useState<string | null>(null);
  const { tickets, loading: ticketsLoading } = useSupportTickets({
    scope: "admin",
    enabled: true,
  });

  const loadStats = useCallback(async () => {
    const result = await fetchAdminStats();
    if (result.error) {
      setStatsError(result.error);
      return;
    }

    setStats(result.data?.stats ?? emptyStats);
    setStatsError(null);
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const recentTickets = tickets.slice(0, 5);

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-col gap-6"
    >
      <div>
        <Text weight="semibold" size={500}>
          Morfinance Admin
        </Text>
        <Caption1 block className="mt-1 text-muted-foreground">
          Platform overview for {user?.email ?? "administrator"}
        </Caption1>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Caption1>Total users</Caption1>
          <Text className={styles.statValue}>{stats.totalUsers}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Open tickets</Caption1>
          <Text className={styles.statValue}>{stats.openTickets}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Chat sessions</Caption1>
          <Text className={styles.statValue}>{stats.openChatSessions}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Admin users</Caption1>
          <Text className={styles.statValue}>{stats.adminUsers}</Text>
        </div>
      </div>

      {statsError ? (
        <Caption1 className={styles.empty}>{statsError}</Caption1>
      ) : null}

      <div className={styles.quickLinks}>
        <Link to="/admin/tickets" className={styles.quickLink}>
          <span className={styles.quickIcon}>
            <ShieldTask24Regular className="h-5 w-5" />
          </span>
          <Text weight="semibold">Support Queue</Text>
          <Caption1>
            {stats.openTickets} open · {stats.inProgressTickets} in progress
          </Caption1>
        </Link>

        <Link to="/admin/users" className={styles.quickLink}>
          <span className={styles.quickIcon}>
            <People24Regular className="h-5 w-5" />
          </span>
          <Text weight="semibold">User Management</Text>
          <Caption1>{stats.totalUsers} registered users</Caption1>
        </Link>

        <Link to="/admin/chat" className={styles.quickLink}>
          <span className={styles.quickIcon}>
            <Chat24Regular className="h-5 w-5" />
          </span>
          <Text weight="semibold">Support Chat</Text>
          <Caption1>{stats.totalChatMessages} messages sent</Caption1>
        </Link>
      </div>

      <div className={styles.split}>
        <PanelCard>
          <PanelCardTopBar>
            <PanelCardTopIcon>
              <ShieldTask24Regular className="h-5 w-5 text-primary" />
            </PanelCardTopIcon>
          </PanelCardTopBar>
          <PanelCardHeader
            title="Recent tickets"
            description="Latest support requests"
          />
          <PanelCardBody className={styles.list}>
            {ticketsLoading ? (
              <Caption1 className={styles.empty}>Loading tickets...</Caption1>
            ) : recentTickets.length === 0 ? (
              <Caption1 className={styles.empty}>No tickets yet.</Caption1>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.dbId} className={styles.listItem}>
                  <Text weight="semibold">{ticket.subject}</Text>
                  <Caption1>
                    {ticket.userEmail || ticket.userName || ticket.userId} ·{" "}
                    {formatTicketDate(ticket.createdAt)}
                  </Caption1>
                  <AppBadge tone="info" appearance="tint" size="small">
                    {ticket.status}
                  </AppBadge>
                </div>
              ))
            )}
          </PanelCardBody>
        </PanelCard>

        <PanelCard>
          <PanelCardTopBar>
            <PanelCardTopIcon>
              <People24Regular className="h-5 w-5 text-primary" />
            </PanelCardTopIcon>
          </PanelCardTopBar>
          <PanelCardHeader
            title="Operations snapshot"
            description="Current platform health"
          />
          <PanelCardBody className={styles.list}>
            <div className={styles.listItem}>
              <Text weight="semibold">Resolved tickets</Text>
              <Caption1>{stats.resolvedTickets} completed requests</Caption1>
            </div>
            <div className={styles.listItem}>
              <Text weight="semibold">In-progress tickets</Text>
              <Caption1>{stats.inProgressTickets} being handled</Caption1>
            </div>
            <div className={styles.listItem}>
              <Text weight="semibold">Open chat sessions</Text>
              <Caption1>{stats.openChatSessions} active conversations</Caption1>
            </div>
            <div className={styles.listItem}>
              <Text weight="semibold">Last refreshed</Text>
              <Caption1>{formatAdminDate(new Date().toISOString())}</Caption1>
            </div>
          </PanelCardBody>
        </PanelCard>
      </div>
    </motion.div>
  );
}
