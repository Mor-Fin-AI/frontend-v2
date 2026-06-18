"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Caption1,
  Dropdown,
  Option,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { ShieldTask24Regular } from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useScrollAnimation, fadeUpVariants } from "@/hooks/useScrollAnimation";
import { useSupportTickets } from "@/hooks/useSupportTicketsRealtime";
import {
  formatTicketDate,
  updateTicketStatus,
  type SupportTicket,
} from "@/lib/supportTickets";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAppToast } from "@/hooks/useAppToast";
import { TICKET_STATUSES, type TicketStatus } from "@/app/(dashboard)/settings/data";

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
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
  statCard: {
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  ticket: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  ticketHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  ticketMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  statusControl: {
    minWidth: "160px",
  },
  description: {
    color: "var(--muted-foreground)",
    whiteSpace: "pre-wrap",
  },
  empty: {
    textAlign: "center",
    color: "var(--muted-foreground)",
    padding: tokens.spacingHorizontalL,
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

export default function AdminTicketsPage() {
  const styles = useStyles();
  const { ref, controls } = useScrollAnimation();
  const toast = useAppToast();
  const {
    tickets,
    setTickets,
    loading,
    error,
    setError,
    isLive,
  } = useSupportTickets({ scope: "admin", enabled: true });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    ticket: SupportTicket;
    status: TicketStatus;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyStatusChange = async (ticket: SupportTicket, status: TicketStatus) => {
    setUpdatingId(ticket.dbId);
    const { error: updateError, ticket: updatedTicket } = await updateTicketStatus(
      ticket.dbId,
      status
    );
    setUpdatingId(null);
    setPendingStatusChange(null);

    if (updateError) {
      setError(updateError);
      toast.error("Status update failed", updateError);
      return;
    }

    if (updatedTicket) {
      setTickets((current) =>
        current.map((item) =>
          item.dbId === ticket.dbId ? { ...item, ...updatedTicket } : item
        )
      );
      toast.success(
        "Ticket updated",
        `${ticket.id} is now ${status}.`
      );
    }
  };

  const requestStatusChange = (ticket: SupportTicket, status: TicketStatus) => {
    if (ticket.status === status) return;

    if (status === "Resolved") {
      setPendingStatusChange({ ticket, status });
      setConfirmOpen(true);
      return;
    }

    void applyStatusChange(ticket, status);
  };

  const handleStatusChange = async (ticket: SupportTicket, status: TicketStatus) => {
    requestStatusChange(ticket, status);
  };

  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === "Resolved").length;

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-col gap-6"
    >
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Caption1>Total tickets</Caption1>
          <Text className={styles.statValue}>{tickets.length}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Open</Caption1>
          <Text className={styles.statValue}>{openCount}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>In progress</Caption1>
          <Text className={styles.statValue}>{inProgressCount}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Resolved</Caption1>
          <Text className={styles.statValue}>{resolvedCount}</Text>
        </div>
      </div>

      <PanelCard>
        <PanelCardTopBar>
          <PanelCardTopIcon>
            <ShieldTask24Regular className="h-5 w-5 text-primary" />
          </PanelCardTopIcon>
        </PanelCardTopBar>

        <PanelCardHeader
          title="Support ticket queue"
          description="Review and update user support requests"
          action={
            isLive ? (
              <Caption1 className={styles.liveBadge}>
                <span className={styles.liveDot} aria-hidden />
                Live queue
              </Caption1>
            ) : undefined
          }
        />

        <PanelCardBody className={styles.list}>
          {loading ? (
            <Caption1 className={styles.empty}>Loading tickets...</Caption1>
          ) : error ? (
            <Caption1 className={styles.empty}>{error}</Caption1>
          ) : tickets.length === 0 ? (
            <Caption1 className={styles.empty}>No support tickets yet.</Caption1>
          ) : (
            tickets.map((ticket) => (
              <article key={ticket.dbId} className={styles.ticket}>
                <div className={styles.ticketHeader}>
                  <div>
                    <Text weight="semibold">{ticket.subject}</Text>
                    <div className={styles.ticketMeta}>
                      <AppBadge tone="neutral" appearance="outline" size="small">
                        {ticket.id}
                      </AppBadge>
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
                    </div>
                    <Caption1 className="mt-1 block">
                      {ticket.userName || ticket.userEmail || ticket.userId} ·{" "}
                      {formatTicketDate(ticket.createdAt)}
                    </Caption1>
                  </div>

                  <Dropdown
                    className={styles.statusControl}
                    value={ticket.status}
                    selectedOptions={[ticket.status]}
                    disabled={updatingId === ticket.dbId}
                    onOptionSelect={(_event, data) => {
                      const status = data.optionValue as TicketStatus | undefined;
                      if (status) {
                        void handleStatusChange(ticket, status);
                      }
                    }}
                  >
                    {TICKET_STATUSES.map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Dropdown>
                </div>

                <Caption1 className={styles.description}>{ticket.description}</Caption1>

                <AppBadge
                  tone={ticketStatusTone[ticket.status]}
                  appearance="tint"
                  size="small"
                >
                  {ticket.status}
                </AppBadge>
              </article>
            ))
          )}
        </PanelCardBody>
      </PanelCard>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingStatusChange(null);
        }}
        modalType="alert"
        title="Mark ticket as resolved?"
        description={
          pendingStatusChange
            ? `"${pendingStatusChange.ticket.subject}" (${pendingStatusChange.ticket.id}) will be closed. The user will no longer see it as an active request.`
            : ""
        }
        confirmLabel="Mark resolved"
        loading={updatingId === pendingStatusChange?.ticket.dbId}
        onConfirm={() => {
          if (pendingStatusChange) {
            void applyStatusChange(
              pendingStatusChange.ticket,
              pendingStatusChange.status
            );
            setConfirmOpen(false);
          }
        }}
      />
    </motion.div>
  );
}
