const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type OpenClawAgentSnapshot = {
  id: string;
  name: string;
  emoji: string;
  role: string;
  outputs: string[];
  promptFile: string | null;
  kpi: string;
  isOrchestrator?: boolean;
  registered: boolean;
  model: string | null;
  workspace: string | null;
  skills: string[];
};

export type OpenClawAgentsSnapshot = {
  generatedAt: string;
  openclaw: {
    configPath: string;
    configLoaded: boolean;
    gatewayUrl: string;
    dashboardUrl: string;
    reachable: boolean;
    defaultModel: string | null;
    installNote: string;
  };
  executionHierarchy: readonly string[];
  agentFramework: {
    mode: "recommend-only";
    docsPath: string;
  };
  subagents: {
    configured: boolean;
    requireAgentId: boolean | null;
    delegationMode: string | null;
    maxConcurrent: number | null;
    runTimeoutSeconds: number | null;
    allowAgents: string[];
    toolDeny: string[];
    envFile: string;
    docsPath: string;
  };
  agents: OpenClawAgentSnapshot[];
};

export async function fetchOpenClawAgents() {
  const response = await fetch(`${API_BASE}/agents/openclaw`);
  if (!response.ok) {
    throw new Error(`Failed to load OpenClaw agents (${response.status})`);
  }
  return (await response.json()) as OpenClawAgentsSnapshot;
}

export function getOpenClawDashboardUrl(snapshot?: OpenClawAgentsSnapshot | null) {
  return (
    import.meta.env.VITE_OPENCLAW_DASHBOARD_URL ??
    snapshot?.openclaw.dashboardUrl ??
    "http://127.0.0.1:18789/"
  );
}
