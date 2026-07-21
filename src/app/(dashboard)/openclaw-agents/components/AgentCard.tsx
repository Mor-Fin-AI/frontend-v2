"use client";

import {
  Badge,
  Button,
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowSquareUpRight24Regular,
  Bot24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
} from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import type { OpenClawAgentSnapshot } from "@/lib/agentsApi";
import { getOpenClawDashboardUrl } from "@/lib/agentsApi";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    height: "100%",
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  cardOrchestrator: {
    // `borderColor` is not typed in some Fluent UI style typings.
    // Set the full border instead.
    border: `1px solid ${tokens.colorBrandStroke1}`,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground1} 55%)`,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  emoji: {
    fontSize: "28px",
    lineHeight: 1,
  },
  outputs: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalXS,
  },
  meta: {
    display: "grid",
    gap: tokens.spacingVerticalXS,
    marginTop: "auto",
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

export default function AgentCard({
  agent,
  dashboardUrl,
}: {
  agent: OpenClawAgentSnapshot;
  dashboardUrl: string;
}) {
  const styles = useStyles();
  const chatUrl = `${dashboardUrl.replace(/\/$/, "")}/`;

  return (
    <article
      className={mergeClasses(
        styles.card,
        agent.isOrchestrator ? styles.cardOrchestrator : undefined
      )}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <span className={styles.emoji} aria-hidden>
              {agent.emoji}
            </span>
            <div>
              <Text weight="semibold" block>
                {agent.name}
              </Text>
              <Caption1>{agent.id}</Caption1>
            </div>
          </div>
        </div>
        <Badge
          appearance="outline"
          color={agent.registered ? "success" : "warning"}
          icon={agent.registered ? <CheckmarkCircle24Regular /> : <DismissCircle24Regular />}
        >
          {agent.registered ? "Registered" : "Not registered"}
        </Badge>
      </div>

      <Text size={300}>{agent.role}</Text>

      <div>
        <Caption1 block className="mb-2">
          Output labels
        </Caption1>
        <div className={styles.outputs}>
          {agent.outputs.map((label) => (
            <AppBadge key={label} tone="neutral">
              {label}
            </AppBadge>
          ))}
        </div>
      </div>

      <Caption1>KPI: {agent.kpi}</Caption1>

      <div className={styles.meta}>
        {agent.model ? (
          <Caption1>
            Model: <span className="font-mono">{agent.model}</span>
          </Caption1>
        ) : null}
        {agent.promptFile ? (
          <Caption1>
            Prompt: <span className="font-mono">{agent.promptFile}</span>
          </Caption1>
        ) : null}
        <Button
          as="a"
          href={chatUrl}
          target="_blank"
          rel="noreferrer"
          appearance="secondary"
          size="small"
          icon={<ArrowSquareUpRight24Regular />}
        >
          Open in OpenClaw
        </Button>
      </div>
    </article>
  );
}

export function AgentCardSkeleton() {
  const styles = useStyles();
  return (
    <div className={styles.card} aria-hidden>
      <div className="flex items-center gap-3">
        <Bot24Regular />
        <div className="h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}
