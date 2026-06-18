"use client";

import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  Calendar24Regular,
  Person24Regular,
  ThumbDislike24Regular,
  ThumbLike24Regular,
} from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import AppProgressBar from "@/components/ui/AppProgressBar";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import { useScrollAnimation, fadeUpVariants } from "@/hooks/useScrollAnimation";
import { proposalCategoryTone, proposalStatusTone } from "@/lib/badgeTones";
import { getProposalById } from "../data";

const VOTE_FOR_COLOR = "#22C38E";

const useStyles = makeStyles({
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalM,
    color: "var(--muted-foreground)",
    textDecoration: "none",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    transitionProperty: "color",
    transitionDuration: "150ms",
    ":hover": {
      color: "var(--foreground)",
    },
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingVerticalL,
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    },
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  bodyText: {
    color: "var(--muted-foreground)",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: "var(--muted-foreground)",
  },
  votesRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
  },
  voteFor: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorPaletteGreenForeground1,
  },
  voteAgainst: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorPaletteRedForeground1,
  },
  progressWrap: {
    flex: "1 1 160px",
    minWidth: "120px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  timelineItem: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    paddingLeft: tokens.spacingHorizontalM,
    borderLeft: `2px solid var(--border)`,
  },
});

export default function ProposalDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const proposal = proposalId ? getProposalById(proposalId) : undefined;
  const styles = useStyles();
  const { ref, controls } = useScrollAnimation();

  if (!proposal) {
    return <Navigate to="/governance" replace />;
  }

  const isActive = proposal.status === "Active";

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-col gap-6"
    >
      <Link to="/governance" className={styles.backLink}>
        <ArrowLeft24Regular className="h-4 w-4" />
        Back to Governance
      </Link>

      <PanelCard>
        <PanelCardHeader
          title={proposal.title}
          description={proposal.description}
        />
        <PanelCardBody className={styles.section}>
          <div className={styles.metaRow}>
            <Caption1>{proposal.id}</Caption1>
            <AppBadge
              tone={proposalStatusTone[proposal.status]}
              appearance="tint"
              size="small"
            >
              {proposal.status}
            </AppBadge>
            <AppBadge
              tone={proposalCategoryTone[proposal.category]}
              appearance="tint"
              size="small"
            >
              {proposal.category}
            </AppBadge>
            {proposal.timeLeft ? (
              <Caption1>{proposal.timeLeft}</Caption1>
            ) : null}
          </div>

          <Text className={styles.bodyText}>{proposal.fullDescription}</Text>

          <div className={styles.votesRow}>
            <span className={styles.voteFor}>
              <ThumbLike24Regular className="h-4 w-4" aria-hidden />
              {proposal.votesFor} for
            </span>
            <div className={styles.progressWrap}>
              <AppProgressBar
                percent={proposal.forPercent}
                color={VOTE_FOR_COLOR}
                shape="rounded"
                thickness="large"
              />
            </div>
            <span className={styles.voteAgainst}>
              <ThumbDislike24Regular className="h-4 w-4" aria-hidden />
              {proposal.votesAgainst} against
            </span>
          </div>

          {isActive ? (
            <div className={styles.actions}>
              <NeuButton variant="success" size="sm">
                Vote For
              </NeuButton>
              <NeuButton variant="secondary" size="sm">
                Vote Against
              </NeuButton>
            </div>
          ) : null}
        </PanelCardBody>
      </PanelCard>

      <div className={styles.grid}>
        <PanelCard>
          <PanelCardHeader
            title="Proposal details"
            description="Submission and voting metadata"
          />
          <PanelCardBody className={styles.section}>
            <div className={styles.infoRow}>
              <Person24Regular className="h-4 w-4" />
              <Caption1>Submitted by {proposal.author}</Caption1>
            </div>
            <div className={styles.infoRow}>
              <Calendar24Regular className="h-4 w-4" />
              <Caption1>Created {proposal.createdAt}</Caption1>
            </div>
            {proposal.votingEndsAt ? (
              <div className={styles.infoRow}>
                <Calendar24Regular className="h-4 w-4" />
                <Caption1>
                  {isActive ? "Voting ends" : "Voting ended"} {proposal.votingEndsAt}
                </Caption1>
              </div>
            ) : null}
            <div className={mergeClasses(styles.infoRow, "!text-foreground")}>
              <Caption1>Quorum required: {proposal.quorumRequired}</Caption1>
            </div>
          </PanelCardBody>
        </PanelCard>

        <PanelCard>
          <PanelCardHeader
            title="Timeline"
            description="Key milestones for this proposal"
          />
          <PanelCardBody>
            <div className={styles.timeline}>
              {proposal.timeline.map((event) => (
                <div key={`${event.date}-${event.label}`} className={styles.timelineItem}>
                  <Caption1>{event.date}</Caption1>
                  <Text size={300}>{event.label}</Text>
                </div>
              ))}
            </div>
          </PanelCardBody>
        </PanelCard>
      </div>
    </motion.div>
  );
}
