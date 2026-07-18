import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  EXECUTION_HIERARCHY,
  MOR_AGENT_DEFINITIONS,
  type MorAgentDefinition,
} from "../data/morAgentsRegistry.js";

type OpenClawConfigAgent = {
  id?: string;
  name?: string;
  workspace?: string;
  agentDir?: string;
  model?: string | { primary?: string };
  skills?: string[];
  subagents?: Record<string, unknown>;
};

type OpenClawConfig = {
  agents?: {
    defaults?: {
      model?: string | { primary?: string };
      subagents?: Record<string, unknown>;
    };
    list?: OpenClawConfigAgent[];
  };
  tools?: {
    subagents?: {
      tools?: { allow?: string[]; deny?: string[] };
    };
  };
};

export type OpenClawAgentSnapshot = MorAgentDefinition & {
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

function expandHome(input: string) {
  return input.startsWith("~") ? path.join(os.homedir(), input.slice(1)) : input;
}

function resolveOpenClawConfigPath() {
  const repoRoot = path.resolve(process.cwd());
  const localConfig = path.join(repoRoot, "integrations/openclaw/openclaw.json");
  if (process.env.OPENCLAW_CONFIG_PATH) {
    return expandHome(process.env.OPENCLAW_CONFIG_PATH);
  }
  try {
    return fsSync.existsSync(localConfig) ? localConfig : path.join(os.homedir(), ".openclaw/openclaw.json");
  } catch {
    return path.join(os.homedir(), ".openclaw/openclaw.json");
  }
}

function resolveModel(model: string | { primary?: string } | undefined) {
  if (!model) return null;
  if (typeof model === "string") return model;
  return model.primary ?? null;
}

async function readOpenClawConfig(configPath: string): Promise<OpenClawConfig | null> {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    return JSON.parse(raw) as OpenClawConfig;
  } catch {
    return null;
  }
}

async function probeGateway(gatewayUrl: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(gatewayUrl, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getOpenClawAgentsSnapshot(): Promise<OpenClawAgentsSnapshot> {
  const configPath = resolveOpenClawConfigPath();
  const repoRoot = path.resolve(process.cwd());
  const localOpenClaw = path.join(repoRoot, "openclaw");
  const hasLocalSubmodule = fsSync.existsSync(path.join(localOpenClaw, "openclaw.mjs"));
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL ?? "http://127.0.0.1:18789";
  const dashboardUrl = process.env.OPENCLAW_DASHBOARD_URL ?? `${gatewayUrl.replace(/\/$/, "")}/`;

  const [config, reachable] = await Promise.all([
    readOpenClawConfig(configPath),
    probeGateway(gatewayUrl),
  ]);

  const configuredAgents = new Map(
    (config?.agents?.list ?? [])
      .filter((entry): entry is OpenClawConfigAgent & { id: string } => Boolean(entry.id))
      .map((entry) => [entry.id, entry])
  );

  const defaultModel =
    resolveModel(config?.agents?.defaults?.model) ??
    resolveModel(configuredAgents.get("main")?.model) ??
    null;

  const agents: OpenClawAgentSnapshot[] = MOR_AGENT_DEFINITIONS.map((definition) => {
    const configured = configuredAgents.get(definition.id);
    const model = resolveModel(configured?.model) ?? defaultModel;

    return {
      ...definition,
      registered: Boolean(configured),
      model,
      workspace: configured?.workspace ?? null,
      skills: configured?.skills ?? (definition.id === "main" ? ["mor-finance"] : ["mor-finance"]),
    };
  });

  const subDefaults = config?.agents?.defaults?.subagents ?? {};
  const mainSubagents = configuredAgents.get("main")?.subagents as Record<string, unknown> | undefined;
  const allowAgents = (mainSubagents?.allowAgents ??
    subDefaults.allowAgents ??
    []) as string[];

  return {
    generatedAt: new Date().toISOString(),
    openclaw: {
      configPath,
      configLoaded: Boolean(config),
      gatewayUrl,
      dashboardUrl,
      reachable,
      defaultModel,
      installNote: hasLocalSubmodule
        ? "OpenClaw source is in ./openclaw (git submodule). Config: integrations/openclaw/openclaw.json"
        : "Run npm run openclaw:setup to configure integrations/openclaw/.",
    },
    executionHierarchy: EXECUTION_HIERARCHY,
    agentFramework: {
      mode: "recommend-only",
      docsPath: "docs/agents/prompts",
    },
    subagents: {
      configured: Boolean(config?.agents?.defaults?.subagents),
      requireAgentId:
        (mainSubagents?.requireAgentId as boolean | undefined) ??
        (subDefaults.requireAgentId as boolean | undefined) ??
        null,
      delegationMode:
        (mainSubagents?.delegationMode as string | undefined) ??
        (subDefaults.delegationMode as string | undefined) ??
        null,
      maxConcurrent: (subDefaults.maxConcurrent as number | undefined) ?? null,
      runTimeoutSeconds: (subDefaults.runTimeoutSeconds as number | undefined) ?? null,
      allowAgents: Array.isArray(allowAgents) ? allowAgents : [],
      toolDeny: config?.tools?.subagents?.tools?.deny ?? [],
      envFile: path.join(repoRoot, "integrations/openclaw/subagents.env"),
      docsPath: "integrations/openclaw/SUBAGENTS.md",
    },
    agents,
  };
}
