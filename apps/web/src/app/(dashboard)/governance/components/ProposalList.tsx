'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Proposal, ProposalStatus, ProposalCategory } from '../data';
import { ThumbLike24Regular, ThumbDislike24Regular } from '@fluentui/react-icons';
import {
  Card,
  CardFooter,
  CardHeader,
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import NeuButton from '@/components/ui/NeuButton';
import AppProgressBar from '@/components/ui/AppProgressBar';
import AppBadge from '@/components/ui/AppBadge';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import { proposalCategoryTone, proposalStatusTone } from '@/lib/badgeTones';
import { CARD_APPEARANCE, CARD_FOCUS_MODE, useCardShellStyles } from '@/components/ui/cardShell';
import { motion } from 'framer-motion';

const VOTE_FOR_COLOR = '#22C38E';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  proposalCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    width: '100%',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  proposalId: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground3,
  },
  timeLeft: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  votesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  voteFor: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorPaletteGreenForeground1,
  },
  voteAgainst: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorPaletteRedForeground1,
  },
  progressWrap: {
    flex: '1 1 160px',
    minWidth: '120px',
  },
  author: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginLeft: tokens.spacingHorizontalS,
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  viewLink: {
    marginLeft: 'auto',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

function ProposalBadge({ label }: { label: string }) {
  const resolvedTone =
    proposalStatusTone[label as ProposalStatus] ??
    proposalCategoryTone[label as ProposalCategory] ??
    'neutral';

  return (
    <AppBadge tone={resolvedTone} appearance="tint" size="small">
      {label}
    </AppBadge>
  );
}

function ProposalCard({ proposal, index }: { proposal: Proposal; index: number }) {
  const isActive = proposal.status === 'Active';
  const styles = useStyles();
  const shell = useCardShellStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        appearance={CARD_APPEARANCE}
        size="large"
        focusMode={CARD_FOCUS_MODE}
        className={mergeClasses(shell.shell, styles.proposalCard)}
      >
        <div className={styles.metaRow}>
          <div className={styles.badgeRow}>
            <span className={styles.proposalId}>
              {proposal.isOnChain ? `#${proposal.id}` : proposal.id}
            </span>
            <ProposalBadge label={proposal.status} />
            <ProposalBadge label={proposal.category} />
            {proposal.stateLabel ? (
              <AppBadge tone="neutral" appearance="tint" size="small">
                {proposal.stateLabel}
              </AppBadge>
            ) : null}
          </div>
          {proposal.timeLeft ? (
            <span className={styles.timeLeft}>{proposal.timeLeft}</span>
          ) : null}
        </div>

        <CardHeader
          header={
            <Link to={`/governance/${proposal.id}`} className="hover:underline">
              <Text as="h5" weight="semibold" style={{ margin: 0 }}>
                {proposal.title}
              </Text>
            </Link>
          }
          description={
            <Caption1 className={shell.caption}>{proposal.description}</Caption1>
          }
        />

        <div className={styles.votesRow}>
          <span className={styles.voteFor}>
            <ThumbLike24Regular className="h-4 w-4" aria-hidden />
            {proposal.votesFor}
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
            {proposal.votesAgainst}
          </span>

          <span className={styles.author}>by {proposal.author}</span>
        </div>

        {isActive ? (
          <CardFooter className={styles.footer}>
            <NeuButton variant="success" size="sm">
              Vote For
            </NeuButton>
            <NeuButton variant="secondary" size="sm">
              Vote Against
            </NeuButton>
            <Link to={`/governance/${proposal.id}`} className={styles.viewLink}>
              View details
            </Link>
          </CardFooter>
        ) : (
          <CardFooter className={styles.footer}>
            <Link to={`/governance/${proposal.id}`} className={styles.viewLink}>
              View details
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

export default function ProposalList({
  proposals,
  isLoading = false,
  isLive = false,
}: {
  proposals: Proposal[];
  isLoading?: boolean;
  isLive?: boolean;
}) {
  const styles = useStyles();

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader
        title="Governance Proposals"
        description={
          isLive
            ? "Live proposals from MorGovernorTimeLocked on Arbitrum"
            : "Sample proposals — create one on-chain to replace this list"
        }
      />
      <PanelCardBody>
        {isLoading ? (
          <Caption1 className="text-muted-foreground">Loading proposals…</Caption1>
        ) : proposals.length === 0 ? (
          <Caption1 className="text-muted-foreground">
            No proposals yet. Create the first governance proposal on Arbitrum.
          </Caption1>
        ) : (
          <div className={styles.list}>
            {proposals.map((proposal, index) => (
              <ProposalCard key={proposal.id} proposal={proposal} index={index} />
            ))}
          </div>
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
