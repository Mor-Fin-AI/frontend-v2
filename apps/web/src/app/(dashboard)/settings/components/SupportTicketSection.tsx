"use client";

import { useEffect } from "react";
import {
  Caption1,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PersonSupport24Regular } from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useAuth } from "@/context/AuthContext";
import { useSupportTickets } from "@/hooks/useSupportTicketsRealtime";
import { formatTicketDate } from "@/lib/supportTickets";
import CreateSupportTicketDialog from "./CreateSupportTicketDialog";
import { useAppToast } from "@/hooks/useAppToast";

const ticketStatusTone = {
  Open: "info",
  "In Progress": "warning",
  Resolved: "success",
} as const;

const ticketPriorityTone = {
  Low: "neutral",
  Medium: "info",
  High: "warning",
  Urgent: "danger",
} as const;

const useStyles = makeStyles({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  ticketList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  ticketItem: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  ticketHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
  },
  ticketMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  ticketSubject: {
    fontWeight: tokens.fontWeightSemibold,
    color: "var(--card-foreground)",
  },
  ticketDescription: {
    color: "var(--muted-foreground)",
    whiteSpace: "pre-wrap",
  },
  emptyState: {
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px dashed var(--border)",
    color: "var(--muted-foreground)",
    textAlign: "center",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    color: "var(--muted-foreground)",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "#22C38E",
  },
});

export default function SupportTicketSection() {
  const styles = useStyles();
  const { user } = useAuth();
  const toast = useAppToast();
  const {
    tickets,
    setTickets,
    loading: isLoading,
    error: ticketsError,
    isLive,
  } = useSupportTickets({
    scope: "user",
    userId: user?.id,
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (ticketsError) {
      toast.error("Could not load tickets", ticketsError);
    }
  }, [ticketsError, toast]);

  return (
    <PanelCard>
      <PanelCardTopBar>
        <PanelCardTopIcon>
          <PersonSupport24Regular className="h-5 w-5 text-primary" />
        </PanelCardTopIcon>
      </PanelCardTopBar>

      <PanelCardHeader
        title="Support tickets"
        description="Create a ticket for account, wallet, or dashboard issues"
        action={
          <CreateSupportTicketDialog
            onCreated={(ticket) => {
              setTickets((current) => [ticket, ...current]);
            }}
          />
        }
      />

      <PanelCardBody className={styles.section}>
        <div className={styles.ticketList}>
          <div className={styles.headerRow}>
            <Text weight="semibold">Your tickets</Text>
            {isLive ? (
              <Caption1 className={styles.liveBadge}>
                <span className={styles.liveDot} aria-hidden />
                Live updates
              </Caption1>
            ) : null}
          </div>

          {isLoading ? (
            <Caption1 className={styles.emptyState}>Loading tickets...</Caption1>
          ) : tickets.length === 0 ? (
            <Caption1 className={styles.emptyState}>
              No support tickets yet. Use New ticket to open your first request.
            </Caption1>
          ) : (
            tickets.map((ticket) => (
              <article key={ticket.dbId} className={styles.ticketItem}>
                <div className={styles.ticketHeader}>
                  <div className={styles.ticketMeta}>
                    <Text className={styles.ticketSubject}>{ticket.subject}</Text>
                    <AppBadge tone="neutral" appearance="outline" size="small">
                      {ticket.id}
                    </AppBadge>
                  </div>
                  <Caption1>{formatTicketDate(ticket.createdAt)}</Caption1>
                </div>

                <div className={styles.ticketMeta}>
                  <AppBadge tone="brand" appearance="tint" size="small">
                    {ticket.category}
                  </AppBadge>
                  <AppBadge
                    tone={ticketPriorityTone[ticket.priority]}
                    appearance="tint"
                    size="small"
                  >
                    {ticket.priority}
                  </AppBadge>
                  <AppBadge
                    tone={ticketStatusTone[ticket.status]}
                    appearance="tint"
                    size="small"
                  >
                    {ticket.status}
                  </AppBadge>
                </div>

                <Caption1 className={styles.ticketDescription}>
                  {ticket.description}
                </Caption1>
              </article>
            ))
          )}
        </div>
      </PanelCardBody>
    </PanelCard>
  );
}
