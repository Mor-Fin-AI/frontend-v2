"use client";

import {
  Badge,
  Button,
  Caption1,
  Card,
  CardHeader,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowSquareUpRight24Regular,
  Bot24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  PlugConnected24Regular,
} from "@fluentui/react-icons";
import AgentCard, { AgentCardSkeleton } from "./AgentCard";
import AppBadge from "@/components/ui/AppBadge";
import { getOpenClawDashboardUrl } from "@/lib/agentsApi";
import type { OpenClawAgentsSnapshot } from "@/lib/agentsApi";

const useStyles = makeStyles({
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  statusCard: {
    padding: tokens.spacingHorizontalL,
  },
  statusRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  hierarchy: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: tokens.spacingHorizontalL,
  },
});

export default function OpenClawAgentsPanel({
  snapshot,
  isLoading,
  error,
}: {
  snapshot?: OpenClawAgentsSnapshot;
  isLoading: boolean;
  error: Error | null;
}) {
  const styles = useStyles();
  const dashboardUrl = getOpenClawDashboardUrl(snapshot);
  const specialists = snapshot?.agents.filter((agent) => !agent.isOrchestrator) ?? [];
  const orchestrator = snapshot?.agents.find((agent) => agent.isOrchestrator);

  return (
    <div className={styles.panel}>
      <Card className={styles.statusCard}>
        <CardHeader
          header={
            <div className="flex items-center gap-2">
              <Bot24Regular />
              <Text weight="semibold">OpenClaw Gateway</Text>
            </div>
          }
          description="OpenClaw runs separately from this repo (~/.openclaw/). This page reads your local OpenClaw config and links to the Control UI for chat and fine-tuning."
        />
        <Caption1 block className="mb-3 text-muted-foreground">
          {snapshot?.openclaw.installNote ??
            "OpenClaw is not bundled here. Install globally (openclaw CLI) and start the gateway in a separate terminal."}
        </Caption1>
        <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
          <Caption1 block className="mb-2 font-medium">
            What lives where
          </Caption1>
          <Text size={200} block>
            <strong>This repo</strong> — <span className="font-mono">openclaw/</span> (submodule),{" "}
            <span className="font-mono">integrations/openclaw/</span>, prompts
          </Text>
          <Text size={200} block>
            Run <span className="font-mono">npm run openclaw:setup</span> then{" "}
            <span className="font-mono">npm run openclaw:gateway</span>
          </Text>
          {snapshot?.openclaw.configPath ? (
            <Caption1 block className="mt-2">
              Config: <span className="font-mono">{snapshot.openclaw.configPath}</span>
            </Caption1>
          ) : null}
        </div>
        <div className={styles.statusRow}>
          <div className="flex flex-wrap items-center gap-3">
            {isLoading ? (
              <Badge appearance="outline">Checking gateway…</Badge>
            ) : (
              <Badge
                appearance="outline"
                color={snapshot?.openclaw.reachable ? "success" : "danger"}
                icon={
                  snapshot?.openclaw.reachable ? (
                    <CheckmarkCircle24Regular />
                  ) : (
                    <DismissCircle24Regular />
                  )
                }
              >
                {snapshot?.openclaw.reachable ? "Gateway online" : "Gateway offline"}
              </Badge>
            )}
            {snapshot?.openclaw.defaultModel ? (
              <Caption1>
                Default model:{" "}
                <span className="font-mono">{snapshot.openclaw.defaultModel}</span>
              </Caption1>
            ) : null}
            {snapshot?.openclaw.configLoaded ? (
              <Badge appearance="tint" icon={<PlugConnected24Regular />}>
                Config loaded
              </Badge>
            ) : null}
          </div>
          <Button
            as="a"
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            appearance="primary"
            icon={<ArrowSquareUpRight24Regular />}
          >
            Open OpenClaw Dashboard
          </Button>
        </div>
      </Card>

      {snapshot ? (
        <div>
          <Caption1 block className="mb-2">
            Execution hierarchy
          </Caption1>
          <div className={styles.hierarchy}>
            {snapshot.executionHierarchy.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <Badge appearance="outline">{index + 1}</Badge>
                <Text size={300}>{step}</Text>
                {index < snapshot.executionHierarchy.length - 1 ? (
                  <Text size={200}>→</Text>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {snapshot?.subagents.configured ? (
        <Card className={styles.statusCard}>
          <CardHeader
            header={<Text weight="semibold">Sub-agent environment</Text>}
            description="OpenClaw delegates MOR analysis from main → specialist sub-agents via sessions_spawn."
          />
          <div className="flex flex-wrap gap-2">
            {snapshot.subagents.delegationMode ? (
              <Badge appearance="outline">delegation: {snapshot.subagents.delegationMode}</Badge>
            ) : null}
            {snapshot.subagents.requireAgentId ? (
              <Badge appearance="outline">requireAgentId</Badge>
            ) : null}
            {snapshot.subagents.maxConcurrent != null ? (
              <Badge appearance="outline">maxConcurrent: {snapshot.subagents.maxConcurrent}</Badge>
            ) : null}
            {snapshot.subagents.runTimeoutSeconds != null ? (
              <Badge appearance="outline">timeout: {snapshot.subagents.runTimeoutSeconds}s</Badge>
            ) : null}
          </div>
          <Caption1 block className="mt-3 mb-1">
            Spawn targets
          </Caption1>
          <div className="flex flex-wrap gap-2">
            {snapshot.subagents.allowAgents.map((id) => (
              <AppBadge key={id} tone="brand">
                {id}
              </AppBadge>
            ))}
          </div>
          <Caption1 className="mt-3">
            Env file: <span className="font-mono">{snapshot.subagents.envFile}</span> · Docs:{" "}
            <span className="font-mono">{snapshot.subagents.docsPath}</span>
          </Caption1>
        </Card>
      ) : null}

      {error ? (
        <Card className={styles.statusCard}>
          <Text>{error.message}</Text>
          <Caption1 className="mt-2">
            Start this repo with <span className="font-mono">npm run dev</span>, then start OpenClaw
            separately: <span className="font-mono">openclaw gateway</span>
          </Caption1>
        </Card>
      ) : null}

      {!isLoading && snapshot && !snapshot.openclaw.reachable ? (
        <Card className={styles.statusCard}>
          <Text weight="semibold" block>
            OpenClaw gateway is offline
          </Text>
          <Caption1 className="mt-2">
            OpenClaw is not part of this project. In another terminal run:
          </Caption1>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 font-mono text-sm">
            openclaw gateway{"\n"}# then open http://127.0.0.1:18789/
          </pre>
        </Card>
      ) : null}

      {orchestrator ? (
        <div>
          <Text weight="semibold" block className="mb-3">
            Orchestrator
          </Text>
          <div className="max-w-xl">
            <AgentCard agent={orchestrator} dashboardUrl={dashboardUrl} />
          </div>
        </div>
      ) : null}

      <div>
        <Text weight="semibold" block className="mb-3">
          Specialist agents
        </Text>
        <div className={styles.grid}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <AgentCardSkeleton key={index} />
              ))
            : specialists.map((agent) => (
                <AgentCard key={agent.id} agent={agent} dashboardUrl={dashboardUrl} />
              ))}
        </div>
      </div>

      {!isLoading && snapshot ? (
        <Caption1>
          Fine-tune prompts in OpenClaw under <strong>Agents → Files → AGENTS.md</strong> for each
          agent, or edit{" "}
          <span className="font-mono">{snapshot.agentFramework.docsPath}/</span> in this repo.
        </Caption1>
      ) : null}
    </div>
  );
}
